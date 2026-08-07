"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

export function FrequentlyBought({
  main,
  companions,
}: {
  main: Product;
  companions: Product[];
}) {
  const items = [main, ...companions];
  const [selected, setSelected] = useState<Set<string>>(
    new Set(items.map((p) => p.id))
  );
  const addToCart = useCart((s) => s.add);
  const pushToast = useToast((s) => s.push);

  const total = items
    .filter((p) => selected.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addAll() {
    items
      .filter((p) => selected.has(p.id))
      .forEach((p) => {
        const v = p.variants.find((x) => x.isDefault) ?? p.variants[0];
        addToCart({ productId: p.id, variantId: v.id, quantity: 1 });
      });
    pushToast(`${selected.size} items added to cart`);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              {i > 0 && <Plus size={18} className="text-muted" />}
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="absolute left-1.5 top-1.5 z-10 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span className="block h-20 w-20 overflow-hidden rounded-xl border border-border">
                  <SmartImage src={p.images[0].url} alt={p.title} />
                </span>
              </label>
            </div>
          ))}
        </div>
        <div className="lg:text-right">
          <p className="text-sm text-muted">
            Total for {selected.size} {selected.size === 1 ? "item" : "items"}
          </p>
          <p className="text-xl font-bold">{formatINR(total)}</p>
          <Button className="mt-2" onClick={addAll} disabled={selected.size === 0}>
            Add selected to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
