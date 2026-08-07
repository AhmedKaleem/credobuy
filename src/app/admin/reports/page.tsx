import { IndianRupee, Percent, ShoppingBag, TrendingUp } from "lucide-react";
import { PageHeader, Card, Table, BarChart, StatCard } from "@/components/admin/ui";
import { getAllProducts, getBrandById } from "@/lib/queries";
import { monthlyRevenue, categorySales } from "@/data/admin";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Sales Reports", robots: { index: false } };

export default async function AdminReportsPage() {
  const products = await getAllProducts();
  const revenue = monthlyRevenue.reduce((s, m) => s + m.value, 0);
  const topProducts = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 8);

  return (
    <div>
      <PageHeader title="Sales Reports" description="Revenue, category and product performance." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue (6 mo)" value={formatINR(revenue)} icon={IndianRupee} tone="success" />
        <StatCard label="Avg. order value" value={formatINR(1847)} icon={ShoppingBag} tone="primary" />
        <StatCard label="Conversion rate" value="3.4%" icon={Percent} tone="accent" />
        <StatCard label="Repeat customers" value="38%" icon={TrendingUp} tone="primary" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card title="Monthly revenue trend">
          <BarChart data={monthlyRevenue} />
        </Card>
        <Card title="Units sold by category">
          <BarChart data={categorySales} />
        </Card>
      </div>

      <Card title="Top performing products">
        <Table head={["Product", "Brand", "Rating", "Units sold (est.)", "Revenue (est.)"]}>
          {topProducts.map((p) => {
            const brand = getBrandById(p.brandId);
            const units = Math.round(p.reviewCount * 1.4);
            return (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">
                  <span className="line-clamp-1">{p.title}</span>
                </td>
                <td className="px-4 py-3 text-muted">{brand?.name}</td>
                <td className="px-4 py-3">{p.rating.toFixed(1)}★</td>
                <td className="px-4 py-3">{units.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 font-semibold">{formatINR(units * p.price)}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
