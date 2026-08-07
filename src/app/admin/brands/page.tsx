import { Plus } from "lucide-react";
import { PageHeader, Card, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getAllProducts, getBrands } from "@/lib/queries";

export const metadata = { title: "Brand Management", robots: { index: false } };

export default async function AdminBrandsPage() {
  const [brands, products] = await Promise.all([getBrands(), getAllProducts()]);

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Accessory brands available in your store."
        action={
          <Button>
            <Plus size={16} /> Add brand
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <Table head={["Brand", "Slug", "Products"]}>
          {brands.map((b) => {
            const count = products.filter((p) => p.brandId === b.id).length;
            return (
              <tr key={b.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 overflow-hidden rounded-lg border border-border">
                      <SmartImage src={b.logoUrl} alt={b.name} />
                    </span>
                    <span className="font-medium">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{b.slug}</td>
                <td className="px-4 py-3">{count}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
