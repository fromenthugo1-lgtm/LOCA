import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PlanFields } from "@/components/admin/plan-fields";
import { PageHeader, Section } from "@/components/admin/ui";
import { createPlan } from "@/features/admin/plans/actions";
import { requireSuperAdmin } from "@/features/auth/guards";

export const metadata: Metadata = { title: "Nouvelle formule" };

export default function NewPlanPage() {
  return (
    <AdminSuspense>
      <NewPlan />
    </AdminSuspense>
  );
}

async function NewPlan() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader title="Nouvelle formule" back={{ href: "/admin/formules", label: "Formules" }} />
      <Section title="Formule">
        <ActionForm action={createPlan} submitLabel="Créer la formule">
          <PlanFields />
        </ActionForm>
      </Section>
    </>
  );
}
