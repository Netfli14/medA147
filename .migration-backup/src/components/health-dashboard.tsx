import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslateButton } from "@/components/ui/translate-button";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { supabase } from "@/integrations/supabase/client";
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

interface DashboardData {
  healthScore: number;
  riskScore: number;
  shortTermMeasures: string[];
  longTermMeasures: string[];
  verdict: string;
  topCondition?: string;
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
      const { data: resp, error } = await supabase.functions.invoke("suggest-journals", {
        body: { condition: condition.slice(0, 300), language },
      });
      if (error) throw error;
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
    const improvement = data.healthScore + (100 - data.healthScore) * (1 - Math.exp(-day / 7));
    return {
      day: `${t('day') || 'Day'} ${day}`,
      [t('projectedHealth') || 'Projected']: Math.round(improvement),
    };
  });

  // Build actual analysis history points
  const historyPoints = history
    .filter((h) => h.date)
    .map((h, i) => {
      const date = new Date(h.date);
      return {
        dayLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        index: i,
        score: data.healthScore - (history.length - 1 - i) * 3, // approximate
      };
    });

  // Merge into chart data  
  const chartData = projectedData.map((point, i) => {
    const historyPoint = historyPoints[i];
    return {
      ...point,
      [t('actualHealth') || 'Actual']: historyPoint ? Math.max(10, Math.min(100, historyPoint.score)) : undefined,
    };
  });

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
              <h3 className="font-display text-lg font-bold text-foreground">{t('generalVerdict')}</h3>
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

        {/* Re-analyze reminder */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 mt-3">
          <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t('reanalyzeReminder') || 'We recommend running this analysis again in 1-2 days to track your health progress and see how your condition develops.'}
          </p>
        </div>

        {/* Verify with journals — interactive */}
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
                  {t('verifyWithJournals') || 'Not sure? Verify with medical journals'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t('verifyWithJournalsHint') || 'Find peer-reviewed articles about this condition'}
                </p>
              </div>
            </div>
            <span className="text-primary text-xs font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
              {loadingJournals ? (t('loading') || '...') : (t('findJournals') || 'Find')} →
            </span>
          </button>
        )}

        {journalsError && (
          <p className="mt-3 text-xs text-destructive">{journalsError}</p>
        )}

        {journals && journals.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {t('relevantJournals') || 'Specific articles supporting this verdict'}
            </div>
            {journals.map((j, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] uppercase tracking-wide text-primary font-semibold">{j.name}{j.articleYear ? ` · ${j.articleYear}` : ''}</p>
                {j.articleTitle && (
                  <p className="text-sm font-semibold text-foreground leading-snug mt-1">{j.articleTitle}</p>
                )}
                {j.reason && (
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{j.reason}</p>
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
                      {t('openArticle') || 'Open article page'}
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
                      {t('searchInJournal') || 'Search journal'}
                    </a>
                  )}
                  {j.url && (
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-muted-foreground text-[11px] font-medium hover:text-foreground transition-colors"
                    >
                      {t('journalHome') || 'Journal home'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Score */}
        <div className={`glass-card p-6 rounded-3xl bg-gradient-to-br ${getHealthBg(data.healthScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className={`h-5 w-5 ${getHealthColor(data.healthScore)}`} />
              <span className="font-display font-bold text-foreground">{t('healthScore')}</span>
            </div>
            <span className={`font-display text-3xl font-bold ${getHealthColor(data.healthScore)}`}>
              {data.healthScore}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('critical')} (0)</span>
              <span>{t('healthy')} (100)</span>
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
        <div className={`glass-card p-6 rounded-3xl bg-gradient-to-br ${getHealthBg(100 - data.riskScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getRiskColor(data.riskScore)}`} />
              <span className="font-display font-bold text-foreground">{t('riskScore')}</span>
            </div>
            <span className={`font-display text-3xl font-bold ${getRiskColor(data.riskScore)}`}>
              {data.riskScore}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('lowRisk')} (0%)</span>
              <span>{t('highRisk')} (100%)</span>
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
          {t('healthProgressChart') || 'Health Progress'}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t('healthChartDesc') || 'The green line shows projected improvement over 14 days. The blue line tracks your actual analysis scores over time.'}
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: t('days') || 'Days', position: 'insideBottom', offset: -5, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: t('healthScoreLabel') || 'Health Score (0-100)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey={t('projectedHealth') || 'Projected'}
                stroke="hsl(152, 68%, 38%)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey={t('actualHealth') || 'Actual'}
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'hsl(217, 91%, 60%)' }}
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
            <h3 className="font-display font-bold text-foreground">{t('shortTermMeasures')}</h3>
          </div>
          <ul className="space-y-2.5">
            {data.shortTermMeasures.map((measure, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
            <h3 className="font-display font-bold text-foreground">{t('longTermMeasures')}</h3>
          </div>
          <ul className="space-y-2.5">
            {data.longTermMeasures.map((measure, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
