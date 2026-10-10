import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSuperAdmin } from "@/features/auth/guards";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration SpendEdge" },
  robots: { index: false, follow: false },
};

/**
 * L'interface d'administration n'est rendue qu'après vérification du rôle super_admin.
 * Chaque page et chaque action revérifient le rôle elles-mêmes (les layouts et les pages
 * se rendent en parallèle : ce contrôle-ci ne protège que l'habillage).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96" label="Vérification de l'accès…" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader area="admin" />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <details className="group rounded-brand border border-line bg-surface lg:hidden">
            <summary className="flex h-11 cursor-pointer list-none items-center px-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              Menu de l&apos;administration
            </summary>
            <div className="border-t border-line p-3">
              <AdminSidebar />
            </div>
          </details>
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
        </aside>
        <main id="contenu" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
