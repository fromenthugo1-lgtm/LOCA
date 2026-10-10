import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, PageHeader, Td } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { sectorOptions } from "@/config/business";
import { listCompanies } from "@/features/admin/companies/queries";
import { companyStatusLabels, formatDate } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Entreprises" };

export default function CompaniesPage() {
  return (
    <AdminSuspense>
      <CompaniesList />
    </AdminSuspense>
  );
}

async function CompaniesList() {
  const rows = await listCompanies();
  return (
    <>
      <PageHeader
        title="Entreprises"
        description="Chaque entreprise est un espace isolé. Ses membres n'accèdent qu'à ses données."
        actions={
          <ButtonLink href="/admin/entreprises/nouvelle">
            <Plus strokeWidth={1.75} aria-hidden="true" />
            Nouvelle entreprise
          </ButtonLink>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Aucune entreprise pour le moment.">Créez l&apos;entreprise d&apos;un client lors de sa mise en service.</EmptyState>
      ) : (
        <DataTable caption="Entreprises" head={["Nom", "Secteur", "Membres", "Statut", "Créée le"]}>
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/entreprises/${c.id}`} className="font-medium text-primary hover:text-primary-hover">{c.name}</Link>
              </Td>
              <Td>{sectorOptions.find((o) => o.value === c.sector)?.label ?? c.sector ?? "Non précisé"}</Td>
              <Td className="tabular-nums">{c.memberCount}</Td>
              <Td>{companyStatusLabels[c.status]}</Td>
              <Td className="whitespace-nowrap text-muted">{formatDate(c.created_at)}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
