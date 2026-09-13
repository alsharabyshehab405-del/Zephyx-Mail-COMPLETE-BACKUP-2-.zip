import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, Check, ClipboardList, FileDown, KeyRound, Plus, ShieldAlert, ShieldCheck, Users, Webhook, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import {
  createEnterpriseOrganization,
  createOrganizationApiKey,
  createOrganizationWebhook,
  createSecurityIncident,
  askOrganizationSecurityAssistant,
  getOrganizationSecurityDashboard,
  getOrganizationSecuritySummary,
  listEnterpriseOrganizations,
  listOrganizationApiKeys,
  listOrganizationAuditLogs,
  listOrganizationMembers,
  listOrganizationWebhooks,
  listSecurityIncidents,
  updateOrganizationAiPhishing,
  type EnterpriseOrganization,
  type OrganizationSecuritySummary,
  type SecurityDashboard,
  type SecurityAssistantResponse,
  type SecurityIncident,
} from "@/lib/feature-api";

const ONBOARDING_KEY = "zephyx-enterprise-security-onboarding-dismissed";

function formatDate(value: string, locale?: string) { return new Intl.DateTimeFormat(locale || (typeof document !== "undefined" ? document.documentElement.lang : undefined) || undefined, { dateStyle: "medium" }).format(new Date(value)); }

