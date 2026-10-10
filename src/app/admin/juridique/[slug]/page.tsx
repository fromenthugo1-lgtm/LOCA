import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader, Section } from "@/components/admin/ui";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { publishLegalPage } from "@/features/admin/legal/actions";
import { listLegalVersions } from "@/features/admin/legal/queries";
import { formatDateTime } from "@/features/admin/labels";
import { legalDefaults, type LegalSlug } from "@/features/legal/defaults";
import { getLegalPage } from "@/features/legal/queries";

export const metadata: Metadata = { title: "Page juridique" };

type Props = { params: Promise<{ slug: string }> };

export default function LegalEditPage({ params }: Props) {
  return (
    <AdminSuspense>
      <LegalEditor params={params} />
    </AdminSuspense>
  );
}

async function LegalEditor({ params }: Props) {
  const { slug } = await params;
  if (!Object.hasOwn(legalDefaults, slug)) notFound();
  const [page, versions] = await Promise.all([getLegalPage(slug as LegalSlug), listLegalVersions(slug)]);
  return (
    <>
      <PageHeader title={page.title} description={`Version en ligne : ${page.version}`} back={{ href: "/admin/juridique", label: "Pages juridiques" }} />
      <div className="flex flex-col gap-6">
        <Notice tone="info" title="Format du texte">
          « ## » en début de ligne pour un titre, « - » pour une liste, une ligne vide entre deux paragraphes, **texte** pour le gras,
          [texte](/chemin) pour un lien. Remplacez chaque [À COMPLÉTER] par l&apos;information réelle.
        </Notice>
        <Section title="Texte publié">
          <ActionForm action={publishLegalPage} submitLabel="Publier cette version" pendingLabel="Publication…">
            <input type="hidden" name="slug" value={page.slug} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="title" label="Titre">
                <Input id="title" name="title" defaultValue={page.title} maxLength={160} />
              </Field>
              <Field id="version" label="Numéro de version" hint="À changer à chaque modification du texte.">
                <Input id="version" name="version" defaultValue={page.version} maxLength={40} />
              </Field>
            </div>
            <Field id="body" label="Texte">
              <Textarea id="body" name="body" defaultValue={page.body} rows={24} className="font-mono text-[13px]" />
            </Field>
          </ActionForm>
        </Section>
        <Section title="Versions publiées" description="Historique conservé en base : il prouve la version acceptée par chaque utilisateur.">
          {versions.length === 0 ? (
            <p className="text-sm text-muted">Aucune version publiée : la trame par défaut est affichée.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {versions.map((v) => (
                <li key={v.version} className="flex justify-between py-2">
                  <span className="font-medium text-ink">{v.version}</span>
                  <span className="text-muted">{formatDateTime(v.published_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
