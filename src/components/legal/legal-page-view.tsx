import { Container } from "@/components/layout/container";
import { Notice } from "@/components/ui/notice";
import { getLegalPage } from "@/features/legal/queries";
import type { LegalSlug } from "@/features/legal/defaults";
import { RichText } from "./rich-text";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

/** Page juridique : texte publié depuis l'administration, ou trame par défaut. */
export async function LegalPageView({ slug }: { slug: LegalSlug }) {
  const page = await getLegalPage(slug);
  const incomplete = page.body.includes("[À COMPLÉTER");
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[40px]">{page.title}</h1>
        <p className="mt-3 text-[13px] text-muted">
          Version {page.version}
          {page.publishedAt ? `, publiée le ${dateFormat.format(new Date(page.publishedAt))}` : ""}
        </p>
        {incomplete ? (
          <Notice tone="warning" title="Document en cours de finalisation" className="mt-8">
            <p>Certaines informations sont en attente et signalées comme telles dans le texte.</p>
          </Notice>
        ) : null}
        <div className="mt-10">
          <RichText source={page.body} />
        </div>
      </Container>
    </section>
  );
}
