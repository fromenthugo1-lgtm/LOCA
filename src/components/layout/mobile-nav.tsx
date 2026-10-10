"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

/** Menu mobile : panneau plein écran accessible (focus piégé, Échap pour fermer). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-brand text-ink hover:bg-ink/5 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Navigation du site SpendEdge</DialogPrimitive.Description>
          <div className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
            <Logo />
            <DialogPrimitive.Close
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-brand text-ink hover:bg-ink/5"
              aria-label="Fermer le menu"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link href={item.href} onClick={close} className="flex h-14 items-center text-[17px] text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-2 border-t border-line p-4 sm:px-6">
            <ButtonLink href={routes.demo} size="lg" onClick={close}>
              Demander une démonstration
            </ButtonLink>
            <ButtonLink href={routes.signIn} variant="secondary" size="lg" onClick={close}>
              Se connecter
            </ButtonLink>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
