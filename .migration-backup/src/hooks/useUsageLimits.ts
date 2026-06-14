import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsageLimits {
  symptoms: { used: number; max: number };
  aiDoctor: { used: number; max: number };
  aiAnalysis: { used: number; max: number };
}

const FREE_LIMITS = { symptoms: 3, aiDoctor: 5, aiAnalysis: 3 };
const PREMIUM_LIMITS = { symptoms: 999, aiDoctor: 999, aiAnalysis: 999 };

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getStorageKey(): string {
  return `medai-usage-${getTodayKey()}`;
}

function getUsageFromStorage(): Record<string, number> {
  try {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveUsageToStorage(usage: Record<string, number>) {
  localStorage.setItem(getStorageKey(), JSON.stringify(usage));
}

export function useUsageLimits() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [usage, setUsage] = useState<Record<string, number>>(getUsageFromStorage);

  useEffect(() => {
    if (!user) return;
    const checkPremium = async () => {
      const { data } = await supabase
        .from("user_premium" as any)
        .select("active, expires_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && (data as any).active && new Date((data as any).expires_at) > new Date()) {
        setIsPremium(true);
      }
    };
    checkPremium();
  }, [user]);

  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  const getLimits = useCallback((): UsageLimits => {
    const u = getUsageFromStorage();
    return {
      symptoms: { used: u.symptoms || 0, max: limits.symptoms },
      aiDoctor: { used: u.aiDoctor || 0, max: limits.aiDoctor },
      aiAnalysis: { used: u.aiAnalysis || 0, max: limits.aiAnalysis },
    };
  }, [limits]);

  const canUse = useCallback((fn: "symptoms" | "aiDoctor" | "aiAnalysis"): boolean => {
    const u = getUsageFromStorage();
    return (u[fn] || 0) < limits[fn];
  }, [limits]);

  const recordUsage = useCallback(async (fn: "symptoms" | "aiDoctor" | "aiAnalysis", actionData?: any) => {
    const u = getUsageFromStorage();
    u[fn] = (u[fn] || 0) + 1;
    saveUsageToStorage(u);
    setUsage({ ...u });

    // Log to database
    try {
      await supabase.from("user_actions" as any).insert({
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_name: user?.user_metadata?.display_name || user?.email?.split("@")[0] || null,
        function_name: fn,
        action_data: actionData ? JSON.stringify(actionData) : "{}",
      } as any);
    } catch {
      // Silent fail for logging
    }
  }, [user]);

  const getTimeUntilReset = useCallback((): string => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  return { getLimits, canUse, recordUsage, getTimeUntilReset, isPremium };
}
