import { formatINR } from "@/lib/utils";
import type { CartTotals } from "@/lib/cart";

export function SummaryRows({ totals }: { totals: CartTotals }) {
  return (
    <div className="space-y-2 border-t border-border pt-4 text-sm">
      <Row label={`Subtotal (${totals.itemCount} items)`} value={formatINR(totals.subtotal)} />
      {totals.savings > 0 && (
        <Row label="Product savings" value={`- ${formatINR(totals.savings)}`} tone="success" />
      )}
      {totals.discount > 0 && (
        <Row label="Coupon discount" value={`- ${formatINR(totals.discount)}`} tone="success" />
      )}
      <Row
        label="Shipping"
        value={totals.shipping === 0 ? "FREE" : formatINR(totals.shipping)}
        tone={totals.shipping === 0 ? "success" : undefined}
      />
      <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
        <span>Total</span>
        <span>{formatINR(totals.total)}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={tone === "success" ? "font-medium text-success" : ""}>
        {value}
      </span>
    </div>
  );
}
