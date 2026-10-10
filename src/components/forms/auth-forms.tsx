"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { Field, Input, fieldDescribedBy } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthFormState,
} from "@/features/auth/actions";
import { PasswordInput } from "./password-input";
import { SubmitButton } from "./submit-button";

const idle: AuthFormState = { status: "idle" };

function useErrors(state: AuthFormState) {
  return state.status === "invalid" ? state.fieldErrors : {};
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (state.status === "error") return <Notice tone="error">{state.message}</Notice>;
  if (state.status === "done") return <Notice tone="success">{state.message}</Notice>;
  return null;
}

function aria(id: string, error?: string, extra?: string) {
  const described = [fieldDescribedBy(id, { error }), extra].filter(Boolean).join(" ") || undefined;
  return { id, "aria-invalid": error ? true : undefined, "aria-describedby": described };
}

export function SignInForm() {
  const [state, action] = useActionState(signIn, idle);
  const errors = useErrors(state);
  const params = useSearchParams();
  const invalidLink = params.get("lien") === "invalide";
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {invalidLink && state.status === "idle" ? (
        <Notice tone="warning">Ce lien a expiré ou a déjà été utilisé. Connectez-vous ou demandez un nouveau lien.</Notice>
      ) : null}
      <FormMessage state={state} />
      <input type="hidden" name="suite" value={params.get("suite") ?? ""} />
      <Field id="signin-email" label="E-mail" error={errors.email}>
        <Input {...aria("signin-email", errors.email)} name="email" type="email" autoComplete="email" required />
      </Field>
      <Field id="signin-password" label="Mot de passe" error={errors.password}>
        <PasswordInput {...aria("signin-password", errors.password)} name="password" autoComplete="current-password" required />
      </Field>
      <Link href={routes.forgotPassword} className="-mt-2 self-start text-sm text-primary hover:text-primary-hover">
        Mot de passe oublié ?
      </Link>
      <SubmitButton className="w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href={routes.signUp} className="font-medium text-primary hover:text-primary-hover">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUp, idle);
  const errors = useErrors(state);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <FormMessage state={state} />
      <Field id="signup-email" label="E-mail professionnel" error={errors.email}>
        <Input {...aria("signup-email", errors.email)} name="email" type="email" autoComplete="email" required />
      </Field>
      <Field id="signup-password" label="Mot de passe" error={errors.password}>
        <PasswordInput
          {...aria("signup-password", errors.password, "signup-password-rules")}
          name="password"
          autoComplete="new-password"
          showRules
          required
        />
      </Field>
      <Field id="signup-passwordConfirm" label="Confirmez le mot de passe" error={errors.passwordConfirm}>
        <PasswordInput
          {...aria("signup-passwordConfirm", errors.passwordConfirm)}
          name="passwordConfirm"
          autoComplete="new-password"
          required
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <input
            id="signup-acceptTerms"
            name="acceptTerms"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-primary"
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-describedby={errors.acceptTerms ? "signup-acceptTerms-error" : undefined}
          />
          <label htmlFor="signup-acceptTerms" className="text-sm leading-relaxed text-ink">
            J&apos;ai lu et j&apos;accepte les{" "}
            <Link href={routes.terms} target="_blank" className="text-primary underline underline-offset-2">
              conditions générales d&apos;utilisation
            </Link>
            .
          </label>
        </div>
        {errors.acceptTerms ? (
          <p id="signup-acceptTerms-error" className="text-[13px] text-danger">
            {errors.acceptTerms}
          </p>
        ) : null}
      </div>
      <p className="text-[13px] leading-relaxed text-muted">
        Vos données servent à gérer votre compte. Détails dans la{" "}
        <Link href={routes.privacy} className="text-primary underline underline-offset-2">
          politique de confidentialité
        </Link>
        .
      </p>
      <SubmitButton className="w-full" pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href={routes.signIn} className="font-medium text-primary hover:text-primary-hover">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, idle);
  const errors = useErrors(state);
  if (state.status === "done") return <FormMessage state={state} />;
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <FormMessage state={state} />
      <Field id="forgot-email" label="E-mail du compte" error={errors.email}>
        <Input {...aria("forgot-email", errors.email)} name="email" type="email" autoComplete="email" required />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Envoi…">
        Recevoir un lien de réinitialisation
      </SubmitButton>
      <Link href={routes.signIn} className="text-center text-sm text-primary hover:text-primary-hover">
        Retour à la connexion
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, idle);
  const errors = useErrors(state);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <FormMessage state={state} />
      <Field id="reset-password" label="Nouveau mot de passe" error={errors.password}>
        <PasswordInput
          {...aria("reset-password", errors.password, "reset-password-rules")}
          name="password"
          autoComplete="new-password"
          showRules
          required
        />
      </Field>
      <Field id="reset-passwordConfirm" label="Confirmez le mot de passe" error={errors.passwordConfirm}>
        <PasswordInput {...aria("reset-passwordConfirm", errors.passwordConfirm)} name="passwordConfirm" autoComplete="new-password" required />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Enregistrement…">
        Enregistrer le nouveau mot de passe
      </SubmitButton>
    </form>
  );
}
