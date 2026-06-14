import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Clock,
  Activity,
  Bot,
  Camera,
  Shield,
  Crown,
  History,
  Edit3,
  Save,
  X,
  Heart,
  Pill,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ActionRecord {
  id: string;
  function_name: string;
  action_data: any;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile } = useMedicalProfile();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // local form state
  const [form, setForm] = useState({
    age: profile.age?.toString() ?? "",
    gender: profile.gender ?? "",
    weight: profile.weight?.toString() ?? "",
    height: profile.height?.toString() ?? "",
    bloodType: profile.bloodType ?? "",
    smokingStatus: profile.smokingStatus ?? "",
    alcoholUse: profile.alcoholUse ?? "",
    chronicConditions: profile.chronicConditions.join(", "),
    allergies: profile.allergies.join(", "),
    currentMedications: profile.currentMedications.join(", "),
  });

  // keep form in sync when profile loads from server
  useEffect(() => {
    if (!editing) {
      setForm({
        age: profile.age?.toString() ?? "",
        gender: profile.gender ?? "",
        weight: profile.weight?.toString() ?? "",
        height: profile.height?.toString() ?? "",
        bloodType: profile.bloodType ?? "",
        smokingStatus: profile.smokingStatus ?? "",
        alcoholUse: profile.alcoholUse ?? "",
        chronicConditions: profile.chronicConditions.join(", "),
        allergies: profile.allergies.join(", "),
        currentMedications: profile.currentMedications.join(", "),
      });
    }
  }, [profile, editing]);

  useEffect(() => {
    if (!user) return;
    const fetchActions = async () => {
      try {
        const res = await fetch("/api/actions", { credentials: "include" });
        const json = res.ok ? await res.json() : {};
        setActions((json.data as ActionRecord[]) || []);
      } catch {}
      setLoadingActions(false);
    };
    fetchActions();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const toArr = (s: string) =>
        s.split(",").map((x) => x.trim()).filter(Boolean);

      updateProfile({
        age: form.age ? Number(form.age) : null,
        gender: (form.gender as any) || null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
        bloodType: form.bloodType || null,
        smokingStatus: form.smokingStatus || null,
        alcoholUse: form.alcoholUse || null,
        chronicConditions: toArr(form.chronicConditions),
        allergies: toArr(form.allergies),
        currentMedications: toArr(form.currentMedications),
      });

      setEditing(false);
      toast({
        title: t("profileSaved") || "Profile saved",
        description: t("profileSavedDesc") || "Your medical profile has been updated.",
      });
    } catch {
      toast({
        title: "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      age: profile.age?.toString() ?? "",
      gender: profile.gender ?? "",
      weight: profile.weight?.toString() ?? "",
      height: profile.height?.toString() ?? "",
      bloodType: profile.bloodType ?? "",
      smokingStatus: profile.smokingStatus ?? "",
      alcoholUse: profile.alcoholUse ?? "",
      chronicConditions: profile.chronicConditions.join(", "),
      allergies: profile.allergies.join(", "),
      currentMedications: profile.currentMedications.join(", "),
    });
  };

  if (!user) {
    return (
      <Layout>
        <SEOHead title="Profile" description="Your profile and usage history" path="/profile" />
        <div className="container py-24 flex flex-col items-center justify-center text-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {t("signInRequired") || "Sign in to view your profile"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              {t("signInProfileDesc") || "Your medical profile, usage history and saved data will appear here after signing in."}
            </p>
          </div>
          <Link to="/">
            <Button className="gradient-primary text-primary-foreground rounded-2xl px-8 h-12">
              {t("goHome") || "Go to Home"}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const fnIcon: Record<string, any> = {
    symptoms: Activity,
    aiDoctor: Bot,
    aiAnalysis: Camera,
  };

  const fnLabel: Record<string, string> = {
    symptoms: t("symptoms"),
    aiDoctor: t("aiDoctor"),
    aiAnalysis: t("aiAnalysis"),
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const smokingOptions = ["never", "former", "occasional", "daily"];
  const alcoholOptions = ["never", "rarely", "moderate", "frequent"];

  return (
    <Layout>
      <SEOHead title="Profile" description="Your profile and usage history" path="/profile" />
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* User card */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <User className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl font-bold text-foreground truncate">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Link to="/premium">
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-xl">
                  <Crown className="h-4 w-4 text-primary" />
                  {t("getPremium") || "Premium"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {profile.age && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">{t("age")}</p>
                  <p className="font-bold text-foreground">{profile.age}</p>
                </div>
              )}
              {profile.gender && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">{t("gender")}</p>
                  <p className="font-bold text-foreground capitalize">{profile.gender}</p>
                </div>
              )}
              {profile.weight && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">{t("weight") || "Weight"}</p>
                  <p className="font-bold text-foreground">{profile.weight} kg</p>
                </div>
              )}
              {profile.height && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="font-bold text-foreground">{profile.height} cm</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Profile */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t("medicalProfile") || "Medical Profile"}
              </h2>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => setEditing(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  {t("edit") || "Edit"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                    {t("cancel") || "Cancel"}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-xl gradient-primary text-primary-foreground border-0"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t("save") || "Save"}
                  </Button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t("age")}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="e.g. 30"
                      value={form.age}
                      onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t("gender")}</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Weight (kg)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      placeholder="e.g. 70"
                      value={form.weight}
                      onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Height (cm)</Label>
                    <Input
                      type="number"
                      min={50}
                      max={300}
                      placeholder="e.g. 175"
                      value={form.height}
                      onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Blood Type</Label>
                    <Select
                      value={form.bloodType}
                      onValueChange={(v) => setForm((p) => ({ ...p, bloodType: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((bt) => (
                          <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Smoking */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Smoking status</Label>
                    <Select
                      value={form.smokingStatus}
                      onValueChange={(v) => setForm((p) => ({ ...p, smokingStatus: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {smokingOptions.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Alcohol */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Alcohol use</Label>
                    <Select
                      value={form.alcoholUse}
                      onValueChange={(v) => setForm((p) => ({ ...p, alcoholUse: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {alcoholOptions.map((a) => (
                          <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-medical-warning" />
                    {t("chronicConditions")}
                  </Label>
                  <Input
                    placeholder="e.g. Diabetes, Hypertension, Asthma"
                    value={form.chronicConditions}
                    onChange={(e) => setForm((p) => ({ ...p, chronicConditions: e.target.value }))}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple conditions with commas</p>
                </div>

                {/* Allergies */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    {t("allergies")}
                  </Label>
                  <Input
                    placeholder="e.g. Penicillin, Peanuts, Latex"
                    value={form.allergies}
                    onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple allergies with commas</p>
                </div>

                {/* Medications */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-primary" />
                    {t("medications")}
                  </Label>
                  <Input
                    placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                    value={form.currentMedications}
                    onChange={(e) => setForm((p) => ({ ...p, currentMedications: e.target.value }))}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple medications with commas</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Read-only view */}
                {!profile.age && !profile.gender && !profile.chronicConditions.length && !profile.allergies.length && !profile.currentMedications.length ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto">
                      <Heart className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {t("noProfileYet") || "No medical profile set up yet."}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      {t("profileHelpsAI") || "Adding your profile helps AI give more personalized health recommendations."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl mt-2"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Set up profile
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.age && (
                      <InfoRow label={t("age")} value={`${profile.age} years`} />
                    )}
                    {profile.gender && (
                      <InfoRow label={t("gender")} value={profile.gender} capitalize />
                    )}
                    {profile.weight && (
                      <InfoRow label="Weight" value={`${profile.weight} kg`} />
                    )}
                    {profile.height && (
                      <InfoRow label="Height" value={`${profile.height} cm`} />
                    )}
                    {profile.bloodType && (
                      <InfoRow label="Blood type" value={profile.bloodType} />
                    )}
                    {profile.smokingStatus && (
                      <InfoRow label="Smoking" value={profile.smokingStatus} capitalize />
                    )}
                    {profile.alcoholUse && (
                      <InfoRow label="Alcohol" value={profile.alcoholUse} capitalize />
                    )}
                    {profile.chronicConditions.length > 0 && (
                      <div className="md:col-span-2 p-3 rounded-xl bg-medical-warning/5 border border-medical-warning/20">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-medical-warning" />
                          {t("chronicConditions")}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {profile.chronicConditions.join(", ")}
                        </p>
                      </div>
                    )}
                    {profile.allergies.length > 0 && (
                      <div className="md:col-span-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-destructive" />
                          {t("allergies")}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {profile.allergies.join(", ")}
                        </p>
                      </div>
                    )}
                    {profile.currentMedications.length > 0 && (
                      <div className="md:col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Pill className="h-3 w-3 text-primary" />
                          {t("medications")}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {profile.currentMedications.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI personalization notice */}
                {(profile.age || profile.chronicConditions.length > 0) && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-medical-green/5 border border-medical-green/20 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-medical-green shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      {t("analysisPersonalized") || "AI analysis is personalized using your profile data."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("dataSecurityTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("dataSecurityDesc")}</p>
            </div>
          </div>

          {/* Usage History */}
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {t("usageHistory")}
            </h2>

            {loadingActions ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : actions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t("noHistoryYet")}</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {actions.map((action) => {
                  const Icon = fnIcon[action.function_name] || Activity;
                  let data: any = {};
                  try {
                    data =
                      typeof action.action_data === "string"
                        ? JSON.parse(action.action_data)
                        : action.action_data;
                  } catch {}

                  return (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {fnLabel[action.function_name] || action.function_name}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(action.created_at).toLocaleString()}
                          </span>
                        </div>
                        {data?.result && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {data.result}
                          </p>
                        )}
                        {data?.symptoms && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {data.symptoms}
                          </p>
                        )}
                        {data?.query && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {data.query}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}

function InfoRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold text-foreground text-sm mt-0.5 ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}
