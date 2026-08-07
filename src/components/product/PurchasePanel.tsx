"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/store/toast";

export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const fallbackVariant = {
    id: `${product.id}-default`,
    productId: product.id,
    sku: product.slug,
    name: "Default",
    price: product.price,
    mrp: product.mrp,
    stock: product.stock,
    isDefault: true,
  };
  const initial =
    product.variants.find((v) => v.isDefault) ??
    product.variants[0] ??
    fallbackVariant;
  const [variantId, setVariantId] = useState(initial.id);
  const [qty, setQty] = useState(1);

  const variant =
    product.variants.find((v) => v.id === variantId) ??
    product.variants[0] ??
    fallbackVariant;

  const addToCart = useCart((s) => s.add);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) => s.ids.includes(product.id));
  const pushToast = useToast((s) => s.push);

  const outOfStock = product.stockStatus === "out_of_stock";

  function add() {
    addToCart({ productId: product.id, variantId: variant.id, quantity: qty });
    pushToast("Added to cart");
  }

  function buyNow() {
    addToCart({ productId: product.id, variantId: variant.id, quantity: qty });
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <Price price={variant.price} mrp={variant.mrp} size="lg" />
      <p className="text-xs text-muted">Inclusive of all taxes</p>

      {product.variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">
            Variant:{" "}
            <span className="font-normal text-muted">{variant.name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-[var(--radius-button)] border px-3.5 py-2 text-sm transition-colors",
                  v.id === variantId
                    ? "border-primary bg-primary-soft font-medium text-primary"
                    : "border-border hover:border-muted"
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Quantity</span>
        <QuantityStepper
          value={qty}
          onChange={setQty}
          max={Math.max(1, Math.min(10, product.stock))}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          size="lg"
          onClick={add}
          disabled={outOfStock}
        >
          <ShoppingCart size={18} />
          Add to Cart
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={buyNow}
          disabled={outOfStock}
        >
          <Zap size={18} />
          Buy Now
        </Button>
      </div>

      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
          pushToast(
            inWishlist ? "Removed from wishlist" : "Added to wishlist",
            "info"
          );
        }}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-danger"
      >
        <Heart size={18} className={cn(inWishlist && "fill-danger text-danger")} />
        {inWishlist ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    </div>
  );
}
