import "server-only";
import type { EmailSender } from "./types";

export const disabledEmailSender: EmailSender = {
  name: "désactivé",
  async send() {
    return { sent: false, reason: "not_configured" };
  },
};

/** Service d'e-mail actif. En V1 : désactivé (aucune confirmation n'est annoncée au visiteur). */
export function getEmailSender(): EmailSender {
  return disabledEmailSender;
}
