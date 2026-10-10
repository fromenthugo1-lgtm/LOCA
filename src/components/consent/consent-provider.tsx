"use client";

import { createContext, use, useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  cookieCategories,
  optionalCategoriesWithTools,
  type CookieCategoryId,
} from "@/config/cookies";
import { isAllowed, parseConsent, serializeConsent, type ConsentState } from "@/features/consent/consent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ConsentContextValue = {
  state: ConsentState | null;
  allowed: (category: CookieCategoryId) => boolean;
  openPreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readCookie(): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return match ? match.slice(CONSENT_COOKIE.length + 1) : null;
}

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeConsent(choices: Partial<Record<CookieCategoryId, boolean>>) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(choices)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  listeners.forEach((l) => l());
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readCookie, () => null);
  const state = useMemo(() => parseConsent(raw), [raw]);
  const [open, setOpen] = useState(false);

  const allowed = useCallback((category: CookieCategoryId) => isAllowed(state, category), [state]);
  const value = useMemo(() => ({ state, allowed, openPreferences: () => setOpen(true) }), [state, allowed]);

  // Le bandeau n'apparaît que s'il existe un consentement à recueillir.
  const needsBanner = state === null && optionalCategoriesWithTools().length > 0;

  return (
    <ConsentContext value={value}>
      {children}
      {needsBanner ? <ConsentBanner onCustomize={() => setOpen(true)} /> : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <ConsentPreferences state={state} onDone={() => setOpen(false)} />
      </Dialog>
    </ConsentContext>
  );
}

export function useConsent() {
  const ctx = use(ConsentContext);
  if (!ctx) throw new Error("useConsent doit être utilisé dans ConsentProvider");
  return ctx;
}

/** N'affiche son contenu (un script de mesure, par exemple) qu'après consentement. */
export function ConsentGate({ category, children }: { category: CookieCategoryId; children: ReactNode }) {
  const { allowed } = useConsent();
  return allowed(category) ? children : null;
}

function allChoices(value: boolean) {
  return Object.fromEntries(cookieCategories.filter((c) => !c.required).map((c) => [c.id, value]));
}

function ConsentBanner({ onCustomize }: { onCustomize: () => void }) {
  return (
    <div role="region" aria-label="Cookies" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-brand border border-line bg-surface p-5 shadow-panel">
      <p className="text-sm leading-relaxed text-ink">
        Nous aimerions mesurer l&apos;audience du site pour l&apos;améliorer. Vous pouvez accepter ou refuser, et changer d&apos;avis à tout moment via « Gérer les cookies ».
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => writeConsent(allChoices(false))}>Tout refuser</Button>
        <Button variant="secondary" onClick={() => writeConsent(allChoices(true))}>Tout accepter</Button>
        <Button variant="secondary" onClick={onCustomize}>Personnaliser</Button>
      </div>
    </div>
  );
}

function ConsentPreferences({ state, onDone }: { state: ConsentState | null; onDone: () => void }) {
  const [draft, setDraft] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(cookieCategories.filter((c) => !c.required).map((c) => [c.id, isAllowed(state, c.id)])),
  );

  const save = (choices: Record<string, boolean>) => {
    writeConsent(choices);
    onDone();
  };

  return (
    <DialogContent
      title="Gérer les cookies"
      description="Choisissez finalité par finalité. Accepter les conditions d'utilisation ne vaut pas accord pour les cookies."
    >
      <ul className="flex flex-col gap-3">
        {cookieCategories.map((cat) => {
          const inputId = `consent-${cat.id}`;
          const noTool = !cat.required && cat.tools.length === 0;
          return (
            <li key={cat.id} className="rounded-brand border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor={inputId} className="text-sm font-medium text-ink">{cat.label}</label>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{cat.description}</p>
                </div>
                <input
                  id={inputId}
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-primary"
                  checked={cat.required ? true : (draft[cat.id] ?? false)}
                  disabled={cat.required || noTool}
                  onChange={(e) => setDraft((d) => ({ ...d, [cat.id]: e.target.checked }))}
                />
              </div>
              {cat.tools.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1 text-[13px] text-muted">
                  {cat.tools.map((t) => (
                    <li key={t.name}>
                      <span className="text-ink">{t.name}</span> : {t.purpose} ({t.duration})
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => save(allChoices(false))}>Tout refuser</Button>
        <Button variant="secondary" onClick={() => save(allChoices(true))}>Tout accepter</Button>
        <Button variant="secondary" onClick={() => save(draft)}>Enregistrer</Button>
      </div>
    </DialogContent>
  );
}
