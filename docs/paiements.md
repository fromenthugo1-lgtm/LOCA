# Abonnements et paiements

**État V1 : préparé, aucune transaction possible.** Aucun compte de paiement n'est connecté, aucune coordonnée bancaire n'est demandée ni stockée. Le prestataire prévu est Stripe.

## Ce qui est prêt

| Élément | Où | Rôle |
|---|---|---|
| Formules | Table `plans`, administration `/admin/formules`, page `/tarifs` | Frais de mise en service et abonnement mensuel séparés (centimes, EUR, HT), limites, fonctionnalités, publication, archivage. Champs `provider_product_id`, `provider_setup_price_id`, `provider_monthly_price_id` vides. |
| Abonnements | Table `subscriptions` | Entreprise, formule, statut (`trialing`, `active`, `past_due`, `unpaid`, `canceled`, `expired`, `incomplete`), dates de début, de période, d'essai, résiliation programmée, mise en service facturée ou non. Une seule souscription en cours par entreprise. Aucune écriture possible depuis l'application. |
| Événements de paiement | Table `billing_events` | Alimentée plus tard **uniquement** par les webhooks signés, identifiant d'événement unique (idempotence). |
| Droit d'accès | `private.company_has_active_subscription`, `public.company_subscription_is_active` | Calculé en base à partir de l'état réel de l'abonnement ; affiché dans l'espace client. |
| Interface de prestataire | `src/services/payments/types.ts` | Paiement, portail client, vérification de webhook. Aucune implémentation. |

Règle : une page de confirmation visitée ne vaut jamais paiement. Seul un webhook dont la signature est vérifiée peut changer l'état d'un abonnement.

## Ce qu'il restera à faire (dans cet ordre)

1. **Compte Stripe** (à faire par Hugo) : créer le compte, renseigner l'entreprise, activer les paiements. Coût : commissions Stripe par transaction.
2. **Produits et prix** dans Stripe : un prix ponctuel (mise en service) et un prix récurrent mensuel par formule ; reporter leurs identifiants dans les champs `provider_*` de chaque formule.
3. **Clés** : `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans les variables Vercel (jamais dans le code).
4. **Webhook** : route serveur `/api/stripe/webhook` qui vérifie la signature, insère l'événement dans `billing_events` (doublon ignoré grâce à l'identifiant unique), puis met à jour `subscriptions` avec la clé secrète. Événements à traiter : `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`.
5. **Portail client Stripe** : changement de formule, moyen de paiement, résiliation.
6. **CGV** : rédiger les conditions de vente (durée, résiliation, impayés, changement de formule, sort des données) avant tout encaissement.
7. **Brancher l'accès** : conditionner les futurs modules à `company_subscription_is_active` en plus du statut du compte.
8. **Tests** : rejouer des événements de test Stripe (Stripe CLI) et vérifier l'idempotence, les paiements échoués et la résiliation.
