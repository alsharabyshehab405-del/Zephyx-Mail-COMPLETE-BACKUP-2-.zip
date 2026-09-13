import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { formatLocaleNumber } from "@/lib/i18n-config";
import { analyticsOverview } from "@/lib/feature-api";

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { t, locale } = useI18n();
  const [data, setData] = useState<Awaited<ReturnType<typeof analyticsOverview>> | null>(null);
  useEffect(() => { void analyticsOverview().then(setData).catch(() => setData(null)); }, []);
  const max = Math.max(1, ...(data?.activityByHour.map((item) => item.count) ?? [1]));
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{t("analytics.eyebrow")}</p><h1 className="text-3xl font-bold">{t("analytics.title")}</h1></div><Button variant="outline" onClick={() => setLocation("/")}>{t("navigation.backToInbox")}</Button></div>
        {!data ? <p className="text-muted-foreground">{t("analytics.loading")}</p> : <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{t("analytics.totalEmails")}</p><p className="mt-2 text-3xl font-bold">{formatLocaleNumber(data.totalEmails, locale)}</p></div>
            <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{t("analytics.unread")}</p><p className="mt-2 text-3xl font-bold">{formatLocaleNumber(data.unreadEmails, locale)}</p></div>
            <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{t("analytics.storage")}</p><p className="mt-2 text-3xl font-bold">{formatLocaleNumber(Number((data.storageBytes / 1024 / 1024).toFixed(1)), locale)} {t("analytics.megabytes")}</p></div>
          </div>
          <section className="mt-6 rounded-xl border p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">{t("analytics.peakActivity")}</h2><span className="text-sm text-muted-foreground">{data.peakHour}:00</span></div><div className="mt-6 flex h-48 items-end gap-1">{data.activityByHour.map((item) => <div key={item.hour} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-primary/70" style={{ height: `${Math.max(4, item.count / max * 100)}%` }} title={`${item.hour}:00 — ${formatLocaleNumber(item.count, locale)}`} /><span className="text-[10px] text-muted-foreground">{item.hour}</span></div>)}</div></section>
        </>}
      </div>
    </main>
  );
}
