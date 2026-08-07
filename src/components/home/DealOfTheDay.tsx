"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Rating } from "@/components/ui/Rating";
import { discountPercent, formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useMounted } from "@/hooks/useMounted";

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DealOfTheDay({
  product,
  headline,
  subtitle,
}: {
  product: Product;
  headline?: string;
  subtitle?: string;
}) {
  const mounted = useMounted();
  const [now, setNow] = useState(() => Date.now());
  const addToCart = useCart((s) => s.add);
  const pushToast = useToast((s) => s.push);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(0, endOfToday() - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const off = discountPercent(product.mrp, product.price);
  const variant =
    product.variants.find((v) => v.isDefault) ??
    product.variants[0] ?? {
      id: `${product.id}-default`,
      productId: product.id,
      sku: product.slug,
      name: "Default",
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      isDefault: true,
    };
  const image = product.images[0];
  const soldPct = 68;

  return (
    <section
      aria-label="Deal of the day"
      className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface"
    >
      <div className="flex flex-col gap-0 md:flex-row">
        <div className="flex flex-col justify-center gap-3 bg-secondary p-6 text-white md:w-72">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Flame size={14} /> Deal of the Day
          </span>
          <h2 className="text-2xl font-bold leading-tight">
            {headline ?? `Save ${off}% today only`}
          </h2>
          {subtitle ? (
            <p className="text-sm text-white/85">{subtitle}</p>
          ) : null}
          <p className="text-sm text-white/85">Hurry, offer ends in:</p>
          <div className="flex gap-2">
            {[
              { v: hours, l: "Hrs" },
              { v: minutes, l: "Min" },
              { v: seconds, l: "Sec" },
            ].map((t) => (
              <div key={t.l} className="rounded-lg bg-white/15 px-3 py-2 text-center">
                <span className="block text-xl font-bold tabular-nums">
                  {mounted ? pad(t.v) : "--"}
                </span>
                <span className="text-[10px] uppercase text-white/80">{t.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-5 p-6 sm:flex-row">
          <Link
            href={`/product/${product.slug}`}
            className="h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border"
          >
            <SmartImage
              src={image?.url ?? ""}
              alt={image?.alt ?? product.title}
            />
          </Link>
          <div className="flex-1 text-center sm:text-left">
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-lg font-semibold hover:text-primary">
                {product.title}
              </h3>
            </Link>
            <div className="mt-1 flex justify-center sm:justify-start">
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-2 sm:justify-start">
              <span className="text-2xl font-bold text-primary">
                {formatINR(product.price)}
              </span>
              <span className="text-sm text-muted line-through">
                {formatINR(product.mrp)}
              </span>
              <span className="text-sm font-semibold text-success">{off}% off</span>
            </div>

            <div className="mt-3 max-w-xs">
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${soldPct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {soldPct}% claimed — going fast!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                addToCart({ productId: product.id, variantId: variant.id, quantity: 1 });
                pushToast("Added to cart");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
