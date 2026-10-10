import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { routes, safeInternalPath } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/forms/submit-button";
import { confirmEmailLink } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Confirmation", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const copy: Record<string, { title: string; text: string; button: string }> = {
  recovery: {
    title: "Réinitialiser votre mot de passe",
    text: "Cliquez sur le bouton pour choisir un nouveau mot de passe.",
    button: "Choisir un nouveau mot de passe",
  },
  email_change: {
    title: "Confirmer votre nouvelle adresse",
    text: "Cliquez sur le bouton pour valider le changement d'adresse e-mail.",
    button: "Confirmer la nouvelle adresse",
  },
};
const defaultCopy = {
  title: "Confirmer votre adresse e-mail",
  text: "Cliquez sur le bouton pour activer votre compte SpendEdge.",
  button: "Confirmer mon adresse",
};

export default function ConfirmPage({ searchParams }: Props) {
  return (
    <main id="contenu" className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href={routes.home} aria-label="SpendEdge, retour à l'accueil" className="rounded-brand">
        <Logo />
      </Link>
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <ConfirmForm searchParams={searchParams} />
        </Suspense>
      </Card>
    </main>
  );
}

async function ConfirmForm({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type ?? "";
  const c = copy[type] ?? defaultCopy;
  if (!params.token_hash || !type) {
    return (
      <p className="text-[15px] text-muted">
        Ce lien est incomplet. <Link href={routes.signIn} className="text-primary underline">Retour à la connexion</Link>
      </p>
    );
  }
  return (
    <form action={confirmEmailLink} className="flex flex-col gap-4">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{c.title}</h1>
      <p className="text-[15px] leading-relaxed text-muted">{c.text}</p>
      <input type="hidden" name="token_hash" value={params.token_hash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={safeInternalPath(params.next, routes.account)} />
      <SubmitButton className="w-full" pendingLabel="Vérification…">{c.button}</SubmitButton>
    </form>
  );
}
