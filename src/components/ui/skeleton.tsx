import { cn } from "@/lib/utils";

/** Zone de chargement sobre (pas d'animation artificielle, simple fond neutre). */
export function Skeleton({ className, label = "Chargement…" }: { className?: string; label?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("rounded-brand bg-line/60", className)}>
      <span className="sr-only">{label}</span>
    </div>
  );
}
