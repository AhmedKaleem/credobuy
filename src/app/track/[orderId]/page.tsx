"use client";

import { use } from "react";
import { CheckCircle2, Circle, MapPin, PackageX } from "lucide-react";
import { Container, Badge, Skeleton } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";
import { useOrders } from "@/store/orders";
import { useMounted } from "@/hooks/useMounted";
import {
  buildTimeline,
  deriveStatus,
  estimatedDelivery,
  STATUS_LABELS,
  statusTone,
} from "@/lib/orders";
import { formatINR, formatDate, cn } from "@/lib/utils";

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const mounted = useMounted();
  const getByNumber = useOrders((s) => s.getByNumber);

  if (!mounted) {
    return (
      <Container className="py-6">
        <Skeleton className="h-96" />
      </Container>
    );
  }

  const order = getByNumber(orderId);

  if (!order) {
    return (
      <Container className="py-6">
        <EmptyState
          icon={PackageX}
          title="Order not found"
          description={`We couldn't find order #${orderId}. Check the number and try again.`}
          actionLabel="Track another order"
          actionHref="/track"
        />
      </Container>
    );
  }

  const status = deriveStatus(order);
  const timeline = buildTimeline(status, order.placedAt);

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Track Order", href: "/track" },
          { label: `#${order.orderNumber}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-sm text-muted">
                  Placed on {formatDate(order.placedAt)}
                </p>
              </div>
              <Badge tone={statusTone(status)}>{STATUS_LABELS[status]}</Badge>
            </div>
            {status !== "delivered" && status !== "cancelled" && (
              <p className="mt-3 rounded-[var(--radius-button)] bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
                Arriving by {estimatedDelivery(order.placedAt)}
              </p>
            )}

            <ol className="mt-6 space-y-0">
              {timeline.map((step, i) => (
                <li key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {step.done ? (
                      <CheckCircle2 size={22} className="text-success" />
                    ) : (
                      <Circle size={22} className="text-border" />
                    )}
                    {i < timeline.length - 1 && (
                      <span
                        className={cn(
                          "w-0.5 flex-1",
                          step.done ? "bg-success" : "bg-border"
                        )}
                        style={{ minHeight: 32 }}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.done ? "text-foreground" : "text-muted"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.at && (
                      <p className="text-xs text-muted">{formatDate(step.at)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-3 font-semibold">Items in this order</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                    <SmartImage src={item.imageUrl} alt={item.title} />
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{item.title}</p>
                    <p className="text-xs text-muted">
                      Qty {item.quantity} · {formatINR(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <MapPin size={18} className="text-primary" /> Delivery address
            </h2>
            <p className="text-sm font-medium">{order.address.fullName}</p>
            <p className="text-sm text-muted">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""},{" "}
              {order.address.city}, {order.address.state} -{" "}
              {order.address.pincode}
            </p>
            <p className="text-sm text-muted">Phone: {order.address.phone}</p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
            <h2 className="mb-2 font-semibold">Payment summary</h2>
            <div className="flex justify-between py-1">
              <span className="text-muted">Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between py-1 text-success">
                <span>Discount</span>
                <span>- {formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-muted">Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
