import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { CompanyFields } from "@/components/admin/company-fields";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader, Section } from "@/components/admin/ui";
import { createCompany } from "@/features/admin/companies/actions";
import { requireSuperAdmin } from "@/features/auth/guards";

export const metadata: Metadata = { title: "Nouvelle entreprise" };

export default function NewCompanyPage() {
  return (
    <AdminSuspense>
      <NewCompany />
    </AdminSuspense>
  );
}

async function NewCompany() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader title="Nouvelle entreprise" back={{ href: "/admin/entreprises", label: "Entreprises" }} />
      <Section title="Informations">
        <ActionForm action={createCompany} submitLabel="Créer l'entreprise">
          <CompanyFields />
        </ActionForm>
      </Section>
    </>
  );
}
