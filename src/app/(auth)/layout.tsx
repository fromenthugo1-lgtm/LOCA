import Link from "next/link";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-4 sm:px-6">
          <Link href={routes.home} aria-label="SpendEdge, retour à l'accueil" className="rounded-brand">
            <Logo />
          </Link>
        </div>
      </header>
      <main id="contenu" className="flex flex-1 items-start justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t border-line py-6 text-center text-[13px] text-muted">
        <Link href={routes.privacy} className="hover:text-ink">Confidentialité</Link>
        <span className="mx-2" aria-hidden="true">·</span>
        <Link href={routes.terms} className="hover:text-ink">Conditions d&apos;utilisation</Link>
        <span className="mx-2" aria-hidden="true">·</span>
        <Link href={routes.contact} className="hover:text-ink">Contact</Link>
      </footer>
    </div>
  );
}
