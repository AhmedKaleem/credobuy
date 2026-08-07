import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { getBrands, getCategories } from "@/lib/queries";

export const metadata = { title: "Add Product", robots: { index: false } };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Add product"
        description="Create a new catalogue item."
      />
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
