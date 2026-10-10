"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { companySizeOptions, sectorOptions } from "@/config/business";
import { routes } from "@/config/routes";
import { Field, Input, Select, Textarea, fieldDescribedBy } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { submitDemoRequest, type DemoFormState } from "@/features/demo-requests/actions";
import {
  demoRequestSchema,
  fieldErrorsFrom,
  readDemoForm,
  type DemoRequestField,
} from "@/features/demo-requests/schema";
import { SubmitButton } from "./submit-button";

type Props = { privacyNotice: string; successTitle: string; successText: string };

export function DemoRequestForm({ privacyNotice, successTitle, successText }: Props) {
  const [state, formAction] = useActionState<DemoFormState, FormData>(submitDemoRequest, { status: "idle" });
  const [clientErrors, setClientErrors] = useState<Partial<Record<DemoRequestField, string>>>({});
  const mountedAt = useRef<number>(0);
  const elapsedRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status !== "idle") resultRef.current?.focus();
  }, [state]);

  const serverErrors = state.status === "invalid" ? state.fieldErrors : {};
  const errors = { ...serverErrors, ...clientErrors };

  if (state.status === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} className="outline-none">
        <Notice tone="success" title={successTitle}>
          <p>{successText}</p>
        </Notice>
      </div>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Même schéma que le serveur : erreurs affichées sans aller-retour réseau.
    const result = demoRequestSchema.safeParse(readDemoForm(new FormData(event.currentTarget)));
    if (!result.success) {
      event.preventDefault();
      const fe = fieldErrorsFrom(result.error);
      setClientErrors(fe);
      const first = Object.keys(fe)[0];
      if (first) document.getElementById(`demo-${first}`)?.focus();
      return;
    }
    setClientErrors({});
    if (elapsedRef.current) elapsedRef.current.value = String(Date.now() - mountedAt.current);
  }

  const control = (name: DemoRequestField, hint?: string) => ({
    id: `demo-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": fieldDescribedBy(`demo-${name}`, { hint, error: errors[name] }),
  });

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {state.status === "error" ? (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          <Notice tone="error" title="La demande n'a pas été envoyée">
            <p>{state.message}</p>
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="demo-fullName" label="Nom et prénom" error={errors.fullName}>
          <Input {...control("fullName")} autoComplete="name" required maxLength={120} />
        </Field>
        <Field id="demo-email" label="E-mail professionnel" error={errors.email}>
          <Input {...control("email")} type="email" autoComplete="email" required maxLength={254} />
        </Field>
        <Field id="demo-companyName" label="Entreprise" error={errors.companyName}>
          <Input {...control("companyName")} autoComplete="organization" required maxLength={160} />
        </Field>
        <Field id="demo-jobTitle" label="Fonction" error={errors.jobTitle}>
          <Input {...control("jobTitle")} autoComplete="organization-title" required maxLength={120} />
        </Field>
        <Field id="demo-sector" label="Secteur d'activité" error={errors.sector}>
          <Select {...control("sector")} required defaultValue="">
            <option value="" disabled>
              Choisir un secteur
            </option>
            {sectorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="demo-companySize" label="Taille de l'entreprise" optional error={errors.companySize}>
          <Select {...control("companySize")} defaultValue="">
            <option value="">Non précisé</option>
            {companySizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="demo-phone" label="Téléphone" optional error={errors.phone} className="sm:col-span-2">
          <Input {...control("phone")} type="tel" autoComplete="tel" maxLength={30} />
        </Field>
        <Field
          id="demo-message"
          label="Votre besoin"
          optional
          hint="Ce que vous achetez, auprès de combien de fournisseurs, à quelle fréquence."
          error={errors.message}
          className="sm:col-span-2"
        >
          <Textarea {...control("message", "hint")} rows={4} maxLength={2000} />
        </Field>
      </div>

      {/* Champ piège invisible pour les humains, rempli par les robots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="demo-website">Site web</label>
        <input id="demo-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={elapsedRef} type="hidden" name="elapsedMs" defaultValue="0" />

      <p className="text-[13px] leading-relaxed text-muted">
        {privacyNotice}{" "}
        <Link href={routes.privacy} className="text-primary underline underline-offset-2 hover:text-primary-hover">
          Politique de confidentialité
        </Link>
        .
      </p>

      <SubmitButton className="w-full sm:w-auto sm:self-start" pendingLabel="Envoi de la demande…">
        Envoyer ma demande
      </SubmitButton>
    </form>
  );
}
