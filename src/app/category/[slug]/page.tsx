import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import {
  applyFilters,
  getAllProducts,
  getBrands,
  getCategories,
  getCategoryBySlug,
  getDeviceBrands,
  getDeviceModels,
} from "@/lib/queries";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [allProducts, categories, brands, deviceBrands, deviceModels] =
    await Promise.all([
      getAllProducts(),
      getCategories(),
      getBrands(),
      getDeviceBrands(),
      getDeviceModels(),
    ]);

  const products = applyFilters(
    allProducts,
    { categorySlug: slug },
    { categories, brands }
  );

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
        <p className="mt-1 text-sm text-muted">{category.description}</p>
      </div>
      <ProductBrowser
        products={products}
        categories={categories}
        brands={brands}
        deviceBrands={deviceBrands}
        deviceModels={deviceModels}
        lockedCategorySlug={slug}
      />
    </Container>
  );
}
