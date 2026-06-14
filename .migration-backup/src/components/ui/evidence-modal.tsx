import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, ExternalLink, FileText, Globe, Shield } from "lucide-react";
import { Button } from "./button";

interface EvidenceSource {
  name: string;
  type: "clinical" | "who" | "research" | "guideline";
  description: string;
  url?: string;
}

const defaultSources: EvidenceSource[] = [
  {
    name: "WHO Guidelines",
    type: "who",
    description: "World Health Organization clinical recommendations and treatment protocols",
    url: "https://www.who.int/publications",
  },
  {
    name: "NICE Clinical Guidelines",
    type: "guideline",
    description: "National Institute for Health and Care Excellence evidence-based recommendations",
    url: "https://www.nice.org.uk/guidance",
  },
  {
    name: "PubMed Medical Database",
    type: "research",
    description: "Peer-reviewed medical research and systematic reviews",
    url: "https://pubmed.ncbi.nlm.nih.gov/",
  },
  {
    name: "Clinical Practice Guidelines",
    type: "clinical",
    description: "Evidence-based protocols used by healthcare professionals worldwide",
  },
];

const getSourceIcon = (type: EvidenceSource["type"]) => {
  switch (type) {
    case "who":
      return Globe;
    case "clinical":
      return Shield;
    case "research":
      return FileText;
    case "guideline":
      return BookOpen;
    default:
      return FileText;
  }
};

const getSourceColor = (type: EvidenceSource["type"]) => {
  switch (type) {
    case "who":
      return "text-medical-blue bg-medical-blue/10";
    case "clinical":
      return "text-medical-green bg-medical-green/10";
    case "research":
      return "text-medical-purple bg-medical-purple/10";
    case "guideline":
      return "text-primary bg-primary/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

interface EvidenceModalProps {
  children: React.ReactNode;
  condition?: string;
}

export function EvidenceModal({ children, condition }: EvidenceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Evidence Sources
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {condition && (
            <p className="text-sm text-muted-foreground">
              Information about <span className="font-semibold text-foreground">{condition}</span> is based on:
            </p>
          )}
          <div className="space-y-3">
            {defaultSources.map((source) => {
              const Icon = getSourceIcon(source.type);
              const colorClass = getSourceColor(source.type);
              return (
                <div
                  key={source.name}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm">{source.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.description}</p>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        Learn more <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 rounded-xl bg-medical-warning/10 border border-medical-warning/20">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-medical-warning">Disclaimer:</span> This information is for educational purposes only and should not replace professional medical advice. Always consult a healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
