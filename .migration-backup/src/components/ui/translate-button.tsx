import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TranslateButtonProps {
  text: string;
  onTranslated: (translated: string | null) => void;
  isTranslated: boolean;
  cacheKey?: string;
  className?: string;
}

const CACHE_PREFIX = "medai_translate_v1:";

export function TranslateButton({ text, onTranslated, isTranslated, cacheKey, className }: TranslateButtonProps) {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
      if (isTranslated) {
        onTranslated(null);
        return;
      }
      if (!text?.trim()) return;

      const key = `${CACHE_PREFIX}${language}:${cacheKey || text.slice(0, 80)}`;
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          onTranslated(cached);
          return;
        }
      } catch {}

      setLoading(true);
      try {
        console.log("[translate] invoke", { lang: language, len: text.length });
        const { data, error } = await supabase.functions.invoke("translate-text", {
          body: { text, targetLang: language, contextHint: "Medical verdict / advice" },
        });
        console.log("[translate] response", { error, data });
        if (error) throw new Error(error.message || "Edge function error");

        // data.translated может быть строкой (когда text это string) или объектом
        let translated: string | null = null;
        if (typeof data?.translated === "string") {
          translated = data.translated;
        } else if (data?.translated && typeof data.translated === "object" && typeof data.translated.value === "string") {
          translated = data.translated.value;
        }

        if (translated && translated.trim()) {
          try { localStorage.setItem(key, translated); } catch {}
          onTranslated(translated);
        } else {
          throw new Error(data?.error || "Empty translation");
        }
      } catch (e) {
        console.error("[translate] failed", e);
        toast({
          title: t("translationFailed") || "Translation failed",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={loading || !text?.trim()}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5 mr-1.5" />
        )}
        {loading ? t("translating") : isTranslated ? t("showOriginal") : t("translateVerdict")}
      </Button>
    );
  }
