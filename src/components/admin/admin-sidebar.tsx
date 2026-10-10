"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav aria-label="Administration" className="flex flex-col gap-6">
      {adminNav.map((group) => (
        <div key={group.title}>
          <p className="px-2.5 text-[12px] font-medium text-muted">{group.title}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex rounded-brand px-2.5 py-1.5 text-sm transition-colors",
                      isActive(item.href) ? "bg-surface font-medium text-ink shadow-panel" : "text-ink/75 hover:bg-ink/5 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-disabled="true" className="flex items-center justify-between rounded-brand px-2.5 py-1.5 text-sm text-muted">
                    {item.label}
                    <span className="text-[11px]">Bientôt</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
