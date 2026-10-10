import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DefinitionList, PageHeader, Section } from "@/components/admin/ui";
import { Field, Select, Textarea } from "@/components/ui/field";
import { companySizeOptions, sectorOptions } from "@/config/business";
import { updateDemoRequest } from "@/features/admin/demo-requests/actions";
import { demoStatuses, getDemoRequest } from "@/features/admin/demo-requests/queries";
import { demoStatusLabels, formatDateTime } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Demande de démo" };

type Props = { params: Promise<{ id: string }> };

export default function DemoRequestPage({ params }: Props) {
  return (
    <AdminSuspense>
      <DemoRequestDetail params={params} />
    </AdminSuspense>
  );
}

async function DemoRequestDetail({ params }: Props) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const r = await getDemoRequest(id);
  if (!r) notFound();

  return (
    <>
      <PageHeader title={r.full_name} description={`${r.company_name}, reçue le ${formatDateTime(r.created_at)}`} back={{ href: "/admin/demandes", label: "Demandes de démo" }} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Section title="Informations transmises">
          <DefinitionList
            items={[
              { label: "Nom et prénom", value: r.full_name },
              { label: "E-mail", value: <a href={`mailto:${r.email}`} className="text-primary">{r.email}</a> },
              { label: "Entreprise", value: r.company_name },
              { label: "Fonction", value: r.job_title },
              { label: "Secteur", value: sectorOptions.find((o) => o.value === r.sector)?.label ?? r.sector },
              { label: "Taille", value: companySizeOptions.find((o) => o.value === r.company_size)?.label ?? r.company_size },
              { label: "Téléphone", value: r.phone },
              { label: "Besoin", value: r.message ? <span className="whitespace-pre-line">{r.message}</span> : null },
              { label: "Conservation jusqu'au", value: formatDateTime(r.retain_until) },
            ]}
          />
        </Section>
        <Section title="Suivi" description="Visible uniquement par l'équipe SpendEdge.">
          <ActionForm action={updateDemoRequest} submitLabel="Enregistrer">
            <input type="hidden" name="id" value={r.id} />
            <Field id="status" label="Statut">
              <Select id="status" name="status" defaultValue={r.status}>
                {demoStatuses.map((s) => (
                  <option key={s} value={s}>{demoStatusLabels[s]}</option>
                ))}
              </Select>
            </Field>
            <Field id="internalNotes" label="Notes internes" optional>
              <Textarea id="internalNotes" name="internalNotes" defaultValue={r.internal_notes ?? ""} rows={6} maxLength={4000} />
            </Field>
          </ActionForm>
        </Section>
      </div>
    </>
  );
}