export default function EnterpriseSecurity() {
  const { locale, t } = useI18n();
  const [organizations, setOrganizations] = useState<EnterpriseOrganization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [summary, setSummary] = useState<OrganizationSecuritySummary | null>(null);
  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboard | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<SecurityAssistantResponse | null>(null);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; email: string; name: string; role: string }>>([]);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; success: boolean; createdAt: string }>>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; revokedAt: string | null; createdAt: string }>>([]);
  const [webhooks, setWebhooks] = useState<Array<{ id: string; url: string; active: boolean; events: string[] }>>([]);
  const [newOrg, setNewOrg] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [oneTimeSecret, setOneTimeSecret] = useState("");
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_KEY) === "1");
  const [error, setError] = useState("");
  const [aiPhishingBusy, setAiPhishingBusy] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);

  const selected = useMemo(() => organizations.find((organization) => organization.id === organizationId) ?? null, [organizations, organizationId]);
  const canManage = selected?.role === "owner" || selected?.role === "admin";

  const stateCopy = {
    safe: { label: t("email.securityStateSafe"), description: t("enterprise.riskSafeDescription"), action: t("email.securityActionSafe"), icon: ShieldCheck, className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    suspicious: { label: t("email.securityStateSuspicious"), description: t("enterprise.riskSuspiciousDescription"), action: t("email.securityActionSuspicious"), icon: ShieldAlert, className: "text-amber-800 bg-amber-50 border-amber-200" },
    dangerous: { label: t("email.securityStateDangerous"), description: t("enterprise.riskDangerousDescription"), action: t("email.securityActionDangerous"), icon: ShieldAlert, className: "text-red-800 bg-red-50 border-red-200" },
    blocked: { label: t("email.securityStateBlocked"), description: t("enterprise.riskBlockedDescription"), action: t("email.securityActionBlocked"), icon: X, className: "text-slate-800 bg-slate-100 border-slate-300" },
  } as const;

  async function refreshOrganizations() {
    const result = await listEnterpriseOrganizations();
    setOrganizations(result.organizations);
    if (!organizationId && result.organizations[0]) setOrganizationId(result.organizations[0].id);
  }
  async function refreshOrganization(id: string) {
    if (!id) return;
    const [nextSummary, nextDashboard, nextIncidents, nextMembers, nextLogs, nextKeys, nextWebhooks] = await Promise.all([
      getOrganizationSecuritySummary(id), getOrganizationSecurityDashboard(id), listSecurityIncidents(id), listOrganizationMembers(id), listOrganizationAuditLogs(id), listOrganizationApiKeys(id), listOrganizationWebhooks(id),
    ]);
    setSummary(nextSummary); setSecurityDashboard(nextDashboard); setIncidents(nextIncidents.incidents); setMembers(nextMembers.members); setAuditLogs(nextLogs.logs); setApiKeys(nextKeys.apiKeys); setWebhooks(nextWebhooks.webhooks);
  }
  useEffect(() => { void refreshOrganizations().catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load organizations")); }, []);
  useEffect(() => { void refreshOrganization(organizationId).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load security data")); }, [organizationId]);

  async function run(action: () => Promise<void>) { setError(""); try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Request failed"); } }
  async function createOrg() { await run(async () => { const created = await createEnterpriseOrganization(newOrg); setNewOrg(""); setOrganizations((current) => [...current, created]); setOrganizationId(created.id); }); }
  async function createIncident() { if (!organizationId || !incidentTitle.trim()) return; await run(async () => { await createSecurityIncident(organizationId, { title: incidentTitle, description: incidentDescription, severity: "medium" }); setIncidentTitle(""); setIncidentDescription(""); await refreshOrganization(organizationId); }); }
  async function createKey() { if (!organizationId || !apiKeyName.trim()) return; await run(async () => { const created = await createOrganizationApiKey(organizationId, apiKeyName); setApiKeyName(""); setOneTimeSecret(created.secret); await refreshOrganization(organizationId); }); }
  async function createHook() { if (!organizationId || !webhookUrl.trim()) return; await run(async () => { const created = await createOrganizationWebhook(organizationId, { url: webhookUrl, events: ["security.incident.created", "security.report.created"] }); setWebhookUrl(""); setOneTimeSecret(created.secret); await refreshOrganization(organizationId); }); }
  async function toggleAiPhishing() { if (!organizationId || !summary || !canManage) return; setAiPhishingBusy(true); await run(async () => { await updateOrganizationAiPhishing(organizationId, !summary.aiPhishing.enabled); await refreshOrganization(organizationId); }); setAiPhishingBusy(false); }
  async function askAssistant() { if (!organizationId || !assistantQuestion.trim()) return; setAssistantBusy(true); await run(async () => { const response = await askOrganizationSecurityAssistant(organizationId, assistantQuestion.trim(), locale); setAssistantResponse(response); setAssistantQuestion(""); }); setAssistantBusy(false); }
  function download(extension: "csv" | "pdf") { if (!organizationId) return; window.open(`/api/enterprise/${encodeURIComponent(organizationId)}/reports.${extension}`, "_blank", "noopener,noreferrer"); }
  function dismissOnboarding() { setDismissed(true); window.localStorage.setItem(ONBOARDING_KEY, "1"); }

  return <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8" dir={locale === "ar" || locale === "ur" ? "rtl" : "ltr"}>
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-primary">{t("enterprise.eyebrow")}</p><h1 className="text-3xl font-semibold tracking-tight">{t("enterprise.title")}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{t("enterprise.headerDescription")}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => download("csv")} disabled={!organizationId}><FileDown className="me-2 h-4 w-4" />{t("enterprise.downloadCsv")}</Button><Button variant="outline" onClick={() => download("pdf")} disabled={!organizationId}><FileDown className="me-2 h-4 w-4" />{t("enterprise.downloadPdf")}</Button></div></header>
    {!dismissed && <section className="rounded-xl border border-primary/20 bg-primary/5 p-5" aria-label={t("enterprise.onboardingAria")}><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 text-primary" /><div className="flex-1"><h2 className="font-semibold">{t("enterprise.onboardingTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("enterprise.onboardingDescription")}</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><span>{t("enterprise.onboardingStep1")}</span><span>{t("enterprise.onboardingStep2")}</span><span>{t("enterprise.onboardingStep3")}</span></div></div><Button size="sm" variant="outline" onClick={dismissOnboarding} className="rounded-full border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">{t("enterprise.systemHealthy")}</Button></div></section>}
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <section className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><label className="text-sm font-medium" htmlFor="organization-select">{t("enterprise.organization")}</label><select id="organization-select" className="h-10 rounded-md border bg-background px-3 text-sm" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}><option value="">{t("enterprise.selectOrg")}</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name} — {organization.role}</option>)}</select><Input className="sm:max-w-xs" placeholder={t("enterprise.newOrgNamePlaceholder")} value={newOrg} onChange={(event) => setNewOrg(event.target.value)} /><Button onClick={() => void createOrg()} disabled={!newOrg.trim()}><Plus className="me-2 h-4 w-4" />{t("enterprise.create")}</Button></div></section>
    {summary && <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label={t("enterprise.summaryAria")}><Metric icon={<Users />} label={t("enterprise.members")} value={summary.members} /><Metric icon={<Activity />} label={t("enterprise.analyzedMessages")} value={summary.analyzedMessages} /><Metric icon={<ShieldAlert />} label={t("enterprise.openIncidents")} value={summary.openIncidents} tone={summary.openIncidents ? "warning" : "normal"} /><Metric icon={<ShieldAlert />} label={t("enterprise.criticalIncidents")} value={summary.criticalIncidents} tone={summary.criticalIncidents ? "danger" : "normal"} /><Metric icon={<ClipboardList />} label={t("enterprise.averageRiskScore")} value={`${summary.averageSpamScore}/100`} /></section>
      <section className="grid gap-4 md:grid-cols-4" aria-label={t("enterprise.riskSummaryAria")}>{Object.entries(summary.riskSummary).map(([key, value]) => { const state = stateCopy[key as keyof typeof stateCopy]; const Icon = state.icon; return <div key={key} className={`rounded-xl border p-4 ${state.className}`}><div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className="font-medium">{state.label}</span></div><p className="mt-2 text-2xl font-semibold">{value}</p><p className="text-xs opacity-80">{t("enterprise.messages")}</p></div>; })}</section>
      <section data-testid="ai-phishing-admin-summary" aria-label={t("enterprise.aiPhishingAria")} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{t("enterprise.aiPhishingTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("enterprise.aiPhishingDescription")}</p></div>{canManage && <Button size="sm" variant="outline" disabled={aiPhishingBusy} onClick={() => void toggleAiPhishing()}>{aiPhishingBusy ? t("enterprise.saving") : summary.aiPhishing.enabled ? t("enterprise.disableAnalysis") : t("enterprise.enableWithConsent")}</Button>}</div><div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><Metric label={t("enterprise.status")} value={summary.aiPhishing.provider.state} /><Metric label={t("enterprise.analyzed")} value={summary.aiPhishing.analyzedMessages} /><Metric label={t("enterprise.safe")} value={summary.aiPhishing.safe} /><Metric label={t("enterprise.suspicious")} value={summary.aiPhishing.suspicious} /><Metric label={t("enterprise.dangerous")} value={summary.aiPhishing.dangerous} /><Metric label={t("enterprise.averageRisk")} value={`${summary.aiPhishing.averageRiskScore}/100`} /></div></section>
      {securityDashboard && <section data-testid="security-dashboard" aria-label={t("enterprise.dashboardTitle")} className="grid gap-6 lg:grid-cols-2"><Panel title={t("enterprise.dashboardTitle")} icon={<Activity />}><p className="mb-4 text-sm text-muted-foreground">{t("enterprise.dashboardDescription")}</p><div className="grid gap-3 sm:grid-cols-2"><Metric label={t("enterprise.phishingAttempts")} value={securityDashboard.phishingAttempts} /><Metric label={t("enterprise.spamCampaigns")} value={securityDashboard.spamCampaigns} /></div><div className="mt-4"><h3 className="text-sm font-medium">{t("enterprise.topRiskDomains")}</h3>{securityDashboard.topRiskDomains.length ? <ul className="mt-2 space-y-1 text-sm">{securityDashboard.topRiskDomains.slice(0, 5).map((item) => <li key={item.domain} className="flex justify-between gap-3"><bdi dir="ltr">{item.domain}</bdi><span className="text-muted-foreground">{item.attempts} {t("enterprise.attempts")}</span></li>)}</ul> : <Empty text={t("enterprise.noData")} />}</div></Panel><Panel title={t("enterprise.assistantTitle")} icon={<ShieldCheck />}><p className="mb-3 text-sm text-muted-foreground">{t("enterprise.assistantDescription")}</p><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void askAssistant(); }}><Input value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} placeholder={t("enterprise.assistantPlaceholder")} aria-label={t("enterprise.assistantPlaceholder")} /><Button type="submit" disabled={assistantBusy || !assistantQuestion.trim()}>{assistantBusy ? "…" : t("enterprise.assistantAsk")}</Button></form>{assistantResponse?.state === "NOT_CONFIGURED" ? <p className="mt-3 rounded bg-muted/50 p-3 text-sm">{t("enterprise.assistantNotConfigured")}</p> : assistantResponse?.answer ? <div className="mt-3 rounded bg-muted/50 p-3 text-sm"><p className="font-medium">{t("enterprise.assistantAnswer")}</p><p className="mt-1">{assistantResponse.answer}</p>{assistantResponse.keyPoints.length ? <ul className="mt-2 list-disc ps-5">{assistantResponse.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div> : null}</Panel></section>}
      <div className="grid gap-6 lg:grid-cols-2"><Panel title={t("enterprise.incidentsTitle")} icon={<ShieldAlert />}><div className="space-y-3">{incidents.length === 0 ? <Empty text={t("enterprise.noIncidents")} /> : incidents.slice(0, 8).map((incident) => <div key={incident.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-medium">{incident.title}</p><p className="text-xs text-muted-foreground">{incident.description || t("enterprise.noDescription")}</p></div><span className="rounded-full bg-muted px-2 py-1 text-xs">{incident.status}</span></div><p className="mt-2 text-xs text-muted-foreground">{incident.severity} · {formatDate(incident.createdAt)}</p></div>)}</div>{canManage && <div className="mt-4 space-y-2 border-t pt-4"><Input placeholder={t("enterprise.incidentTitlePlaceholder")} value={incidentTitle} onChange={(event) => setIncidentTitle(event.target.value)} /><Input placeholder={t("enterprise.incidentDescriptionPlaceholder")} value={incidentDescription} onChange={(event) => setIncidentDescription(event.target.value)} /><Button size="sm" onClick={() => void createIncident()} disabled={!incidentTitle.trim()}>{t("enterprise.registerIncident")}</Button></div>}</Panel>
      <Panel title={t("enterprise.membersAndPermissions")} icon={<Users />}><div className="space-y-2">{members.map((member) => <div key={member.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span><bdi dir="auto">{member.name}</bdi><span className="ms-2 text-muted-foreground"><bdi dir="ltr">{member.email}</bdi></span></span><span className="rounded-full bg-muted px-2 py-1 text-xs">{member.role}</span></div>)}{members.length === 0 && <Empty text={t("enterprise.addMembersAfterCreate")} />}</div><p className="mt-3 text-xs text-muted-foreground">{t("enterprise.roleDescription")}</p></Panel></div>
      <div className="grid gap-6 lg:grid-cols-3"><Panel title={t("enterprise.auditLogTitle")} icon={<ClipboardList />}><div className="space-y-2">{auditLogs.slice(0, 6).map((log) => <div key={log.id} className="flex items-center justify-between text-sm"><span>{log.action}</span><span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span></div>)}{auditLogs.length === 0 && <Empty text={t("enterprise.noActivity")} />}</div></Panel><Panel title={t("enterprise.apiKeysTitle")} icon={<KeyRound />}><div className="space-y-2">{apiKeys.map((key) => <div key={key.id} className="flex items-center justify-between rounded border p-2 text-sm"><span>{key.name}<span className="ms-2 font-mono text-xs text-muted-foreground">{key.keyPrefix}…</span></span><span>{key.revokedAt ? t("enterprise.revoked") : t("enterprise.active")}</span></div>)}{canManage && <div className="flex gap-2"><Input placeholder={t("enterprise.keyNamePlaceholder")} value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} /><Button size="sm" onClick={() => void createKey()} disabled={!apiKeyName.trim()}><Plus className="h-4 w-4" /></Button></div>}</div></Panel><Panel title={t("enterprise.webhooksTitle")} icon={<Webhook />}><div className="space-y-2">{webhooks.map((hook) => <div key={hook.id} className="rounded border p-2 text-sm"><bdi dir="ltr" className="block truncate">{hook.url}</bdi><span className="text-xs text-muted-foreground">{hook.active ? t("enterprise.active") : t("enterprise.inactive")}</span></div>)}{canManage && <div className="flex gap-2"><Input placeholder="https://example.com/webhook" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} /><Button size="sm" onClick={() => void createHook()} disabled={!webhookUrl.trim()}><Plus className="h-4 w-4" /></Button></div>}</div></Panel></div>
    </>}
    {oneTimeSecret && <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status"><b>{t("enterprise.saveSecretNow")}</b> {t("enterprise.secretShownOnce")} <code className="ms-2 break-all">{oneTimeSecret}</code><Button className="ms-2" size="sm" variant="ghost" onClick={() => setOneTimeSecret("")}>{t("enterprise.hide")}</Button></section>}
  </main>;
}

function Metric({ icon, label, value, tone = "normal" }: { icon?: ReactNode; label: string; value: string | number; tone?: "normal" | "warning" | "danger" }) { return <div className={`rounded-xl border bg-card p-4 shadow-sm ${tone === "danger" ? "border-red-300" : tone === "warning" ? "border-amber-300" : ""}`}><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{icon ? <span>{label}</span> : <span>{label}</span>}</div><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) { return <section className="rounded-xl border bg-card p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-semibold">{icon}{title}</h2>{children}</section>; }
function Empty({ text }: { text: string }) { return <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{text}</p>; }
