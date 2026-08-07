import type { Order, OrderStatus, OrderTimelineEntry } from "@/types";

export const ORDER_FLOW: { status: OrderStatus; label: string }[] = [
  { status: "confirmed", label: "Order Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** Build a delivery timeline, marking steps done up to the current status. */
export function buildTimeline(
  current: OrderStatus,
  placedAt: string
): OrderTimelineEntry[] {
  const currentIndex = ORDER_FLOW.findIndex((s) => s.status === current);
  const base = new Date(placedAt).getTime();
  return ORDER_FLOW.map((step, i) => {
    const done = i <= currentIndex;
    return {
      status: step.status,
      label: step.label,
      at: done ? new Date(base + i * 86_400_000).toISOString() : null,
      done,
    };
  });
}

/** Estimated delivery date string. */
export function estimatedDelivery(placedAt: string): string {
  const d = new Date(placedAt);
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function statusTone(
  status: OrderStatus
): "success" | "accent" | "danger" | "primary" {
  if (status === "delivered") return "success";
  if (status === "cancelled" || status === "returned") return "danger";
  if (status === "out_for_delivery" || status === "shipped") return "accent";
  return "primary";
}

/** For the demo: derive a plausible current status from the order age. */
export function deriveStatus(order: Order): OrderStatus {
  if (order.status === "cancelled" || order.status === "returned") {
    return order.status;
  }
  const ageDays = Math.floor(
    (Date.now() - new Date(order.placedAt).getTime()) / 86_400_000
  );
  const index = Math.min(ageDays, ORDER_FLOW.length - 1);
  return ORDER_FLOW[index].status;
}
