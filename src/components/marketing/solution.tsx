import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AvailabilityBadge } from "@/components/ui/badge";
import { getSiteContent } from "@/features/site-content/queries";

export async function SolutionSection() {
  const c = await getSiteContent("home.solution");
  return (
    <section aria-labelledby="solution-titre" className="border-b border-line bg-surface py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <SectionHeading id="solution-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} className="lg:sticky lg:top-28 lg:self-start" />
        <ol className="flex flex-col divide-y divide-line border-y border-line">
          {c.items.map((item, i) => (
            <li key={item.id} className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-2 py-6">
              <span className="pt-0.5 text-[13px] font-medium tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-[17px] font-semibold text-ink">{item.title}</h3>
                  <AvailabilityBadge status={item.status} />
                </div>
                <p className="text-[15px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
