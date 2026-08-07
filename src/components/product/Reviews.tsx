import { CheckCircle2 } from "lucide-react";
import type { Product, Review } from "@/types";
import { StarRow } from "@/components/ui/Rating";
import { formatDate } from "@/lib/utils";

export function Reviews({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct:
      star === Math.round(product.rating)
        ? 62
        : Math.max(4, 30 - Math.abs(star - product.rating) * 12),
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold">{product.rating.toFixed(1)}</span>
          <div>
            <StarRow value={product.rating} />
            <p className="text-sm text-muted">
              {product.reviewCount.toLocaleString("en-IN")} ratings
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted">{d.star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-[var(--color-rating)]"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-5 last:border-0">
            <div className="flex items-center gap-2">
              <StarRow value={r.rating} size={14} />
              <span className="font-semibold">{r.title}</span>
            </div>
            <p className="mt-1.5 text-sm text-foreground">{r.body}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <span className="font-medium">{r.userName}</span>
              <span>·</span>
              <span>{formatDate(r.createdAt)}</span>
              {r.verified && (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckCircle2 size={12} /> Verified Purchase
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
