import { Boxes, ClipboardList, GitCompareArrows, Inbox, MailCheck, Settings2, Truck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AvailabilityBadge } from "@/components/ui/badge";
import { getSiteContent } from "@/features/site-content/queries";

const icons: Record<string, typeof Truck> = {
  needs: ClipboardList,
  suppliers: Truck,
  matching: Boxes,
  automation: MailCheck,
  tracking: Inbox,
  comparison: GitCompareArrows,
  setup: Settings2,
};

export async function FeaturesSection() {
  const c = await getSiteContent("home.features");
  return (
    <section id="fonctionnalites" aria-labelledby="fonctionnalites-titre" className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading id="fonctionnalites-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {c.items.map((item, index) => {
            const Icon = icons[item.id] ?? Boxes;
            return (
              <li key={item.id} className={`flex flex-col gap-3 rounded-brand ${index < 3 ? "lg:col-span-4" : "lg:col-span-3"} ${index === c.items.length - 1 ? "sm:col-span-2 lg:col-span-3" : ""} border border-line bg-surface p-6 transition-colors duration-150 hover:border-[#CBD5E1]`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-brand border border-line bg-canvas">
                    <Icon className="size-5 text-night" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <AvailabilityBadge status={item.status} />
                </div>
                <h3 className="mt-1 text-[17px] font-semibold text-ink">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
