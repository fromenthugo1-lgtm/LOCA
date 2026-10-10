/**
 * Interface du futur prestataire de paiement (Stripe prévu). Rien n'est branché en V1 :
 * aucune transaction, aucune coordonnée bancaire. Voir docs/paiements.md.
 * Règle : un abonnement ne devient actif que par un webhook signé et vérifié,
 * jamais par la visite d'une page de confirmation.
 */
export type CheckoutRequest = { companyId: string; planId: string; includeSetupFee: boolean };

export interface PaymentProvider {
  readonly name: "stripe";
  createCheckoutSession(request: CheckoutRequest): Promise<{ url: string }>;
  createCustomerPortalSession(companyId: string): Promise<{ url: string }>;
  /** Vérifie la signature et renvoie l'événement ; lève une erreur si la signature est invalide. */
  verifyWebhook(rawBody: string, signature: string): Promise<{ id: string; type: string; payload: unknown }>;
}
