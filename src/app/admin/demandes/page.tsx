import type { Metadata } from "next";
import Link from "next/link";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, FilterTabs, PageHeader, Td } from "@/components/admin/ui";
import { sectorOptions } from "@/config/business";
import { demoStatuses, listDemoRequests } from "@/features/admin/demo-requests/queries";
import { demoStatusLabels, formatDateTime } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Demandes de démo" };

type Props = { searchParams: Promise<{ statut?: string }> };

export default function DemoRequestsPage({ searchParams }: Props) {
  return (
    <AdminSuspense>
      <DemoRequestsList searchParams={searchParams} />
    </AdminSuspense>
  );
}

const sectorLabel = (v: string) => sectorOptions.find((o) => o.value === v)?.label ?? v;

async function DemoRequestsList({ searchParams }: Props) {
  const { statut } = await searchParams;
  const status = demoStatuses.find((s) => s === statut) ?? null;
  const rows = await listDemoRequests(status);
  return (
    <>
      <PageHeader title="Demandes de démo" description="Demandes reçues par le formulaire du site, de la plus récente à la plus ancienne." />
      <FilterTabs
        items={[
          { label: "Toutes", href: "/admin/demandes", active: status === null },
          ...demoStatuses.map((s) => ({ label: demoStatusLabels[s], href: `/admin/demandes?statut=${s}`, active: status === s })),
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="Aucune demande pour ce filtre." />
      ) : (
        <DataTable caption="Demandes de démonstration" head={["Reçue le", "Contact", "Entreprise", "Secteur", "Statut"]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-canvas">
              <Td className="whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</Td>
              <Td>
                <Link href={`/admin/demandes/${r.id}`} className="font-medium text-primary hover:text-primary-hover">
                  {r.full_name}
                </Link>
              </Td>
              <Td>{r.company_name}</Td>
              <Td>{sectorLabel(r.sector)}</Td>
              <Td>{demoStatusLabels[r.status]}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
