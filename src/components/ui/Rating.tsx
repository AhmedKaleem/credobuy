import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

export function Rating({ value, count, size = 14, className }: RatingProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-xs font-semibold text-white">
        {value.toFixed(1)}
        <Star size={size - 3} className="fill-white" />
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-muted">
          ({count.toLocaleString("en-IN")})
        </span>
      )}
    </span>
  );
}

export function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(value)
              ? "fill-[var(--color-rating)] text-[var(--color-rating)]"
              : "text-border"
          )}
        />
      ))}
    </span>
  );
}
