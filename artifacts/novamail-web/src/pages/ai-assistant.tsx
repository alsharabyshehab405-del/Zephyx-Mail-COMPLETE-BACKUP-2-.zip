import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { aiWrite, type AiWriteOperation } from "@/lib/feature-api";
import { useI18n } from "@/hooks/use-i18n";

const operationIds: Array<AiWriteOperation> = ["draft", "rephrase", "shorten", "quick_reply"];

export default function AiAssistant() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [operation, setOperation] = useState<AiWriteOperation>("draft");
  const [instruction, setInstruction] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  const operationLabel = (id: AiWriteOperation) => {
    switch (id) {
      case "draft": return t("ai.draftLabel");
      case "rephrase": return t("ai.rephraseLabel");
      case "shorten": return t("ai.shortenLabel");
      case "quick_reply": return t("ai.quickReplyLabel");
      default: return id;
    }
  };
  const operationDescription = (id: AiWriteOperation) => {
    switch (id) {
      case "draft": return t("ai.draftDescription");
      case "rephrase": return t("ai.rephraseDescription");
      case "shorten": return t("ai.shortenDescription");
      case "quick_reply": return t("ai.quickReplyDescription");
      default: return "";
    }
  };

  const run = async () => {
    if (!instruction.trim() && !context.trim()) return;
    setBusy(true);
    try {
      const response = await aiWrite({ operation, instruction, context });
      setResult(
        response.state === "NOT_CONFIGURED"
          ? t("ai.notConfigured")
          : response.text ?? t("ai.noResponse"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">Zephyx AI</p><h1 className="text-3xl font-bold">{t("ai.title")}</h1><p className="mt-2 text-muted-foreground">{t("ai.subtitle")}</p></div>
          <Button variant="outline" onClick={() => setLocation("/")}>{t("ai.backToInbox")}</Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <section className="space-y-2 rounded-xl border p-3">
            {operationIds.map((item) => <button type="button" key={item} onClick={() => setOperation(item)} className={`w-full rounded-lg p-3 text-start transition-colors ${operation === item ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><p className="font-medium">{operationLabel(item)}</p><p className="mt-1 text-xs text-muted-foreground">{operationDescription(item)}</p></button>)}
          </section>
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold">{operationLabel(operation)}</h2>
            <div className="mt-4 space-y-3"><textarea className="min-h-28 w-full rounded-md border bg-background p-3 text-sm" placeholder={t("ai.instructionPlaceholder")} value={instruction} onChange={(event) => setInstruction(event.target.value)} /><textarea className="min-h-40 w-full rounded-md border bg-background p-3 text-sm" placeholder={t("ai.contextPlaceholder")} value={context} onChange={(event) => setContext(event.target.value)} /><Button onClick={() => void run()} disabled={busy || (!instruction.trim() && !context.trim())}>{busy ? t("ai.generating") : t("ai.run")}</Button></div>
            {result && <div className="mt-6 rounded-lg bg-muted/50 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ai.result")}</p><p className="whitespace-pre-wrap text-sm leading-7">{result}</p></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
