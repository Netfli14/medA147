import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const COOKIE_KEY = "medai-cookie-consent";

export function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50",
        "rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-5",
        "animate-fade-up"
      )}
    >
      <button
        onClick={decline}
        className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 mb-4 pr-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
          <Cookie className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground mb-1">{t('cookieTitle')}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('cookieDesc')}{" "}
            <Link to="/privacy" className="text-primary hover:underline" onClick={accept}>
              {t('privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={accept}
          size="sm"
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 hover:opacity-90"
        >
          {t('cookieAccept')}
        </Button>
        <Button
          onClick={decline}
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl"
        >
          {t('cookieDecline')}
        </Button>
      </div>
    </div>
  );
}
