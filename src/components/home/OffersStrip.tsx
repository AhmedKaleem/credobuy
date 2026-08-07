import { CreditCard, Landmark, Percent, Wallet, type LucideIcon } from "lucide-react";
import type { Promotion } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Landmark,
  Wallet,
  Percent,
  CreditCard,
};

export function OffersStrip({ offers }: { offers: Promotion[] }) {
  if (!offers.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {offers.map((o) => {
        const Icon = (o.icon && iconMap[o.icon]) || Percent;
        return (
          <div
            key={o.id}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {o.title ?? o.message}
              </p>
              {o.title ? (
                <p className="text-xs text-muted">{o.message}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
