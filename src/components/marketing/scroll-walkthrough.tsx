"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Step = { id: string; title: string; text: string };

/**
 * Démonstration verticale au défilement (DESIGN.md, « Mouvement ») :
 * - grand écran : les étapes défilent à gauche, le panneau collant à droite change avec l'étape ;
 * - mobile : chaque étape est suivie de son panneau, sans effet lié au défilement.
 * Le défilement n'est jamais bloqué ; IntersectionObserver suit l'étape au centre de l'écran.
 * Avec prefers-reduced-motion, la transition devient instantanée (globals.css).
 */
export function ScrollWalkthrough({ steps, panels }: { steps: Step[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
      <ol className="flex min-w-0 flex-col gap-12 lg:gap-0">
        {steps.map((step, i) => (
          <li
            key={step.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="flex flex-col gap-5 lg:min-h-[62vh] lg:justify-center"
          >
            <div
              className={cn(
                "border-l-2 pl-5 transition-colors duration-[240ms]",
                active === i ? "lg:border-primary" : "lg:border-line",
                "border-primary",
              )}
            >
              <h3 className={cn("text-xl font-semibold transition-colors duration-[240ms]", active === i ? "text-ink" : "text-ink lg:text-muted")}>
                {step.title}
              </h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{step.text}</p>
            </div>
            <div className="lg:hidden">{panels[i]}</div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-[calc(50vh-190px)] grid">
          {panels.map((panel, i) => (
            <div
              key={steps[i]?.id ?? i}
              aria-hidden={active !== i}
              inert={active !== i}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)]",
                active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
              )}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
