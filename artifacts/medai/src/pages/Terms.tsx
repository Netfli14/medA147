import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, AlertTriangle, Ban, CheckCircle2, Scale } from "lucide-react";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead
        title="Terms of Use"
        description="Read the Terms of Use for MedAI+, your AI-powered health assistant."
        path="/terms"
      />
      <div className="container py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-gradient">{t('termsOfUse')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('termsOfUse')}
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            By using MedAI+, you agree to these Terms of Use. Please read them carefully.
          </p>
        </div>

        <div className="space-y-8">
          <div className="medical-card p-8 rounded-3xl border-l-4 border-l-destructive">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Medical Disclaimer — Read First</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">MedAI+ is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The information provided by MedAI+ is for informational purposes only. Always seek the advice of a qualified physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information provided by MedAI+. In a medical emergency, call 103 (Kazakhstan) or your local emergency number immediately.
            </p>
          </div>

          <div className="medical-card p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Acceptance of Terms</h2>
            </div>
            <ul className="space-y-3">
              {[
                "By accessing or using MedAI+, you agree to be bound by these Terms of Use and our Privacy Policy.",
                "You must be at least 13 years of age to use MedAI+. Users under 18 should use the service with parental supervision.",
                "You agree to provide accurate information when creating an account and using the service.",
                "These terms may be updated periodically. Continued use of the service constitutes acceptance of the updated terms.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Permitted Use</h2>
            </div>
            <ul className="space-y-3">
              {[
                "MedAI+ is provided for personal, non-commercial health information purposes only.",
                "You may use the service to get general health information, symptom guidance, and medicine information.",
                "You may share your results with your healthcare provider for informational purposes.",
                "Free tier users are subject to daily usage limits. Premium subscribers have expanded access.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <Ban className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Prohibited Activities</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Using MedAI+ to diagnose, treat, cure, or prevent any disease or medical condition.",
                "Attempting to circumvent rate limits, security measures, or access controls.",
                "Submitting false, misleading, or harmful content to the AI systems.",
                "Using the service to develop competing AI health products without written permission.",
                "Sharing your account credentials with others or creating multiple accounts to bypass limits.",
                "Scraping, data mining, or bulk downloading content from the service.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <Scale className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground pt-2">Limitation of Liability</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              MedAI+ is provided "as is" without warranties of any kind. To the maximum extent permitted by applicable law, MedAI+ and its creators shall not be liable for:
            </p>
            <ul className="space-y-3">
              {[
                "Any medical decisions made based on information provided by the service.",
                "Inaccuracies, errors, or omissions in AI-generated health information.",
                "Loss of data, service interruptions, or technical failures.",
                "Any direct, indirect, incidental, or consequential damages arising from use of the service.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              These Terms are governed by the laws of the Republic of Kazakhstan.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
