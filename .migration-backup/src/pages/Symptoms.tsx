import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { UsageBanner } from "@/components/UsageBanner";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConditionCardSkeleton, AnalyzingAnimation } from "@/components/ui/loading-skeleton";
import { EvidenceModal } from "@/components/ui/evidence-modal";
import { HealthDashboard } from "@/components/health-dashboard";
import {
  Activity, AlertCircle, Thermometer, HeartPulse, Brain, Bone, Eye, Ear, Wind, Sparkles,
  Stethoscope, AlertTriangle, CheckCircle2, BookOpen, Info, Apple, Dumbbell, Clock, Droplets,
} from "lucide-react";

const symptomKeys = [
  { id: "headache", labelKey: "headache", icon: Brain },
  { id: "fever", labelKey: "fever", icon: Thermometer },
  { id: "cough", labelKey: "cough", icon: Wind },
  { id: "fatigue", labelKey: "fatigue", icon: HeartPulse },
  { id: "sore_throat", labelKey: "soreThroat", icon: Ear },
  { id: "body_aches", labelKey: "bodyAches", icon: Bone },
  { id: "nausea", labelKey: "nausea", icon: Activity },
  { id: "dizziness", labelKey: "dizziness", icon: Brain },
  { id: "shortness_of_breath", labelKey: "shortnessOfBreath", icon: Wind },
  { id: "chest_pain", labelKey: "chestPain", icon: HeartPulse },
  { id: "runny_nose", labelKey: "runnyNose", icon: Eye },
  { id: "loss_of_appetite", labelKey: "lossOfAppetite", icon: Activity },
];

const severityOptions = [
  { value: "mild", labelKey: "mild" },
  { value: "moderate", labelKey: "moderate" },
  { value: "severe", labelKey: "severe" },
];

const durationOptions = [
  { value: "today", labelKey: "today" },
  { value: "2-3 days", labelKey: "fewDays" },
  { value: "1 week", labelKey: "oneWeek" },
  { value: "2+ weeks", labelKey: "twoWeeksPlus" },
  { value: "1+ month", labelKey: "monthPlus" },
];

interface AnalysisResult {
  conditions: {
    name: string;
    description: string;
    possibleCause: string;
    severity: "low" | "medium" | "high";
    sources?: string[];
  }[];
  healthScore?: number;
  riskScore?: number;
  shortTermMeasures?: string[];
  longTermMeasures?: string[];
  verdict?: string;
}

