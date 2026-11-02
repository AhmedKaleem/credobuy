import { PageHeader, Card, Table, StatusPill } from "@/components/admin/ui";
import { LogisticsForm } from "@/components/admin/LogisticsForm";
import { listAdminOrders } from "@/lib/admin/live";
import { adminOrders } from "@/data/admin";
import { STATUS_LABELS, statusTone } from "@/lib/orders";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Order Management", robots: { index: false } };

export default async function AdminOrdersPage() {
  const live = await listAdminOrders();
  const rows = live.length
    ? live
    : adminOrders.map((o) => ({
        id: o.orderNumber,
        orderNumber: o.orderNumber,
        customer: o.customer,
        city: o.city,
        itemCount: o.items,
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: "paid" as const,
        placedAt: o.placedAt,
      }));

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Live orders, status, and logistics tracking."
      />
      <Card className="overflow-hidden">
        <Table
          head={[
            "Order",
            "Customer",
            "City",
            "Items",
            "Payment",
            "Total",
            "Status",
            "Logistics",
          ]}
        >
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3">
                <p className="font-medium">#{o.orderNumber}</p>
                <p className="text-xs text-muted">{formatDate(o.placedAt)}</p>
              </td>
              <td className="px-4 py-3">{o.customer}</td>
              <td className="px-4 py-3 text-muted">{o.city}</td>
              <td className="px-4 py-3">{o.itemCount}</td>
              <td className="px-4 py-3">
                <StatusPill tone={o.paymentMethod === "cod" ? "muted" : "success"}>
                  {o.paymentMethod === "cod" ? "COD" : "Prepaid"}
                </StatusPill>
              </td>
              <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
              <td className="px-4 py-3">
                <StatusPill tone={statusTone(o.status)}>
                  {STATUS_LABELS[o.status]}
                </StatusPill>
              </td>
              <td className="px-4 py-3">
                {"trackingNumber" in o ? (
                  <LogisticsForm
                    orderId={o.id}
                    status={o.status}
                    carrier={o.carrier}
                    trackingNumber={o.trackingNumber}
                  />
                ) : (
                  <span className="text-xs text-muted">Demo data</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
