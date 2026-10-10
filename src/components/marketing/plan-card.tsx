import { Check } from "lucide-react";
import { business } from "@/config/business";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/button";
import { formatCents, type PublicPlan } from "@/features/plans/schema";

const tax = business.pricesExcludeTax ? " HT" : " TTC";

function limitLine(label: string, value: number | null, unit?: string | null) {
  if (value === null) return null;
  return `${label} : ${new Intl.NumberFormat("fr-FR").format(value)}${unit ? ` ${unit}` : ""}`;
}

/** Carte d'une formule publiée. Sans montant renseigné, le prix est « sur devis ». */
export function PlanCard({ plan, cta }: { plan: PublicPlan; cta: string }) {
  const monthly = formatCents(plan.monthlyPriceCents);
  const setup = formatCents(plan.setupFeeCents);
  const limits = [
    limitLine("Utilisateurs", plan.maxUsers),
    limitLine("Demandes par mois", plan.maxRequestsPerMonth),
    limitLine("Consommation IA", plan.aiUsageLimit, plan.aiUsageUnit),
  ].filter(Boolean) as string[];

  return (
    <article className="flex flex-col gap-6 rounded-brand border border-line bg-surface p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
        {plan.description ? <p className="text-[15px] leading-relaxed text-muted">{plan.description}</p> : null}
      </div>
      <dl className="flex flex-col gap-3 border-y border-line py-5">
        <div>
          <dt className="text-[13px] text-muted">Abonnement mensuel</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {monthly ? (
              <>
                {monthly}
                <span className="text-sm font-normal text-muted">{tax} / mois</span>
              </>
            ) : (
              <span className="text-lg">Sur devis</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-muted">Mise en service (une seule fois)</dt>
          <dd className="mt-1 text-[15px] font-medium tabular-nums text-ink">{setup ? `${setup}${tax}` : "Sur devis"}</dd>
        </div>
      </dl>
      {limits.length + plan.features.length > 0 ? (
        <ul className="flex flex-1 flex-col gap-2.5 text-[15px] text-ink">
          {[...limits, ...plan.features].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}
      <ButtonLink href={routes.demo} variant="secondary">
        {cta}
      </ButtonLink>
    </article>
  );
}
