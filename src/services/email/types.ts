/**
 * Interface d'envoi d'e-mails transactionnels (confirmation de demande de démo, notifications).
 * Aucun prestataire n'est branché en V1 : l'implémentation active est `disabledEmailSender`,
 * qui n'envoie rien et le dit. Brancher un prestataire = fournir une autre implémentation.
 */
export type EmailMessage = { to: string; subject: string; text: string; html?: string };

export type EmailResult = { sent: true; providerId: string } | { sent: false; reason: "not_configured" | "failed" };

export interface EmailSender {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}
