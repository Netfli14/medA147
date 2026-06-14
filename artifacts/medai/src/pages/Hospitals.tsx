import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  Pill,
  Ambulance,
  Navigation,
  ExternalLink,
} from "lucide-react";

const openDirections = (coords: string, name: string) => {
  const url = `https://2gis.kz/astana/search/${encodeURIComponent(name)}`;
  window.open(url, '_blank');
};

export default function Hospitals() {
  const { t } = useLanguage();

  const emergencyNumbers = [
    { name: t('emergencyAmbulance'), number: "103", icon: Ambulance },
    { name: t('generalEmergency'), number: "112", icon: Phone },
  ];

  const hospitals = [
    { name: "University Medical Center", address: "Kabanbay Batyr Ave 53, Astana", phone: "+7 (7172) 70-62-62", hours: "24/7", type: t('mainHospital'), coords: "51.124921,71.405314" },
    { name: "National Coordination Center for Emergency Medicine", address: "Turan Avenue, Astana", phone: "+7 (7172) 70-29-00", hours: "24/7", type: t('emergencyCenter'), coords: "51.083884,71.380874" },
    { name: "Multidisciplinary Children's Hospital №1", address: "Saryarka District, Astana", phone: "+7 (7172) 53-94-33", hours: "24/7", type: t('pediatricHospital'), coords: "51.149337,71.455322" },
  ];

  const pharmacies = [
    { name: "АльфаМед", address: "Astana, Kazakhstan", phone: "+7 (7172) 55-22-33", hours: "24/7", coords: "51.135935,71.422372" },
    { name: "БиоСфера", address: "Astana, Kazakhstan", phone: "+7 (7172) 44-11-22", hours: "08:00 - 22:00", coords: "51.147796,71.47828" },
    { name: "Bios", address: "Astana, Kazakhstan", phone: "+7 (7172) 33-44-55", hours: "24/7", coords: "51.106039,71.400612" },
    { name: "Аптека низких цен", address: "Astana, Kazakhstan", phone: "+7 (7172) 66-77-88", hours: "09:00 - 21:00", coords: "51.182959,71.376425" },
  ];

  return (
    <Layout showFooterDisclaimer>
      <SEOHead title="Pharmacies & Hospitals" description="Find pharmacies and hospitals in Astana with directions via 2GIS. Emergency numbers and healthcare locations." path="/hospitals" />
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-semibold mb-6">
            <Building2 className="h-4 w-4 text-medical-coral" />
            <span className="text-gradient-accent">{t('healthcareLocations')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{t('pharmaciesHospitalsAstana')}</h1>
          <p className="text-lg text-muted-foreground">{t('clickForDirections2gis')}</p>
        </div>

        {/* Emergency Numbers */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyNumbers.map((emergency) => (
              <a key={emergency.number} href={`tel:${emergency.number}`} className="group relative overflow-hidden rounded-2xl border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 p-6 transition-all hover:border-destructive/40 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                    <emergency.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{emergency.name}</p>
                    <p className="font-display text-3xl font-bold text-destructive">{emergency.number}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Pharmacies */}
          <div className="mb-14">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-medical-green to-medical-mint"><Pill className="h-5 w-5 text-white" /></div>
              {t('pharmacies')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacies.map((pharmacy, index) => (
                <button key={index} onClick={() => openDirections(pharmacy.coords, pharmacy.name)} className="pharmacy-card text-left w-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">{pharmacy.name}</h3>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Navigation className="h-4 w-4" /></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{pharmacy.address}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /><span>{pharmacy.hours}</span></div>
                    <div className="flex items-center gap-2 text-primary font-medium"><Phone className="h-4 w-4 shrink-0" /><span>{pharmacy.phone}</span></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-primary font-medium">
                    <Navigation className="h-3.5 w-3.5" />{t('openIn2gis')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hospitals */}
          <div className="mb-14">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-medical-sky"><Building2 className="h-5 w-5 text-white" /></div>
              {t('hospitalsTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map((hospital, index) => (
                <button key={index} onClick={() => openDirections(hospital.coords, hospital.name)} className="pharmacy-card text-left w-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{hospital.name}</h3>
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{hospital.type}</span>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Navigation className="h-4 w-4" /></div>
                  </div>
                  <div className="space-y-2 text-sm mt-3">
                    <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{hospital.address}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /><span>{hospital.hours}</span></div>
                    <div className="flex items-center gap-2 text-primary font-medium"><Phone className="h-4 w-4 shrink-0" /><span>{hospital.phone}</span></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-primary font-medium">
                    <Navigation className="h-3.5 w-3.5" />{t('openIn2gis')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2GIS Link */}
          <div className="glass-card rounded-3xl p-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />{t('astanaHealthcareMap')}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{t('clickForDirections2gis')}</p>
            <Button asChild className="gradient-primary text-white rounded-xl">
              <a href="https://2gis.kz/astana/search/%D0%B0%D0%BF%D1%82%D0%B5%D0%BA%D0%B0" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />{t('openIn2gis')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
