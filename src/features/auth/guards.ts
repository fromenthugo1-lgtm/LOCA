import "server-only";
import { notFound, redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getAccountContext, getSessionUser, type AccountContext, type SessionUser } from "./session";

/** Exige une session valide, sinon renvoie vers la connexion. */
export async function requireUser(next: string = routes.account): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`${routes.signIn}?suite=${encodeURIComponent(next)}`);
  return user;
}

/**
 * Exige un super_admin, vérifié en base à chaque appel (jamais une valeur du navigateur).
 * À appeler dans chaque page et chaque action de /admin : un layout ne protège pas ses pages.
 */
export async function requireSuperAdmin(): Promise<AccountContext> {
  await requireUser(routes.admin);
  const ctx = await getAccountContext();
  // Une page introuvable plutôt qu'un refus : l'existence de /admin n'est pas révélée.
  if (!ctx || !ctx.isSuperAdmin || ctx.profile.status === "suspended") notFound();
  return ctx;
}
