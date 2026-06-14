import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslateButton } from "@/components/ui/translate-button";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Activity,
  Zap,
  CalendarCheck,
  BookOpen,
  ExternalLink,
  Loader2,
  Search,
  Globe,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface VerdictEvidence {
  journal: string;
  url: string;
  year: string;
  finding: string;
}

interface DashboardData {
  healthScore: number;
  riskScore: number;
  shortTermMeasures: string[];
  longTermMeasures: string[];
  verdict: string;
  topCondition?: string;
  verdictEvidence?: VerdictEvidence[];
}

interface JournalSuggestion {
  name: string;
  url: string;
  reason?: string;
  articleTitle?: string;
  articleYear?: string;
  articleUrl?: string;
  searchUrl?: string;
}

interface HealthDashboardProps {
  data: DashboardData;
}

/** Extract [Text](url) markdown links from a string */
function extractMarkdownLinks(text: string): { label: string; url: string }[] {
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const results: { label: string; url: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    results.push({ label: m[1], url: m[2] });
  }
  return results;
}

/** Build disease-info resource links for a condition name */
function getDiseaseInfoLinks(condition: string) {
  const q = encodeURIComponent(condition);
  return [
    {
      label: "Mayo Clinic",
      url: `https://www.mayoclinic.org/search/search-results?q=${q}`,
      icon: "🏥",
    },
    {
      label: "MedlinePlus",
      url: `https://medlineplus.gov/query?id=KEYWORD&umlsType=&q=${q}`,
      icon: "🔬",
    },
    {
      label: "Wikipedia",
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${q}`,
      icon: "📖",
    },
    {
      label: "WebMD",
      url: `https://www.webmd.com/search/search_results/default.aspx?query=${q}`,
      icon: "💊",
    },
    {
      label: "WHO",
      url: `https://www.who.int/health-topics#q=${q}`,
      icon: "🌍",
    },
  ];
}

