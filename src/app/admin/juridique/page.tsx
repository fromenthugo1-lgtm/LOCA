import type { Metadata } from "next";
import Link from "next/link";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, PageHeader, Td } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/features/auth/guards";
import { formatDateTime } from "@/features/admin/labels";
import { legalDefaults, type LegalSlug } from "@/features/legal/defaults";
import { getLegalPage } from "@/features/legal/queries";

export const metadata: Metadata = { title: "Pages juridiques" };

const slugs = Object.keys(legalDefaults) as LegalSlug[];

export default function LegalAdminPage() {
  return (
    <AdminSuspense>
      <LegalList />
    </AdminSuspense>
  );
}

async function LegalList() {
  await requireSuperAdmin();
  const pages = await Promise.all(slugs.map((s) => getLegalPage(s)));
  return (
    <>
      <PageHeader title="Pages juridiques" description="À compléter et à faire relire par un professionnel du droit avant la mise en production." />
      <DataTable caption="Pages juridiques" head={["Page", "Version", "Publiée le", "Champs à compléter"]}>
        {pages.map((p) => (
          <tr key={p.slug} className="hover:bg-canvas">
            <Td>
              <Link href={`/admin/juridique/${p.slug}`} className="font-medium text-primary hover:text-primary-hover">{p.title}</Link>
            </Td>
            <Td>{p.version}</Td>
            <Td>{p.publishedAt ? formatDateTime(p.publishedAt) : "Trame par défaut"}</Td>
            <Td className="tabular-nums">{(p.body.match(/\[À COMPLÉTER/g) ?? []).length}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
