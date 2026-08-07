"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { Container, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { useOrders } from "@/store/orders";
import { useMounted } from "@/hooks/useMounted";
import { estimatedDelivery } from "@/lib/orders";
import { formatINR } from "@/lib/utils";
import { PackageX } from "lucide-react";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const mounted = useMounted();
  const getByNumber = useOrders((s) => s.getByNumber);

  if (!mounted) {
    return <Skeleton className="mx-auto h-96 max-w-2xl" />;
  }

  const order = getByNumber(orderNumber);

  if (!order) {
    return (
      <EmptyState
        icon={PackageX}
        title="Order not found"
        description="We couldn't find this order. It may have been placed on another device."
        actionLabel="Go to My Orders"
        actionHref="/account/orders"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-success/30 bg-success-soft p-6 text-center sm:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Order placed successfully!</h1>
        <p className="mt-1 text-sm text-muted">
          Thank you, {order.address.fullName.split(" ")[0]}. Your order{" "}
          <span className="font-semibold text-foreground">
            #{order.orderNumber}
          </span>{" "}
          has been confirmed.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-medium">
          <Truck size={15} className="text-primary" />
          Estimated delivery by {estimatedDelivery(order.placedAt)}
        </p>
      </div>

      <div className="mt-4 rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Package size={18} className="text-primary" /> Order details
        </h2>
        <div className="mt-4 space-y-3">
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
              <span className="text-sm font-semibold">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-bold">
          <span>Total paid</span>
          <span>{formatINR(order.total)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Payment method:{" "}
          {order.paymentMethod === "cod"
            ? "Cash on Delivery"
            : "Online (Demo)"}{" "}
          · {order.paymentStatus === "paid" ? "Paid" : "Pending"}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/track/${order.orderNumber}`}
          className={`${buttonStyles("primary")} flex-1`}
        >
          Track Order
        </Link>
        <Link href="/shop" className={`${buttonStyles("outline")} flex-1`}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Container className="py-10">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl" />}>
        <OrderSuccessContent />
      </Suspense>
    </Container>
  );
}
