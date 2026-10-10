import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { getSiteContent } from "@/features/site-content/queries";
import { ComparePanel, MatchPanel, NeedPanel, SendPanel, TrackPanel } from "./mockups/walkthrough-panels";
import { ScrollWalkthrough } from "./scroll-walkthrough";

export async function WalkthroughSection() {
  const c = await getSiteContent("home.walkthrough");
  const panels = [<NeedPanel key="need" />, <MatchPanel key="match" />, <SendPanel key="send" />, <TrackPanel key="track" />, <ComparePanel key="compare" />];
  return (
    <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading id="fonctionnement-titre" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        <ScrollWalkthrough steps={c.steps} panels={panels} />
      </Container>
    </section>
  );
}
