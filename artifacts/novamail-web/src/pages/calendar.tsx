import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { listCalendarEvents } from "@/lib/feature-api";
import { useI18n } from "@/hooks/use-i18n";

export default function Calendar() {
  const { t, locale } = useI18n();
  const [, setLocation] = useLocation();
  const [events, setEvents] = useState<Array<{ id: string; title: string; startsAt: string; endsAt: string; location: string | null }>>([]);
  useEffect(() => { void listCalendarEvents().then((result) => setEvents(result.events)).catch(() => setEvents([])); }, []);
  return (
    <main className="min-h-screen bg-background p-6 md:p-10"><div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{t("calendar.integration")}</p><h1 className="text-3xl font-bold">{t("calendar.title")}</h1></div><Button variant="outline" onClick={() => setLocation("/")}>{t("navigation.backToInbox")}</Button></div>
      {events.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t("calendar.empty")}</div> : <div className="space-y-3">{events.map((event) => <article key={event.id} className="rounded-xl border p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{event.title}</h2><p className="mt-1 text-sm text-muted-foreground">{new Date(event.startsAt).toLocaleString(locale)} – {new Date(event.endsAt).toLocaleTimeString(locale)}</p>{event.location && <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>}</div><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{t("calendar.localCalendar")}</span></div></article>)}</div>}
    </div></main>
  );
}
