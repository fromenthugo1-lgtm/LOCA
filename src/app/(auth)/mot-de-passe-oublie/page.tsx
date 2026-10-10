import type { Metadata } from "next";
import { AuthCard } from "@/components/forms/auth-card";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Mot de passe oublié" intro="Indiquez l'adresse de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
