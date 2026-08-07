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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="mt-1 text-sm text-muted">
          Accept to commit stock. Reject releases stock and auto-routes to the
          next distributor. Customer price stays locked.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Awaiting your response ({offered.length})
        </h2>
        {offered.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            No open offers right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {offered.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {f.productTitle ?? "Product"} × {f.quantity}
                    </p>
                    <p className="text-xs text-muted">
                      Order {f.orderNumber ?? f.orderId.slice(0, 8)} · attempt{" "}
                      {f.attemptNumber}/{f.maxAttempts}
                    </p>
                    <p className="mt-1 text-sm">
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
                      <p className="mt-1 text-xs text-muted">
                        Respond by {new Date(f.slaDeadline).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone={statusTone[f.status]}>{f.status}</Badge>
                </div>
                <div className="mt-3">
                  <AssignmentActions fulfillmentId={f.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">In progress ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted">Nothing in progress.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {active.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {f.productTitle ?? "Product"} × {f.quantity} ·{" "}
                  {f.orderNumber ?? "Order"}
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
