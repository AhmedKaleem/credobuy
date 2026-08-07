import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchX } from "lucide-react";
import {
  getBrands,
  getCategories,
  getDeviceBrands,
  getDeviceModels,
  searchProducts,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const [results, categories, brands, deviceBrands, deviceModels] =
    await Promise.all([
      query ? searchProducts(query) : Promise.resolve([]),
      getCategories(),
      getBrands(),
      getDeviceBrands(),
      getDeviceModels(),
    ]);

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
        {query ? `Results for “${query}”` : "Search"}
      </h1>
      <p className="mb-6 text-sm text-muted">
        {query
          ? `${results.length} ${results.length === 1 ? "product" : "products"} found`
          : "Type in the search bar above to find products."}
      </p>

      {query && results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No results for “${query}”`}
          description="Check your spelling or try a more general term like ‘charger’ or ‘case’."
          actionLabel="Browse all products"
          actionHref="/shop"
        />
      ) : results.length > 0 ? (
        <ProductBrowser
          products={results}
          categories={categories}
          brands={brands}
          deviceBrands={deviceBrands}
          deviceModels={deviceModels}
          initialSearch={query}
        />
      ) : null}
    </Container>
  );
}
