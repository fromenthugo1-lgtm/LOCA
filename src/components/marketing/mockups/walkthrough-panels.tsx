import { ArrowRight, Check, CircleAlert, Mail, Minus } from "lucide-react";
import { demoRequest, demoSuppliers } from "./fictional-data";
import { StatusPill } from "./status-pill";
import { FictionalLabel } from "./app-frame";

/** Cadre commun des cinq panneaux de la démonstration au défilement. */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-brand border border-line bg-surface shadow-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="truncate text-[13px] font-medium text-ink">{title}</span>
        <FictionalLabel />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function NeedPanel() {
  return (
    <Panel title={`Nouvelle demande · ${demoRequest.project}`}>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-line pb-2 text-[12px] font-medium text-muted">
        <span>Produit et caractéristiques</span>
        <span>Quantité</span>
      </div>
      <ul className="divide-y divide-line">
        {demoRequest.lines.map((l) => (
          <li key={l.code} className="grid grid-cols-[1fr_auto] items-center gap-x-4 py-3">
            <span className="text-[13px] text-ink">{l.product}</span>
            <span className="rounded-brand border border-line px-2 py-1 text-[13px] tabular-nums text-ink">{l.qty}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-brand bg-canvas px-3 py-2.5 text-[13px]">
        <span className="text-muted">Livraison souhaitée</span>
        <span className="font-medium text-ink">Sous 10 jours, chantier</span>
      </div>
    </Panel>
  );
}

export function MatchPanel() {
  const matches = [
    { line: "Gravier concassé 0/20", code: "GRA-020", category: "Granulats", suppliers: 3 },
    { line: "Bordure béton T2", code: "BOR-T2", category: "Préfabriqué béton", suppliers: 2 },
    { line: "Géotextile 200 g/m²", code: "GEO-200", category: "Géosynthétiques", suppliers: 3 },
  ];
  return (
    <Panel title="Rapprochement avec votre catalogue">
      <ul className="flex flex-col gap-2">
        {matches.map((m) => (
          <li key={m.code} className="grid grid-cols-1 gap-2 rounded-brand border border-line p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="text-[13px] text-ink">{m.line}</span>
            <ArrowRight className="hidden size-4 text-ai sm:block" strokeWidth={1.75} aria-hidden="true" />
            <span className="flex flex-col">
              <span className="font-mono text-[12px] text-ink">{m.code}</span>
              <span className="text-[12px] text-muted">
                {m.category} · {m.suppliers} fournisseurs
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-muted">
        <span className="font-medium text-ink">4 fournisseurs retenus</span> sur 11 référencés.
      </p>
    </Panel>
  );
}

export function SendPanel() {
  return (
    <Panel title="Demande de prix · Négoce Alpha">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
        <dt className="text-muted">À</dt>
        <dd className="text-ink">commercial@negoce-alpha.exemple</dd>
        <dt className="text-muted">Objet</dt>
        <dd className="text-ink">Demande de prix : DA-0142, Chantier Les Tilleuls</dd>
      </dl>
      <div className="mt-3 rounded-brand border border-line bg-canvas p-3 text-[13px] leading-relaxed text-ink/85">
        Bonjour, pourriez-vous nous adresser votre meilleure offre pour les articles suivants, livrables sous 10 jours :
        gravier concassé 0/20 (12 t), bordure béton T2 (80 u), géotextile 200 g/m² (300 m²). Merci de préciser vos délais.
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <Mail className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Envoi depuis votre boîte, après votre validation
        </span>
        <span className="rounded-brand bg-primary px-3 py-1.5 text-[12px] font-medium text-white">Valider l&apos;envoi</span>
      </div>
    </Panel>
  );
}

export function TrackPanel() {
  return (
    <Panel title="Suivi de la demande DA-0142">
      <ul className="divide-y divide-line">
        {demoSuppliers.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">{s.name}</p>
              <p className="text-[12px] text-muted">{s.note ?? s.match}</p>
            </div>
            <StatusPill status={s.status} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ComparePanel() {
  const answered = demoSuppliers.filter((s) => s.status === "answered");
  return (
    <Panel title="Comparaison des réponses">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[13px]">
          <caption className="sr-only">Comparaison fictive des réponses fournisseurs</caption>
          <thead>
            <tr className="border-b border-line text-[12px] text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Fournisseur</th>
              <th scope="col" className="py-2 pr-3 font-medium">Prix HT</th>
              <th scope="col" className="py-2 pr-3 font-medium">Délai</th>
              <th scope="col" className="py-2 font-medium">Lignes couvertes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {answered.map((s) => (
              <tr key={s.name}>
                <th scope="row" className="py-2.5 pr-3 font-medium text-ink">{s.name}</th>
                <td className="py-2.5 pr-3 tabular-nums text-ink">{s.price}</td>
                <td className="py-2.5 pr-3 tabular-nums text-ink">{s.delay}</td>
                <td className="py-2.5 text-ink">
                  <span className="inline-flex items-center gap-1.5">
                    {s.match === "3 lignes sur 3" ? (
                      <Check className="size-3.5 text-success" strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Minus className="size-3.5 text-warning" strokeWidth={1.75} aria-hidden="true" />
                    )}
                    {s.match}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-warning-ink">
        <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        Granulats Bêta ne couvre qu&apos;une ligne : les totaux ne sont pas comparables tels quels.
      </p>
    </Panel>
  );
}
