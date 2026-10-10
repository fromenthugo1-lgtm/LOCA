import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DefinitionList, PageHeader, Section } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { anonymizeAccount, cancelDeletion, scheduleDeletion, setAccountStatus } from "@/features/admin/accounts/actions";
import { accountStatuses, getAccount } from "@/features/admin/accounts/queries";
import { accountStatusLabels, companyRoleLabels, formatDateTime } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Compte" };

type Props = { params: Promise<{ id: string }> };

export default function AccountPage({ params }: Props) {
  return (
    <AdminSuspense>
      <AccountDetail params={params} />
    </AdminSuspense>
  );
}

async function AccountDetail({ params }: Props) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const result = await getAccount(id);
  if (!result) notFound();
  const { account: a, memberships, isSelf } = result;
  const graceOver = a.deletion_scheduled_for ? new Date(a.deletion_scheduled_for) <= new Date() : false;

  return (
    <>
      <PageHeader title={a.email} description={accountStatusLabels[a.account_status]} back={{ href: "/admin/comptes", label: "Comptes" }} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Compte">
          <DefinitionList
            items={[
              { label: "Nom", value: a.full_name },
              { label: "Statut", value: accountStatusLabels[a.account_status] },
              { label: "Inscrit le", value: formatDateTime(a.created_at) },
              { label: "Adresse confirmée le", value: formatDateTime(a.email_confirmed_at) },
              { label: "Dernière connexion", value: formatDateTime(a.last_sign_in_at) },
              { label: "CGU acceptées", value: a.terms_version ? `${a.terms_version}, le ${formatDateTime(a.terms_accepted_at)}` : "Non" },
              { label: "Suppression demandée", value: a.deletion_requested_at ? formatDateTime(a.deletion_requested_at) : "Non" },
              { label: "Anonymisation possible le", value: a.deletion_scheduled_for ? formatDateTime(a.deletion_scheduled_for) : "Non programmée" },
              { label: "Anonymisé le", value: a.anonymized_at ? formatDateTime(a.anonymized_at) : "Non" },
            ]}
          />
        </Section>

        <Section title="Statut d'accès" description="Activer, mettre en attente de mise en service, suspendre ou réactiver.">
          {isSelf ? (
            <Notice tone="info">Vous ne pouvez pas modifier votre propre statut.</Notice>
          ) : a.anonymized_at ? (
            <Notice tone="info">Compte anonymisé : plus aucune action possible.</Notice>
          ) : (
            <ActionForm action={setAccountStatus} submitLabel="Appliquer le statut">
              <input type="hidden" name="userId" value={a.id} />
              <Field id="status" label="Nouveau statut">
                <Select id="status" name="status" defaultValue={a.account_status}>
                  {accountStatuses.map((s) => (
                    <option key={s} value={s}>{accountStatusLabels[s]}</option>
                  ))}
                </Select>
              </Field>
              <Field id="reason" label="Motif (journalisé)" optional>
                <Input id="reason" name="reason" maxLength={300} />
              </Field>
            </ActionForm>
          )}
        </Section>

        <Section title="Entreprises" description="Le rattachement se gère depuis la fiche de l'entreprise.">
          {memberships.length === 0 ? (
            <p className="text-sm text-muted">Aucune entreprise.</p>
          ) : (
            <ul className="divide-y divide-line">
              {memberships.map((m) => (
                <li key={m.companyId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/entreprises/${m.companyId}`} className="font-medium text-primary hover:text-primary-hover">{m.name}</Link>
                  <span className="text-muted">{companyRoleLabels[m.role]}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {!isSelf && !a.anonymized_at ? (
          <Section title="Suppression du compte" description="Procédure en deux temps : suspension et délai de grâce, puis anonymisation. Rien n'est effacé immédiatement.">
            {!a.deletion_scheduled_for ? (
              <ActionForm action={scheduleDeletion} submitLabel="Suspendre et programmer l'anonymisation" variant="danger">
                <input type="hidden" name="userId" value={a.id} />
              </ActionForm>
            ) : (
              <div className="flex flex-col gap-4">
                <ActionForm action={cancelDeletion} submitLabel="Annuler la suppression" variant="secondary">
                  <input type="hidden" name="userId" value={a.id} />
                </ActionForm>
                {graceOver ? (
                  <ActionForm action={anonymizeAccount} submitLabel="Anonymiser définitivement" variant="danger">
                    <input type="hidden" name="userId" value={a.id} />
                    <Field id="confirm" label="Pour confirmer, tapez ANONYMISER">
                      <Input id="confirm" name="confirm" autoComplete="off" />
                    </Field>
                  </ActionForm>
                ) : (
                  <Notice tone="info">L&apos;anonymisation sera possible à partir du {formatDateTime(a.deletion_scheduled_for)}.</Notice>
                )}
              </div>
            )}
          </Section>
        ) : null}
      </div>
    </>
  );
}
