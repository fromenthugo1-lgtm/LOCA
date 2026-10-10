import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader, Section } from "@/components/admin/ui";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { createFaqItem, deleteFaqItem, importDefaultFaq, updateFaqItem } from "@/features/admin/faq/actions";
import { listFaqItems } from "@/features/admin/faq/queries";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqAdminPage() {
  return (
    <AdminSuspense>
      <FaqAdmin />
    </AdminSuspense>
  );
}

function FaqFields({ prefix, values }: { prefix: string; values?: { question: string; answer: string; display_order: number; is_published: boolean } }) {
  return (
    <>
      <Field id={`${prefix}-question`} label="Question">
        <Input id={`${prefix}-question`} name="question" defaultValue={values?.question ?? ""} maxLength={300} />
      </Field>
      <Field id={`${prefix}-answer`} label="Réponse" hint="Fidèle à ce qui existe réellement, sans promesse technique ou juridique non garantie.">
        <Textarea id={`${prefix}-answer`} name="answer" defaultValue={values?.answer ?? ""} rows={4} maxLength={4000} />
      </Field>
      <div className="flex flex-wrap items-end gap-6">
        <Field id={`${prefix}-order`} label="Ordre">
          <Input id={`${prefix}-order`} name="displayOrder" type="number" min={0} max={1000} defaultValue={values?.display_order ?? 0} className="w-28" />
        </Field>
        <div className="flex items-center gap-2 pb-2.5">
          <input id={`${prefix}-pub`} name="isPublished" type="checkbox" defaultChecked={values?.is_published ?? true} className="size-4 accent-primary" />
          <label htmlFor={`${prefix}-pub`} className="text-sm text-ink">Publiée</label>
        </div>
      </div>
    </>
  );
}

async function FaqAdmin() {
  const items = await listFaqItems();
  return (
    <>
      <PageHeader title="FAQ" description="Questions affichées sur la page d'accueil. Sans question publiée, le site affiche les questions par défaut." />
      <div className="flex flex-col gap-6">
        {items.length === 0 ? (
          <Section title="Questions par défaut affichées" description="Importez-les pour pouvoir les modifier.">
            <ActionForm action={importDefaultFaq} submitLabel="Importer les questions par défaut" variant="secondary" />
          </Section>
        ) : null}
        {items.length > 0 && !items.some((i) => i.is_published) ? (
          <Notice tone="warning">Aucune question publiée : le site affiche les questions par défaut.</Notice>
        ) : null}
        {items.map((item, i) => (
          <Section key={item.id} title={`Question ${i + 1}`}>
            <ActionForm action={updateFaqItem} submitLabel="Enregistrer">
              <input type="hidden" name="id" value={item.id} />
              <FaqFields prefix={item.id} values={item} />
            </ActionForm>
            <ActionForm action={deleteFaqItem} submitLabel="Supprimer cette question" variant="secondary" className="mt-3">
              <input type="hidden" name="id" value={item.id} />
            </ActionForm>
          </Section>
        ))}
        <Section title="Ajouter une question">
          <ActionForm action={createFaqItem} submitLabel="Ajouter">
            <FaqFields prefix="new" />
          </ActionForm>
        </Section>
      </div>
    </>
  );
}
