import { CircleAlert, CircleCheck, Clock, Send } from "lucide-react";
import type { SupplierStatus } from "./fictional-data";
import { cn } from "@/lib/utils";

const map: Record<SupplierStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "En attente", icon: Clock, className: "text-muted" },
  sent: { label: "Envoyée", icon: Send, className: "text-primary" },
  answered: { label: "Réponse reçue", icon: CircleCheck, className: "text-success-ink" },
  issue: { label: "Anomalie", icon: CircleAlert, className: "text-danger" },
};

/** Statut d'une demande dans les maquettes : icône + libellé. */
export function StatusPill({ status, className }: { status: SupplierStatus; className?: string }) {
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", s.className, className)}>
      <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {s.label}
    </span>
  );
}
