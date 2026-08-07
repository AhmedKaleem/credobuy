"use client";

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { useOrders } from "@/store/orders";
import { deriveStatus, STATUS_LABELS, statusTone } from "@/lib/orders";
import { formatINR, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const orders = useOrders((s) => s.orders);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order it will appear here for tracking."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = deriveStatus(order);
            return (
              <Link
                key={order.orderNumber}
                href={`/track/${order.orderNumber}`}
                className="block rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <p className="text-sm font-semibold">#{order.orderNumber}</p>
                    <p className="text-xs text-muted">
                      Placed on {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(status)}>{STATUS_LABELS[status]}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="h-12 w-12 overflow-hidden rounded-lg border-2 border-surface"
                      >
                        <SmartImage src={item.imageUrl} alt={item.title} />
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">
                      {order.items[0]?.title}
                      {order.items.length > 1 &&
                        ` + ${order.items.length - 1} more`}
                    </p>
                    <p className="font-semibold">{formatINR(order.total)}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
