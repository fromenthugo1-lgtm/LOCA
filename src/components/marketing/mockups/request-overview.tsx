import { Route } from "lucide-react";
import { AppFrame } from "./app-frame";
import { demoRequest, demoSuppliers } from "./fictional-data";
import { StatusPill } from "./status-pill";

/** Maquette du hero : une demande d'achat, ses lignes, et le suivi des fournisseurs consultés. */
export function RequestOverviewMockup() {
  return (
    <AppFrame title={`${demoRequest.reference} · ${demoRequest.project}`}>
      <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
        <section className="border-b border-line p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <p className="text-[12px] font-medium text-muted">Besoin</p>
          <p className="mt-1 text-[13px] text-muted">{demoRequest.dueDate}</p>
          <ul className="mt-4 flex flex-col divide-y divide-line rounded-brand border border-line">
            {demoRequest.lines.map((line) => (
              <li key={line.code} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{line.product}</p>
                  <p className="font-mono text-[11px] text-muted">{line.code}</p>
                </div>
                <span className="shrink-0 text-[13px] tabular-nums text-ink">{line.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ai-ink">
            <Route className="size-3.5 text-ai" strokeWidth={1.75} aria-hidden="true" />4 fournisseurs retenus dans votre catalogue
          </p>
        </section>
        <section className="p-4 sm:p-5">
          <p className="text-[12px] font-medium text-muted">Fournisseurs consultés</p>
          <ul className="mt-3 flex flex-col divide-y divide-line">
            {demoSuppliers.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{s.name}</p>
                  <p className="text-[12px] text-muted">{s.note ?? s.match}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <StatusPill status={s.status} />
                  {s.price ? <span className="text-[12px] tabular-nums text-muted">{s.price} HT</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppFrame>
  );
}
