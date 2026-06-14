import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DisclaimerBannerProps {
  className?: string;
  dismissible?: boolean;
}

export function DisclaimerBanner({ className, dismissible = true }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className={cn(
      "relative rounded-xl bg-medical-warning/10 border border-medical-warning/20 p-4 flex items-start gap-3",
      className
    )}>
      <AlertTriangle className="h-5 w-5 text-medical-warning shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-foreground font-medium mb-1">{t('importantNotice')}</p>
        <p className="text-sm text-muted-foreground">
          {t('disclaimerBannerText')}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}