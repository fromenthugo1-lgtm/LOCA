import type { Database } from "@/lib/supabase/database.types";

type Enums = Database["public"]["Enums"];

export const demoStatusLabels: Record<Enums["demo_request_status"], string> = {
  new: "Nouvelle",
  in_progress: "En cours",
  done: "Traitée",
  refused: "Refusée",
};

export const accountStatusLabels: Record<Enums["account_status"], string> = {
  created: "Compte créé",
  onboarding_pending: "Mise en service en attente",
  active: "Actif",
  suspended: "Suspendu",
};

export const companyStatusLabels: Record<Enums["company_status"], string> = {
  active: "Active",
  suspended: "Suspendue",
  archived: "Archivée",
};

export const companyRoleLabels: Record<Enums["company_role"], string> = {
  member: "Utilisateur",
  company_admin: "Administrateur de l'entreprise",
};

export const gdprTypeLabels: Record<Enums["gdpr_request_type"], string> = {
  access: "Accès",
  rectification: "Rectification",
  erasure: "Effacement",
  restriction: "Limitation",
  portability: "Portabilité",
  objection: "Opposition",
  consent_withdrawal: "Retrait du consentement",
};

export const gdprStatusLabels: Record<Enums["gdpr_request_status"], string> = {
  received: "Reçue",
  identity_check: "Vérification d'identité",
  in_progress: "En cours",
  completed: "Clôturée",
  rejected: "Refusée",
};

const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });
const dateOnly = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Europe/Paris" });

export function formatDateTime(value: string | null | undefined): string {
  return value ? dateTime.format(new Date(value)) : "Non renseigné";
}
export function formatDate(value: string | null | undefined): string {
  return value ? dateOnly.format(new Date(value)) : "Non renseigné";
}
