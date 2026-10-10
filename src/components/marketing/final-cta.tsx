import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { getSiteContent } from "@/features/site-content/queries";

export async function FinalCta() {
  const c = await getSiteContent("home.finalCta");
  return (
    <section aria-labelledby="cta-final-titre" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start gap-8 rounded-brand border border-line bg-surface p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="cta-final-titre" className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[34px]">
              {c.title}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{c.text}</p>
          </div>
          <ButtonLink href={routes.demo} size="lg" className="shrink-0">
            {c.cta}
            <ArrowRight strokeWidth={1.75} aria-hidden="true" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
