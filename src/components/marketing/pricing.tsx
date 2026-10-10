import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { routes } from "@/config/routes";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { getPublishedPlans } from "@/features/plans/queries";
import { getSiteContent } from "@/features/site-content/queries";
import { PlanCard } from "./plan-card";

export async function PricingSection({ showDetailsLink = true }: { showDetailsLink?: boolean }) {
  const [c, plans] = await Promise.all([getSiteContent("home.pricing"), getPublishedPlans()]);
  return (
    <section id="tarifs" aria-labelledby="tarifs-titre" className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading id="tarifs-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        {plans.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} cta={c.cta} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-start gap-6 rounded-brand border border-line bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-brand border border-line bg-canvas">
                <MessagesSquare className="size-5 text-night" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">{c.emptyTitle}</p>
                <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">{c.emptyText}</p>
              </div>
            </div>
            <ButtonLink href={routes.demo} className="shrink-0">
              {c.cta}
            </ButtonLink>
          </div>
        )}
        {showDetailsLink ? (
          <Link
            href={routes.pricing}
            className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:text-primary-hover"
          >
            {c.detailsLink}
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : null}
      </Container>
    </section>
  );
}
