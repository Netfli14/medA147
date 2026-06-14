import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MedicalCard } from "@/components/ui/medical-card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Activity, Bot, Camera, ShoppingBag, Building2, ArrowRight, Shield, Clock,
  Brain, Sparkles, Users, Zap, HeartPulse, Crown,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Index() {
  const { t } = useLanguage();

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

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="AI-Powered Health Assistant" description="Get instant health insights, accurate symptom analysis, medicine recommendations, and find nearby healthcare facilities, all powered by advanced AI." path="/" />
      <div>
        {/* Hero Section — Nature/Medical Style */}
        <section className="relative overflow-hidden min-h-[550px] md:min-h-[600px]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

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
            <p className="font-display text-3xl md:text-5xl font-bold text-white/90 leading-tight tracking-wide drop-shadow-lg">
              live<span className="text-emerald-400">.</span>
            </p>
            <p className="font-display text-3xl md:text-5xl font-bold text-white/90 leading-tight tracking-wide drop-shadow-lg">
              check<span className="text-emerald-400">.</span>
            </p>
            <p className="font-display text-3xl md:text-5xl font-bold text-emerald-400 leading-tight tracking-wide drop-shadow-lg">
              recover<span className="text-white/90">.</span>
            </p>
          </div>

          <div className="container relative py-16 md:py-24 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-white">{t('heroTagline')}</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] max-w-4xl">
              {t('heroTitle1')}{" "}
              <span className="text-emerald-400">{t('heroTitle2')}</span>{" "}
              {t('heroTitle3')}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
              {t('heroDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-2xl px-8 h-14 text-base font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-300">
                <Link to="/symptoms">
                  <HeartPulse className="mr-2 h-5 w-5" />
                  {t('checkSymptoms')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 rounded-2xl px-8 h-14 text-base font-semibold hover:scale-[1.02] active:scale-[0.97] transition-all duration-300">
                <Link to="/ai-doctor">
                  <Bot className="mr-2 h-5 w-5" />
                  {t('talkToAI')}
                </Link>
              </Button>
            </div>

            {/* Premium CTA */}
            <Link to="/premium" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-colors">
              <Crown className="h-4 w-4" />
              {t('getPremium')} - 5000₸/{t('perMonth')}
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 border-y border-primary/10">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-primary text-primary-foreground mb-3 shadow-lg">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="font-display text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 relative">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="container relative">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('exploreFeatures').split(' ')[0]} <span className="text-gradient">{t('exploreFeatures').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t('featuresDescription')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Link key={feature.href} to={feature.href} className="block">
                  <MedicalCard icon={feature.icon} gradient={feature.gradient} title={feature.title} description={feature.description} className="h-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-center text-primary-foreground shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
              <div className="relative">
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">{t('needHelp')}</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">{t('emergencyDescription')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-8 h-14 text-base font-bold shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-300">
                    <a href="tel:103">{t('callEmergency')}</a>
                  </Button>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-8 h-14 text-base font-bold shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-300">
                    <Link to="/hospitals">{t('findHospitals')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
