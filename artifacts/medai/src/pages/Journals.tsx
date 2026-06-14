import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ExternalLink, Library } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { JOURNALS_DB } from "@/data/journals";

export default function Journals() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>(JOURNALS_DB.map((j) => j.category));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JOURNALS_DB.filter((j) => {
      const inCat = activeCategory === "all" || j.category === activeCategory;
      const inSearch =
        !q ||
        j.name.toLowerCase().includes(q) ||
        (j.publisher || "").toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        (j.description || "").toLowerCase().includes(q);
      return inCat && inSearch;
    });
  }, [search, activeCategory]);

  return (
    <Layout>
      <SEOHead
        title="Medical Journals Library"
        description="1000+ peer-reviewed medical journals and clinical sources used by MedAI+ AI for evidence-based symptom analysis and health recommendations."
        path="/journals"
      />
      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Library className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t('journals') || 'Medical Journals'}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('journalsTitle') || 'Medical Journals Library'}
          </h1>
          <p className="text-lg text-muted-foreground mb-3">
            {t('journalsDesc') || 'Peer-reviewed sources used to ground MedAI+ recommendations.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <BookOpen className="h-4 w-4" />
            <span>{JOURNALS_DB.length}+ journals across {categories.length - 1} specialties</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchJournals') || 'Search by name, publisher, specialty...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat === "all" ? (t('all') || 'All') : cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length === JOURNALS_DB.length
              ? `Showing all ${filtered.length} journals`
              : `Showing ${filtered.length} of ${JOURNALS_DB.length} journals`}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-2.5">
          {filtered.map((journal) => (
            <a
              key={journal.id}
              href={journal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-4 flex items-start gap-3.5 hover:shadow-md transition-all group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {journal.name}
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{journal.publisher}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {journal.category}
                  </span>
                  {journal.impact_factor && (
                    <span className="text-xs font-semibold text-primary">
                      IF {journal.impact_factor}
                    </span>
                  )}
                </div>
                {journal.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {journal.description}
                  </p>
                )}
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              {t('noJournalsFound') || 'No journals found matching your search.'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
