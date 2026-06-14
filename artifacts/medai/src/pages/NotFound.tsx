import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Stethoscope } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEOHead title="Page Not Found" description="The page you are looking for does not exist." path="/404" />
      <div className="container flex flex-col items-center justify-center min-h-[70vh] py-20 text-center">
        <div className="relative mb-8">
          <div className="font-display text-[160px] md:text-[220px] font-bold leading-none text-gradient opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary text-primary-foreground shadow-2xl">
              <Stethoscope className="h-12 w-12" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('notFoundTitle')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
          {t('notFoundDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="rounded-2xl px-8 h-12 gradient-primary text-primary-foreground border-0 hover:opacity-90">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t('goHome')}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 h-12">
            <Link to="/symptoms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('checkSymptoms')}
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;