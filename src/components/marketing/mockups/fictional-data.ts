/**
 * Données manifestement fictives des maquettes (lettres grecques, chantier imaginaire).
 * Aucune ne correspond à une entreprise réelle. Toujours affichées avec la mention
 * « Aperçu, données fictives ».
 */
export const demoRequest = {
  reference: "DA-0142",
  project: "Chantier Les Tilleuls",
  dueDate: "Livraison souhaitée sous 10 jours",
  lines: [
    { product: "Gravier concassé 0/20", qty: "12 t", code: "GRA-020" },
    { product: "Bordure béton T2", qty: "80 u", code: "BOR-T2" },
    { product: "Géotextile 200 g/m²", qty: "300 m²", code: "GEO-200" },
  ],
};

export type SupplierStatus = "pending" | "sent" | "answered" | "issue";

export const demoSuppliers: {
  name: string;
  match: string;
  status: SupplierStatus;
  price: string | null;
  delay: string | null;
  note?: string;
}[] = [
  { name: "Négoce Alpha", match: "3 lignes sur 3", status: "answered", price: "4 182 €", delay: "5 jours" },
  { name: "Granulats Bêta", match: "1 ligne sur 3", status: "answered", price: "1 296 €", delay: "3 jours" },
  { name: "Matériaux Gamma", match: "3 lignes sur 3", status: "sent", price: null, delay: null },
  { name: "Distribution Delta", match: "2 lignes sur 3", status: "issue", price: null, delay: null, note: "Adresse e-mail à vérifier" },
];
