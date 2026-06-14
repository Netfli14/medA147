import { useState, useRef } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MedicineCardSkeleton, AnalyzingAnimation } from "@/components/ui/loading-skeleton";
import { EvidenceModal } from "@/components/ui/evidence-modal";
import { TranslateButton } from "@/components/ui/translate-button";

import { 
  ShoppingBag, 
  AlertCircle, 
  Search, 
  Pill, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Package,
  Info,
  Sparkles,
  Filter,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  BookOpen,
  Car,
  Footprints,
  Store,
  FileText,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

/** Render text with [label](url) markdown links as clickable <a> tags */
function renderWithLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (m) {
          return (
            <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium">
              {m[1]}<ExternalLink className="h-2.5 w-2.5 inline ml-0.5 opacity-70" />
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface InteractionWarning {
  severity: "high" | "medium" | "low";
  type: "drug-drug" | "drug-disease" | "drug-allergy";
  message: string;
}

interface EvidenceCitation {
  journal: string;
  url: string;
  year: string;
  finding: string;
  evidenceLevel?: string;
}

interface Medicine {
  name: string;
  purpose: string;
  dosage: string;
  instructions: string;
  warnings: string[];
  estimatedPrice: string;
  duration: string;
  brand?: string;
  isGeneric?: boolean;
  analogues?: string[];
  inStock?: boolean;
  incompatibleWith?: string[];
  imageUrl?: string;
  mechanism?: string;
  prescriptionRequired?: boolean;
  evidenceSource?: string;
  evidenceCitation?: EvidenceCitation;
  interactionWarnings?: InteractionWarning[];
}

interface MedicineResult {
  condition: string;
  medicines: Medicine[];
  generalAdvice: string;
  safetyAlerts?: string[];
}

interface NearbyPharmacy {
  name: string;
  address: string;
  phone: string;
  distance: string;
  walkTime: string;
  driveTime: string;
  coords: string;
  inStock: boolean;
}

const nearbyPharmacies: NearbyPharmacy[] = [
  {
    name: "АльфаМед",
    address: "Astana",
    phone: "+7 (7172) 57-72-72",
    distance: "0.8 km",
    walkTime: "10 min",
    driveTime: "3 min",
    coords: "51.135935,71.422372",
    inStock: true,
  },
  {
    name: "БиоСфера",
    address: "Astana",
    phone: "+7 (7172) 44-55-66",
    distance: "1.2 km",
    walkTime: "15 min",
    driveTime: "5 min",
    coords: "51.147796,71.47828",
    inStock: true,
  },
  {
    name: "Bios",
    address: "Astana",
    phone: "+7 (7172) 33-44-55",
    distance: "2.1 km",
    walkTime: "26 min",
    driveTime: "7 min",
    coords: "51.106039,71.400612",
    inStock: true,
  },
  {
    name: "Аптека низких цен",
    address: "Astana",
    phone: "+7 (7172) 22-33-44",
    distance: "3.5 km",
    walkTime: "44 min",
    driveTime: "12 min",
    coords: "51.182959,71.376425",
    inStock: true,
  },
];

type PriceFilter = "all" | "cheap" | "medium" | "expensive";

export default function Medicines() {
  const { profile, getProfileContext } = useMedicalProfile();
  const { t, language } = useLanguage();
  const [condition, setCondition] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MedicineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [showGenerics, setShowGenerics] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<NearbyPharmacy | null>(null);
  
  // Per-medicine translation state (keyed by medicine index)
  const [translatedInstructions, setTranslatedInstructions] = useState<Record<number, string | null>>({});
  const [translatedPurposes, setTranslatedPurposes] = useState<Record<number, string | null>>({});

  // Safety panel state
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);
  const [localDiseases, setLocalDiseases] = useState<string[]>([]);
  const [localMedications, setLocalMedications] = useState<string[]>([]);
  const [diseaseInput, setDiseaseInput] = useState("");
  const [medInput, setMedInput] = useState("");

  // Prescription scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState("");
  const [isAnalyzingPrescription, setIsAnalyzingPrescription] = useState(false);
  const [prescriptionResults, setPrescriptionResults] = useState<any>(null);
  const prescriptionInputRef = useRef<HTMLInputElement>(null);

  const popularConditions = [
    { key: "conditionHeadache", en: "Headache" },
    { key: "conditionColdFlu", en: "Cold & Flu" },
    { key: "conditionFever", en: "Fever" },
    { key: "conditionAllergies", en: "Allergies" },
    { key: "conditionStomachPain", en: "Stomach Pain" },
    { key: "conditionSoreThroat", en: "Sore Throat" },
    { key: "conditionBackPain", en: "Back Pain" },
    { key: "conditionCough", en: "Cough" },
    { key: "conditionInsomnia", en: "Insomnia" },
    { key: "conditionMusclePain", en: "Muscle Pain" },
  ];

  const searchMedicines = async () => {
    if (!condition.trim()) {
      setError(t('errorEnterCondition'));
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const profileContext = getProfileContext();
      const mergedMedications = [...new Set([...localMedications, ...profile.currentMedications])];
      const mergedDiseases = [...new Set([...localDiseases, ...profile.chronicConditions])];
      const res = await fetch("/api/ai/find-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: condition.trim(),
          age: profile.age || undefined,
          weight: profile.weight || undefined,
          allergies: profile.allergies,
          currentMedications: mergedMedications,
          chronicDiseases: mergedDiseases,
          profileContext,
          language,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError(t('errorFindMedicines'));
    } finally {
      setIsSearching(false);
    }
  };

  const openPharmacyDirections = (pharmacy: NearbyPharmacy) => {
    window.open(
      `https://2gis.kz/astana/search/${encodeURIComponent(pharmacy.name)}`,
      "_blank"
    );
  };

  const callPharmacy = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, "")}`;
  };

  const getPriceCategory = (price: string): PriceFilter => {
    const numMatch = price.match(/\d+/);
    if (!numMatch) return "medium";
    const num = parseInt(numMatch[0]);
    if (num < 500) return "cheap";
    if (num < 1500) return "medium";
    return "expensive";
  };

  const filteredMedicines = results?.medicines?.filter((m) => {
    if (priceFilter !== "all" && getPriceCategory(m.estimatedPrice) !== priceFilter) return false;
    if (showGenerics && !m.isGeneric) return false;
    return true;
  });

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    setPrescriptionFileName(file.name);
    setPrescriptionResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPrescriptionImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyzePrescription = async () => {
    if (!prescriptionImage) return;
    setIsAnalyzingPrescription(true);
    try {
      const res = await fetch("/api/ai/analyze-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: prescriptionImage, language }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPrescriptionResults(data);
    } catch (err) {
      console.error("Prescription analysis error:", err);
      setError(t('errorAnalysisFailed'));
    } finally {
      setIsAnalyzingPrescription(false);
    }
  };

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="Medicine Finder" description="Find medicines for your condition with prices, dosages, instructions, and nearby pharmacy availability in Astana." path="/medicines" />
      <div className="container py-12 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <ShoppingBag className="h-4 w-4 text-medical-green" />
            <span className="text-gradient">{t('healthMarket')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('findMedicinesTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('medicineShop')}</p>
          <Button onClick={() => setShowScanner(!showScanner)} variant="outline" className="mt-4 rounded-xl">
            <Camera className="mr-2 h-4 w-4" />{t('showPrescriptionScanner')}
          </Button>
        </div>

        {/* Prescription Scanner */}
        {showScanner && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />{t('prescriptionScanner')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{t('scanPrescriptionDesc')}</p>
              {!prescriptionImage ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-all bg-muted/30 hover:bg-muted/50">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <span className="text-sm text-muted-foreground">{t('uploadPrescription')}</span>
                  <input ref={prescriptionInputRef} type="file" accept="image/*" onChange={handlePrescriptionUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative mb-4">
                  <img src={prescriptionImage} alt="Prescription" className="w-full max-h-[300px] object-contain rounded-2xl bg-muted" />
                  <button onClick={() => { setPrescriptionImage(null); setPrescriptionResults(null); }} className="absolute top-2 right-2 p-2 rounded-xl bg-background/90 hover:bg-destructive hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {prescriptionImage && (
                <Button onClick={analyzePrescription} disabled={isAnalyzingPrescription} className="w-full mt-4 gradient-primary text-white rounded-xl h-12">
                  {isAnalyzingPrescription ? (<><Sparkles className="mr-2 h-4 w-4 animate-spin" />{t('analyzingPrescription')}</>) : (<><Sparkles className="mr-2 h-4 w-4" />{t('scanPrescription')}</>)}
                </Button>
              )}
              {prescriptionResults?.medicines?.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">{t('prescriptionResults')}</h3>
                  {prescriptionResults.medicines.map((med: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-foreground">{med.name}</h4>
                        <span className="text-medical-green font-bold text-sm">{med.estimatedPrice}</span>
                      </div>
                      {med.genericName && <p className="text-xs text-muted-foreground mb-1">{t('generic')}: {med.genericName}</p>}
                      <p className="text-sm text-muted-foreground mb-2">{med.dosage} · {med.instructions}</p>
                      {med.whereToBuy?.length > 0 && (
                        <p className="text-xs text-primary mb-2"><MapPin className="inline h-3 w-3 mr-1" />{t('whereToBuy')}: {med.whereToBuy.join(", ")}</p>
                      )}
                      {med.alternatives?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">{t('alternatives')}:</p>
                          {med.alternatives.map((alt: any, j: number) => (
                            <span key={j} className="inline-block mr-2 text-xs px-2 py-1 rounded-full bg-medical-green/10 text-medical-green">{alt.name} · {alt.price}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {prescriptionResults.doctorNotes && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground"><Info className="inline h-3 w-3 mr-1" />{t('doctorNotes')}: {prescriptionResults.doctorNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Search Form */}
          <div className="glass-card p-8 rounded-3xl mb-8">
            <div className="space-y-6">
              {/* Condition Input */}
              <div>
                <Label htmlFor="condition" className="text-foreground text-base font-semibold mb-3 block">
                  {t('whatsYourCondition')}
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="condition"
                    placeholder={t('conditionPlaceholder')}
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchMedicines()}
                    className="pl-12 h-14 rounded-2xl text-base border-2 focus:border-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {popularConditions.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCondition(t(c.key))}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                        condition === t(c.key)
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {t(c.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Profile Panel */}
              <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSafetyPanel((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm leading-tight">
                        {t('safetyCheckTitle') || 'Patient Safety Profile'}
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 truncate">
                        {localDiseases.length + localMedications.length > 0
                          ? `${localDiseases.length} ${t('chronicDiseasesLabel') || 'diseases'} · ${localMedications.length} ${t('currentMedicationsLabel') || 'medications'}`
                          : t('safetyCheckHint') || 'AI checks interactions with your diseases and medications'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(localDiseases.length > 0 || localMedications.length > 0) && (
                      <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {localDiseases.length + localMedications.length}
                      </span>
                    )}
                    {showSafetyPanel ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
                  </div>
                </button>

                {showSafetyPanel && (
                  <div className="px-5 pb-5 pt-4 bg-amber-50/50 dark:bg-amber-950/10 space-y-5">
                    {/* Chronic Diseases */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                          {t('chronicDiseasesLabel') || 'Chronic Diseases'}
                        </label>
                        {profile.chronicConditions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setLocalDiseases([...new Set([...localDiseases, ...profile.chronicConditions])])}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            {t('importFromProfile') || 'Import from profile'}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                        {localDiseases.map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            {d}
                            <button type="button" onClick={() => setLocalDiseases(localDiseases.filter((_, j) => j !== i))} className="hover:text-destructive ml-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {localDiseases.length === 0 && <p className="text-xs text-muted-foreground italic">{t('chronicDiseasesPlaceholder') || 'e.g. Diabetes type 2, Hypertension...'}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={diseaseInput}
                          onChange={(e) => setDiseaseInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && diseaseInput.trim()) {
                              e.preventDefault();
                              setLocalDiseases([...localDiseases, diseaseInput.trim()]);
                              setDiseaseInput("");
                            }
                          }}
                          placeholder={t('chronicDiseasesPlaceholder') || 'e.g. Diabetes type 2...'}
                          className="h-9 rounded-xl text-sm border-amber-200 focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => { if (diseaseInput.trim()) { setLocalDiseases([...localDiseases, diseaseInput.trim()]); setDiseaseInput(""); } }}
                          className="px-3 h-9 rounded-xl bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                        </button>
                      </div>
                    </div>

                    {/* Current Medications */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Pill className="h-4 w-4 text-amber-600" />
                          {t('currentMedicationsLabel') || 'Current Medications'}
                        </label>
                        {profile.currentMedications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setLocalMedications([...new Set([...localMedications, ...profile.currentMedications])])}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            {t('importFromProfile') || 'Import from profile'}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                        {localMedications.map((m, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                            {m}
                            <button type="button" onClick={() => setLocalMedications(localMedications.filter((_, j) => j !== i))} className="hover:text-destructive ml-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {localMedications.length === 0 && <p className="text-xs text-muted-foreground italic">{t('currentMedicationsPlaceholder') || 'e.g. Metformin 500mg...'}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={medInput}
                          onChange={(e) => setMedInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && medInput.trim()) {
                              e.preventDefault();
                              setLocalMedications([...localMedications, medInput.trim()]);
                              setMedInput("");
                            }
                          }}
                          placeholder={t('currentMedicationsPlaceholder') || 'e.g. Metformin 500mg...'}
                          className="h-9 rounded-xl text-sm border-amber-200 focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => { if (medInput.trim()) { setLocalMedications([...localMedications, medInput.trim()]); setMedInput(""); } }}
                          className="px-3 h-9 rounded-xl bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-3 w-3 shrink-0" />
                      {t('typeAndPressEnter') || 'Type and press Enter to add'}
                    </p>
                  </div>
                )}
              </div>

              {/* Profile Context Notice */}
              {(profile.age || profile.allergies.length > 0 || profile.currentMedications.length > 0) && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      {t('analysisPersonalized')}
                      {profile.age && ` (${t('age')}: ${profile.age})`}
                      {profile.allergies.length > 0 && `, ${profile.allergies.length} ${t('allergies').toLowerCase()}`}
                      {profile.currentMedications.length > 0 && `, ${profile.currentMedications.length} ${t('medications').toLowerCase()}`}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <Button
            onClick={searchMedicines}
            disabled={isSearching}
            size="lg"
            className="w-full gradient-primary text-primary-foreground border-0 rounded-2xl h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isSearching ? (
              <>
                <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('findingMedicines')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t('findMedicines')}
              </>
            )}
          </Button>

          {/* Loading State */}
          {isSearching && (
            <div className="mt-12">
              <AnalyzingAnimation />
            </div>
          )}

          {/* Results */}
          {results && !isSearching && (
            <div className="mt-12 space-y-8 animate-fade-up">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t('medicinesFor')} <span className="text-gradient">{results.condition}</span>
                </h2>
                <p className="text-muted-foreground">
                  {results.medicines?.length || 0} {t('foundMedicines')}
                </p>
              </div>

              {/* Critical Safety Alert Banner */}
              {results.safetyAlerts && results.safetyAlerts.length > 0 && (
                <div className="p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/40">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-destructive text-sm mb-1">
                        {t('safetyAlertBanner') || 'Safety Alert — Critical Interactions Detected'}
                      </p>
                      <ul className="space-y-1">
                        {results.safetyAlerts.map((alert, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-destructive mt-0.5">•</span>
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="glass-card p-4 rounded-2xl">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t('filters')}:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={priceFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPriceFilter("all")}
                    >
                      {t('allPrices')}
                    </Badge>
                    <Badge
                      variant={priceFilter === "cheap" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPriceFilter("cheap")}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      {t('budget')} (&lt;500 KZT)
                    </Badge>
                    <Badge
                      variant={priceFilter === "medium" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPriceFilter("medium")}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      <DollarSign className="h-3 w-3 -ml-2" />
                      {t('medium')}
                    </Badge>
                    <Badge
                      variant={priceFilter === "expensive" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPriceFilter("expensive")}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      <DollarSign className="h-3 w-3 -ml-2" />
                      <DollarSign className="h-3 w-3 -ml-2" />
                      {t('premium')}
                    </Badge>
                  </div>

                  <Badge
                    variant={showGenerics ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setShowGenerics(!showGenerics)}
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    {t('genericsOnly')}
                  </Badge>
                </div>
              </div>

              {/* Medicine Cards */}
              {filteredMedicines && filteredMedicines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMedicines.map((medicine, index) => (
                    <div key={index} className="medicine-shop-card">
                      {/* Header with Image */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start gap-4">
                          {medicine.imageUrl ? (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-muted">
                              <img 
                                src={medicine.imageUrl} 
                                alt={medicine.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '';
                                  e.currentTarget.parentElement!.innerHTML = '<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical-green to-medical-mint"><svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-medical-green to-medical-mint">
                              <Pill className="h-7 w-7 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                                  {medicine.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {medicine.purpose}
                                </p>
                              </div>
                              {medicine.isGeneric && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('generic')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stock & Price */}
                      <div className="px-6 pb-4 flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-medical-green/10 border border-medical-green/20">
                          <DollarSign className="h-4 w-4 text-medical-green" />
                          <span className="font-display font-bold text-medical-green">
                            {medicine.estimatedPrice || "Price varies"}
                          </span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          medicine.inStock 
                            ? "bg-medical-green/10 text-medical-green" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {medicine.inStock ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              {t('inStock')}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              {t('outOfStock')}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="px-6 pb-6 space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                          <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-foreground text-sm block mb-0.5">
                              {t('dosage')}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {medicine.dosage}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                          <Info className="h-5 w-5 text-medical-blue shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                              <span className="font-medium text-foreground text-sm">{t('instructions')}</span>
                              <TranslateButton
                                text={medicine.instructions}
                                onTranslated={(v) => setTranslatedInstructions((p) => ({ ...p, [index]: v }))}
                                isTranslated={!!translatedInstructions[index]}
                                cacheKey={`instr:${index}:${medicine.name}`}
                                className="h-6 text-[11px] opacity-60 hover:opacity-100"
                              />
                            </div>
                            <span className="text-muted-foreground text-sm">
                              {translatedInstructions[index] ?? medicine.instructions}
                            </span>
                          </div>
                        </div>

                        {medicine.duration && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                            <Clock className="h-5 w-5 text-medical-purple shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-foreground text-sm block mb-0.5">
                                {t('duration')}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {medicine.duration}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Evidence Source */}
                        {medicine.evidenceSource && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-medical-blue/10 border border-medical-blue/20">
                            <FileText className="h-4 w-4 text-medical-blue shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-medical-blue text-sm block mb-0.5">
                                {t('evidenceBased')}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {renderWithLinks(medicine.evidenceSource)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Structured Evidence Citation */}
                        {medicine.evidenceCitation && (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-[11px] uppercase tracking-wide font-semibold text-primary flex items-center gap-1 mb-2">
                              <BookOpen className="h-3 w-3" />
                              {t('citedInVerdict') || 'Clinical Evidence'}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {medicine.evidenceCitation.finding}
                              </p>
                              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                <a
                                  href={medicine.evidenceCitation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" />
                                  {medicine.evidenceCitation.journal}
                                </a>
                                <span className="text-[11px] text-muted-foreground">{medicine.evidenceCitation.year}</span>
                                {medicine.evidenceCitation.evidenceLevel && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-medical-green/10 text-medical-green text-[11px] font-medium">
                                    {medicine.evidenceCitation.evidenceLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interaction Warnings from Safety Profile */}
                        {medicine.interactionWarnings && medicine.interactionWarnings.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5 text-amber-600" />
                              {t('safetyCheckTitle') || 'Safety Check'}
                            </p>
                            {medicine.interactionWarnings.map((w, wi) => {
                              const severityStyle =
                                w.severity === "high"
                                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                                  : w.severity === "medium"
                                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                                  : "bg-muted border-border text-muted-foreground";
                              const SeverityIcon = w.severity === "high" ? ShieldAlert : w.severity === "medium" ? AlertTriangle : Info;
                              const label =
                                w.severity === "high"
                                  ? t('criticalInteraction') || 'Critical'
                                  : w.severity === "medium"
                                  ? t('moderateInteraction') || 'Moderate'
                                  : t('minorInteraction') || 'Minor';
                              return (
                                <div key={wi} className={`p-3 rounded-xl border ${severityStyle}`}>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <SeverityIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="font-semibold text-xs">{label} — {w.type === "drug-drug" ? "Drug Interaction" : w.type === "drug-disease" ? "Contraindication" : "Allergy Risk"}</span>
                                  </div>
                                  <p className="text-xs leading-relaxed">{w.message}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (localDiseases.length > 0 || localMedications.length > 0) ? (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <p className="text-xs text-green-700 dark:text-green-400">
                              {t('noInteractionsFound') || 'No interactions detected with your safety profile'}
                            </p>
                          </div>
                        ) : null}

                        {/* Analogues */}
                        {medicine.analogues && medicine.analogues.length > 0 && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-medical-blue/10 border border-medical-blue/20">
                            <RefreshCcw className="h-4 w-4 text-medical-blue shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-medical-blue text-sm block mb-1">
                                {t('analogues')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {medicine.analogues.map((a, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {a}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Incompatibility Warning */}
                        {medicine.incompatibleWith && medicine.incompatibleWith.length > 0 && (
                          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <span className="font-medium text-destructive text-sm">
                                {t('drugInteractionWarning')}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('mayInteractWith')}: {medicine.incompatibleWith.join(", ")}
                            </p>
                          </div>
                        )}

                        {medicine.warnings && medicine.warnings.length > 0 && (
                          <div className="p-3 rounded-xl bg-medical-warning/10 border border-medical-warning/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-medical-warning" />
                              <span className="font-medium text-medical-warning text-sm">
                                {t('warnings')}
                              </span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {medicine.warnings.slice(0, 3).map((warning, wIndex) => (
                                <li key={wIndex} className="flex items-start gap-1.5">
                                  <span className="text-medical-warning">•</span>
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Evidence Button */}
                        <EvidenceModal condition={medicine.name}>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            <BookOpen className="h-4 w-4 mr-2" />
                            {t('whatIsThisBased')}
                          </Button>
                        </EvidenceModal>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No medicines match your filters.</p>
                </div>
              )}

              {/* Nearby Pharmacies */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {t('nearbyPharmacies')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyPharmacies.map((pharmacy, index) => (
                    <div
                      key={index}
                      className={`pharmacy-card ${selectedPharmacy === pharmacy ? "border-primary" : ""}`}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          pharmacy.inStock ? "bg-medical-green/10" : "bg-muted"
                        }`}>
                          <Store className={`h-6 w-6 ${pharmacy.inStock ? "text-medical-green" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground">{pharmacy.name}</h4>
                            <Badge variant={pharmacy.inStock ? "default" : "secondary"} className="text-xs shrink-0">
                              {pharmacy.inStock ? t('inStock') : "Check"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pharmacy.address}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {pharmacy.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Footprints className="h-3 w-3" />
                              {pharmacy.walkTime} {t('walkTime')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {pharmacy.driveTime} {t('driveTime')}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                callPharmacy(pharmacy.phone);
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {t('callPharmacy')}
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-8 gradient-primary text-primary-foreground border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPharmacyDirections(pharmacy);
                              }}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              {t('getDirections')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Advice */}
              {results.generalAdvice && (
                <div className="glass-card p-6 rounded-2xl border-2 border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <Info className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2">
                        {t('generalAdvice')}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {results.generalAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
