import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/action-form";
import { ContentFields } from "@/components/admin/content-fields";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader, Section } from "@/components/admin/ui";
import { Notice } from "@/components/ui/notice";
import { resetContent, saveContent } from "@/features/admin/content/actions";
import { getContentRow } from "@/features/admin/content/queries";
import { formatDateTime } from "@/features/admin/labels";
import { siteContentDefaults } from "@/features/site-content/defaults";
import { mergeOnReference, type ContentValue } from "@/features/site-content/form-data";
import { sectionLabels } from "@/features/site-content/labels";
import { isSiteContentKey } from "@/features/site-content/schemas";

export const metadata: Metadata = { title: "Modifier un contenu" };

type Props = { params: Promise<{ key: string }>; searchParams: Promise<{ retour?: string }> };

export default function ContentPage({ params, searchParams }: Props) {
  return (
    <AdminSuspense>
      <ContentEditor params={params} searchParams={searchParams} />
    </AdminSuspense>
  );
}

async function ContentEditor({ params, searchParams }: Props) {
  const [{ key }, { retour }] = await Promise.all([params, searchParams]);
  if (!isSiteContentKey(key)) notFound();
  const row = await getContentRow(key);
  const reference = siteContentDefaults[key] as unknown as ContentValue;
  // Le formulaire s'ouvre sur le brouillon s'il existe, sinon sur le texte en ligne.
  const current = mergeOnReference(reference, row?.draft ?? row?.published ?? reference);

  return (
    <>
      <PageHeader title={sectionLabels[key].title} description={sectionLabels[key].where} back={{ href: "/admin/contenus", label: "Contenus" }} />
      <div className="flex flex-col gap-6">
        {retour === "defaut" && !row ? <Notice tone="success">Le texte par défaut est de nouveau affiché sur le site.</Notice> : null}
        {row?.draft ? <Notice tone="info">Un brouillon non publié est affiché ci-dessous. Le site montre toujours la version publiée.</Notice> : null}
        <Notice tone="warning" title="Règles de rédaction">
          Vouvoiement, phrases courtes, aucun chiffre, avis ou client inventé, pas de tiret long. Une fonction future reste marquée
          « En développement », « Prévu » ou « Vision ».
        </Notice>
        <Section
          title="Texte"
          description={row?.published_at ? `Version en ligne publiée le ${formatDateTime(row.published_at)}.` : "Le site affiche actuellement le texte par défaut."}
        >
          <ActionForm action={saveContent} submitLabel="Publier sur le site" pendingLabel="Publication…">
            <input type="hidden" name="key" value={key} />
            <ContentFields value={current} />
            <div>
              <button
                type="submit"
                name="intent"
                value="draft"
                className="inline-flex h-10 items-center rounded-brand border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-canvas"
              >
                Enregistrer en brouillon
              </button>
            </div>
          </ActionForm>
        </Section>
        {row ? (
          <Section title="Revenir au texte par défaut" description="Supprime la version enregistrée (publiée et brouillon).">
            <ActionForm action={resetContent} submitLabel="Revenir au texte par défaut" variant="secondary">
              <input type="hidden" name="key" value={key} />
            </ActionForm>
          </Section>
        ) : null}
      </div>
    </>
  );
}
