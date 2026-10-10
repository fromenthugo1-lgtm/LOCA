import Link from "next/link";
import { Suspense } from "react";
import { Building2, CalendarClock, CircleCheck, Lock, Settings2, Trash2 } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/forms/submit-button";
import { acceptCurrentTerms, requestAccountDeletion } from "@/features/auth/actions";
import { resolveAccountView } from "@/features/auth/account-view";
import { requireUser } from "@/features/auth/guards";
import { getAccountContext } from "@/features/auth/session";
import { getCurrentTermsVersion } from "@/features/legal/queries";
import { isSupabaseConfigured } from "@/lib/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isSupabaseConfigured()) {
    return (
      <Notice tone="warning" title="Espace client à configurer">
        <p>Supabase n&apos;est pas encore relié à ce site. Voir le README, étape « Créer le projet Supabase ».</p>
      </Notice>
    );
  }
  return (
    <Suspense fallback={<Skeleton className="h-64" label="Chargement de votre espace…" />}>
      <AccountHome searchParams={searchParams} />
    </Suspense>
  );
}

const roleLabels = { member: "Utilisateur", company_admin: "Administrateur de l'entreprise" } as const;

async function AccountHome({ searchParams }: { searchParams: SearchParams }) {
  await requireUser(routes.account);
  const [ctx, currentTerms, params] = await Promise.all([getAccountContext(), getCurrentTermsVersion(), searchParams]);
  if (!ctx) {
    return <Notice tone="error" title="Espace indisponible">Votre profil n&apos;a pas pu être chargé. Réessayez dans quelques minutes.</Notice>;
  }

  const view = resolveAccountView({
    status: ctx.profile.status,
    acceptedTermsVersion: ctx.profile.termsVersion,
    currentTermsVersion: currentTerms,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Mon espace</h1>
        <p className="mt-1 text-[15px] text-muted">{ctx.user.email}</p>
      </div>

      {params.motdepasse === "modifie" ? <Notice tone="success">Votre mot de passe a été modifié.</Notice> : null}
      {params.erreur ? <Notice tone="error">L&apos;opération n&apos;a pas pu aboutir. Réessayez dans quelques minutes.</Notice> : null}
      {ctx.profile.deletionRequestedAt ? (
        <Notice tone="info" title="Suppression du compte demandée">
          Votre demande est enregistrée et sera traitée sous un mois. Votre compte sera d&apos;abord désactivé, puis vos
          données supprimées ou anonymisées après un délai de trente jours.
        </Notice>
      ) : null}

      {view === "terms_required" ? <TermsCard version={currentTerms} /> : null}
      {view === "created" ? (
        <StateCard icon={CalendarClock} title="Votre compte est créé, réservez une démonstration">
          <p>
            L&apos;accès au service s&apos;ouvre après une démonstration et la mise en service de votre environnement (vos
            fournisseurs et vos produits, configurés avec vous).
          </p>
          <ButtonLink href={routes.demo} className="mt-2 self-start">Demander une démonstration</ButtonLink>
        </StateCard>
      ) : null}
      {view === "onboarding_pending" ? (
        <StateCard icon={Settings2} title="Votre environnement est en cours de configuration">
          <p>Nous préparons vos fournisseurs, vos produits et vos règles d&apos;envoi. Vous serez prévenu dès que votre espace sera prêt.</p>
        </StateCard>
      ) : null}
      {view === "suspended" ? (
        <StateCard icon={Lock} title="Accès suspendu, contactez-nous">
          <p>L&apos;accès à votre espace est suspendu. Pour en connaître la raison ou le rétablir, contactez-nous.</p>
          <ButtonLink href={routes.contact} variant="secondary" className="mt-2 self-start">Nous contacter</ButtonLink>
        </StateCard>
      ) : null}
      {view === "active" ? <ActiveSpace companies={ctx.companies} /> : null}

      {!ctx.profile.deletionRequestedAt ? <DeletionCard /> : null}
    </div>
  );
}

function StateCard({ icon: Icon, title, children }: { icon: typeof Lock; title: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-3 p-6 sm:p-8">
      <Icon className="size-6 text-night" strokeWidth={1.75} aria-hidden="true" />
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="flex max-w-2xl flex-col gap-2 text-[15px] leading-relaxed text-muted">{children}</div>
    </Card>
  );
}

function TermsCard({ version }: { version: string }) {
  return (
    <StateCard icon={CircleCheck} title="Conditions d'utilisation à accepter">
      <p>
        Pour continuer, merci d&apos;accepter la version en vigueur des{" "}
        <Link href={routes.terms} target="_blank" className="text-primary underline underline-offset-2">
          conditions générales d&apos;utilisation
        </Link>{" "}
        (version {version}).
      </p>
      <form action={acceptCurrentTerms} className="mt-2">
        <SubmitButton pendingLabel="Enregistrement…">J&apos;accepte les conditions d&apos;utilisation</SubmitButton>
      </form>
    </StateCard>
  );
}

function ActiveSpace({ companies }: { companies: { id: string; name: string; role: keyof typeof roleLabels }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Votre entreprise</h2>
        {companies.length === 0 ? (
          <p className="mt-2 text-[15px] text-muted">Votre compte n&apos;est rattaché à aucune entreprise pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {companies.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <Building2 className="size-5 text-night" strokeWidth={1.75} aria-hidden="true" />
                <span className="text-[15px] font-medium text-ink">{c.name}</span>
                <span className="text-[13px] text-muted">{roleLabels[c.role]}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Notice tone="info" title="Modules en développement">
        Demandes d&apos;achat, fournisseurs, suivi et comparaison arrivent dans les prochaines versions. Ils apparaîtront ici dès
        qu&apos;ils seront opérationnels.
      </Notice>
    </div>
  );
}

function DeletionCard() {
  return (
    <details className="group rounded-brand border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm text-muted [&::-webkit-details-marker]:hidden">
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Supprimer mon compte
      </summary>
      <div className="flex flex-col gap-3 border-t border-line p-4 text-sm leading-relaxed text-muted">
        <p>
          Votre demande ouvre une procédure de suppression : le compte est d&apos;abord désactivé, puis vos données sont supprimées
          ou anonymisées après trente jours, sauf obligation légale de conservation. Rien n&apos;est supprimé immédiatement.
        </p>
        <form action={requestAccountDeletion}>
          <SubmitButton variant="danger" pendingLabel="Envoi…">Demander la suppression de mon compte</SubmitButton>
        </form>
      </div>
    </details>
  );
}
