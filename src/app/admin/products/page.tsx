import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, Card, Table, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getBrandById } from "@/lib/queries";
import { fetchAdminProducts } from "@/lib/admin/actions";
import { formatINR, discountPercent } from "@/lib/utils";

export const metadata = { title: "Product Management", robots: { index: false } };

export default async function AdminProductsPage() {
  const products = await fetchAdminProducts();

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products across the catalogue.`}
        action={
          <Link href="/admin/products/new">
            <Button>
              <Plus size={16} /> Add product
            </Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <Table
          head={[
            "Product",
            "Category",
            "Sub Category",
            "Series",
            "Product Type",
            "Compatible Device",
            "Price",
            "Stock",
            "",
          ]}
        >
          {products.map((p) => {
            const brand = getBrandById(p.brandId);
            const off = discountPercent(p.mrp, p.price);
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                      <SmartImage
                        src={p.images[0]?.url ?? ""}
                        alt={p.title}
                      />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      <span className="text-xs text-muted">{brand?.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.taxonomyCategory}</td>
                <td className="px-4 py-3 text-sm text-muted">{p.subCategory}</td>
                <td className="px-4 py-3 text-sm text-muted">{p.series}</td>
                <td className="px-4 py-3 text-sm">{p.productType}</td>
                <td className="px-4 py-3 text-sm text-muted">
                  {p.compatibleDevice || (p.universal ? "Universal" : "—")}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{formatINR(p.price)}</span>
                  {off > 0 && (
                    <span className="ml-1 text-xs text-success">{off}% off</span>
                  )}
                </td>
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
                    {p.stock}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
