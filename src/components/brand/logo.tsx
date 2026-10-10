import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" : symbole + nom ; "mark" : symbole seul. */
  variant?: "full" | "mark";
  /** "dark" pour fond clair (par défaut), "light" pour fond bleu nuit. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Symbole SpendEdge : un point (le besoin de l'acheteur), un trait (la mise en relation),
 * une arête nette (le bon fournisseur). Voir DESIGN.md, « Logo ».
 */
export function LogoMark({ tone = "dark", className }: Omit<LogoProps, "variant">) {
  const tile = tone === "dark" ? "var(--color-night)" : "transparent";
  const stroke = tone === "dark" ? "transparent" : "var(--color-night-line)";
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={cn("size-8 shrink-0", className)}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill={tile} stroke={stroke} />
      <circle cx="9.5" cy="16" r="3" fill="#FFFFFF" />
      <path d="M13.5 16H20.5" stroke="var(--color-ai)" strokeWidth="2" strokeLinecap="round" />
      <path d="M23.5 8.5V23.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="square" />
    </svg>
  );
}

export function Logo({ variant = "full", tone = "dark", className }: LogoProps) {
  if (variant === "mark") return <LogoMark tone={tone} className={className} />;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      <span
        className={cn(
          "text-[17px] font-semibold tracking-[-0.01em]",
          tone === "dark" ? "text-night" : "text-white",
        )}
      >
        SpendEdge
      </span>
    </span>
  );
}
