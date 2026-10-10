import Link from "next/link";
import { AdminSuspense } from "@/components/admin/page-suspense";
import { PageHeader } from "@/components/admin/ui";
import { getAdminOverview } from "@/features/admin/overview";

export default function AdminHomePage() {
  return (
    <AdminSuspense>
      <Overview />
    </AdminSuspense>
  );
}

async function Overview() {
  const o = await getAdminOverview();
  const cards = [
    { label: "Demandes de démo nouvelles", value: o.newDemos, href: "/admin/demandes?statut=new" },
    { label: "Mises en service en attente", value: o.pendingOnboarding, href: "/admin/comptes?statut=onboarding_pending" },
    { label: "Demandes RGPD ouvertes", value: o.openGdpr, href: "/admin/rgpd", alert: o.lateGdpr > 0 ? `${o.lateGdpr} en retard` : null },
    { label: "Suppressions de compte à traiter", value: o.pendingDeletions, href: "/admin/comptes" },
  ];
  return (
    <>
      <PageHeader title="Vue d'ensemble" description="Ce qui attend une action de votre part. Chiffres lus en direct dans la base." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="flex h-full flex-col gap-2 rounded-brand border border-line bg-surface p-5 transition-colors hover:border-[#CBD5E1]">
              <span className="text-sm text-muted">{c.label}</span>
              <span className="text-[28px] font-semibold tabular-nums text-ink">{c.value}</span>
              {c.alert ? <span className="text-[13px] font-medium text-danger">{c.alert}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
