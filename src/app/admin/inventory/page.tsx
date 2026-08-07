import { PageHeader, Card, Table, StatusPill, StatCard } from "@/components/admin/ui";
import { Boxes, AlertTriangle, XCircle } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { getAllProducts, getBrandById } from "@/lib/queries";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Inventory Management", robots: { index: false } };

export default async function AdminInventoryPage() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) => a.stock - b.stock);
  const lowStock = products.filter((p) => p.stockStatus === "low_stock").length;
  const outOfStock = products.filter((p) => p.stockStatus === "out_of_stock").length;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);

  return (
    <div>
      <PageHeader title="Inventory" description="Track stock levels across all products." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total units in stock" value={totalUnits.toLocaleString("en-IN")} icon={Boxes} tone="primary" />
        <StatCard label="Low stock items" value={String(lowStock)} icon={AlertTriangle} tone="accent" />
        <StatCard label="Out of stock" value={String(outOfStock)} icon={XCircle} tone="danger" />
      </div>

      <Card className="overflow-hidden">
        <Table head={["Product", "SKU (default)", "Stock", "Inventory value", "Status"]}>
          {sorted.map((p) => {
            const brand = getBrandById(p.brandId);
            const variant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 overflow-hidden rounded-lg border border-border">
                      <SmartImage src={p.images[0].url} alt={p.title} />
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium">{p.title}</p>
                      <p className="text-xs text-muted">{brand?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{variant.sku}</td>
                <td className="px-4 py-3 font-semibold">{p.stock}</td>
                <td className="px-4 py-3">{formatINR(p.stock * p.price)}</td>
                <td className="px-4 py-3">
                  <StatusPill
                    tone={
                      p.stockStatus === "out_of_stock"
                        ? "danger"
                        : p.stockStatus === "low_stock"
                        ? "accent"
                        : "success"
                    }
                  >
                    {p.stockStatus === "out_of_stock"
                      ? "Out of stock"
                      : p.stockStatus === "low_stock"
                      ? "Low stock"
                      : "In stock"}
                  </StatusPill>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
