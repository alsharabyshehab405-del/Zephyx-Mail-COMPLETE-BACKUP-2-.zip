import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { MailWarning } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { requestEmailVerification, getApiErrorMessage } from "@/lib/auth-api";

export function EmailVerificationBanner({ collapsible = false }: { collapsible?: boolean }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const collapseStorageKey = `zephyx-email-verification-banner-collapsed:${user?.id || user?.email || "account"}`;
  const [collapsed, setCollapsed] = useState(() => {
    if (!collapsible || typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(collapseStorageKey) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!collapsible || !isMobile || typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(collapseStorageKey) === null) {
        setCollapsed(true);
        window.localStorage.setItem(collapseStorageKey, "true");
      }
    } catch {
      // A mobile-first default is still useful when storage is unavailable.
      setCollapsed(true);
    }
  }, [collapseStorageKey, collapsible, isMobile]);

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (!collapsible) return;
    setCollapsed(!event.currentTarget.open);
  };

  const handleSummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!collapsible) return;
    const details = event.currentTarget.parentElement as HTMLDetailsElement | null;
    if (!details) return;
    window.setTimeout(() => {
      const nextCollapsed = !details.open;
      setCollapsed(nextCollapsed);
      try {
        window.localStorage.setItem(collapseStorageKey, String(nextCollapsed));
      } catch {
        // Local persistence is best effort; verification remains available in this session.
      }
    }, 0);
  };

  const verificationMutation = useMutation({
    mutationFn: requestEmailVerification,
    onSuccess: () => {
      toast({
        title: t("verification.sentTitle"),
        description: t("verification.sentDescription"),
      });
    },
    onError: (error) => {
      const apiMessage = getApiErrorMessage(error, t("verification.requestFailed"));

      if (/email is already verified/i.test(apiMessage)) {
        setVerificationComplete(true);
        toast({
          title: t("verification.alreadyVerified"),
        });
        return;
      }

      const description = /too many email requests/i.test(apiMessage)
        ? t("verification.tooManyRequests")
        : apiMessage;

      toast({
        title: t("common.error"),
        description,
        variant: "destructive",
      });
    },
  });

  if (!user || user.emailVerifiedAt || verificationComplete) return null;

  const content = (
    <div className="novamail-verification-banner flex flex-col gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          {!collapsible ? (
            <p className="font-medium text-foreground">{t("verification.bannerTitle")}</p>
          ) : null}
          <p className="text-muted-foreground">{t("verification.bannerDescription")}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        disabled={verificationMutation.isPending}
        onClick={() => verificationMutation.mutate()}
      >
        {verificationMutation.isPending ? t("common.loading") : t("verification.resend")}
      </Button>
    </div>
  );

  return collapsible ? (
    <details
      className="novamail-inbox-verification-collapsible border-b border-amber-500/30"
      open={!collapsed}
      onToggle={handleToggle}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <summary onClick={handleSummaryClick} className="cursor-pointer bg-amber-500/10 px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {t("verification.bannerTitle")}
      </summary>
      {content}
    </details>
  ) : (
    content
  );
}
