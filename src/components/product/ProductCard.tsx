"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Price } from "@/components/ui/Price";
import { StarRow } from "@/components/ui/Rating";
import { discountPercent, cn } from "@/lib/utils";
import { brands } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/store/toast";

export function ProductCard({ product }: { product: Product }) {
  const brandName =
    product.brandName ??
    brands.find((b) => b.id === product.brandId)?.name;
  const off = discountPercent(product.mrp, product.price);
  const defaultVariant =
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

  const addToCart = useCart((s) => s.add);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const inWishlist = useWishlist((s) => s.ids.includes(product.id));
  const pushToast = useToast((s) => s.push);

  const outOfStock = product.stockStatus === "out_of_stock";

  return (
    <div className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
          onClick={() => {
            toggleWishlist(product.id);
            pushToast(inWishlist ? "Removed from wishlist" : "Added to wishlist", "info");
          }}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-muted backdrop-blur transition-colors hover:text-danger"
        >
          <Heart size={17} className={cn(inWishlist && "fill-danger text-danger")} />
        </button>

        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
              -{off}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="w-fit rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              New
            </span>
          )}
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <div className="transition-transform duration-500 group-hover:scale-[1.04]">
            <SmartImage
              src={image?.url ?? ""}
              alt={image?.alt ?? product.title}
            />
          </div>
        </Link>

        <div className="absolute inset-x-2.5 bottom-2.5 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              addToCart({
                productId: product.id,
                variantId: defaultVariant.id,
                quantity: 1,
              });
              pushToast("Added to cart");
            }}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-semibold shadow-sm transition-colors",
              outOfStock
                ? "cursor-not-allowed bg-surface text-muted"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
          >
            <ShoppingBag size={16} />
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        {brandName && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {brandName}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug transition-colors hover:text-accent">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5">
          <StarRow value={product.rating} size={13} />
          <span className="text-xs text-muted">({product.reviewCount})</span>
        </div>
        <Price price={product.price} mrp={product.mrp} size="sm" className="mt-0.5" />
        {product.stockStatus === "low_stock" && (
          <span className="text-xs font-medium text-warning">Only a few left</span>
        )}
      </div>
    </div>
  );
}
