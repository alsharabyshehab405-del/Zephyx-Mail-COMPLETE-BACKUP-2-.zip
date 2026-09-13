import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import { createTemplate, listTemplates } from "@/lib/feature-api";

export default function Templates() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; subject: string; bodyText: string }>>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const refresh = () => listTemplates().then((result) => setTemplates(result.templates)).catch(() => undefined);
  useEffect(() => { void refresh(); }, []);
  const save = async () => { if (!name.trim() || !bodyText.trim()) return; await createTemplate({ name, subject, bodyText, bodyHtml: `<p>${bodyText.replace(/\n/g, "<br/>")}</p>` }); setName(""); setSubject(""); setBodyText(""); await refresh(); };
  return <main className="min-h-screen bg-background p-6 md:p-10"><div className="mx-auto max-w-4xl">
    <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{t("templates.eyebrow")}</p><h1 className="text-3xl font-bold">{t("templates.title")}</h1></div><Button variant="outline" onClick={() => setLocation("/")}>{t("navigation.backToInbox")}</Button></div>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">{t("templates.createTemplate")}</h2><div className="mt-4 grid gap-3"><Input placeholder={t("templates.templateName")} value={name} onChange={(event) => setName(event.target.value)} /><Input placeholder={t("templates.subjectOptional")} value={subject} onChange={(event) => setSubject(event.target.value)} /><textarea className="min-h-32 rounded-md border bg-background p-3 text-sm" placeholder={t("templates.reusableResponse")} value={bodyText} onChange={(event) => setBodyText(event.target.value)} /><Button onClick={() => void save()} disabled={!name.trim() || !bodyText.trim()}>{t("templates.saveTemplate")}</Button></div></section>
    <section className="mt-6 space-y-3">{templates.map((template) => <article key={template.id} className="rounded-xl border p-5"><h2 className="font-semibold">{template.name}</h2>{template.subject && <p className="mt-1 text-xs text-muted-foreground">{t("templates.subjectPrefix")} {template.subject}</p>}<p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{template.bodyText}</p></article>)}</section>
  </div></main>;
}
