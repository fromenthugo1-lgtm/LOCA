import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[15px] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Section({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-brand border border-line bg-surface", className)}>
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-brand border border-dashed border-line bg-surface px-6 py-12 text-center">
      <Inbox className="size-6 text-muted" strokeWidth={1.75} aria-hidden="true" />
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {children ? <div className="max-w-md text-sm text-muted">{children}</div> : null}
    </div>
  );
}

/** Tableau d'administration : défile horizontalement sur petit écran, sans casser la page. */
export function DataTable({ caption, head, children }: { caption: string; head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-brand border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-canvas text-[12px] text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top text-ink", className)}>{children}</td>;
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[180px_1fr]">
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-sm text-ink [overflow-wrap:anywhere]">{value ?? "Non renseigné"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Filtres par lien (navigation par paramètre d'URL, sans JavaScript). */
export function FilterTabs({ items }: { items: { label: string; href: string; active: boolean }[] }) {
  return (
    <nav aria-label="Filtres" className="mb-4 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.active ? "page" : undefined}
          className={cn(
            "rounded-brand border px-3 py-1.5 text-sm transition-colors",
            i.active ? "border-night bg-night text-white" : "border-line bg-surface text-ink/80 hover:border-[#CBD5E1]",
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
