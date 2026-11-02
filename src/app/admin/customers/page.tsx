import { PageHeader, Card, Table } from "@/components/admin/ui";
import { listAdminCustomers } from "@/lib/admin/live";
import { adminCustomers } from "@/data/admin";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Customer Management", robots: { index: false } };

export default async function AdminCustomersPage() {
  const live = await listAdminCustomers();
  const rows = live.length
    ? live.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: "—",
        orders: c.orders,
        totalSpent: c.totalSpent,
        joined: c.joined,
      }))
    : adminCustomers;

  return (
    <div>
      <PageHeader title="Customers" description="Registered customers and their activity." />
      <Card className="overflow-hidden">
        <Table head={["Customer", "Contact", "City", "Orders", "Total spent", "Joined"]}>
          {rows.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                    {c.name.charAt(0)}
                  </span>
                  <span className="font-medium">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">
                <p>{c.email}</p>
                <p className="text-xs">{c.phone}</p>
              </td>
              <td className="px-4 py-3 text-muted">{c.city}</td>
              <td className="px-4 py-3">{c.orders}</td>
              <td className="px-4 py-3 font-semibold">{formatINR(c.totalSpent)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(c.joined)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
