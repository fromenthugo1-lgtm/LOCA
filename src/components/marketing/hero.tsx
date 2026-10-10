import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { getSiteContent } from "@/features/site-content/queries";
import { RequestOverviewMockup } from "./mockups/request-overview";

export async function Hero() {
  const c = await getSiteContent("home.hero");
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
      {/* Lignes de repère « plan technique » (DESIGN.md, « Forme et espace »). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
        <Container className="relative h-full">
          <div className="absolute inset-y-0 left-4 border-l border-line sm:left-6" />
          <div className="absolute inset-y-0 right-4 border-r border-line sm:right-6" />
        </Container>
      </div>
      <Container className="relative pb-16 pt-16 sm:pt-24 lg:pb-24">
        <div className="max-w-3xl animate-appear px-0 sm:px-6">
          <p className="text-[13px] font-medium tracking-wide text-primary">{c.eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px] lg:text-[60px]"
          >
            {c.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg">{c.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.demo} size="lg">
              {c.primaryCta}
              <ArrowRight strokeWidth={1.75} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/#fonctionnement" variant="secondary" size="lg">
              {c.secondaryCta}
            </ButtonLink>
          </div>
        </div>
        <div className="mt-14 sm:mt-20 sm:px-6">
          <RequestOverviewMockup />
        </div>
      </Container>
    </section>
  );
}
