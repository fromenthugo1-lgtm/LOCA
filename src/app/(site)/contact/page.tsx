import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { routes } from "@/config/routes";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez SpendEdge pour une question sur vos demandes de prix fournisseurs, ou demandez une démonstration adaptée à votre activité.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const c = await getSiteContent("site.contact");
  const items = [
    { icon: Mail, label: "E-mail", value: c.email },
    { icon: Phone, label: "Téléphone", value: c.phone },
    { icon: MapPin, label: "Adresse", value: c.address },
    { icon: Clock, label: "Horaires", value: c.hours },
  ];
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px]">Nous contacter</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">{c.intro}</p>
        <Card className="mt-10 divide-y divide-line">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 p-5">
              <Icon className="mt-0.5 size-5 shrink-0 text-night" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="text-[13px] text-muted">{label}</p>
                <p className={value.startsWith("[À COMPLÉTER") ? "mt-0.5 text-[15px] text-warning-ink" : "mt-0.5 text-[15px] text-ink"}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </Card>
        <ButtonLink href={routes.demo} size="lg" className="mt-8">
          Demander une démonstration
        </ButtonLink>
      </Container>
    </section>
  );
}
