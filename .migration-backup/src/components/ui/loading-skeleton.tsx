import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("glass-card p-6 rounded-2xl space-y-4 animate-pulse", className)}>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded-lg bg-muted" />
          <div className="h-4 w-1/2 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded-lg bg-muted" />
        <div className="h-4 w-4/5 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function MedicineCardSkeleton() {
  return (
    <div className="medicine-shop-card animate-pulse">
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 rounded-lg bg-muted" />
            <div className="h-4 w-1/2 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
      <div className="px-6 pb-4">
        <div className="h-8 w-32 rounded-full bg-muted" />
      </div>
      <div className="px-6 pb-6 space-y-3">
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function ConditionCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl border-2 border-border animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-1/2 rounded-lg bg-muted" />
          <div className="h-5 w-24 rounded-full bg-muted" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded-lg bg-muted" />
        <div className="h-4 w-5/6 rounded-lg bg-muted" />
      </div>
      <div className="h-20 rounded-xl bg-muted" />
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 justify-start animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-muted" />
      <div className="max-w-[80%] space-y-2">
        <div className="h-4 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-56 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function AnalyzingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-display text-lg font-semibold text-foreground animate-pulse">
          AI is analyzing...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PharmacyCardSkeleton() {
  return (
    <div className="pharmacy-card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded-lg bg-muted" />
          <div className="h-4 w-1/2 rounded-lg bg-muted" />
          <div className="h-4 w-1/3 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