export default function Symptoms() {
  const { profile, getProfileContext, addToHistory } = useMedicalProfile();
  const { t, language } = useLanguage();
  const { canUse, recordUsage } = useUsageLimits();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalSymptoms, setAdditionalSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced diagnostic questions
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [temperature, setTemperature] = useState("");
  const [recentTravel, setRecentTravel] = useState("");
  
  // Lifestyle questions
  const [diet, setDiet] = useState("");
  const [exercise, setExercise] = useState("");
  const [sleep, setSleep] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [stressLevel, setStressLevel] = useState("");

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0 && !additionalSymptoms.trim()) {
      setError(t('pleaseSelectSymptom'));
      return;
    }
    if (!canUse("symptoms")) {
      setError(t('usageLimitReached'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const selectedLabels = selectedSymptoms.map(
      (id) => t(symptomKeys.find((s) => s.id === id)?.labelKey || id)
    );

    const allSymptoms = [...selectedLabels, additionalSymptoms.trim()].filter(Boolean).join(", ");

    // Build enhanced context from diagnostic questions
    const diagnosticContext = [
      severity && `Severity: ${severity}`,
      duration && `Duration: ${duration}`,
      temperature && `Temperature: ${temperature}°C`,
      recentTravel && `Recent travel: ${recentTravel}`,
      waterIntake && `Water intake: ${waterIntake}`,
      stressLevel && `Stress level: ${stressLevel}`,
    ].filter(Boolean).join(". ");

    const lifestyleContext = [
      diet && `Diet: ${diet}`,
      exercise && `Exercise: ${exercise}`,
      sleep && `Sleep: ${sleep}`,
    ].filter(Boolean).join(". ");

    try {
      const profileContext = getProfileContext();
      const fullContext = [profileContext, diagnosticContext, lifestyleContext].filter(Boolean).join("\n");
      
      const { data, error: funcError } = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms: allSymptoms, profileContext: fullContext, language },
      });

      if (funcError) throw funcError;
      setResults(data);
      await recordUsage("symptoms", { symptoms: allSymptoms, result: data?.conditions?.map((c: { name: string }) => c.name).join(", ") });

      if (data?.conditions?.length > 0) {
        addToHistory({
          symptoms: allSymptoms,
          result: data.conditions.map((c: { name: string }) => c.name).join(", "),
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      if (err instanceof Error && err.message.includes("429")) {
        setError(t('rateLimitError') || "Too many requests. Please try again later.");
      } else {
        setError(t('errorAnalysisFailed'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "low": return { bg: "bg-medical-green/10", border: "border-medical-green/20", text: "text-medical-green", icon: CheckCircle2 };
      case "medium": return { bg: "bg-medical-warning/10", border: "border-medical-warning/20", text: "text-medical-warning", icon: AlertTriangle };
      case "high": return { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: AlertCircle };
      default: return { bg: "bg-muted", border: "border-border", text: "text-muted-foreground", icon: Activity };
    }
  };

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="Symptom Checker" description="Advanced AI-powered symptom analysis. Select symptoms and get accurate condition identification with evidence-based results." path="/symptoms" />
      <div className="container py-12 md:py-16">
        {/* Usage Banner */}
        <div className="max-w-4xl mx-auto">
          <UsageBanner feature="symptoms" />
        </div>

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t('advancedSymptomAnalysis')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('analyzeYourSymptoms').split(' ').map((word, i) =>
              i === 1 ? <span key={i} className="text-gradient">{word} </span> : word + ' '
            )}
          </h1>
          <p className="text-lg text-muted-foreground">{t('symptomDescription')}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Context Notice */}
          {(profile.age || profile.chronicConditions.length > 0) && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {t('analysisPersonalized')}
                  {profile.age && ` (${t('age')}: ${profile.age})`}
                  {profile.gender && `, ${t(profile.gender)}`}
                  {profile.chronicConditions.length > 0 && `, ${profile.chronicConditions.length} ${t('chronicConditions').toLowerCase()}`}
                </span>
              </p>
            </div>
          )}

          {/* Symptoms Selection */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />{t('selectSymptoms')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {symptomKeys.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <button key={symptom.id} onClick={() => toggleSymptom(symptom.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected ? "border-primary bg-primary/10 text-primary shadow-md scale-[1.02]"
                        : "border-border bg-background hover:border-primary/50 text-foreground hover:bg-muted/50"
                    }`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{t(symptom.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Details */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />{t('diagnosticDetails') || 'Diagnostic Details'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Severity */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-medical-warning" />
                  {t('symptomSeverity') || 'Symptom Severity'}
                </Label>
                <div className="flex gap-2 mt-2">
                  {severityOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setSeverity(opt.value)}
                      className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                        severity === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>
                      {t(opt.labelKey) || opt.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-medical-blue" />
                  {t('symptomDuration') || 'Duration'}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {durationOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setDuration(opt.value)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                        duration === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>
                      {t(opt.labelKey) || opt.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-destructive" />
                  {t('bodyTemperature') || 'Body Temperature (°C)'}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              {/* Recent Travel */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-medical-purple" />
                  {t('recentTravel') || 'Recent Travel'}
                </Label>
                <Input
                  placeholder={t('recentTravelPlaceholder') || "e.g., South Asia, 2 weeks ago"}
                  value={recentTravel}
                  onChange={(e) => setRecentTravel(e.target.value)}
                  className="mt-1 rounded-xl"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* Detail description */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />{t('describeInDetail')}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{t('moreDetailsMoreAccurate')}</p>
            <Textarea
              placeholder={t('describePlaceholder')}
              value={additionalSymptoms}
              onChange={(e) => setAdditionalSymptoms(e.target.value)}
              className="min-h-[140px] resize-none rounded-2xl text-base"
              maxLength={5000}
            />
          </div>

          {/* Lifestyle Questions */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Apple className="h-5 w-5 text-primary" />{t('lifestyleQuestions')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Apple className="h-4 w-4 text-medical-green" />{t('dietQuestion')}
                </label>
                <Textarea
                  placeholder={t('dietPlaceholder')}
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="min-h-[80px] resize-none rounded-2xl text-sm"
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-medical-blue" />{t('exerciseQuestion')}
                </label>
                <Textarea
                  placeholder={t('exercisePlaceholder')}
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="min-h-[80px] resize-none rounded-2xl text-sm"
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-medical-purple" />{t('sleepQuestion')}
                </label>
                <Textarea
                  placeholder={t('sleepPlaceholder')}
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="min-h-[80px] resize-none rounded-2xl text-sm"
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-medical-sky" />{t('waterIntake') || 'Daily Water Intake'}
                  </label>
                  <Input
                    placeholder={t('waterIntakePlaceholder') || "e.g., 1.5 liters/day"}
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(e.target.value)}
                    className="mt-1 rounded-xl"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-medical-coral" />{t('stressLevel') || 'Stress Level'}
                  </label>
                  <div className="flex gap-2 mt-1">
                    {["low", "medium", "high"].map((level) => (
                      <button key={level} onClick={() => setStressLevel(level)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                          stressLevel === level ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                        }`}>
                        {t(level) || level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" /><p className="font-medium">{error}</p>
            </div>
          )}

          <Button onClick={analyzeSymptoms} disabled={isAnalyzing} size="lg"
            className="w-full gradient-primary text-primary-foreground border-0 rounded-2xl h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
            {isAnalyzing ? (
              <><div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('analyzingSymptoms')}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{t('analyzeSymptoms')}</>
            )}
          </Button>

          {isAnalyzing && <div className="mt-12"><AnalyzingAnimation /></div>}

          {/* Results */}
          {results && results.conditions && !isAnalyzing && (
            <div className="mt-12 space-y-8 animate-fade-up">
              {results.healthScore !== undefined && results.riskScore !== undefined && (
                <HealthDashboard
                  data={{
                    healthScore: results.healthScore,
                    riskScore: results.riskScore,
                    shortTermMeasures: results.shortTermMeasures || [],
                    longTermMeasures: results.longTermMeasures || [],
                    verdict: results.verdict || "",
                    topCondition: results.conditions?.[0]?.name,
                  }}
                />
              )}

              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t('possibleConditions').split(' ').map((word, i) =>
                    i === 0 ? word + ' ' : <span key={i} className="text-gradient">{word}</span>
                  )}
                </h2>
                <p className="text-muted-foreground">{t('basedOnSymptoms')}</p>
              </div>

              <div className="space-y-4">
                {results.conditions.map((condition, index) => {
                  const styles = getSeverityStyles(condition.severity);
                  const SeverityIcon = styles.icon;
                  return (
                    <div key={index} className={`glass-card p-6 rounded-2xl border-2 ${styles.border} animate-fade-up`} style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.bg}`}>
                            <SeverityIcon className={`h-6 w-6 ${styles.text}`} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold text-foreground mb-1">{condition.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
                              <SeverityIcon className="h-3 w-3" />
                              {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)} {t('severity')}
                            </span>
                          </div>
                        </div>
                        <EvidenceModal condition={condition.name}>
                          <Button variant="ghost" size="sm" className="shrink-0"><BookOpen className="h-4 w-4" /></Button>
                        </EvidenceModal>
                      </div>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{condition.description}</p>
                      <div className="p-4 rounded-xl bg-muted/50 mb-3">
                        <span className="font-semibold text-foreground text-sm">{t('possibleCause')}:</span>
                        <p className="text-muted-foreground text-sm mt-1">{condition.possibleCause}</p>
                      </div>
                      {condition.sources && condition.sources.length > 0 && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 mb-2">
                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                            {t('medicalSources')}:
                          </span>
                          <ul className="space-y-1.5">
                            {condition.sources.map((source, si) => {
                              const urlMatch = source.match(/(https?:\/\/[^\s]+)/);
                              return (
                                <li key={si} className="text-xs text-muted-foreground leading-relaxed">
                                  {urlMatch ? (
                                    <>
                                      {source.replace(urlMatch[0], '').replace(/\s+$/, '')}
                                      {' '}
                                      <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                                        {t('viewSource')} ↗
                                      </a>
                                    </>
                                  ) : (
                                    <span>• {source}</span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
