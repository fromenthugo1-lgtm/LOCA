import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { DemoRequestForm } from "@/components/forms/demo-request-form";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Demander une démonstration",
  description:
    "Présentez-nous votre activité : nous vous montrons comment SpendEdge peut prendre en charge vos demandes de prix fournisseurs.",
  alternates: { canonical: "/demo" },
};

export default async function DemoPage() {
  const c = await getSiteContent("demo.page");
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px]">{c.title}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{c.intro}</p>
          </div>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {c.nextSteps.map((step, i) => (
              <li key={step.id} className="grid grid-cols-[2rem_1fr] gap-x-3 py-4">
                <span className="text-[13px] font-medium tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[15px] font-medium text-ink">{step.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Card className="relative p-6 sm:p-8">
          <DemoRequestForm privacyNotice={c.privacyNotice} successTitle={c.successTitle} successText={c.successText} />
        </Card>
      </Container>
    </section>
  );
}
