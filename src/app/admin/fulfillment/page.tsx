import { PageHeader, StatusPill } from "@/components/admin/ui";
import { RerouteForm } from "@/components/admin/RerouteForm";
import { FailedLineActions } from "@/components/admin/FailedLineActions";
import { listAdminFulfillments } from "@/lib/fulfillment/queries";
import { getDistributors } from "@/lib/queries";
import { fetchAdminProducts } from "@/lib/admin/actions";
import { formatINR } from "@/lib/utils";

export const metadata = {
  title: "Fulfillment",
  robots: { index: false },
};

export default async function AdminFulfillmentPage() {
  const [fulfillments, distributors, products] = await Promise.all([
    listAdminFulfillments(),
    getDistributors(),
    fetchAdminProducts(),
  ]);

  const open = fulfillments.filter((f) =>
    ["pending", "offered", "failed", "rejected", "waiting"].includes(f.status)
  );
  const rest = fulfillments.filter(
    (f) =>
      !["pending", "offered", "failed", "rejected", "waiting"].includes(f.status)
  );

  const distOptions = distributors.map((d) => ({ id: d.id, name: d.name }));
  const productOptions = products.slice(0, 200).map((p) => ({
    id: p.id,
    title: p.title,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fulfillment"
        description="If no partner has stock we wait 2 days, then you refund or send a substitute. Customer price stays locked."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Needs attention ({open.length})</h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted">No open assignments.</p>
        ) : (
          <ul className="space-y-4">
            {open.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {f.productTitle ?? "Product"} × {f.quantity}
                    </p>
                    <p className="text-xs text-muted">
                      Order {f.orderNumber ?? f.orderId.slice(0, 8)} ·{" "}
                      {f.distributorName ?? "Unassigned"} · attempt{" "}
                      {f.attemptNumber}/{f.maxAttempts}
                    </p>
                    <p className="mt-1 text-sm">
                      Customer {formatINR(f.customerUnitPrice)}
                      {f.supplierUnitCost != null
                        ? ` · cost ${formatINR(f.supplierUnitCost)}`
                        : ""}
                      {f.costVariance !== 0
                        ? ` · variance ${formatINR(f.costVariance)}`
                        : ""}
                    </p>
                    {f.rejectReason ? (
                      <p className="mt-1 text-xs text-danger">
                        Reason: {f.rejectReason}
                      </p>
                    ) : null}
                    {f.status === "waiting" && f.waitingUntil ? (
                      <p className="mt-1 text-xs text-accent">
                        Holding for stock until{" "}
                        {new Date(f.waitingUntil).toLocaleString("en-IN")}.
                      </p>
                    ) : null}
                    {f.status === "failed" ? (
                      <p className="mt-1 text-xs text-danger">
                        Wait ended. Refund this line or send a substitute.
                      </p>
                    ) : null}
                  </div>
                  <StatusPill
                    tone={
                      f.status === "failed"
                        ? "danger"
                        : f.status === "waiting"
                          ? "accent"
                          : "accent"
                    }
                  >
                    {f.status}
                  </StatusPill>
                </div>
                {["offered", "pending", "failed", "rejected", "waiting"].includes(
                  f.status
                ) ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <RerouteForm
                      fulfillmentId={f.id}
                      distributors={distOptions}
                    />
                  </div>
                ) : null}
                {f.status === "failed" ? (
                  <FailedLineActions
                    fulfillmentId={f.id}
                    products={productOptions}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent ({rest.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Distributor</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rest.slice(0, 40).map((f) => (
                <tr key={f.id} className="border-b border-border/70">
                  <td className="px-3 py-2">{f.orderNumber ?? "—"}</td>
                  <td className="px-3 py-2">
                    {f.productTitle ?? "—"} × {f.quantity}
                  </td>
                  <td className="px-3 py-2">{f.distributorName ?? "—"}</td>
                  <td className="px-3 py-2">{f.status}</td>
                  <td className="px-3 py-2">
                    {formatINR(f.customerUnitPrice)}
                  </td>
                  <td className="px-3 py-2">
                    {f.supplierUnitCost != null
                      ? formatINR(f.supplierUnitCost)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
