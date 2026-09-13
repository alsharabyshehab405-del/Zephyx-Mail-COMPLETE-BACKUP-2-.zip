import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { listTasks, updateTask } from "@/lib/feature-api";
import { useI18n } from "@/hooks/use-i18n";

type Task = { id: string; title: string; status: "open" | "completed"; priority: string; dueAt: string | null };

export default function Tasks() {
  const { t, locale } = useI18n();
  const [, setLocation] = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => listTasks().then((result) => setTasks(result.tasks)).finally(() => setLoading(false));
  useEffect(() => { void refresh(); }, []);

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">{t("tasks.productivity")}</p><h1 className="text-3xl font-bold">{t("tasks.title")}</h1></div>
          <Button variant="outline" onClick={() => setLocation("/")}>{t("navigation.backToInbox")}</Button>
        </div>
        {loading ? <p className="text-muted-foreground">{t("tasks.loading")}</p> : tasks.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t("tasks.empty")}</div> : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-4 rounded-xl border p-4 ${task.status === "completed" ? "opacity-60" : ""}`}>
                <input type="checkbox" checked={task.status === "completed"} onChange={() => void updateTask(task.id, { status: task.status === "completed" ? "open" : "completed" }).then(refresh)} aria-label={t("tasks.completeAria", { title: task.title })} />
                <div className="min-w-0 flex-1"><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{t("tasks.priority")}: {task.priority}{task.dueAt ? ` · ${t("tasks.due")} ${new Date(task.dueAt).toLocaleString(locale)}` : ""}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
