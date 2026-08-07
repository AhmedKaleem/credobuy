"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { buttonStyles } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/primitives";
import { SummaryRows } from "@/components/cart/SummaryRows";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useMounted } from "@/hooks/useMounted";
import {
  computeTotals,
  type ResolvedCartItem,
} from "@/lib/cart";
import {
  findCouponAction,
  resolveCartItemsAction,
} from "@/lib/query-actions";
import { formatINR } from "@/lib/utils";
import type { Coupon } from "@/types";

export default function CartPage() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const pushToast = useToast((s) => s.push);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [resolved, setResolved] = useState<ResolvedCartItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    resolveCartItemsAction(items).then((rows) => {
      if (!cancelled) setResolved(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const totals = computeTotals(resolved, coupon);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const found = await findCouponAction(couponCode.trim());
    if (!found) {
      pushToast("Invalid coupon code", "error");
      return;
    }
    if (totals.subtotal < found.minOrder) {
      pushToast(
        `Add ${formatINR(found.minOrder - totals.subtotal)} more to use ${found.code}`,
        "error"
      );
      return;
    }
    setCoupon(found);
    pushToast(`Coupon ${found.code} applied`);
  }

  if (!mounted) {
    return (
      <Container className="py-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
        Your Cart{" "}
        {totals.itemCount > 0 && (
          <span className="text-lg font-normal text-muted">
            ({totals.itemCount} items)
          </span>
        )}
      </h1>

      {resolved.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our accessories and find something you love."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {resolved.map(({ product, variant, quantity }) => (
              <div
                key={variant.id}
                className="flex gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-3 sm:p-4"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border"
                >
                  <SmartImage src={product.images[0].url} alt={product.title} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => {
                        remove(variant.id);
                        pushToast("Removed from cart", "info");
                      }}
                      className="text-muted hover:text-danger"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {product.variants.length > 1 && (
                    <p className="text-xs text-muted">{variant.name}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QuantityStepper
                      value={quantity}
                      size="sm"
                      max={Math.max(1, Math.min(10, product.stock))}
                      onChange={(q) => setQuantity(variant.id, q)}
                    />
                    <span className="font-semibold">
                      {formatINR(variant.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-surface p-5">
              <h2 className="text-lg font-bold">Order Summary</h2>

              <form onSubmit={applyCoupon} className="space-y-2">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-[var(--radius-button)] bg-success-soft px-3 py-2 text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-success">
                      <Tag size={14} /> {coupon.code} applied
                    </span>
                    <button
                      type="button"
                      aria-label="Remove coupon"
                      onClick={() => {
                        setCoupon(null);
                        setCouponCode("");
                      }}
                      className="text-muted hover:text-danger"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-[var(--radius-button)] bg-primary-soft px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted">
                  Try <button type="button" className="font-semibold text-primary" onClick={() => setCouponCode("CREDO10")}>CREDO10</button> for 10% off
                </p>
              </form>

              <SummaryRows totals={totals} />

              <Link href="/checkout" className={`${buttonStyles("primary", "lg")} w-full`}>
                Proceed to Checkout
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm font-medium text-primary hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
