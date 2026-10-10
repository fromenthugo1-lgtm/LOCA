import Link from "next/link";
import { footerNav } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { ManageCookiesButton } from "@/components/consent/manage-cookies-button";
import { getSiteContent } from "@/features/site-content/queries";
import { Container } from "./container";

export async function SiteFooter() {
  const footer = await getSiteContent("site.footer");
  return (
    <footer className="bg-night text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <Link href={routes.home} aria-label="SpendEdge, retour à l'accueil" className="w-fit rounded-brand">
            <Logo tone="light" />
          </Link>
          <p className="text-sm leading-relaxed text-night-muted">{footer.tagline}</p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="text-[13px] font-medium text-white">{group.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-night-muted transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              {group.title === "Informations légales" ? (
                <li>
                  <ManageCookiesButton className="text-left text-sm text-night-muted transition-colors hover:text-white" />
                </li>
              ) : null}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-night-line">
        <Container className="flex flex-col gap-2 py-6 text-[13px] text-night-muted sm:flex-row sm:justify-between">
          <p>© SpendEdge</p>
          <Link href={routes.privacy} className="transition-colors hover:text-white">
            Vos données personnelles
          </Link>
        </Container>
      </div>
    </footer>
  );
}
