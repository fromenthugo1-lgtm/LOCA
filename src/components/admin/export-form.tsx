"use client";

import { useActionState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit-button";
import { exportPersonalData, type ExportState } from "@/features/admin/gdpr/actions";

/** Export RGPD : le fichier JSON est préparé par le serveur puis téléchargé par le navigateur. */
export function ExportForm() {
  const [state, action] = useActionState<ExportState, FormData>(exportPersonalData, { status: "idle" });
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (state.status !== "ready" || !linkRef.current) return;
    const url = URL.createObjectURL(new Blob([state.json], { type: "application/json" }));
    linkRef.current.href = url;
    linkRef.current.click();
    return () => URL.revokeObjectURL(url);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
      {state.status === "ready" ? (
        <Notice tone="success">
          Export prêt.{" "}
          <a ref={linkRef} download={state.filename} className="text-primary underline">
            Télécharger à nouveau
          </a>
        </Notice>
      ) : null}
      <Field id="export-email" label="E-mail de la personne">
        <Input id="export-email" name="email" type="email" required />
      </Field>
      <div>
        <SubmitButton variant="secondary" pendingLabel="Préparation…">
          <Download strokeWidth={1.75} aria-hidden="true" />
          Télécharger l&apos;export
        </SubmitButton>
      </div>
    </form>
  );
}
