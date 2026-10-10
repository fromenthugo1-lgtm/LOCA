import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Vérifiez votre boîte e-mail", robots: { index: false } };

/** État « Inscription à confirmer » (docs/SPEC.md §8.3). */
export default function CheckEmailPage() {
  return (
    <Card className="flex flex-col items-start gap-4 p-6 sm:p-8">
      <MailCheck className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Vérifiez votre boîte e-mail</h1>
      <p className="text-[15px] leading-relaxed text-muted">
        Si cette adresse peut être utilisée, un e-mail de confirmation vient de lui être envoyé. Ouvrez le lien qu&apos;il
        contient pour activer votre compte. Le lien expire au bout d&apos;une heure.
      </p>
      <p className="text-[15px] leading-relaxed text-muted">
        Rien reçu après quelques minutes ? Vérifiez vos courriers indésirables, puis réessayez l&apos;inscription.
      </p>
      <Link href={routes.signIn} className="text-sm font-medium text-primary hover:text-primary-hover">
        Aller à la connexion
      </Link>
    </Card>
  );
}
