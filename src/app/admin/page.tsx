import Link from "next/link";
import {
  IndianRupee,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, StatCard, Card, Table, BarChart, StatusPill } from "@/components/admin/ui";
import { getAllProducts } from "@/lib/queries";
import { adminOrders, adminCustomers, monthlyRevenue, categorySales } from "@/data/admin";
import { STATUS_LABELS, statusTone } from "@/lib/orders";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard", robots: { index: false } };

export default async function AdminDashboard() {
  const products = await getAllProducts();
  const lowStock = products
    .filter((p) => p.stock < 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const revenue = monthlyRevenue.reduce((s, m) => s + m.value, 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your CredoBuy store performance."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Revenue (6 mo)" value={formatINR(revenue)} icon={IndianRupee} delta="+14.8%" tone="success" />
        <StatCard label="Total Orders" value="1,284" icon={ShoppingBag} delta="+8.2%" tone="primary" />
        <StatCard label="Products" value={String(products.length)} icon={Package} tone="accent" />
        <StatCard label="Customers" value="642" icon={Users} delta="+5.1%" tone="primary" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Monthly revenue" action={<TrendingUp size={18} className="text-success" />}>
          <BarChart data={monthlyRevenue.map((m) => ({ label: m.label, value: m.value }))} />
        </Card>
        <Card title="Units sold by category">
          <BarChart data={categorySales} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Recent orders" className="lg:col-span-2" action={<Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>}>
          <Table head={["Order", "Customer", "Total", "Status"]}>
            {adminOrders.slice(0, 5).map((o) => (
              <tr key={o.orderNumber}>
                <td className="px-4 py-3 font-medium">#{o.orderNumber}</td>
                <td className="px-4 py-3">
                  {o.customer}
                  <span className="block text-xs text-muted">{formatDate(o.placedAt)}</span>
                </td>
                <td className="px-4 py-3">{formatINR(o.total)}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={statusTone(o.status)}>{STATUS_LABELS[o.status]}</StatusPill>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Low stock alerts" action={<AlertTriangle size={18} className="text-warning" />}>
          <ul className="space-y-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/product/${p.slug}`} className="line-clamp-1 hover:text-primary">
                  {p.title}
                </Link>
                <StatusPill tone={p.stock === 0 ? "danger" : "accent"}>
                  {p.stock} left
                </StatusPill>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Top customers" action={<Link href="/admin/customers" className="text-sm font-semibold text-primary hover:underline">View all</Link>}>
          <Table head={["Customer", "City", "Orders", "Total spent"]}>
            {adminCustomers.slice(0, 4).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.city}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-semibold">{formatINR(c.totalSpent)}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
