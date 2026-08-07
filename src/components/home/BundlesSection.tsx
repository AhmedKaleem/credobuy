"use client";

import Link from "next/link";
import { PackagePlus } from "lucide-react";
import type { Product } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

interface BundleDef {
  id: string;
  title: string;
  /** Keyword matchers against productType / categoryId / subCategory. */
  pickers: Array<(p: Product) => boolean>;
}

function haystack(p: Product): string {
  return `${p.productType} ${p.categoryId} ${p.subCategory} ${p.productCategory}`.toLowerCase();
}

function isPhoneCase(p: Product): boolean {
  const h = haystack(p);
  return (
    h.includes("phone case") ||
    (h.includes("case") && p.categoryId === "cat-cases" && !h.includes("airpods") && !h.includes("earbud") && !h.includes("ipad"))
  );
}

function isScreenProtector(p: Product): boolean {
  const h = haystack(p);
  return h.includes("screen protector") || h.includes("tempered glass");
}

function isCharger(p: Product): boolean {
  const h = haystack(p);
  return (
    (h.includes("charger") || h.includes("wireless charger") || p.categoryId === "cat-chargers") &&
    !h.includes("power bank") &&
    !h.includes("cable")
  );
}

function isPowerBank(p: Product): boolean {
  const h = haystack(p);
  return h.includes("power bank") || p.categoryId === "cat-powerbanks";
}

function isCable(p: Product): boolean {
  const h = haystack(p);
  return h.includes("cable") || p.categoryId === "cat-cables";
}

const bundleDefs: BundleDef[] = [
  {
    id: "bundle-essentials",
    title: "Phone Essentials Kit",
    pickers: [isPhoneCase, isScreenProtector, isCharger],
  },
  {
    id: "bundle-travel",
    title: "Travel Power Kit",
    pickers: [isPowerBank, isCable, isCharger],
  },
  {
    id: "bundle-charge",
    title: "Charge & Protect Pack",
    pickers: [isPhoneCase, isCable, isPowerBank],
  },
];

function pickDistinct(
  products: Product[],
  pickers: Array<(p: Product) => boolean>,
  usedIds: Set<string>
): Product[] {
  const items: Product[] = [];
  for (const match of pickers) {
    const found = products.find((p) => !usedIds.has(p.id) && match(p));
    if (found) {
      items.push(found);
      usedIds.add(found.id);
    }
  }
  return items;
}

export function BundlesSection({ products }: { products: Product[] }) {
  const addToCart = useCart((s) => s.add);
  const pushToast = useToast((s) => s.push);
  const usedIds = new Set<string>();

  const bundles = bundleDefs
    .map((def) => {
      const items = pickDistinct(products, def.pickers, usedIds);
      const total = items.reduce((sum, p) => sum + p.price, 0);
      const mrpTotal = items.reduce((sum, p) => sum + p.mrp, 0);
      const bundlePrice = Math.round(total * 0.92); // extra 8% bundle discount
      return { def, items, bundlePrice, mrpTotal };
    })
    .filter((b) => b.items.length >= 2);

  if (bundles.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {bundles.map(({ def, items, bundlePrice, mrpTotal }) => (
        <div
          key={def.id}
          className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <PackagePlus size={18} />
            {def.title}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {items.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-lg text-muted">+</span>}
                <Link
                  href={`/product/${p.slug}`}
                  className="h-16 w-16 overflow-hidden rounded-xl border border-border"
                >
                  <SmartImage src={p.images[0].url} alt={p.title} />
                </Link>
              </div>
            ))}
          </div>
          <ul className="mt-4 flex-1 space-y-1 text-sm text-muted">
            {items.map((p) => (
              <li key={p.id} className="line-clamp-2">
                • {p.title}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">{formatINR(bundlePrice)}</span>
              <span className="ml-2 text-sm text-muted line-through">
                {formatINR(mrpTotal)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              items.forEach((p) => {
                const v = p.variants.find((x) => x.isDefault) ?? p.variants[0];
                addToCart({ productId: p.id, variantId: v.id, quantity: 1 });
              });
              pushToast("Bundle added to cart");
            }}
            className="mt-3 h-10 rounded-[var(--radius-button)] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add bundle to cart
          </button>
        </div>
      ))}
    </div>
  );
}
