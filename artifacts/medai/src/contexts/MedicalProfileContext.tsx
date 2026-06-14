import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
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

  useEffect(() => {
    localStorage.setItem("medai-profile", JSON.stringify(profile));
  }, [profile]);

  // Hydrate from API once after login
  useEffect(() => {
    if (!user) {
      hydratedFromDb.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profiles/me", { credentials: "include" });
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            setProfile((prev) => rowToProfile(json.profile, prev));
          } else {
            // First login — push local profile up
            await fetch("/api/profiles/me", {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                age: profile.age,
                gender: profile.gender,
                weightKg: profile.weight,
                heightCm: profile.height,
                bloodType: profile.bloodType,
                chronicConditions: profile.chronicConditions.join(", "),
                allergies: profile.allergies.join(", "),
                currentMedications: profile.currentMedications.join(", "),
              }),
            });
          }
        }

        // Hydrate symptom history
        const histRes = await fetch("/api/premium/symptom-history", { credentials: "include" });
        if (histRes.ok) {
          const histJson = await histRes.json();
          if (histJson.data && Array.isArray(histJson.data)) {
            setProfile((prev) => ({
              ...prev,
              symptomHistory: histJson.data.map((h: any) => ({
                date: h.created_at,
                symptoms: typeof h.symptoms === "string" ? h.symptoms : (h.symptoms?.text || ""),
                result: typeof h.result === "string" ? h.result : (h.result?.verdict || ""),
              })),
            }));
          }
        }
      } catch (e) {
        console.warn("Profile hydration failed:", e);
      } finally {
        hydratedFromDb.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Debounced save to API whenever profile changes (after hydration)
  useEffect(() => {
    if (!user || !hydratedFromDb.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/profiles/me", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: profile.age,
            gender: profile.gender,
            weightKg: profile.weight,
            heightCm: profile.height,
            bloodType: profile.bloodType,
            chronicConditions: profile.chronicConditions.join(", "),
            allergies: profile.allergies.join(", "),
            currentMedications: profile.currentMedications.join(", "),
          }),
        });
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
  };

  const clearHistory = () => {
    setProfile((prev) => ({ ...prev, symptomHistory: [] }));
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
