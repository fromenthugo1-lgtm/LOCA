import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ActionForm } from "@/components/admin/action-form";
import { CompanyFields } from "@/components/admin/company-fields";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader, Section } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { addMember, changeMemberRole, removeMember, updateCompany } from "@/features/admin/companies/actions";
import { getCompany } from "@/features/admin/companies/queries";
import { accountStatusLabels, companyRoleLabels, companyStatusLabels } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Entreprise" };

type Props = { params: Promise<{ id: string }> };

export default function CompanyPage({ params }: Props) {
  return (
    <AdminSuspense>
      <CompanyDetail params={params} />
    </AdminSuspense>
  );
}

const roles = ["member", "company_admin"] as const;

async function CompanyDetail({ params }: Props) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const result = await getCompany(id);
  if (!result) notFound();
  const { company: c, members } = result;

  return (
    <>
      <PageHeader title={c.name} description={companyStatusLabels[c.status]} back={{ href: "/admin/entreprises", label: "Entreprises" }} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Informations">
          <ActionForm action={updateCompany} submitLabel="Enregistrer">
            <input type="hidden" name="id" value={c.id} />
            <CompanyFields values={c} />
            <Field id="status" label="Statut de l'entreprise">
              <Select id="status" name="status" defaultValue={c.status}>
                {(["active", "suspended", "archived"] as const).map((s) => (
                  <option key={s} value={s}>{companyStatusLabels[s]}</option>
                ))}
              </Select>
            </Field>
          </ActionForm>
        </Section>

        <div className="flex flex-col gap-6">
          <Section title="Membres" description="Un membre n'accède aux données que si son compte et l'entreprise sont actifs.">
            {members.length === 0 ? (
              <p className="text-sm text-muted">Aucun membre.</p>
            ) : (
              <ul className="divide-y divide-line">
                {members.map((m) => (
                  <li key={m.user_id} className="flex flex-col gap-3 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/admin/comptes/${m.user_id}`} className="text-sm font-medium text-primary hover:text-primary-hover">{m.email}</Link>
                      <span className="text-[13px] text-muted">{accountStatusLabels[m.account_status]}</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <ActionForm action={changeMemberRole} submitLabel="Changer le rôle" variant="secondary" className="flex flex-wrap items-end gap-3">
                        <input type="hidden" name="companyId" value={c.id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                        <label htmlFor={`role-${m.user_id}`} className="sr-only">Rôle de {m.email}</label>
                        <Select id={`role-${m.user_id}`} name="role" defaultValue={m.role} className="w-64">
                          {roles.map((r) => (
                            <option key={r} value={r}>{companyRoleLabels[r]}</option>
                          ))}
                        </Select>
                      </ActionForm>
                      <ActionForm action={removeMember} submitLabel="Retirer" variant="secondary" className="flex items-end">
                        <input type="hidden" name="companyId" value={c.id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                      </ActionForm>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Rattacher un compte" description="Le compte doit déjà exister (la personne s'inscrit elle-même).">
            <ActionForm action={addMember} submitLabel="Rattacher">
              <input type="hidden" name="companyId" value={c.id} />
              <Field id="email" label="E-mail du compte">
                <Input id="email" name="email" type="email" required />
              </Field>
              <Field id="role" label="Rôle">
                <Select id="role" name="role" defaultValue="member">
                  {roles.map((r) => (
                    <option key={r} value={r}>{companyRoleLabels[r]}</option>
                  ))}
                </Select>
              </Field>
            </ActionForm>
          </Section>
        </div>
      </div>
    </>
  );
}
