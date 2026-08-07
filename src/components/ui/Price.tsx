import { discountPercent, formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { price: "text-base", mrp: "text-xs", off: "text-xs" },
  md: { price: "text-lg", mrp: "text-sm", off: "text-sm" },
  lg: { price: "text-2xl", mrp: "text-base", off: "text-sm" },
};

export function Price({ price, mrp, size = "md", className }: PriceProps) {
  const off = discountPercent(mrp, price);
  const s = sizeMap[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-bold text-foreground", s.price)}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-muted line-through", s.mrp)}>
            {formatINR(mrp)}
          </span>
          <span className={cn("font-semibold text-success", s.off)}>
            {off}% off
          </span>
        </>
      )}
    </div>
  );
}
