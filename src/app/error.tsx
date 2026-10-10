"use client";

import { Button } from "@/components/ui/button";

/** Erreur inattendue : message neutre, aucun détail technique affiché au visiteur. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenu" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-[24px] font-semibold text-ink">Une erreur est survenue.</h1>
      <p className="text-[15px] text-muted">Merci de réessayer. Si le problème persiste, contactez-nous.</p>
      <Button variant="secondary" onClick={reset}>
        Réessayer
      </Button>
    </main>
  );
}
