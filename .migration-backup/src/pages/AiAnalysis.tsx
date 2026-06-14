import { useState, useRef } from "react";
import { SEOHead } from "@/components/SEOHead";
import { UsageBanner } from "@/components/UsageBanner";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConditionCardSkeleton, AnalyzingAnimation } from "@/components/ui/loading-skeleton";
import { EvidenceModal } from "@/components/ui/evidence-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Camera, Upload, AlertCircle, Image as ImageIcon, X, Sparkles, Eye,
  CheckCircle2, AlertTriangle, Zap, BookOpen, Info, Clock, Droplets, MapPin,
} from "lucide-react";

interface AnalysisResult {
  conditions: {
    name: string;
    description: string;
    likelihood: "low" | "medium" | "high";
  }[];
  observations: string[];
  recommendation: string;
  medications?: { name: string; type: string; dosage: string; instructions: string; estimatedPrice?: string }[];
  healingStages?: { week: string; description: string; appearance: string }[];
}

export default function AiAnalysis() {
  const { profile, getProfileContext, addToHistory } = useMedicalProfile();
  const { t, language } = useLanguage();
  const { canUse, recordUsage } = useUsageLimits();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Additional rash diagnostic questions
  const [rashDuration, setRashDuration] = useState("");
  const [rashItching, setRashItching] = useState("");
  const [rashLocation, setRashLocation] = useState("");
  const [rashSpread, setRashSpread] = useState("");
  const [rashAllergenContact, setRashAllergenContact] = useState("");
  const [rashPain, setRashPain] = useState("");
  const [rashTemperature, setRashTemperature] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(t('errorSelectImage')); return; }
    if (file.size > 10 * 1024 * 1024) { setError(t('errorImageSize')); return; }
    setFileName(file.name);
    setError(null);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setFileName("");
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!image) { setError(t('errorUploadFirst')); return; }
    if (!canUse("aiAnalysis")) { setError(t('usageLimitReached')); return; }
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    // Build extra context from rash questions
    const rashContext = [
      rashDuration && `Duration: ${rashDuration}`,
      rashItching && `Itching: ${rashItching}`,
      rashLocation && `Location: ${rashLocation}`,
      rashSpread && `Spreading: ${rashSpread}`,
      rashAllergenContact && `Allergen contact: ${rashAllergenContact}`,
      rashPain && `Pain level: ${rashPain}`,
      rashTemperature && `Has fever: ${rashTemperature}`,
    ].filter(Boolean).join(". ");

    try {
      const profileContext = [getProfileContext(), rashContext].filter(Boolean).join("\n");
      const { data, error: funcError } = await supabase.functions.invoke("analyze-image", {
        body: { image, profileContext, language },
      });
      if (funcError) throw funcError;
      setResults(data);
      await recordUsage("aiAnalysis", { result: data?.conditions?.map((c: { name: string }) => c.name).join(", ") });
      if (data?.conditions?.length > 0) {
        addToHistory({
          symptoms: "Image analysis",
          result: data.conditions.map((c: { name: string }) => c.name).join(", "),
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(t('errorAnalysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLikelihoodStyles = (likelihood: string) => {
    switch (likelihood) {
      case "low": return { bg: "bg-medical-green/10", border: "border-medical-green/20", text: "text-medical-green", icon: CheckCircle2 };
      case "medium": return { bg: "bg-medical-warning/10", border: "border-medical-warning/20", text: "text-medical-warning", icon: AlertTriangle };
      case "high": return { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: AlertCircle };
      default: return { bg: "bg-muted", border: "border-border", text: "text-muted-foreground", icon: Eye };
    }
  };

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="AI Image Analysis" description="Upload photos of skin conditions for AI-powered visual analysis." path="/ai-analysis" />
      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto"><UsageBanner feature="aiAnalysis" /></div>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Camera className="h-4 w-4 text-medical-purple" />
            <span className="text-gradient">{t('precisionAIAnalysis')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('aiImageAnalysis')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('uploadPhotoDescription')}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {(profile.age || profile.allergies.length > 0) && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {t('analysisPersonalized')}
                  {profile.age && ` (${t('age')}: ${profile.age})`}
                  {profile.allergies.length > 0 && `, ${profile.allergies.length} ${t('allergies').toLowerCase()}`}
                </span>
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />{t('uploadImage')}
            </h2>
            {!image ? (
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-border rounded-3xl cursor-pointer hover:border-primary/50 transition-all bg-muted/30 hover:bg-muted/50 group">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-medical-purple mb-6 group-hover:scale-105 transition-transform">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <p className="mb-2 text-lg text-foreground font-semibold">{t('clickToUpload')}</p>
                  <p className="text-sm text-muted-foreground">{t('upTo10MB')}</p>
                  <p className="text-xs text-muted-foreground mt-2">{t('forBestResults')}</p>
                </div>
                <input id="image-upload" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={image} alt="Uploaded image" className="w-full max-h-[400px] object-contain rounded-2xl bg-muted" />
                <button onClick={clearImage} className="absolute top-3 right-3 p-2.5 rounded-xl bg-background/90 text-foreground hover:bg-destructive hover:text-white transition-colors shadow-lg" aria-label="Remove image">
                  <X className="h-5 w-5" />
                </button>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />{fileName}
                </div>
              </div>
            )}
          </div>

          {/* Rash Diagnostic Questions */}
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />{t('rashDiagnosticQuestions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-medical-blue" />{t('rashDuration')}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["today", "fewDays", "oneWeek", "twoWeeksPlus"].map((opt) => (
                    <button key={opt} onClick={() => setRashDuration(opt)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                        rashDuration === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>{t(opt)}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-medical-coral" />{t('rashItching')}
                </Label>
                <div className="flex gap-2 mt-2">
                  {["noItching", "mildItching", "severeItching"].map((opt) => (
                    <button key={opt} onClick={() => setRashItching(opt)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                        rashItching === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>{t(opt)}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-medical-purple" />{t('rashBodyLocation')}
                </Label>
                <Input placeholder={t('rashLocationPlaceholder')} value={rashLocation} onChange={(e) => setRashLocation(e.target.value)} className="mt-1 rounded-xl" maxLength={200} />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-medical-warning" />{t('rashSpreading')}
                </Label>
                <div className="flex gap-2 mt-2">
                  {["notSpreading", "slowlySpreading", "rapidlySpreading"].map((opt) => (
                    <button key={opt} onClick={() => setRashSpread(opt)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                        rashSpread === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>{t(opt)}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />{t('rashAllergenContact')}
                </Label>
                <Input placeholder={t('rashAllergenPlaceholder')} value={rashAllergenContact} onChange={(e) => setRashAllergenContact(e.target.value)} className="mt-1 rounded-xl" maxLength={200} />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-medical-warning" />{t('rashPainLevel')}
                </Label>
                <div className="flex gap-2 mt-2">
                  {["noPain", "mildPain", "severePain"].map((opt) => (
                    <button key={opt} onClick={() => setRashPain(opt)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                        rashPain === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>{t(opt)}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" /><p className="font-medium">{error}</p>
            </div>
          )}

          <Button onClick={analyzeImage} disabled={!image || isAnalyzing} size="lg"
            className="w-full gradient-primary text-primary-foreground border-0 rounded-2xl h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
            {isAnalyzing ? (
              <><div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('analyzingImage')}</>
            ) : (
              <><Zap className="mr-2 h-5 w-5" />{t('analyzeImage')}</>
            )}
          </Button>

          {isAnalyzing && <div className="mt-12"><AnalyzingAnimation /></div>}

          {results && !isAnalyzing && (
            <div className="mt-12 space-y-8 animate-fade-up">
              {results.observations && results.observations.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />{t('aiObservations')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.observations.map((observation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{observation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.conditions && results.conditions.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">{t('possibleConditions')}</h2>
                  <div className="space-y-4">
                    {results.conditions.map((condition, index) => {
                      const styles = getLikelihoodStyles(condition.likelihood);
                      const LikelihoodIcon = styles.icon;
                      return (
                        <div key={index} className={`glass-card p-6 rounded-2xl border-2 ${styles.border}`}>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-start gap-4">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.bg}`}>
                                <LikelihoodIcon className={`h-6 w-6 ${styles.text}`} />
                              </div>
                              <div>
                                <h3 className="font-display text-xl font-bold text-foreground mb-1">{condition.name}</h3>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
                                  <LikelihoodIcon className="h-3 w-3" />
                                  {condition.likelihood.charAt(0).toUpperCase() + condition.likelihood.slice(1)} {t('likelihood')}
                                </span>
                              </div>
                            </div>
                            <EvidenceModal condition={condition.name}>
                              <Button variant="ghost" size="sm" className="shrink-0"><BookOpen className="h-4 w-4" /></Button>
                            </EvidenceModal>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{condition.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.recommendation && (
                <div className="glass-card p-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground mb-2">{t('aiRecommendation')}</h3>
                      <p className="text-muted-foreground leading-relaxed">{results.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications */}
              {results.medications && results.medications.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-medical-green" />{t('recommendedMedications') || 'Recommended Medications'}
                  </h2>
                  <div className="space-y-3">
                    {results.medications.map((med, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-bold text-foreground">{med.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{med.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1"><strong>{t('dosage') || 'Dosage'}:</strong> {med.dosage}</p>
                        <p className="text-sm text-muted-foreground">{med.instructions}</p>
                        {med.estimatedPrice && <p className="text-xs text-medical-green font-medium mt-1">~{med.estimatedPrice}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Healing Stages */}
              {results.healingStages && results.healingStages.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-medical-green" />{t('healingTimeline') || 'Healing Timeline'}
                  </h2>
                  <div className="space-y-4">
                    {results.healingStages.map((stage, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-medical-green/20 flex items-center justify-center text-medical-green font-bold text-xs">{i + 1}</div>
                          {i < results.healingStages!.length - 1 && <div className="w-0.5 h-full bg-medical-green/20 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-bold text-foreground text-sm">{stage.week}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                          <p className="text-xs text-primary mt-1 italic">{t('appearance') || 'Appearance'}: {stage.appearance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-analyze reminder */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">{t('reanalyzeReminder')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
