import Link from "next/link";
import { mainNav } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href={routes.home} aria-label="SpendEdge, retour à l'accueil" className="rounded-brand">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-brand px-3 py-2 text-sm text-ink/75 transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href={routes.signIn} variant="ghost" size="sm">
            Se connecter
          </ButtonLink>
          <ButtonLink href={routes.demo} size="sm">
            Demander une démonstration
          </ButtonLink>
        </div>

        <MobileNav />
      </Container>
    </header>
  );
}
