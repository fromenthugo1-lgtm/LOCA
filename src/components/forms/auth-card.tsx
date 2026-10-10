import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { isSupabaseConfigured } from "@/lib/env";

/** Cadre commun des pages d'authentification, avec avertissement si Supabase n'est pas configuré. */
export function AuthCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {intro ? <p className="mt-2 text-[15px] leading-relaxed text-muted">{intro}</p> : null}
      </div>
      {isSupabaseConfigured() ? null : (
        <Notice tone="warning" title="Authentification à configurer">
          <p>Supabase n&apos;est pas encore relié à ce site : les comptes ne fonctionnent pas encore. Voir le README.</p>
        </Notice>
      )}
      <Card className="p-6 sm:p-8">{children}</Card>
    </div>
  );
}
