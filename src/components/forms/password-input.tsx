"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Minus } from "lucide-react";
import { passwordRules } from "@/features/auth/schema";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"input"> & { showRules?: boolean };

/** Champ mot de passe avec affichage optionnel et règles de robustesse vérifiées en direct. */
export function PasswordInput({ showRules = false, className, id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-controls={id}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-brand text-muted hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" strokeWidth={1.75} aria-hidden="true" /> : <Eye className="size-4" strokeWidth={1.75} aria-hidden="true" />}
        </button>
      </div>
      {showRules ? (
        <ul id={`${id}-rules`} className="grid grid-cols-1 gap-1 text-[13px] sm:grid-cols-2">
          {passwordRules.map((rule) => {
            const ok = rule.test(value);
            return (
              <li key={rule.id} className={cn("flex items-center gap-1.5", ok ? "text-success-ink" : "text-muted")}>
                {ok ? <Check className="size-3.5" strokeWidth={1.75} aria-hidden="true" /> : <Minus className="size-3.5" strokeWidth={1.75} aria-hidden="true" />}
                {rule.label}
                <span className="sr-only">{ok ? " : respecté" : " : non respecté"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
