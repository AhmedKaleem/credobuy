import { Plus } from "lucide-react";
import { PageHeader, Card, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Category Management", robots: { index: false } };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organise your catalogue into shoppable categories."
        action={
          <Button>
            <Plus size={16} /> Add category
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <Table head={["#", "Category", "Slug", "Products", "Status"]}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 text-muted">{c.sortOrder}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon name={c.icon} size={18} />
                  </span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="line-clamp-1 text-xs text-muted">{c.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{c.slug}</td>
              <td className="px-4 py-3">{c.productCount}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
