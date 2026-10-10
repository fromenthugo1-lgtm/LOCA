/**
 * Conversion entre un contenu (objet JSON) et les champs d'un formulaire nommés par chemin
 * (« items.2.title »). La structure de référence est toujours celle du texte par défaut :
 * on ne peut ni ajouter ni retirer d'élément, seulement modifier les textes.
 */
export type ContentValue = string | ContentValue[] | { [key: string]: ContentValue };

export function fromFormData(reference: ContentValue, formData: FormData, path: string[] = []): ContentValue {
  if (typeof reference === "string") {
    const raw = formData.get(path.join("."));
    return typeof raw === "string" ? raw : reference;
  }
  if (Array.isArray(reference)) {
    return reference.map((item, i) => fromFormData(item, formData, [...path, String(i)]));
  }
  return Object.fromEntries(
    Object.entries(reference).map(([k, v]) => [k, k === "id" ? v : fromFormData(v, formData, [...path, k])]),
  );
}

/** Fusionne une version enregistrée sur la structure de référence (les clés inconnues sont ignorées). */
export function mergeOnReference(reference: ContentValue, stored: unknown): ContentValue {
  if (typeof reference === "string") return typeof stored === "string" ? stored : reference;
  if (Array.isArray(reference)) {
    const arr = Array.isArray(stored) ? stored : [];
    return reference.map((item, i) => mergeOnReference(item, arr[i]));
  }
  const obj = stored && typeof stored === "object" && !Array.isArray(stored) ? (stored as Record<string, unknown>) : {};
  return Object.fromEntries(Object.entries(reference).map(([k, v]) => [k, k === "id" ? v : mergeOnReference(v, obj[k])]));
}
