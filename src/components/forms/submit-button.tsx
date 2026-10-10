"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** Bouton d'envoi avec état de chargement explicite (désactivé pendant l'envoi). */
export function SubmitButton({
  children,
  pendingLabel = "Envoi…",
  className,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} className={className} variant={variant}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" strokeWidth={1.75} aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
