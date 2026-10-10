"use client";

import { useActionState, type ReactNode } from "react";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ActionState } from "@/features/admin/action-state";

/**
 * Formulaire d'administration relié à une action serveur. Affiche le résultat réel de
 * l'action (succès ou erreur) et transmet les erreurs par champ aux enfants.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Enregistrement…",
  variant,
  children,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  children?: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } as ActionState);
  const errors = state.status === "invalid" ? state.fieldErrors : {};
  return (
    <form action={formAction} noValidate className={className ?? "flex flex-col gap-4"}>
      {state.status === "success" ? <Notice tone="success">{state.message}</Notice> : null}
      {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
      {state.status === "invalid" ? (
        <Notice tone="error" title="Vérifiez les champs suivants">
          <ul className="list-disc pl-4">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </Notice>
      ) : null}
      {children}
      <div>
        <SubmitButton variant={variant} pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
