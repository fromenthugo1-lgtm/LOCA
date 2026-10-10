import type { Metadata } from "next";
import { AppHeader } from "@/components/app/app-header";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader area="client" />
      <main id="contenu" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
