"use client";

import { useConsent } from "./consent-provider";

export function ManageCookiesButton({ className }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences} className={className}>
      Gérer les cookies
    </button>
  );
}
