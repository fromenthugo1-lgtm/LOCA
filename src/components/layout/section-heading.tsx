import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** En-tête de section vitrine : sur-titre, titre (h2), texte d'introduction. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrow ? (
        <p className={cn("text-[13px] font-medium tracking-wide", tone === "dark" ? "text-ai" : "text-primary")}>{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={cn(
          "text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[34px]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p className={cn("text-base leading-relaxed sm:text-[17px]", tone === "dark" ? "text-night-muted" : "text-muted")}>{intro}</p>
      ) : null}
    </div>
  );
}
