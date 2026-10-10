import { Factory, HardHat, Shovel, Trees, Zap } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getSiteContent } from "@/features/site-content/queries";

const icons: Record<string, typeof Factory> = {
  construction: HardHat,
  earthworks: Shovel,
  landscaping: Trees,
  electrical: Zap,
  industry: Factory,
};

export async function SectorsSection() {
  const c = await getSiteContent("home.sectors");
  return (
    <section id="secteurs" aria-labelledby="secteurs-titre" className="border-b border-line bg-surface py-20 sm:py-28">
      <Container>
        <SectionHeading id="secteurs-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-brand border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {c.items.map((item) => {
            const Icon = icons[item.id] ?? Factory;
            return (
              <li key={item.id} className="flex flex-col gap-3 bg-surface p-6">
                <Icon className="size-5 text-night" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-[16px] font-semibold text-ink">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-[15px] text-muted">{c.note}</p>
      </Container>
    </section>
  );
}
