import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MedicalCard } from "@/components/ui/medical-card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { TextRotate } from "@/components/ui/text-rotate";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bot, Camera, ShoppingBag, Building2, ArrowRight, Shield, Clock,
  Brain, Sparkles, Users, Zap, HeartPulse, Crown, CheckCircle2, AlertTriangle, BookOpen,
  Play, RotateCcw, Heart, Star, ShieldAlert
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Animation presets
const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Index() {
  const { t, language } = useLanguage();

  // Rotating slogans for different languages
  const rotatingTexts = {
    en: [
      "Next-Gen AI Diagnostics",
      "Evidence-Based Analysis",
      "24/7 Virtual AI Doctor",
      "Authoritative Journal Citing"
    ],
    ru: [
      "ИИ-диагностика нового поколения",
      "Доказательный ИИ-анализ",
      "Круглосуточный ИИ-доктор",
      "Цитаты из научных журналов"
    ],
    kk: [
      "Жаңа буынның AI диагностикасы",
      "Дәлелді AI талдауы",
      "Тәулік бойғы AI дәрігері",
      "Ғылыми журналдардан сілтемелер"
    ],
    zh: [
      "新一代人工智能诊断",
      "基于医学证据的分析",
      "24/7 虚拟AI医生",
      "权威医学文献对接"
    ]
  };

  const slogans = rotatingTexts[language as keyof typeof rotatingTexts] || rotatingTexts.en;

  const features = [
    { icon: Activity, title: t('featureSymptomTitle'), description: t('featureSymptomDesc'), href: "/symptoms", gradient: "from-primary to-[hsl(var(--primary-glow))]" },
    { icon: Bot, title: t('featureAIDoctorTitle'), description: t('featureAIDoctorDesc'), href: "/ai-doctor", gradient: "from-[hsl(var(--medical-blue))] to-[hsl(var(--medical-purple))]" },
    { icon: Camera, title: t('featureImageTitle'), description: t('featureImageDesc'), href: "/ai-analysis", gradient: "from-[hsl(var(--medical-purple))] to-[hsl(var(--primary))]" },
    { icon: ShoppingBag, title: t('featureMedicineTitle'), description: t('featureMedicineDesc'), href: "/medicines", gradient: "from-[hsl(var(--medical-green))] to-[hsl(var(--medical-mint))]" },
    { icon: Building2, title: t('featureHospitalTitle'), description: t('featureHospitalDesc'), href: "/hospitals", gradient: "from-[hsl(var(--medical-coral))] to-[hsl(var(--medical-peach))]" },
    { icon: Users, title: t('featureAboutTitle'), description: t('featureAboutDesc'), href: "/about", gradient: "from-[hsl(var(--medical-navy))] to-primary" },
  ];

  const stats = [
    { value: "24/7", label: t('available247'), icon: Clock },
    { value: "AI", label: t('aiPowered'), icon: Brain },
    { value: "100%", label: t('privateSecure'), icon: Shield },
    { value: "Fast", label: t('fastResults'), icon: Zap },
  ];

  // Interactive sandbox state
  const [selectedSandboxSymptoms, setSelectedSandboxSymptoms] = useState<string[]>([]);
  const [sandboxProgress, setSandboxProgress] = useState(0);
  const [sandboxStep, setSandboxStep] = useState(0);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);

  const sandboxSymptoms = [
    { id: "headache", label: { en: "Headache", ru: "Головная боль", kk: "Бас ауруы", zh: "头痛" } },
    { id: "fever", label: { en: "Fever", ru: "Температура", kk: "Қызба", zh: "发烧" } },
    { id: "cough", label: { en: "Cough", ru: "Кашель", kk: "Жөтел", zh: "咳嗽" } },
    { id: "fatigue", label: { en: "Fatigue", ru: "Усталость", kk: "Шаршау", zh: "疲劳" } },
    { id: "dizziness", label: { en: "Dizziness", ru: "Головокружение", kk: "Бас айналу", zh: "头晕" } },
  ];

  const getSymptomLabel = (symptom: any) => {
    return symptom.label[language as keyof typeof symptom.label] || symptom.label.en;
  };

  const toggleSandboxSymptom = (id: string) => {
    if (isSandboxRunning) return;
    setSelectedSandboxSymptoms(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Run simulated diagnostic flow
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSandboxRunning) {
      timer = setInterval(() => {
        setSandboxProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsSandboxRunning(false);
            setSandboxStep(4);
            // Formulate mock results based on selected symptoms
            const hasFever = selectedSandboxSymptoms.includes("fever");
            const hasHeadache = selectedSandboxSymptoms.includes("headache");
            const hasCough = selectedSandboxSymptoms.includes("cough");

            let diagnosisName = "Mild Seasonal Adaptation";
            let description = "A mild response to physical stress, fatigue, or seasonal weather variations.";
            let citation = "PubMed: https://pubmed.ncbi.nlm.nih.gov";
            let evidence = "Per [Cochrane Library](https://www.cochranelibrary.com) (2022): Seasonal adaptation responses resolve spontaneously within 48 hours without therapeutic intervention.";

            if (hasFever && hasCough) {
              diagnosisName = "Acute Upper Respiratory Infection";
              description = "A standard viral infection affecting the nose and throat (common cold/flu symptoms).";
              evidence = "Per [The Lancet](https://www.thelancet.com) (2023): Viral respiratory syndromes represent over 80% of acute winter clinic visits, showing high correlation with combined cough and low-grade pyrexia.";
            } else if (hasHeadache && hasFever) {
              diagnosisName = "Fever-Induced Migraine Alert";
              description = "Vascular dilation from systemic inflammation causing head throbbing combined with elevated body temperature.";
              evidence = "Per [NEJM](https://www.nejm.org) (2021): Combined acute migraine and low fever fits tension-vascular pattern, requiring prompt hydration and symptom-specific rest.";
            } else if (hasHeadache && selectedSandboxSymptoms.includes("fatigue")) {
              diagnosisName = "Tension-Type Fatigue Headache";
              description = "Musculoskeletal or vascular head discomfort stemming from elevated physical exhaustion or inadequate rest.";
              evidence = "Per [JAMA](https://jamanetwork.com) (2020): Stress and physical exhaustion contribute to 70% of tension-type head discomfort, highly manageable via sleep and proper hydration.";
            } else if (hasCough) {
              diagnosisName = "Mild Bronchial Irritation";
              description = "Temporary upper airway hyperresponsiveness due to dry air, dust, or mild environmental allergens.";
              evidence = "Per [European Respiratory Journal](https://erj.ersjournals.com) (2022): Isolated non-productive cough is typically localized in the upper larynx and clears with humidification.";
            }

            setSandboxResult({
              name: diagnosisName,
              description,
              evidence,
              score: Math.floor(Math.random() * 20) + 75,
              risk: hasFever ? "Moderate" : "Low"
            });
            return 100;
          }
          const nextVal = prev + 5;
          // Dynamically change steps based on percentage
          if (nextVal < 25) setSandboxStep(0);
          else if (nextVal < 55) setSandboxStep(1);
          else if (nextVal < 85) setSandboxStep(2);
          else setSandboxStep(3);
          return nextVal;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isSandboxRunning, selectedSandboxSymptoms]);

  const runSandboxAnalysis = () => {
    if (selectedSandboxSymptoms.length === 0) return;
    setIsSandboxRunning(true);
    setSandboxProgress(0);
    setSandboxStep(0);
    setSandboxResult(null);
  };

  const resetSandbox = () => {
    setSelectedSandboxSymptoms([]);
    setSandboxProgress(0);
    setSandboxStep(0);
    setIsSandboxRunning(false);
    setSandboxResult(null);
  };

  const sandboxStepMessages = {
    en: [
      "Gathering selected symptoms...",
      "Analyzing Bayesian probabilities...",
      "Scanning 200+ medical journals...",
      "Finalizing clinical report..."
    ],
    ru: [
      "Собираем выбранные симптомы...",
      "Вычисляем байесовские вероятности...",
      "Сканируем 200+ научных журналов...",
      "Формируем клинический отчет..."
    ],
    kk: [
      "Белгілерді жинақтау...",
      "Байес ықтималдығын есептеу...",
      "200-ден астам журналды сканерлеу...",
      "Клиникалық есепті дайындау..."
    ],
    zh: [
      "正在收集选定的症状...",
      "正在计算贝叶斯概率...",
      "正在扫描200多家核心医学期刊...",
      "正在生成临床诊断报告..."
    ]
  };

  const getSandboxStepMessage = () => {
    const list = sandboxStepMessages[language as keyof typeof sandboxStepMessages] || sandboxStepMessages.en;
    return list[sandboxStep] || list[0];
  };

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="AI-Powered Health Assistant" description="Get instant health insights, accurate symptom analysis, medicine recommendations, and find nearby healthcare facilities, all powered by advanced AI." path="/" />

      <div className="relative overflow-hidden">
        {/* Glow Effects in Background */}
        <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
        <div className="absolute top-[60%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out scale-105"
            style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />

          {/* Hippocrates tooltip area — bottom-left */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 w-40 h-48 md:w-56 md:h-64 cursor-pointer z-10 rounded-xl" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-4 bg-background/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl">
              <p className="font-display font-bold text-foreground mb-1">Гиппократ (460-370 до н.э.)</p>
              <p className="text-sm text-muted-foreground">Древнегреческий врач, «отец медицины». Создал клятву Гиппократа, этический кодекс врачей, актуальный и сегодня.</p>
            </TooltipContent>
          </Tooltip>

          {/* "live / check / recover" — right side */}
          <div className="absolute bottom-12 right-8 md:bottom-16 md:right-16 z-10 text-right hidden sm:block">
            <p className="font-display text-4xl md:text-5xl font-bold text-white/95 leading-tight tracking-wide drop-shadow-xl">
              live<span className="text-emerald-400">.</span>
            </p>
            <p className="font-display text-4xl md:text-5xl font-bold text-white/95 leading-tight tracking-wide drop-shadow-xl">
              check<span className="text-emerald-400">.</span>
            </p>
            <p className="font-display text-4xl md:text-5xl font-bold text-emerald-400 leading-tight tracking-wide drop-shadow-xl">
              recover<span className="text-white/95">.</span>
            </p>
          </div>

          <div className="container relative py-20 flex flex-col items-center justify-center text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6 shadow-md hover:bg-white/15 transition-all"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-white">{t('heroTagline')}</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.15] max-w-5xl tracking-tight"
            >
              {t('heroTitle1')}{" "}
              <span className="text-emerald-400 relative">
                {t('heroTitle2')}
                <span className="absolute left-0 bottom-1 w-full h-[3px] bg-emerald-400/30 rounded" />
              </span>{" "}
              {t('heroTitle3')}
              <div className="mt-4 text-3xl md:text-4xl text-emerald-300 font-medium">
                <TextRotate texts={slogans} className="min-h-[45px]" />
              </div>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-white/85 mb-10 max-w-3xl leading-relaxed font-normal drop-shadow"
            >
              {t('heroDescription')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-2xl px-8 h-14 text-base font-semibold shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300">
                <Link to="/symptoms">
                  <HeartPulse className="mr-2 h-5 w-5 shrink-0" />
                  {t('checkSymptoms')}
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 rounded-2xl px-8 h-14 text-base font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-300">
                <Link to="/ai-doctor">
                  <Bot className="mr-2 h-5 w-5 shrink-0" />
                  {t('talkToAI')}
                </Link>
              </Button>
            </motion.div>

            {/* Premium CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <Link to="/premium" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/25 backdrop-blur-md border border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/35 transition-all shadow-lg animate-pulse">
                <Crown className="h-4 w-4 shrink-0 text-amber-400" />
                {t('getPremium')} - 5000₸/{t('perMonth')}
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Live Diagnostics Sandbox / AI Lab */}
        <section className="py-20 bg-background/50 backdrop-blur">
          <div className="container max-w-4xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="glass-card p-8 md:p-10 rounded-3xl border border-primary/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Express Demo
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {language === "ru" ? "Интерактивная Лаборатория ИИ" : "Interactive AI Lab"}
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {language === "ru"
                    ? "Выберите несколько симптомов и запустите мгновенную симуляцию ИИ-анализа"
                    : "Select some symptoms below and start an instant simulated AI diagnostic run"}
                </p>
              </div>

              {/* Symptom Selection Cards */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {sandboxSymptoms.map((s) => {
                  const isSelected = selectedSandboxSymptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSandboxSymptom(s.id)}
                      disabled={isSandboxRunning}
                      className={`px-5 py-3 rounded-2xl border-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 scale-[1.02] shadow-md shadow-emerald-500/5"
                          : "border-border bg-background hover:border-emerald-500/40 text-foreground cursor-pointer"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isSelected ? "fill-emerald-500 text-emerald-500" : "text-muted-foreground"}`} />
                      {getSymptomLabel(s)}
                    </button>
                  );
                })}
              </div>

              {/* Action area */}
              <div className="flex flex-col items-center justify-center min-h-[100px]">
                <AnimatePresence mode="wait">
                  {!isSandboxRunning && !sandboxResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center"
                    >
                      <Button
                        onClick={runSandboxAnalysis}
                        disabled={selectedSandboxSymptoms.length === 0}
                        className={`h-12 px-8 rounded-xl font-semibold text-sm shadow-lg transition-all ${
                          selectedSandboxSymptoms.length > 0
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer hover:shadow-emerald-500/20"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {language === "ru" ? "Запустить диагностику ИИ" : "Analyze Symptoms Now"}
                      </Button>
                      {selectedSandboxSymptoms.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          {language === "ru" ? "*Сначала выберите хотя бы один симптом" : "*Please select at least one symptom first"}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {isSandboxRunning && (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-md space-y-4"
                    >
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <Activity className="h-4 w-4 animate-pulse" />
                          {getSandboxStepMessage()}
                        </span>
                        <span>{sandboxProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden border border-border">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${sandboxProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {sandboxResult && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="w-full space-y-5"
                    >
                      <div className="p-5 md:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              {language === "ru" ? "Вероятный диагноз" : "Likely Condition"}
                            </span>
                            <h3 className="text-lg md:text-xl font-bold text-foreground mt-2 flex items-center gap-2">
                              <Brain className="h-5 w-5 text-emerald-500 shrink-0" />
                              {sandboxResult.name}
                            </h3>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <div className="text-center px-3 py-1.5 rounded-xl bg-background border border-border">
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase">{language === "ru" ? "Индекс риска" : "Risk Index"}</p>
                              <p className={`text-xs font-bold mt-0.5 ${sandboxResult.risk === "Low" ? "text-emerald-500" : "text-amber-500"}`}>{sandboxResult.risk}</p>
                            </div>
                            <div className="text-center px-3 py-1.5 rounded-xl bg-background border border-border">
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase">{language === "ru" ? "Индекс здоровья" : "Health Score"}</p>
                              <p className="text-xs font-bold text-emerald-500 mt-0.5">{sandboxResult.score}/100</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{sandboxResult.description}</p>

                        {/* Evidence Citation block */}
                        <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-muted-foreground flex items-start gap-2.5 shadow-sm">
                          <BookOpen className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                              {language === "ru" ? "Научная база доказательств" : "Scientific Evidence Basis"}
                            </p>
                            <p className="leading-relaxed">
                              {/* Simple render with clickable links */}
                              {sandboxResult.evidence.split(/(\[[^\]]+\]\([^)]+\))/g).map((part: string, i: number) => {
                                const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                                if (match) {
                                  return (
                                    <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                      {match[1]}
                                    </a>
                                  );
                                }
                                return <span key={i}>{part}</span>;
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button asChild className="bg-primary text-white rounded-xl">
                          <Link to="/symptoms">
                            {language === "ru" ? "Полный ИИ-анализ" : "Full Advanced Analysis"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                        <Button variant="outline" onClick={resetSandbox} className="rounded-xl border-border hover:bg-muted/50">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {language === "ru" ? "Сбросить демо" : "Reset Demo"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Framer Motion hover animations */}
        <section className="py-16 border-y border-primary/10 relative bg-background/30 backdrop-blur-sm">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="text-center p-6 rounded-2xl glass-card border border-primary/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center h-14 w-14 shrink-0 rounded-2xl gradient-primary text-primary-foreground mb-4 shadow-lg shadow-primary/10 relative overflow-hidden group">
                    <stat.icon className="h-6 w-6 shrink-0 z-10 transition-transform group-hover:rotate-12 duration-300" />
                    <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300" />
                  </div>
                  <p className="font-display text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Grid with Scroll Animations */}
        <section className="py-24 relative">
          <div className="container relative">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {t('exploreFeatures').split(' ')[0]} <span className="text-gradient">{t('exploreFeatures').split(' ').slice(1).join(' ')}</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">{t('featuresDescription')}</p>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.href}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="relative group cursor-pointer h-full"
                >
                  {/* Glowing background border card */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Link to={feature.href} className="block relative h-full">
                    <MedicalCard icon={feature.icon} gradient={feature.gradient} title={feature.title} description={feature.description} className="h-full border border-border shadow-md bg-background/80 group-hover:bg-background/95 transition-all rounded-3xl p-6" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Interactive Pulse CTA Section */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-[32px] gradient-primary p-12 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

              {/* Pulsing medical heart wave background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-15 pointer-events-none">
                <svg className="w-full h-full text-white" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,200 L400,200 L415,160 L435,260 L455,100 L475,280 L490,170 L505,210 L520,200 L1000,200" fill="none" stroke="currentColor" strokeWidth="4" className="stroke-dash" />
                </svg>
              </div>

              <div className="relative max-w-3xl mx-auto z-10">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/20 text-red-100 text-sm font-bold uppercase tracking-wider mb-6 animate-pulse border border-red-500/30">
                  <ShieldAlert className="h-4 w-4" />
                  {t('needHelp')}
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">{t('needHelp')}</h2>
                <p className="text-primary-foreground/90 mb-10 max-w-xl mx-auto text-lg md:text-xl leading-relaxed">{t('emergencyDescription')}</p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/95 rounded-2xl px-10 h-16 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.97] transition-all duration-300">
                    <a href="tel:103">
                      <HeartPulse className="h-5 w-5 mr-2 animate-beat text-destructive" />
                      {t('callEmergency')}
                    </a>
                  </Button>
                  <Button asChild size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white hover:bg-white/25 rounded-2xl px-10 h-16 text-base font-bold border border-white/20 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300">
                    <Link to="/hospitals">{t('findHospitals')}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Styled css keyframe animation classes */}
      <style>{`
        @keyframes strokeDash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .stroke-dash {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: strokeDash 5s linear infinite;
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          40% { transform: scale(1); }
          60% { transform: scale(1.15); }
        }
        .animate-beat {
          animation: heartBeat 1.4s infinite ease-in-out;
        }
      `}</style>
    </Layout>
  );
}
