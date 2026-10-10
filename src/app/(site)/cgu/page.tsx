import type { Metadata } from "next";
import { LegalPageView } from "@/components/legal/legal-page-view";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions d'utilisation du site et de l'espace client SpendEdge.",
  alternates: { canonical: "/cgu" },
};

export default function Page() {
  return <LegalPageView slug="cgu" />;
}
