import type { ComponentProps, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-brand border border-line bg-surface px-3 text-[15px] text-ink placeholder:text-muted/80 transition-colors duration-150 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger md:text-sm";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-11 md:h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(controlBase, "h-11 appearance-none bg-[url('/select-chevron.svg')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 md:h-10", className)} {...props}>
      {children}
    </select>
  );
}

type FieldProps = {
  id: string;
  label: string;
  /** Texte d'aide affiché sous le libellé. */
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Champ de formulaire accessible : libellé lié, aide et erreur reliées par aria-describedby
 * (à transmettre au contrôle via `fieldDescribedBy`).
 */
export function Field({ id, label, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-muted"> (facultatif)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-[13px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-danger">
          <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescribedBy(id: string, opts: { hint?: unknown; error?: unknown }): string | undefined {
  const ids = [opts.hint ? `${id}-hint` : null, opts.error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}
