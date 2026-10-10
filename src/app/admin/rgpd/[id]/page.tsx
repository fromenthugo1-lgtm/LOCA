import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DefinitionList, PageHeader, Section } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { updateGdprRequest } from "@/features/admin/gdpr/actions";
import { getGdprRequest } from "@/features/admin/gdpr/queries";
import { formatDateTime, gdprStatusLabels, gdprTypeLabels } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Demande RGPD" };

type Props = { params: Promise<{ id: string }> };

export default function GdprRequestPage({ params }: Props) {
  return (
    <AdminSuspense>
      <GdprDetail params={params} />
    </AdminSuspense>
  );
}

async function GdprDetail({ params }: Props) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const r = await getGdprRequest(id);
  if (!r) notFound();
  return (
    <>
      <PageHeader title={`Demande : ${gdprTypeLabels[r.request_type]}`} description={r.requester_email} back={{ href: "/admin/rgpd", label: "Demandes RGPD" }} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Demande">
          <DefinitionList
            items={[
              { label: "Type", value: gdprTypeLabels[r.request_type] },
              { label: "Demandeur", value: r.requester_email },
              { label: "Compte lié", value: r.user_id ? <Link href={`/admin/comptes/${r.user_id}`} className="text-primary">Voir le compte</Link> : "Aucun compte" },
              { label: "Reçue le", value: formatDateTime(r.received_at) },
              { label: "Échéance", value: formatDateTime(r.due_at) },
              { label: "Identité vérifiée le", value: formatDateTime(r.identity_verified_at) },
              { label: "Clôturée le", value: formatDateTime(r.completed_at) },
            ]}
          />
          {r.request_type === "erasure" && r.user_id ? (
            <p className="mt-4 text-sm text-muted">
              Pour un effacement : programmez la suppression depuis la fiche du compte (suspension, délai de grâce, puis anonymisation).
            </p>
          ) : null}
        </Section>
        <Section title="Traitement" description="Vérification d'identité proportionnée, puis trace minimale de ce qui a été fait.">
          <ActionForm action={updateGdprRequest} submitLabel="Enregistrer">
            <input type="hidden" name="id" value={r.id} />
            <Field id="status" label="Statut">
              <Select id="status" name="status" defaultValue={r.status}>
                {Object.entries(gdprStatusLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field id="identityMethod" label="Méthode de vérification d'identité" optional hint="Exemple : réponse depuis l'adresse du compte.">
              <Input id="identityMethod" name="identityMethod" defaultValue={r.identity_method ?? ""} maxLength={200} />
            </Field>
            <div className="flex items-center gap-2">
              <input id="identityVerified" name="identityVerified" type="checkbox" defaultChecked={Boolean(r.identity_verified_at)} className="size-4 accent-primary" />
              <label htmlFor="identityVerified" className="text-sm text-ink">Identité vérifiée</label>
            </div>
            <Field id="resolutionNote" label="Trace du traitement" optional hint="Ce qui a été fait, sans recopier les données de la personne. Obligatoire pour clôturer.">
              <Textarea id="resolutionNote" name="resolutionNote" defaultValue={r.resolution_note ?? ""} rows={4} maxLength={2000} />
            </Field>
          </ActionForm>
        </Section>
      </div>
    </>
  );
}
