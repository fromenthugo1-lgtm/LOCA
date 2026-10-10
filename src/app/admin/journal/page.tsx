import type { Metadata } from "next";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, FilterTabs, PageHeader, Td } from "@/components/admin/ui";
import { listAuditLogs } from "@/features/admin/gdpr/queries";
import { formatDateTime } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Journal d'audit" };

const tables = [
  { value: "profiles", label: "Comptes" },
  { value: "companies", label: "Entreprises" },
  { value: "company_members", label: "Membres" },
  { value: "demo_requests", label: "Démos" },
  { value: "plans", label: "Formules" },
  { value: "site_content", label: "Contenus" },
  { value: "legal_pages", label: "Juridique" },
  { value: "gdpr_requests", label: "RGPD" },
];

type Props = { searchParams: Promise<{ objet?: string }> };

export default function AuditPage({ searchParams }: Props) {
  return (
    <AdminSuspense>
      <AuditList searchParams={searchParams} />
    </AdminSuspense>
  );
}

async function AuditList({ searchParams }: Props) {
  const { objet } = await searchParams;
  const table = tables.find((t) => t.value === objet)?.value ?? null;
  const rows = await listAuditLogs(table);
  return (
    <>
      <PageHeader title="Journal d'audit" description="Qui a fait quoi, quand, sur quel objet. 300 dernières entrées. Le journal ne peut être ni modifié ni effacé depuis l'application." />
      <FilterTabs
        items={[
          { label: "Tout", href: "/admin/journal", active: table === null },
          ...tables.map((t) => ({ label: t.label, href: `/admin/journal?objet=${t.value}`, active: table === t.value })),
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="Aucune entrée." />
      ) : (
        <DataTable caption="Journal d'audit" head={["Date", "Action", "Objet", "Identifiant", "Auteur", "Détails"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</Td>
              <Td className="font-mono text-[12px]">{r.action}</Td>
              <Td>{r.target_table ?? ""}</Td>
              <Td className="font-mono text-[12px]">{r.target_id ?? ""}</Td>
              <Td className="font-mono text-[12px]">{r.actor_id ? r.actor_id.slice(0, 8) : "système"}</Td>
              <Td className="font-mono text-[12px] text-muted">{Object.keys(r.details as object).length ? JSON.stringify(r.details) : ""}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
