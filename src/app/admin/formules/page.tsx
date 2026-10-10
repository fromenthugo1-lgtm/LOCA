import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, PageHeader, Td } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { listAllPlans } from "@/features/admin/plans/queries";
import { formatCents } from "@/features/plans/schema";

export const metadata: Metadata = { title: "Formules" };

export default function PlansPage() {
  return (
    <AdminSuspense>
      <PlansList />
    </AdminSuspense>
  );
}

async function PlansList() {
  const rows = await listAllPlans();
  return (
    <>
      <PageHeader
        title="Formules"
        description="Formules affichées sur la page Tarifs. Aucune transaction n'est possible : la souscription se fait après la démonstration."
        actions={
          <ButtonLink href="/admin/formules/nouvelle">
            <Plus strokeWidth={1.75} aria-hidden="true" />
            Nouvelle formule
          </ButtonLink>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Aucune formule.">Tant qu&apos;aucune formule n&apos;est publiée, le site affiche « Tarification sur devis ».</EmptyState>
      ) : (
        <DataTable caption="Formules" head={["Nom", "Abonnement HT", "Mise en service HT", "État", "Ordre"]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-canvas">
              <Td>
                {p.archived_at ? (
                  <span className="text-muted">{p.name}</span>
                ) : (
                  <Link href={`/admin/formules/${p.id}`} className="font-medium text-primary hover:text-primary-hover">{p.name}</Link>
                )}
              </Td>
              <Td className="tabular-nums">{formatCents(p.monthly_price_cents) ?? "Sur devis"}</Td>
              <Td className="tabular-nums">{formatCents(p.setup_fee_cents) ?? "Sur devis"}</Td>
              <Td>{p.archived_at ? "Archivée" : p.is_published ? "Publiée" : "Brouillon"}</Td>
              <Td className="tabular-nums">{p.display_order}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
