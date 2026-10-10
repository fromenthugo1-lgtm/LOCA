import { Info } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getSiteContent } from "@/features/site-content/queries";

export async function OnboardingSection() {
  const c = await getSiteContent("home.onboarding");
  return (
    <section aria-labelledby="mise-en-service-titre" className="bg-night py-20 text-white sm:py-28">
      <Container>
        <SectionHeading id="mise-en-service-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} tone="dark" />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-brand border border-night-line bg-night-line md:grid-cols-5">
          {c.steps.map((step, i) => (
            <li key={step.id} className="flex flex-col gap-3 bg-night p-6">
              <span className="text-[13px] font-medium tabular-nums text-ai">Étape {i + 1}</span>
              <h3 className="text-[16px] font-semibold text-white">{step.title}</h3>
              <p className="text-[14px] leading-relaxed text-night-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex max-w-3xl items-start gap-2.5 text-[15px] leading-relaxed text-night-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.75} aria-hidden="true" />
          {c.note}
        </p>
      </Container>
    </section>
  );
}
