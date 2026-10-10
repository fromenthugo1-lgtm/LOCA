import type { Metadata } from "next";
import { LegalPageView } from "@/components/legal/legal-page-view";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions de vente de la mise en service et des abonnements SpendEdge.",
  alternates: { canonical: "/cgv" },
};

export default function Page() {
  return <LegalPageView slug="cgv" />;
}
