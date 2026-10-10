import { FaqSection } from "@/components/marketing/faq";
import { FeaturesSection } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { OnboardingSection } from "@/components/marketing/onboarding";
import { PricingSection } from "@/components/marketing/pricing";
import { ProblemSection } from "@/components/marketing/problem";
import { SectorsSection } from "@/components/marketing/sectors";
import { SolutionSection } from "@/components/marketing/solution";
import { WalkthroughSection } from "@/components/marketing/walkthrough";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env";

export default function HomePage() {
  const url = getSiteUrl();
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <WalkthroughSection />
      <FeaturesSection />
      <SectorsSection />
      <OnboardingSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url,
          logo: `${url}/icon-512.png`,
          description: siteConfig.description,
        }}
      />
    </>
  );
}
