import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { fetchAdminProducts } from "@/lib/admin/actions";
import { getBrands, getCategories } from "@/lib/queries";

export const metadata = { title: "Edit Product", robots: { index: false } };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, brands, categories] = await Promise.all([
    fetchAdminProducts(),
    getBrands(),
    getCategories(),
  ]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div>
      <PageHeader
        title="Edit product"
        description={product.title}
      />
      <ProductForm
        product={product}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
