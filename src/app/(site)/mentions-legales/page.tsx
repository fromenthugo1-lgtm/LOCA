import type { Metadata } from "next";
import { LegalPageView } from "@/components/legal/legal-page-view";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Identité de l'éditeur et de l'hébergeur du site SpendEdge.",
  alternates: { canonical: "/mentions-legales" },
};

export default function Page() {
  return <LegalPageView slug="mentions-legales" />;
}
