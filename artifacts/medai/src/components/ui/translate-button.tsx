import { useState } from "react";
import { Languages, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "kk", label: "Қазақша", flag: "🇰🇿" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
] as const;

type LangCode = "en" | "ru" | "kk" | "zh";

const CACHE_PREFIX = "medai_translate_v1:";

interface TranslateButtonProps {
  text: string;
  onTranslated: (translated: string | null) => void;
  isTranslated: boolean;
  cacheKey?: string;
  className?: string;
}

export function TranslateButton({
  text,
  onTranslated,
  isTranslated,
  cacheKey,
  className,
}: TranslateButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<LangCode | null>(null);

  const doTranslate = async (lang: LangCode) => {
    if (!text?.trim()) return;

    const key = `${CACHE_PREFIX}${lang}:${cacheKey || text.slice(0, 80)}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        setActiveLang(lang);
        onTranslated(cached);
        return;
      }
    } catch {}

    setLoading(true);
    try {
      const res = await fetch("/api/ai/translate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang: "auto", targetLang: lang }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();

      const translated: string | null =
        data?.translated || data?.[lang] || null;

      if (translated && translated.trim()) {
        try {
          localStorage.setItem(key, translated);
        } catch {}
        setActiveLang(lang);
        onTranslated(translated);
      } else {
        throw new Error("Empty translation received");
      }
    } catch (e) {
      console.error("[translate] failed", e);
      toast({
        title: "Translation failed",
        description:
          e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isTranslated) {
    const langInfo = LANGUAGES.find((l) => l.code === activeLang);
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          onTranslated(null);
          setActiveLang(null);
        }}
        className={className}
      >
        <Languages className="h-3.5 w-3.5 mr-1.5" />
        {langInfo ? `${langInfo.flag} ${langInfo.label}` : "Translated"} · Show original
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading || !text?.trim()}
          className={className}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5 mr-1.5" />
          )}
          {loading ? "Translating…" : "Translate"}
          {!loading && <ChevronDown className="h-3 w-3 ml-1 opacity-60" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Choose language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => doTranslate(lang.code)}
            className="gap-2 cursor-pointer"
          >
            <span className="text-base leading-none">{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
