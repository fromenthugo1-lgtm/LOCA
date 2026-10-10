import type { ReactNode } from "react";
import { FileText, Inbox, LayoutGrid, Truck } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Étiquette obligatoire sur toute maquette (DESIGN.md, « Images »). */
export function FictionalLabel({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-brand border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-muted", className)}>
      Aperçu, données fictives
    </span>
  );
}

const nav = [
  { label: "Demandes", icon: FileText, active: true },
  { label: "Fournisseurs", icon: Truck },
  { label: "Réponses", icon: Inbox },
  { label: "Catalogue", icon: LayoutGrid },
];

/** Cadre d'application SpendEdge pour les maquettes : barre latérale + zone de contenu. */
export function AppFrame({ children, className, title }: { children: ReactNode; className?: string; title: string }) {
  return (
    <figure
      className={cn("overflow-hidden rounded-brand border border-line bg-surface shadow-panel", className)}
      aria-label={`Maquette de l'interface SpendEdge : ${title}. Données fictives.`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <LogoMark className="size-5" />
          <span className="truncate text-[13px] font-medium text-ink">{title}</span>
        </div>
        <FictionalLabel />
      </div>
      <div className="flex min-h-0">
        <nav aria-hidden="true" className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-line bg-canvas p-2 md:flex">
          {nav.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-brand px-2.5 py-1.5 text-[13px]",
                active ? "bg-surface font-medium text-ink shadow-panel" : "text-muted",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </figure>
  );
}
