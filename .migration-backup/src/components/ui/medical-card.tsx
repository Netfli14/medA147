import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MedicalCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MedicalCard({
  title,
  description,
  icon: Icon,
  iconColor,
  gradient = "from-primary to-medical-sky",
  children,
  className,
  onClick,
}: MedicalCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "medical-card text-left w-full group relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 bg-gradient-to-br from-primary to-medical-sky" />
      
      <div className="relative">
        {Icon && (
          <div className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
            `bg-gradient-to-br ${gradient}`
          )}>
            <Icon className={cn("h-7 w-7 text-white", iconColor)} />
          </div>
        )}
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
        {children}
      </div>
    </Wrapper>
  );
}
