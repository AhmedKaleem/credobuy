import Link from "next/link";
import { Droplets, Layers, ShieldCheck } from "lucide-react";

const highlights = [
  {
    tag: "Drop-tested",
    name: "AirShock™ Protection",
    text: "Impact-absorbing corners tested to survive 3m drops without adding bulk.",
    icon: Layers,
    href: "/category/cases-and-covers",
  },
  {
    tag: "Zero-yellowing",
    name: "ClearGuard™ Coating",
    text: "UV-stable clear cases and tempered glass that stay crystal clear for years.",
    icon: Droplets,
    href: "/category/screen-protectors",
  },
  {
    tag: "Fast & safe",
    name: "GaN Rapid Charge",
    text: "Compact GaN chargers deliver up to 120W with temperature-smart safety.",
    icon: ShieldCheck,
    href: "/category/chargers",
  },
];

export function TechHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {highlights.map((h) => (
        <Link
          key={h.name}
          href={h.href}
          className="group flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-7 transition-colors hover:border-primary"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <h.icon size={22} strokeWidth={1.7} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {h.tag}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold">{h.name}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{h.text}</p>
          <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">
            Learn more →
          </span>
        </Link>
      ))}
    </div>
  );
}
