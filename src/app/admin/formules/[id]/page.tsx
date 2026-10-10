import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PlanFields } from "@/components/admin/plan-fields";
import { PageHeader, Section } from "@/components/admin/ui";
import { archivePlan, updatePlan } from "@/features/admin/plans/actions";
import { getPlan } from "@/features/admin/plans/queries";

export const metadata: Metadata = { title: "Formule" };

type Props = { params: Promise<{ id: string }> };

export default function PlanPage({ params }: Props) {
  return (
    <AdminSuspense>
      <PlanDetail params={params} />
    </AdminSuspense>
  );
}

async function PlanDetail({ params }: Props) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const plan = await getPlan(id);
  if (!plan || plan.archived_at) notFound();
  return (
    <>
      <PageHeader title={plan.name} description={plan.is_published ? "Publiée sur le site" : "Brouillon"} back={{ href: "/admin/formules", label: "Formules" }} />
      <div className="flex flex-col gap-6">
        <Section title="Formule">
          <ActionForm action={updatePlan} submitLabel="Enregistrer">
            <input type="hidden" name="id" value={plan.id} />
            <PlanFields plan={plan} />
          </ActionForm>
        </Section>
        <Section title="Archiver" description="La formule disparaît du site et de cette liste de travail. Elle reste en base pour l'historique (suppression logique).">
          <ActionForm action={archivePlan} submitLabel="Archiver la formule" variant="danger">
            <input type="hidden" name="id" value={plan.id} />
          </ActionForm>
        </Section>
      </div>
    </>
  );
}
