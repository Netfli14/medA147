import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalProfile } from "@/contexts/MedicalProfileContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Clock, Activity, Bot, Camera, Shield, Crown, History } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ActionRecord {
  id: string;
  function_name: string;
  action_data: any;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { profile } = useMedicalProfile();
  const { t } = useLanguage();
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchActions = async () => {
      const { data } = await supabase
        .from("user_actions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setActions((data as any[]) || []);
      setLoading(false);
    };
    fetchActions();
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  const fnIcon: Record<string, any> = {
    symptoms: Activity,
    aiDoctor: Bot,
    aiAnalysis: Camera,
  };

  const fnLabel: Record<string, string> = {
    symptoms: t('symptoms'),
    aiDoctor: t('aiDoctor'),
    aiAnalysis: t('aiAnalysis'),
  };

  return (
    <Layout>
      <SEOHead title="Profile" description="Your profile and usage history" path="/profile" />
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* User Info */}
          <div className="glass-card p-8 rounded-3xl mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.age && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">{t('age')}</p>
                  <p className="font-bold text-foreground">{profile.age}</p>
                </div>
              )}
              {profile.gender && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">{t('gender')}</p>
                  <p className="font-bold text-foreground">{t(profile.gender)}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">{t('totalActions')}</p>
                <p className="font-bold text-foreground">{actions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <Link to="/premium" className="flex flex-col items-center">
                  <Crown className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs font-semibold text-primary">{t('getPremium')}</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-8 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('dataSecurityTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('dataSecurityDesc')}</p>
            </div>
          </div>

          {/* Usage History */}
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {t('usageHistory')}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : actions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('noHistoryYet')}</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {actions.map((action) => {
                  const Icon = fnIcon[action.function_name] || Activity;
                  let data: any = {};
                  try { data = typeof action.action_data === "string" ? JSON.parse(action.action_data) : action.action_data; } catch {}
                  
                  return (
                    <div key={action.id} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
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
                          <p className="text-xs text-muted-foreground mt-1 truncate">{data.result}</p>
                        )}
                        {data?.symptoms && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{data.symptoms}</p>
                        )}
                        {data?.query && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{data.query}</p>
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
