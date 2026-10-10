import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/routes";
import { AuthCard } from "@/components/forms/auth-card";
import { SignUpForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Créer un compte"
      intro={
        <>
          Votre compte vous donne accès à votre espace. Les fonctions du service sont ouvertes après une{" "}
          <Link href={routes.demo} className="text-primary underline underline-offset-2">
            démonstration
          </Link>{" "}
          et la mise en service de votre environnement.
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
