"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductGrid";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/hooks/useMounted";
import { fetchProductsByIdsAction } from "@/lib/query-actions";
import type { Product } from "@/types";

export default function WishlistPage() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const [wished, setWished] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsByIdsAction(ids)
      .then((rows) => {
        if (!cancelled) setWished(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        My Wishlist{" "}
        {mounted && wished.length > 0 && (
          <span className="text-lg font-normal text-muted">
            ({wished.length})
          </span>
        )}
      </h1>

      {!mounted || loading ? (
        <ProductGridSkeleton count={4} />
      ) : wished.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          actionLabel="Explore products"
          actionHref="/shop"
        />
      ) : (
        <ProductGrid products={wished} />
      )}
    </div>
  );
}
