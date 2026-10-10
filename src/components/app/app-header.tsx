import Link from "next/link";
import { Suspense } from "react";
import { LogOut, Shield } from "lucide-react";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/features/auth/actions";
import { getAccountContext } from "@/features/auth/session";

/** En-tête des espaces connectés (client et administration). */
export function AppHeader({ area }: { area: "client" | "admin" }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={area === "admin" ? routes.admin : routes.account} className="rounded-brand" aria-label="Accueil de l'espace">
            <Logo />
          </Link>
          {area === "admin" ? (
            <span className="rounded-brand border border-line px-2 py-0.5 text-[12px] font-medium text-muted">Administration</span>
          ) : null}
        </div>
        <Suspense fallback={null}>
          <UserMenu area={area} />
        </Suspense>
      </div>
    </header>
  );
}

async function UserMenu({ area }: { area: "client" | "admin" }) {
  const ctx = await getAccountContext();
  if (!ctx) return null;
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="hidden max-w-56 truncate text-sm text-muted sm:block">{ctx.user.email}</span>
      {ctx.isSuperAdmin ? (
        <Link
          href={area === "admin" ? routes.account : routes.admin}
          className="inline-flex h-9 items-center gap-1.5 rounded-brand px-3 text-sm text-ink hover:bg-ink/5"
        >
          <Shield className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {area === "admin" ? "Espace client" : "Administration"}
        </Link>
      ) : null}
      <form action={signOut}>
        <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-brand px-3 text-sm text-ink hover:bg-ink/5">
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
