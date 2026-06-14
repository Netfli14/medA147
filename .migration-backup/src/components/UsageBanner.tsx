import { useState, useEffect } from "react";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface UsageBannerProps {
  feature: "symptoms" | "aiDoctor" | "aiAnalysis";
}

export function UsageBanner({ feature }: UsageBannerProps) {
  const { getLimits, isPremium, getTimeUntilReset } = useUsageLimits();
  const { t } = useLanguage();
  const [timer, setTimer] = useState(getTimeUntilReset());
  const limits = getLimits();
  const info = limits[feature];

  useEffect(() => {
    const interval = setInterval(() => setTimer(getTimeUntilReset()), 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilReset]);

  if (isPremium) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 mb-4">
        <Crown className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          Premium · {t('unlimitedAccess')}
        </span>
      </div>
    );
  }

  const remaining = Math.max(0, info.max - info.used);
  const isLow = remaining <= 1;
  const isOut = remaining === 0;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border mb-4 ${
      isOut ? "bg-destructive/10 border-destructive/20" : isLow ? "bg-medical-warning/10 border-medical-warning/20" : "bg-primary/5 border-primary/10"
    }`}>
      <div className="flex items-center gap-2">
        <Zap className={`h-4 w-4 ${isOut ? "text-destructive" : isLow ? "text-medical-warning" : "text-primary"}`} />
        <span className={`text-sm font-semibold ${isOut ? "text-destructive" : "text-foreground"}`}>
          {t('remainingUses')}: {remaining}/{info.max}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-mono">{timer}</span>
      </div>
      {isOut && (
        <Link to="/premium" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          <Crown className="h-3.5 w-3.5" />
          {t('getPremium')}
        </Link>
      )}
    </div>
  );
}
