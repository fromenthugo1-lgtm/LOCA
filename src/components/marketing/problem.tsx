import { Clock, Copy, FileSpreadsheet, Inbox, PhoneOff, Send } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getSiteContent } from "@/features/site-content/queries";

const icons: Record<string, typeof Send> = {
  contact: Send,
  people: PhoneOff,
  repeat: Copy,
  scattered: Inbox,
  compare: FileSpreadsheet,
  admin: Clock,
};

export async function ProblemSection() {
  const c = await getSiteContent("home.problem");
  return (
    <section aria-labelledby="probleme-titre" className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading id="probleme-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-brand border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((item) => {
            const Icon = icons[item.id] ?? Clock;
            return (
              <li key={item.id} className="flex flex-col gap-3 bg-surface p-6">
                <Icon className="size-5 text-muted" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-[17px] font-semibold text-ink">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
