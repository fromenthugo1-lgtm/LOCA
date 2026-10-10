import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, PageHeader, Section, Td } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { createGdprRequest } from "@/features/admin/gdpr/actions";
import { listGdprRequests } from "@/features/admin/gdpr/queries";
import { formatDate, gdprStatusLabels, gdprTypeLabels } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Demandes RGPD" };

export default function GdprPage() {
  return (
    <AdminSuspense>
      <GdprList />
    </AdminSuspense>
  );
}

async function GdprList() {
  const rows = await listGdprRequests();
  const now = new Date();
  return (
    <>
      <PageHeader title="Demandes RGPD" description="Droits des personnes : réponse sous un mois (prolongeable de deux mois si la demande est complexe, en le justifiant)." />
      <div className="flex flex-col gap-6">
        {rows.length === 0 ? (
          <EmptyState title="Aucune demande enregistrée." />
        ) : (
          <DataTable caption="Demandes RGPD" head={["Reçue le", "Type", "Demandeur", "Statut", "Échéance"]}>
            {rows.map((r) => {
              const open = r.status !== "completed" && r.status !== "rejected";
              const late = open && new Date(r.due_at) < now;
              return (
                <tr key={r.id} className="hover:bg-canvas">
                  <Td className="whitespace-nowrap text-muted">{formatDate(r.received_at)}</Td>
                  <Td>
                    <Link href={`/admin/rgpd/${r.id}`} className="font-medium text-primary hover:text-primary-hover">{gdprTypeLabels[r.request_type]}</Link>
                  </Td>
                  <Td>{r.requester_email}</Td>
                  <Td>{gdprStatusLabels[r.status]}</Td>
                  <Td className={late ? "font-medium text-danger" : ""}>{open ? `${formatDate(r.due_at)}${late ? " (dépassée)" : ""}` : "Clôturée"}</Td>
                </tr>
              );
            })}
          </DataTable>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Enregistrer une demande" description="Demande reçue par e-mail, courrier ou autre canal.">
            <ActionForm action={createGdprRequest} submitLabel="Enregistrer">
              <Field id="requestType" label="Type de demande">
                <Select id="requestType" name="requestType" defaultValue="access">
                  {Object.entries(gdprTypeLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field id="requesterEmail" label="E-mail du demandeur">
                <Input id="requesterEmail" name="requesterEmail" type="email" />
              </Field>
              <Field id="channel" label="Canal">
                <Select id="channel" name="channel" defaultValue="email">
                  <option value="email">E-mail</option>
                  <option value="post">Courrier</option>
                  <option value="account">Depuis le compte</option>
                  <option value="other">Autre</option>
                </Select>
              </Field>
            </ActionForm>
          </Section>
          <Section title="Exporter les données d'une personne" description="Fichier JSON : compte, entreprises, demandes de démo, demandes RGPD. L'export est journalisé.">
            <form action="/admin/rgpd/export" method="get" className="flex flex-col gap-4">
              <Field id="export-email" label="E-mail de la personne">
                <Input id="export-email" name="email" type="email" required />
              </Field>
              <div>
                <Button type="submit" variant="secondary">
                  <Download strokeWidth={1.75} aria-hidden="true" />
                  Télécharger l&apos;export
                </Button>
              </div>
            </form>
          </Section>
        </div>
      </div>
    </>
  );
}
