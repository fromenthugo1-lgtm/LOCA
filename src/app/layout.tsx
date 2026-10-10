import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SpendEdge | Vos demandes de prix fournisseurs, automatisées",
    template: "%s | SpendEdge",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#14243A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh">
        <a
          href="#contenu"
          className="sr-only z-50 rounded-brand bg-primary px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>
        <ConsentProvider>{children}</ConsentProvider>
      </body>
    </html>
  );
}
