import { Field, Input, Select, Textarea } from "@/components/ui/field";
import type { ContentValue } from "@/features/site-content/form-data";
import { fieldLabels, statusOptions } from "@/features/site-content/labels";

/** Génère les champs d'édition à partir de la structure d'une section de texte. */
export function ContentFields({ value, path = [] }: { value: ContentValue; path?: string[] }) {
  if (typeof value === "string") {
    const name = path.join(".");
    const leaf = path[path.length - 1] ?? "";
    const label = fieldLabels[leaf] ?? leaf;
    if (leaf === "status") {
      return (
        <Field id={name} label={label}>
          <Select id={name} name={name} defaultValue={value}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>
      );
    }
    return (
      <Field id={name} label={label}>
        {value.length > 90 ? (
          <Textarea id={name} name={name} defaultValue={value} rows={3} />
        ) : (
          <Input id={name} name={name} defaultValue={value} />
        )}
      </Field>
    );
  }
  if (Array.isArray(value)) {
    const leaf = path[path.length - 1] ?? "";
    return (
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium text-ink">{fieldLabels[leaf] ?? leaf}</legend>
        {value.map((item, i) => (
          <div key={i} className="rounded-brand border border-line p-4">
            <p className="mb-3 text-[12px] font-medium text-muted">Élément {i + 1}</p>
            <div className="flex flex-col gap-3">
              <ContentFields value={item} path={[...path, String(i)]} />
            </div>
          </div>
        ))}
      </fieldset>
    );
  }
  return (
    <>
      {Object.entries(value)
        .filter(([k]) => k !== "id")
        .map(([k, v]) => (
          <ContentFields key={k} value={v} path={[...path, k]} />
        ))}
    </>
  );
}
