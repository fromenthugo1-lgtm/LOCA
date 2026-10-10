import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { FinalCta } from "@/components/marketing/final-cta";
import { OnboardingSection } from "@/components/marketing/onboarding";
import { PricingSection } from "@/components/marketing/pricing";

export const metadata: Metadata = {
  title: "Tarifs et formules",
  description:
    "Une mise en service facturée une seule fois, puis un abonnement mensuel selon le nombre d'utilisateurs et le volume de demandes. Tarifs présentés après la démonstration.",
  alternates: { canonical: "/tarifs" },
};

export default function PricingPage() {
  return (
    <>
      <Container className="pt-16 sm:pt-24">
        <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px]">
          Tarifs et formules
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
          Deux éléments distincts : la mise en service, préparée avec vous et facturée une seule fois, puis
          l&apos;abonnement mensuel. Aucun paiement n&apos;est demandé en ligne : une démonstration précède toute souscription.
        </p>
      </Container>
      <PricingSection showDetailsLink={false} />
      <OnboardingSection />
      <FinalCta />
    </>
  );
}
