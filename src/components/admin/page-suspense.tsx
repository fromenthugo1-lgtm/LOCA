import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Les pages d'administration lisent la session : leur contenu est rendu à la demande. */
export function AdminSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Skeleton className="h-80" label="Chargement…" />}>{children}</Suspense>;
}
