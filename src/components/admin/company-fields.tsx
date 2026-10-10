import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { companySizeOptions, sectorOptions } from "@/config/business";

type Values = { name?: string; legal_identifier?: string | null; sector?: string | null; size?: string | null; notes?: string | null };

export function CompanyFields({ values = {} }: { values?: Values }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Nom de l'entreprise">
        <Input id="name" name="name" defaultValue={values.name ?? ""} required maxLength={160} />
      </Field>
      <Field id="legalIdentifier" label="SIREN ou SIRET" optional>
        <Input id="legalIdentifier" name="legalIdentifier" defaultValue={values.legal_identifier ?? ""} maxLength={40} />
      </Field>
      <Field id="sector" label="Secteur" optional>
        <Select id="sector" name="sector" defaultValue={values.sector ?? ""}>
          <option value="">Non précisé</option>
          {sectorOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>
      <Field id="size" label="Taille" optional>
        <Select id="size" name="size" defaultValue={values.size ?? ""}>
          <option value="">Non précisé</option>
          {companySizeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>
      <Field id="notes" label="Notes internes (jamais visibles du client)" optional className="sm:col-span-2">
        <Textarea id="notes" name="notes" defaultValue={values.notes ?? ""} rows={4} maxLength={4000} />
      </Field>
    </div>
  );
}
