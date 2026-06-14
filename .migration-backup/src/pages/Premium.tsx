import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Brain, Shield, Infinity, Star, CheckCircle2, Loader2, Users, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

type PlanKey = "monthly" | "semiannual" | "annual";

interface Plan {
  key: PlanKey;
  price: string;
  priceNum: number;
  period: string;
  originalPrice?: string;
  badge?: string;
  highlight?: boolean;
}

export default function Premium() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [processing, setProcessing] = useState<PlanKey | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: t('premiumActivated'), description: t('premiumActivatedDesc') });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const checkSub = async () => {
      try {
        const { data } = await supabase.functions.invoke("check-subscription");
        if (data?.subscribed) {
          setSubscribed(true);
          setSubscriptionEnd(data.subscription_end);
        }
      } catch {}
    };
    checkSub();
    const interval = setInterval(checkSub, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const features = [
    t('premiumFeature1'),
    t('premiumFeature2'),
    t('premiumFeature3'),
    t('premiumFeature4'),
    t('premiumFeature5'),
    t('premiumFeature6'),
  ];

  const plans: Plan[] = [
    { key: "monthly", price: "5 000", priceNum: 5000, period: t('perMonth') },
    { key: "semiannual", price: "25 000", priceNum: 25000, period: t('per6Months'), originalPrice: "30 000", badge: t('save17'), highlight: true },
    { key: "annual", price: "50 000", priceNum: 50000, period: t('perYear'), originalPrice: "60 000", badge: t('save17') },
  ];

  const handlePurchase = async (planKey: PlanKey) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setProcessing(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleManage = async () => {
    setProcessing("monthly");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Layout>
      <SEOHead title="Premium" description="Upgrade to MedAI+ Premium for unlimited access" path="/premium" />
      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-sm font-semibold mb-6">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">MedAI+ Premium</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('premiumTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('premiumDesc')}</p>

          {subscribed && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {t('premiumActive')}
              {subscriptionEnd && ` · ${new Date(subscriptionEnd).toLocaleDateString()}`}
            </div>
          )}
        </div>

        {/* 3 Plan Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isHighlight = plan.highlight;
            const isProcessing = processing === plan.key;
            return (
              <div
                key={plan.key}
                className={cn(
                  "relative rounded-3xl p-7 flex flex-col transition-all",
                  isHighlight
                    ? "border-2 border-amber-500 bg-gradient-to-br from-amber-500/5 to-amber-600/5 shadow-2xl md:scale-105"
                    : "border border-border bg-card hover:border-amber-500/40 hover:shadow-xl"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold whitespace-nowrap shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-5">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {t(`plan_${plan.key}`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">MedAI+ Premium</p>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-base font-semibold text-muted-foreground">₸</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through mt-1">
                      {plan.originalPrice} ₸
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.period}</p>

                {/* Action button — fixed height + truncate to prevent distortion */}
                <Button
                  onClick={() => subscribed ? handleManage() : handlePurchase(plan.key)}
                  disabled={!!processing}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-sm border-0 transition-all flex items-center justify-center gap-2 px-3",
                    subscribed
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : isHighlight
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-foreground text-background hover:opacity-90"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : subscribed ? (
                    <span className="truncate">{t('manageSubscription')}</span>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {user ? t('purchasePremium') : t('loginToPurchase')}
                      </span>
                    </>
                  )}
                </Button>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 mt-0.5">
                        <Check className="h-3 w-3 text-amber-600 dark:text-amber-400" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust footer */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            {t('securePayment')} · Stripe
          </p>
        </div>

        {/* Free vs Premium comparison */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-7 rounded-3xl">
            <h3 className="font-display text-lg font-bold text-foreground mb-5 text-center">
              {t('freeVsPremium')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="font-semibold text-muted-foreground">{t('feature')}</div>
              <div className="text-center font-semibold text-muted-foreground">Free</div>
              <div className="text-center font-semibold text-amber-600 dark:text-amber-400">Premium</div>

              <div className="text-foreground py-1.5">{t('symptoms')}</div>
              <div className="text-center text-muted-foreground py-1.5">3/{t('dayUnit')}</div>
              <div className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center py-1.5"><Infinity className="h-4 w-4" /></div>

              <div className="text-foreground py-1.5">{t('aiDoctor')}</div>
              <div className="text-center text-muted-foreground py-1.5">5/{t('dayUnit')}</div>
              <div className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center py-1.5"><Infinity className="h-4 w-4" /></div>

              <div className="text-foreground py-1.5">{t('aiAnalysis')}</div>
              <div className="text-center text-muted-foreground py-1.5">3/{t('dayUnit')}</div>
              <div className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center py-1.5"><Infinity className="h-4 w-4" /></div>

              <div className="text-foreground py-1.5">{t('aiModel')}</div>
              <div className="text-center text-muted-foreground py-1.5">Standard</div>
              <div className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 py-1.5"><Star className="h-3 w-3" /> Pro</div>

              <div className="text-foreground py-1.5">{t('sharing')}</div>
              <div className="text-center text-muted-foreground py-1.5">-</div>
              <div className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 py-1.5"><Users className="h-3 w-3" /> +1</div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </Layout>
  );
}
