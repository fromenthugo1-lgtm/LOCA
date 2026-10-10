import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, EmptyState, FilterTabs, PageHeader, Td } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { accountStatuses, listAccounts } from "@/features/admin/accounts/queries";
import { accountStatusLabels, formatDate } from "@/features/admin/labels";

export const metadata: Metadata = { title: "Comptes" };

type Props = { searchParams: Promise<{ statut?: string; q?: string }> };

export default function AccountsPage({ searchParams }: Props) {
  return (
    <AdminSuspense>
      <AccountsList searchParams={searchParams} />
    </AdminSuspense>
  );
}

async function AccountsList({ searchParams }: Props) {
  const { statut, q } = await searchParams;
  const status = accountStatuses.find((s) => s === statut) ?? null;
  const search = q?.trim().slice(0, 100) || null;
  const rows = await listAccounts(search, status);
  const qs = (s: string | null) => {
    const p = new URLSearchParams();
    if (s) p.set("statut", s);
    if (search) p.set("q", search);
    const str = p.toString();
    return `/admin/comptes${str ? `?${str}` : ""}`;
  };
  return (
    <>
      <PageHeader title="Comptes" description="Comptes inscrits. L'accès au produit dépend uniquement du statut enregistré ici." />
      <form className="mb-4 flex max-w-md gap-2" role="search">
        {status ? <input type="hidden" name="statut" value={status} /> : null}
        <label htmlFor="q" className="sr-only">Rechercher par e-mail ou par nom</label>
        <Input id="q" name="q" defaultValue={search ?? ""} placeholder="E-mail ou nom" />
        <Button type="submit" variant="secondary" aria-label="Rechercher">
          <Search strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </form>
      <FilterTabs
        items={[
          { label: "Tous", href: qs(null), active: status === null },
          ...accountStatuses.map((s) => ({ label: accountStatusLabels[s], href: qs(s), active: status === s })),
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="Aucun compte pour ce filtre." />
      ) : (
        <DataTable caption="Comptes" head={["E-mail", "Nom", "Statut", "Adresse confirmée", "Entreprises", "Inscrit le"]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/comptes/${r.id}`} className="font-medium text-primary hover:text-primary-hover">{r.email}</Link>
                {r.deletion_scheduled_for ? <span className="ml-2 text-[12px] text-danger">Suppression programmée</span> : null}
              </Td>
              <Td>{r.full_name ?? "Non renseigné"}</Td>
              <Td>{accountStatusLabels[r.account_status]}</Td>
              <Td>{r.email_confirmed_at ? "Oui" : "Non"}</Td>
              <Td className="tabular-nums">{r.company_count}</Td>
              <Td className="whitespace-nowrap text-muted">{formatDate(r.created_at)}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
