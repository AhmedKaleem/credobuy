import { BadgeCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const points = [
  {
    icon: BadgeCheck,
    title: "100% Genuine",
    text: "Sourced directly from brands and authorised distributors.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "1–3 day delivery across Tamil Nadu, nationwide shipping.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    text: "7-day hassle-free returns on eligible products.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Protected payments and clear warranty on every order.",
  },
];

export function WhyShop() {
  return (
    <section aria-label="Why shop with CredoBuy">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {points.map((p) => (
          <div
            key={p.title}
            className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <p.icon size={22} />
            </span>
            <h3 className="mt-3 font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
