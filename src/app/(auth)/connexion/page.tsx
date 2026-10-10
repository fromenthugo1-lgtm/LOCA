import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/forms/auth-card";
import { SignInForm } from "@/components/forms/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Se connecter", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthCard title="Se connecter" intro="Accédez à votre espace SpendEdge.">
      <Suspense fallback={<Skeleton className="h-72" />}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
