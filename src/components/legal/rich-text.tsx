import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Affiche un texte au format simplifié (titres « ## », listes « - », **gras**, [liens](/chemin))
 * sous forme d'éléments React. Aucun HTML brut n'est interprété : pas de risque d'injection.
 */
export function RichText({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-ink/85">
      {blocks.map((block, i) => renderBlock(block.trim(), i))}
    </div>
  );
}

function renderBlock(block: string, key: number): ReactNode {
  if (!block) return null;
  if (block.startsWith("## ")) {
    return (
      <h2 key={key} className="mt-6 text-lg font-semibold text-ink first:mt-0">
        {renderInline(block.slice(3))}
      </h2>
    );
  }
  const lines = block.split("\n");
  if (lines.every((l) => l.startsWith("- "))) {
    return (
      <ul key={key} className="flex list-disc flex-col gap-1.5 pl-5 marker:text-muted">
        {lines.map((l, j) => (
          <li key={j}>{renderInline(l.slice(2))}</li>
        ))}
      </ul>
    );
  }
  return <p key={key}>{renderInline(lines.join(" "))}</p>;
}

const inlinePattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\[À COMPLÉTER[^\]]*\])/g;

function renderInline(text: string): ReactNode[] {
  return text.split(inlinePattern).map((part, i) => {
    if (part.startsWith("[À COMPLÉTER")) {
      return (
        <mark key={i} className="rounded-brand bg-[#FFFBEB] px-1 text-warning-ink">
          {part}
        </mark>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/") && !href.startsWith("//")) {
        return (
          <Link key={i} href={href} className="text-primary underline underline-offset-2 hover:text-primary-hover">
            {label}
          </Link>
        );
      }
      if (href.startsWith("https://")) {
        return (
          <a key={i} href={href} rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            {label}
          </a>
        );
      }
      return <span key={i}>{label}</span>;
    }
    return part;
  });
}
