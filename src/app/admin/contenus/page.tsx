import type { Metadata } from "next";
import Link from "next/link";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { DataTable, PageHeader, Td } from "@/components/admin/ui";
import { listContentRows } from "@/features/admin/content/queries";
import { formatDateTime } from "@/features/admin/labels";
import { sectionLabels } from "@/features/site-content/labels";
import { siteContentKeys } from "@/features/site-content/schemas";

export const metadata: Metadata = { title: "Contenus" };

export default function ContentsPage() {
  return (
    <AdminSuspense>
      <ContentsList />
    </AdminSuspense>
  );
}

async function ContentsList() {
  const rows = await listContentRows();
  return (
    <>
      <PageHeader
        title="Contenus du site"
        description="Textes des pages publiques, section par section. Sans version publiée, le site affiche le texte par défaut."
      />
      <DataTable caption="Sections de texte" head={["Section", "Emplacement", "Texte affiché", "Brouillon"]}>
        {siteContentKeys.map((key) => {
          const row = rows.get(key);
          return (
            <tr key={key} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/contenus/${key}`} className="font-medium text-primary hover:text-primary-hover">{sectionLabels[key].title}</Link>
              </Td>
              <Td className="text-muted">{sectionLabels[key].where}</Td>
              <Td>{row?.publishedAt ? `Personnalisé, publié le ${formatDateTime(row.publishedAt)}` : "Texte par défaut"}</Td>
              <Td>{row?.hasDraft ? "Oui" : "Non"}</Td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
