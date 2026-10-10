import { Field, Input, Textarea } from "@/components/ui/field";
import type { Database } from "@/lib/supabase/database.types";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

const euros = (cents: number | null | undefined) => (cents === null || cents === undefined ? "" : (cents / 100).toFixed(2).replace(".", ","));

/** Champs d'une formule. Un montant vide signifie « sur devis » (jamais de prix inventé). */
export function PlanFields({ plan }: { plan?: Plan }) {
  const features = Array.isArray(plan?.features) ? (plan.features as string[]).join("\n") : "";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Nom affiché">
        <Input id="name" name="name" defaultValue={plan?.name ?? ""} required maxLength={80} />
      </Field>
      <Field id="slug" label="Identifiant" hint="Minuscules, chiffres et tirets. Exemple : essentiel">
        <Input id="slug" name="slug" defaultValue={plan?.slug ?? ""} required maxLength={48} />
      </Field>
      <Field id="description" label="Description" optional className="sm:col-span-2">
        <Textarea id="description" name="description" defaultValue={plan?.description ?? ""} rows={3} maxLength={600} />
      </Field>
      <Field id="monthlyPrice" label="Abonnement mensuel, en euros HT" hint="Vide = « sur devis »." optional>
        <Input id="monthlyPrice" name="monthlyPrice" inputMode="decimal" defaultValue={euros(plan?.monthly_price_cents)} />
      </Field>
      <Field id="setupFee" label="Frais de mise en service, en euros HT" hint="Facturés une seule fois. Vide = « sur devis »." optional>
        <Input id="setupFee" name="setupFee" inputMode="decimal" defaultValue={euros(plan?.setup_fee_cents)} />
      </Field>
      <Field id="maxUsers" label="Utilisateurs inclus" optional>
        <Input id="maxUsers" name="maxUsers" type="number" min={1} defaultValue={plan?.max_users ?? ""} />
      </Field>
      <Field id="maxRequestsPerMonth" label="Demandes par mois" optional>
        <Input id="maxRequestsPerMonth" name="maxRequestsPerMonth" type="number" min={1} defaultValue={plan?.max_requests_per_month ?? ""} />
      </Field>
      <Field id="aiUsageLimit" label="Limite de consommation IA" optional>
        <Input id="aiUsageLimit" name="aiUsageLimit" type="number" min={1} defaultValue={plan?.ai_usage_limit ?? ""} />
      </Field>
      <Field id="aiUsageUnit" label="Unité de consommation IA" hint="Exemple : analyses par mois" optional>
        <Input id="aiUsageUnit" name="aiUsageUnit" defaultValue={plan?.ai_usage_unit ?? ""} maxLength={40} />
      </Field>
      <Field id="features" label="Fonctionnalités incluses" hint="Une par ligne, 20 au maximum." optional className="sm:col-span-2">
        <Textarea id="features" name="features" defaultValue={features} rows={5} />
      </Field>
      <Field id="displayOrder" label="Ordre d'affichage">
        <Input id="displayOrder" name="displayOrder" type="number" min={0} max={1000} defaultValue={plan?.display_order ?? 0} />
      </Field>
      <div className="flex items-center gap-3 self-end pb-2">
        <input id="isPublished" name="isPublished" type="checkbox" defaultChecked={plan?.is_published ?? false} className="size-4 accent-primary" />
        <label htmlFor="isPublished" className="text-sm text-ink">Publiée sur le site</label>
      </div>
    </div>
  );
}
