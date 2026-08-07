import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartImage } from "@/components/ui/SmartImage";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import {
  getBrands,
  getCategories,
  getCompatibleProducts,
  getDeviceBrandBySlug,
  getDeviceBrands,
  getDeviceModels,
  getModelBySlug,
} from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}): Promise<Metadata> {
  const { model } = await params;
  const m = await getModelBySlug(model);
  if (!m) return { title: "Device not found" };
  return {
    title: `${m.name} Accessories`,
    description: `Cases, screen protectors, chargers, cables and power banks compatible with the ${m.name}.`,
  };
}

export default async function CompatibleProductsPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand, model } = await params;
  const [deviceBrand, deviceModel] = await Promise.all([
    getDeviceBrandBySlug(brand),
    getModelBySlug(model),
  ]);
  if (!deviceBrand || !deviceModel) notFound();

  const [products, categories, brands, deviceBrands, deviceModels] =
    await Promise.all([
      getCompatibleProducts(deviceModel.id),
      getCategories(),
      getBrands(),
      getDeviceBrands(),
      getDeviceModels(),
    ]);

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop by Device", href: "/device" },
          { label: deviceBrand.name, href: `/device/${brand}` },
          { label: deviceModel.name },
        ]}
      />

      <div className="mb-6 flex items-center gap-4 rounded-[var(--radius-card)] border border-primary/20 bg-primary-soft p-4">
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
          <SmartImage src={deviceModel.imageUrl} alt={deviceModel.name} />
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} />
            Showing compatible accessories
          </p>
          <h1 className="text-xl font-bold sm:text-2xl">
            Accessories for {deviceModel.name}
          </h1>
          <p className="text-sm text-muted">
            {products.length} compatible products including universal chargers,
            cables & power banks.
          </p>
        </div>
      </div>

      <ProductBrowser
        products={products}
        categories={categories}
        brands={brands}
        deviceBrands={deviceBrands}
        deviceModels={deviceModels}
        lockedModelId={deviceModel.id}
      />
    </Container>
  );
}
