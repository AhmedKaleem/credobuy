import { Badge } from "@/components/ui/primitives";
import { AssignmentActions } from "@/components/distributor/AssignmentActions";
import { listDistributorFulfillments } from "@/lib/fulfillment/queries";
import { formatINR } from "@/lib/utils";
import type { FulfillmentStatus } from "@/types";

export const metadata = {
  title: "Distributor Assignments",
  robots: { index: false },
};

const statusTone: Record<
  FulfillmentStatus,
  "primary" | "success" | "accent" | "danger" | "muted"
> = {
  pending: "muted",
  offered: "accent",
  accepted: "success",
  rejected: "danger",
  expired: "danger",
  cancelled: "muted",
  packed: "primary",
  shipped: "primary",
  delivered: "success",
  failed: "danger",
};

export default async function DistributorHomePage() {
  const offered = await listDistributorFulfillments(["offered"]);
  const active = await listDistributorFulfillments([
    "accepted",
    "packed",
    "shipped",
  ]);

  return (
    <div className="space-y-7 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Accept to commit stock. Reject releases stock and notifies the next
          distributor. Customer price stays locked.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold sm:text-lg">
          Awaiting your response ({offered.length})
        </h2>
        {offered.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            No open offers right now. When WhatsApp notifies you, tap Visit
            website — you&apos;ll land here if you stayed signed in.
          </p>
        ) : (
          <ul className="space-y-3">
            {offered.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-base font-semibold leading-snug">
                      {f.productTitle ?? "Product"} × {f.quantity}
                    </p>
                    <p className="text-xs text-muted">
                      Order {f.orderNumber ?? f.orderId.slice(0, 8)} · attempt{" "}
                      {f.attemptNumber}/{f.maxAttempts}
                    </p>
                    <p className="text-sm">
                      Customer paid{" "}
                      <strong>{formatINR(f.customerUnitPrice)}</strong>
                      {f.supplierUnitCost != null ? (
                        <>
                          {" "}
                          · your cost{" "}
                          <strong>{formatINR(f.supplierUnitCost)}</strong>
                        </>
                      ) : null}
                    </p>
                    {f.slaDeadline ? (
                      <p className="text-xs text-muted">
                        Respond by {new Date(f.slaDeadline).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone={statusTone[f.status]}>{f.status}</Badge>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <AssignmentActions fulfillmentId={f.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold sm:text-lg">
          In progress ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted">Nothing in progress.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {active.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm"
              >
                <span className="min-w-0 leading-snug">
                  {f.productTitle ?? "Product"} × {f.quantity}
                  <span className="mt-0.5 block text-xs text-muted">
                    {f.orderNumber ?? "Order"}
                  </span>
                </span>
                <Badge tone={statusTone[f.status]}>{f.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
