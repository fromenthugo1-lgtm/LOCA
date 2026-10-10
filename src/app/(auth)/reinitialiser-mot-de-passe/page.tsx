import type { Metadata } from "next";
import { AuthCard } from "@/components/forms/auth-card";
import { ResetPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choisir un nouveau mot de passe" intro="Ce formulaire n'est valable qu'après avoir ouvert le lien reçu par e-mail.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
