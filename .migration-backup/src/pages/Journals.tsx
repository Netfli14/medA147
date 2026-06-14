import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ExternalLink, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Journal {
  id: string;
  name: string;
  publisher: string | null;
  category: string;
  url: string;
  impact_factor: number | null;
  description: string | null;
}

export default function Journals() {
  const { t } = useLanguage();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("medical_journals" as any)
        .select("id, name, publisher, category, url, impact_factor, description")
        .order("impact_factor", { ascending: false, nullsFirst: false });
      if (!error && data) setJournals(data as unknown as Journal[]);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(journals.map((j) => j.category));
    return ["all", ...Array.from(set).sort()];
  }, [journals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return journals.filter((j) => {
      const inCat = activeCategory === "all" || j.category === activeCategory;
      const inSearch =
        !q ||
        j.name.toLowerCase().includes(q) ||
        (j.publisher || "").toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q);
      return inCat && inSearch;
    });
  }, [journals, search, activeCategory]);

  return (
    <Layout>
      <SEOHead
        title="Approved Medical Journals"
        description="The 100 peer-reviewed medical journals and clinical guideline sources used by MedAI+ to ground its AI recommendations."
        path="/journals"
      />
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t("approvedJournals") || "Approved Medical Journals"}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("journalsTitle") || "100 Peer-Reviewed Medical Sources"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("journalsDescription") ||
              "Our AI is restricted to citing only from this curated whitelist of trusted medical journals and clinical guidelines."}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-5 mb-6 flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchJournals") || "Search by name, publisher, or category"}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    activeCategory === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c === "all" ? t("all") || "All" : c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} / {journals.length} {t("journalsCount") || "journals"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((j) => (
                  <a
                    key={j.id}
                    href={j.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-4 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                        {j.name}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {j.category}
                      </span>
                      {j.impact_factor !== null && (
                        <span className="text-muted-foreground">IF {j.impact_factor}</span>
                      )}
                    </div>
                    {j.publisher && (
                      <p className="text-xs text-muted-foreground">{j.publisher}</p>
                    )}
                    {j.description && (
                      <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2">{j.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
