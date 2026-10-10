import type { z } from "zod";

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | { status: "invalid"; fieldErrors: Record<string, string> };

export function invalid(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { status: "invalid", fieldErrors };
}

/** Erreur de base de données traduite en message neutre ; le détail reste dans les journaux serveur. */
export function dbError(context: string, error: { code?: string; message?: string }): ActionState {
  console.error(`[admin] ${context}`, { code: error.code });
  if (error.code === "23505") return { status: "error", message: "Cette valeur existe déjà (doublon)." };
  if (error.code === "42501") return { status: "error", message: "Action non autorisée." };
  if (error.message?.includes("version_already_published")) {
    return { status: "error", message: "Cette version a déjà été publiée avec un autre texte : changez le numéro de version." };
  }
  return { status: "error", message: "L'enregistrement a échoué. Réessayez dans quelques instants." };
}
