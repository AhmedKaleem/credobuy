"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Promotion } from "@/types";
import { cn } from "@/lib/utils";

export function AnnouncementBar({
  announcements,
}: {
  announcements: Promotion[];
}) {
  const items = announcements.length
    ? announcements
    : [
        {
          id: "fallback",
          placement: "announcement",
          message: "FREE express shipping on orders over ₹499",
          sortOrder: 0,
          isActive: true,
        } satisfies Promotion,
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      4000
    );
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="bg-secondary text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="hidden w-28 sm:block" aria-hidden />

        <div className="relative min-h-[1.25rem] flex-1 overflow-hidden text-center">
          {items.map((p, i) => {
            const className = cn(
              "text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-500",
              i === index
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-x-0 top-0 translate-y-1 opacity-0"
            );
            if (p.href) {
              return (
                <Link
                  key={p.id}
                  href={p.href}
                  className={cn(className, "hover:text-white/90")}
                  aria-hidden={i !== index}
                  tabIndex={i === index ? 0 : -1}
                >
                  {p.message}
                </Link>
              );
            }
            return (
              <p
                key={p.id}
                className={className}
                aria-hidden={i !== index}
              >
                {p.message}
              </p>
            );
          })}
        </div>

        <nav className="flex w-28 shrink-0 items-center justify-end gap-4 text-[11px] font-medium text-white/70">
          <Link href="/track" className="transition-colors hover:text-white">
            Track
          </Link>
          <Link
            href="/contact"
            className="hidden transition-colors hover:text-white sm:inline"
          >
            Help
          </Link>
        </nav>
      </div>
    </div>
  );
}
