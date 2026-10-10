import Link from "next/link";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="contenu" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href={routes.home} aria-label="SpendEdge, retour à l'accueil" className="rounded-brand">
        <Logo />
      </Link>
      <div>
        <p className="text-[13px] font-medium text-primary">Erreur 404</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink">Cette page n&apos;existe pas.</h1>
        <p className="mt-2 text-[15px] text-muted">L&apos;adresse est peut-être incomplète, ou la page a été déplacée.</p>
      </div>
      <ButtonLink href={routes.home} variant="secondary">
        Revenir à l&apos;accueil
      </ButtonLink>
    </main>
  );
}
