import { PageHeader, Card, Table, StatusPill } from "@/components/admin/ui";
import { adminOrders } from "@/data/admin";
import { STATUS_LABELS, statusTone } from "@/lib/orders";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Order Management", robots: { index: false } };

export default function AdminOrdersPage() {
  return (
    <div>
      <PageHeader title="Orders" description="Manage and fulfil customer orders." />
      <Card className="overflow-hidden">
        <Table head={["Order", "Customer", "City", "Items", "Payment", "Total", "Status"]}>
          {adminOrders.map((o) => (
            <tr key={o.orderNumber}>
              <td className="px-4 py-3">
                <p className="font-medium">#{o.orderNumber}</p>
                <p className="text-xs text-muted">{formatDate(o.placedAt)}</p>
              </td>
              <td className="px-4 py-3">{o.customer}</td>
              <td className="px-4 py-3 text-muted">{o.city}</td>
              <td className="px-4 py-3">{o.items}</td>
              <td className="px-4 py-3">
                <StatusPill tone={o.paymentMethod === "cod" ? "muted" : "success"}>
                  {o.paymentMethod === "cod" ? "COD" : "Prepaid"}
                </StatusPill>
              </td>
              <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
              <td className="px-4 py-3">
                <StatusPill tone={statusTone(o.status)}>{STATUS_LABELS[o.status]}</StatusPill>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
