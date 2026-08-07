import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import {
  getAllProducts,
  getBrands,
  getCategories,
  getDeviceBrands,
  getDeviceModels,
} from "@/lib/queries";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Shop All Mobile Accessories",
  description:
    "Browse the full CredoBuy catalogue — cases, screen protectors, chargers, cables, power banks, earbuds, holders and photography gear.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const [products, categories, brands, deviceBrands, deviceModels] =
    await Promise.all([
      getAllProducts(),
      getCategories(),
      getBrands(),
      getDeviceBrands(),
      getDeviceModels(),
    ]);

  return (
    <Container className="py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">All Products</h1>
      <ProductBrowser
        products={products}
        categories={categories}
        brands={brands}
        deviceBrands={deviceBrands}
        deviceModels={deviceModels}
        initialSort={(sort as SortOption) ?? "relevance"}
      />
    </Container>
  );
}