export function HealthDashboard({ data }: HealthDashboardProps) {
  const { t, language } = useLanguage();
  const { profile } = useMedicalProfile();
  const history = profile.symptomHistory;
  const [translatedVerdict, setTranslatedVerdict] = useState<string | null>(null);
  const [journals, setJournals] = useState<JournalSuggestion[] | null>(null);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [journalsError, setJournalsError] = useState<string | null>(null);

  const fetchJournals = async () => {
    const condition = (data.topCondition || data.verdict || "").trim();
    if (!condition) return;
    setLoadingJournals(true);
    setJournalsError(null);
    try {
      const res = await fetch("/api/ai/suggest-journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: condition.slice(0, 300), language }),
      });
      if (!res.ok) throw new Error(await res.text());
      const resp = await res.json();
      setJournals(Array.isArray(resp?.journals) ? resp.journals : []);
    } catch (e) {
      setJournalsError(e instanceof Error ? e.message : "Failed to load journals");
    } finally {
      setLoadingJournals(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-medical-green";
    if (score >= 40) return "text-medical-warning";
    return "text-destructive";
  };

  const getHealthBg = (score: number) => {
    if (score >= 70) return "from-medical-green/20 to-medical-mint/10";
    if (score >= 40) return "from-medical-warning/20 to-medical-peach/10";
    return "from-destructive/20 to-destructive/5";
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-medical-green";
    if (score <= 60) return "text-medical-warning";
    return "text-destructive";
  };

  const getRiskBg = (score: number) => {
    if (score <= 30) return "bg-medical-green";
    if (score <= 60) return "bg-medical-warning";
    return "bg-destructive";
  };

  // Build projected improvement line (14 days)
  const projectedData = Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const improvement =
      data.healthScore + (100 - data.healthScore) * (1 - Math.exp(-day / 7));
    return {
      day: `${t("day") || "Day"} ${day}`,
      [t("projectedHealth") || "Projected"]: Math.round(improvement),
    };
  });

  // Build actual analysis history points
  const historyPoints = history
    .filter((h) => h.date)
    .map((h, i) => {
      const date = new Date(h.date);
      return {
        dayLabel: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        index: i,
        score: data.healthScore - (history.length - 1 - i) * 3,
      };
    });

  // Merge into chart data
  const chartData = projectedData.map((point, i) => {
    const historyPoint = historyPoints[i];
    return {
      ...point,
      [t("actualHealth") || "Actual"]: historyPoint
        ? Math.max(10, Math.min(100, historyPoint.score))
        : undefined,
    };
  });

  // Citations found in the verdict text
  const verdictCitations = extractMarkdownLinks(
    translatedVerdict || data.verdict || ""
  );

  // Condition used for disease info links
  const condition = (data.topCondition || data.verdict || "").slice(0, 100);
  const diseaseLinks = condition ? getDiseaseInfoLinks(condition) : [];

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="glass-card p-6 rounded-3xl border border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold text-foreground">
                {t("generalVerdict")}
              </h3>
              {data.verdict && (
                <TranslateButton
                  text={data.verdict}
                  onTranslated={setTranslatedVerdict}
                  isTranslated={!!translatedVerdict}
                  cacheKey={`verdict:${data.verdict.slice(0, 60)}`}
                />
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed whitespace-pre-wrap">
              {translatedVerdict || data.verdict}
            </p>
          </div>
        </div>

        {/* Citations found in verdict text */}
        {verdictCitations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {t("citedInVerdict") || "Cited sources"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {verdictCitations.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Evidence basis — structured journal citations supporting the verdict */}
        {data.verdictEvidence && data.verdictEvidence.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {t("evidenceBasis") || "Scientific evidence basis"}
            </p>
            <div className="space-y-2">
              {data.verdictEvidence.map((ev, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                      {i + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {ev.journal}
                      </a>
                      {ev.year && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium">
                          {ev.year}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ev.finding}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Re-analyze reminder */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 mt-3">
          <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t("reanalyzeReminder") ||
              "We recommend running this analysis again in 1-2 days to track your health progress."}
          </p>
        </div>

        {/* Verify with journals button */}
        {!journals && (
          <button
            type="button"
            onClick={fetchJournals}
            disabled={loadingJournals || !(data.topCondition || data.verdict)}
            className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:from-primary/15 transition-all group disabled:opacity-60"
          >
            <div className="flex items-center gap-2 min-w-0">
              {loadingJournals ? (
                <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
              )}
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {t("verifyWithJournals") || "Not sure? Verify with medical journals"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t("verifyWithJournalsHint") ||
                    "Find peer-reviewed articles about this condition"}
                </p>
              </div>
            </div>
            <span className="text-primary text-xs font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
              {loadingJournals
                ? t("loading") || "..."
                : t("findJournals") || "Find"}{" "}
              →
            </span>
          </button>
        )}

        {journalsError && (
          <p className="mt-3 text-xs text-destructive">{journalsError}</p>
        )}

        {/* Journals results + disease info */}
        {journals !== null && (
          <div className="mt-3 space-y-3">
            {/* Disease Information Links */}
            {diseaseLinks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  {t("learnAboutCondition") || "Learn about this condition"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {diseaseLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-background/40 hover:bg-muted/60 transition-colors text-sm"
                    >
                      <span className="text-base leading-none shrink-0">{link.icon}</span>
                      <span className="font-medium text-foreground text-xs truncate">{link.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Peer-reviewed journal articles */}
            {journals.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {t("relevantJournals") || "Peer-reviewed articles for this verdict"}
                </p>
                <div className="space-y-2">
                  {journals.map((j, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background/40 p-3"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-primary font-semibold">
                        {j.name}
                        {j.articleYear ? ` · ${j.articleYear}` : ""}
                      </p>
                      {j.articleTitle && (
                        <p className="text-sm font-semibold text-foreground leading-snug mt-1">
                          {j.articleTitle}
                        </p>
                      )}
                      {j.reason && (
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {j.reason}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {j.articleUrl && (
                          <a
                            href={j.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-opacity"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t("openArticle") || "Open article"}
                          </a>
                        )}
                        {j.searchUrl && (
                          <a
                            href={j.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium hover:bg-muted/70 transition-colors"
                          >
                            <Search className="h-3 w-3" />
                            {t("searchInJournal") || "Search journal"}
                          </a>
                        )}
                        {j.url && (
                          <a
                            href={j.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-muted-foreground text-[11px] font-medium hover:text-foreground transition-colors"
                          >
                            {t("journalHome") || "Journal home"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {journals.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                {t("noJournalsFound") || "No specific articles found. Try the disease info links above."}
              </p>
            )}

            {/* Collapse */}
            <button
              type="button"
              onClick={() => setJournals(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center py-1"
            >
              {t("collapse") || "Hide"}
            </button>
          </div>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Score */}
        <div
          className={`glass-card p-6 rounded-3xl bg-gradient-to-br ${getHealthBg(data.healthScore)}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${getHealthColor(data.healthScore)}`} />
              <span className="font-display font-bold text-foreground">
                {t("healthScore")}
              </span>
            </div>
            <span
              className={`font-display text-3xl font-bold ${getHealthColor(data.healthScore)}`}
            >
              {data.healthScore}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("critical")} (0)</span>
              <span>{t("healthy")} (100)</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getRiskBg(100 - data.healthScore)}`}
                style={{ width: `${data.healthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div
          className={`glass-card p-6 rounded-3xl bg-gradient-to-br ${getHealthBg(100 - data.riskScore)}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getRiskColor(data.riskScore)}`} />
              <span className="font-display font-bold text-foreground">
                {t("riskScore")}
              </span>
            </div>
            <span
              className={`font-display text-3xl font-bold ${getRiskColor(data.riskScore)}`}
            >
              {data.riskScore}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("lowRisk")} (0%)</span>
              <span>{t("highRisk")} (100%)</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getRiskBg(data.riskScore)}`}
                style={{ width: `${data.riskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Health Progress Chart */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("healthProgressChart") || "Health Progress"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("healthChartDesc") ||
            "The green line shows projected improvement over 14 days. The blue line tracks your actual analysis scores over time."}
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: t("days") || "Days",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value:
                    t("healthScoreLabel") || "Health Score (0-100)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey={t("projectedHealth") || "Projected"}
                stroke="hsl(152, 68%, 38%)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey={t("actualHealth") || "Actual"}
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Measures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Short-term */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-warning/10">
              <Zap className="h-4 w-4 text-medical-warning" />
            </div>
            <h3 className="font-display font-bold text-foreground">
              {t("shortTermMeasures")}
            </h3>
          </div>
          <ul className="space-y-2.5">
            {data.shortTermMeasures.map((measure, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <TrendingUp className="h-4 w-4 text-medical-warning shrink-0 mt-0.5" />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Long-term */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-green/10">
              <Clock className="h-4 w-4 text-medical-green" />
            </div>
            <h3 className="font-display font-bold text-foreground">
              {t("longTermMeasures")}
            </h3>
          </div>
          <ul className="space-y-2.5">
            {data.longTermMeasures.map((measure, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <TrendingDown className="h-4 w-4 text-medical-green shrink-0 mt-0.5" />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
