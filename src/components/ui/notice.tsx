import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, { icon: typeof Info; box: string; icon_: string }> = {
  info: { icon: Info, box: "border-line bg-surface", icon_: "text-primary" },
  success: { icon: CircleCheck, box: "border-[#BBF7D0] bg-[#F0FDF4]", icon_: "text-success-ink" },
  warning: { icon: TriangleAlert, box: "border-[#FDE68A] bg-[#FFFBEB]", icon_: "text-warning-ink" },
  error: { icon: CircleAlert, box: "border-[#FECACA] bg-[#FEF2F2]", icon_: "text-danger" },
};

/** Message d'état : toujours icône + texte, jamais la couleur seule. */
export function Notice({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn("flex gap-3 rounded-brand border p-4 text-sm leading-relaxed text-ink", t.box, className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", t.icon_)} strokeWidth={1.75} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-ink/80">{children}</div> : null}
      </div>
    </div>
  );
}
