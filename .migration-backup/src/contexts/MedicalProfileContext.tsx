import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MedicalProfile {
  age: number | null;
  gender: "male" | "female" | "other" | null;
  weight: number | null;
  height: number | null;
  bloodType: string | null;
  smokingStatus: string | null;
  alcoholUse: string | null;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  symptomHistory: { date: string; symptoms: string; result: string }[];
}

interface MedicalProfileContextType {
  profile: MedicalProfile;
  updateProfile: (updates: Partial<MedicalProfile>) => void;
  addToHistory: (entry: { symptoms: string; result: string }) => void;
  clearHistory: () => void;
  getProfileContext: () => string;
}

const defaultProfile: MedicalProfile = {
  age: null,
  gender: null,
  weight: null,
  height: null,
  bloodType: null,
  smokingStatus: null,
  alcoholUse: null,
  chronicConditions: [],
  allergies: [],
  currentMedications: [],
  symptomHistory: [],
};

const MedicalProfileContext = createContext<MedicalProfileContextType | undefined>(undefined);

// Map DB row → local profile
function rowToProfile(row: any, fallback: MedicalProfile): MedicalProfile {
  if (!row) return fallback;
  const arr = (s: string | null | undefined): string[] =>
    (s || "").split(",").map((x) => x.trim()).filter(Boolean);
  return {
    ...fallback,
    age: row.age ?? null,
    gender: row.gender ?? null,
    weight: row.weight_kg ? Number(row.weight_kg) : null,
    height: row.height_cm ? Number(row.height_cm) : null,
    bloodType: row.blood_type ?? null,
    chronicConditions: arr(row.chronic_conditions),
    allergies: arr(row.allergies),
    currentMedications: arr(row.current_medications),
  };
}

function profileToRow(profile: MedicalProfile, userId: string) {
  return {
    user_id: userId,
    age: profile.age,
    gender: profile.gender,
    weight_kg: profile.weight,
    height_cm: profile.height,
    blood_type: profile.bloodType,
    chronic_conditions: profile.chronicConditions.join(", ") || null,
    allergies: profile.allergies.join(", ") || null,
    current_medications: profile.currentMedications.join(", ") || null,
  };
}

export function MedicalProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MedicalProfile>(() => {
    try {
      const saved = localStorage.getItem("medai-profile");
      if (saved) return { ...defaultProfile, ...JSON.parse(saved) };
    } catch {}
    return defaultProfile;
  });

  const hydratedFromDb = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always cache locally (works for guests and as offline fallback)
  useEffect(() => {
    localStorage.setItem("medai-profile", JSON.stringify(profile));
  }, [profile]);

  // Hydrate from DB once after login
  useEffect(() => {
    if (!user) {
      hydratedFromDb.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("medical_profiles" as any)
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.warn("medical_profiles fetch:", error.message);
        }
        if (data) {
          setProfile((prev) => rowToProfile(data, prev));
        } else {
          // First login — push local profile up to DB
          const row = profileToRow(profile, user.id);
          await supabase.from("medical_profiles" as any).insert(row);
        }
        // Hydrate symptom history
        const { data: hist } = await supabase
          .from("symptom_history" as any)
          .select("symptoms, description, result, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (hist && Array.isArray(hist)) {
          setProfile((prev) => ({
            ...prev,
            symptomHistory: hist.map((h: any) => ({
              date: h.created_at,
              symptoms: typeof h.symptoms === "string" ? h.symptoms : (h.symptoms?.list || ""),
              result: typeof h.result === "string" ? h.result : (h.result?.summary || ""),
            })),
          }));
        }
      } finally {
        hydratedFromDb.current = true;
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Debounced upsert to DB whenever profile changes (after hydration)
  useEffect(() => {
    if (!user || !hydratedFromDb.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const row = profileToRow(profile, user.id);
        await supabase
          .from("medical_profiles" as any)
          .upsert(row, { onConflict: "user_id" });
      } catch (e) {
        console.warn("Profile save failed:", e);
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [profile, user]);

  const updateProfile = (updates: Partial<MedicalProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addToHistory = (entry: { symptoms: string; result: string }) => {
    const newEntry = { ...entry, date: new Date().toISOString() };
    setProfile((prev) => ({
      ...prev,
      symptomHistory: [newEntry, ...prev.symptomHistory.slice(0, 19)],
    }));
    // Persist for logged-in users
    if (user) {
      supabase.from("symptom_history" as any).insert({
        user_id: user.id,
        symptoms: { list: entry.symptoms },
        result: { summary: entry.result },
      }).then(({ error }) => {
        if (error) console.warn("symptom_history insert:", error.message);
      });
    }
  };

  const clearHistory = () => {
    setProfile((prev) => ({ ...prev, symptomHistory: [] }));
    if (user) {
      supabase.from("symptom_history" as any).delete().eq("user_id", user.id);
    }
  };

  const getProfileContext = () => {
    const parts: string[] = [];
    if (profile.age) parts.push(`Patient age: ${profile.age} years`);
    if (profile.gender) parts.push(`Gender: ${profile.gender}`);
    if (profile.weight) parts.push(`Weight: ${profile.weight} kg`);
    if (profile.height) parts.push(`Height: ${profile.height} cm`);
    if (profile.bloodType) parts.push(`Blood type: ${profile.bloodType}`);
    if (profile.smokingStatus) parts.push(`Smoking: ${profile.smokingStatus}`);
    if (profile.alcoholUse) parts.push(`Alcohol: ${profile.alcoholUse}`);
    if (profile.chronicConditions.length > 0) parts.push(`Chronic conditions: ${profile.chronicConditions.join(", ")}`);
    if (profile.allergies.length > 0) parts.push(`Known allergies: ${profile.allergies.join(", ")}`);
    if (profile.currentMedications.length > 0) parts.push(`Current medications: ${profile.currentMedications.join(", ")}`);
    return parts.length > 0 ? `\n\nPatient Context:\n${parts.join("\n")}` : "";
  };

  return (
    <MedicalProfileContext.Provider
      value={{ profile, updateProfile, addToHistory, clearHistory, getProfileContext }}
    >
      {children}
    </MedicalProfileContext.Provider>
  );
}

export function useMedicalProfile() {
  const context = useContext(MedicalProfileContext);
  if (context === undefined) {
    throw new Error("useMedicalProfile must be used within a MedicalProfileProvider");
  }
  return context;
}
