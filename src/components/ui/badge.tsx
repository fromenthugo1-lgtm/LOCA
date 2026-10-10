import type { ComponentType, ReactNode, SVGProps } from "react";
import { CircleCheck, CircleDashed, Telescope } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

export function Badge({
  icon: Icon,
  children,
  className,
}: {
  icon?: IconType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-brand border border-line bg-surface px-2 py-0.5 text-[12px] font-medium leading-5 text-muted",
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export type Availability = "available" | "in_development" | "planned" | "vision";

const availabilityStyles: Record<Availability, { label: string; icon: IconType; className: string }> = {
  available: { label: "Disponible", icon: CircleCheck, className: "text-success-ink" },
  in_development: { label: "En développement", icon: CircleDashed, className: "text-warning-ink" },
  planned: { label: "Prévu", icon: Telescope, className: "text-muted" },
  vision: { label: "Vision", icon: Telescope, className: "text-muted" },
};

/** Badge de disponibilité : une fonction future n'est jamais présentée comme opérationnelle. */
export function AvailabilityBadge({ status, className }: { status: Availability; className?: string }) {
  const s = availabilityStyles[status];
  return (
    <Badge icon={s.icon} className={cn(s.className, className)}>
      {s.label}
    </Badge>
  );
}
