import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/primitives";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square rounded-[var(--radius-card)]" />
          <div className="space-y-2 pt-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal scroll row for home page carousels. */
export function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:gap-4">
      {products.map((p) => (
        <div key={p.id} className="w-40 shrink-0 snap-start sm:w-56">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
