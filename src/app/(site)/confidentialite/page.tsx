import type { Metadata } from "next";
import { LegalPageView } from "@/components/legal/legal-page-view";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment SpendEdge traite vos données personnelles et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return <LegalPageView slug="confidentialite" />;
}
