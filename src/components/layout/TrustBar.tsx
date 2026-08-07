import { RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";

const items = [
  { icon: Truck, title: "Free express shipping", text: "On all orders over ₹499" },
  { icon: ShieldCheck, title: "2-year warranty", text: "Backed on every product" },
  { icon: RotateCcw, title: "30-day returns", text: "No-questions-asked" },
  { icon: Sparkles, title: "100% genuine", text: "Sourced from brands" },
];

export function TrustBar({ bordered = true }: { bordered?: boolean }) {
  return (
    <section
      aria-label="Why shop with CredoBuy"
      className={
        bordered
          ? "grid grid-cols-2 gap-x-6 gap-y-6 rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8 lg:grid-cols-4"
          : "grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4"
      }
    >
      {items.map((it) => (
        <div key={it.title} className="flex items-start gap-3">
          <it.icon size={22} strokeWidth={1.6} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold leading-tight">{it.title}</p>
            <p className="mt-0.5 text-xs text-muted">{it.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
