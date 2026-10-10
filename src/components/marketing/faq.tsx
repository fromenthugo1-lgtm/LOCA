import { ChevronDown } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getPublishedFaq } from "@/features/faq/queries";
import { getSiteContent } from "@/features/site-content/queries";
import { JsonLd } from "@/components/seo/json-ld";

/** FAQ en accordéon natif (<details>) : accessible au clavier, sans JavaScript. */
export async function FaqSection() {
  const [c, faq] = await Promise.all([getSiteContent("home.faq"), getPublishedFaq()]);
  return (
    <section id="faq" aria-labelledby="faq-titre" className="border-b border-line bg-surface py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeading id="faq-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} className="lg:sticky lg:top-28 lg:self-start" />
        <div className="divide-y divide-line border-y border-line">
          {faq.map((entry) => (
            <details key={entry.question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {entry.question}
                <ChevronDown
                  className="size-4 shrink-0 text-muted transition-transform duration-150 group-open:rotate-180"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-relaxed text-muted">{entry.answer}</p>
            </details>
          ))}
        </div>
      </Container>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((e) => ({
            "@type": "Question",
            name: e.question,
            acceptedAnswer: { "@type": "Answer", text: e.answer },
          })),
        }}
      />
    </section>
  );
}
