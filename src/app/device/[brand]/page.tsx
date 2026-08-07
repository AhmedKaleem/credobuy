import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  getDeviceBrandBySlug,
  getDeviceBrands,
  getModelsForBrandSlug,
} from "@/lib/queries";

export async function generateStaticParams() {
  const brands = await getDeviceBrands();
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const b = await getDeviceBrandBySlug(brand);
  if (!b) return { title: "Brand not found" };
  return {
    title: `${b.name} Accessories — Select Model`,
    description: `Choose your ${b.name} model to find compatible cases, chargers, cables and more.`,
  };
}

export default async function DeviceBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const [deviceBrand, models] = await Promise.all([
    getDeviceBrandBySlug(brand),
    getModelsForBrandSlug(brand),
  ]);
  if (!deviceBrand) notFound();

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop by Device", href: "/device" },
          { label: deviceBrand.name },
        ]}
      />

      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Step 2 of 3</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Select your {deviceBrand.name} model
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/device/${brand}/${m.slug}`}
            className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-all hover:border-primary hover:shadow-[var(--shadow-card)]"
          >
            <SmartImage src={m.imageUrl} alt={m.name} ratio="aspect-[4/3]" />
            <div className="p-3">
              <p className="text-sm font-medium group-hover:text-primary">
                {m.name}
              </p>
              <p className="text-xs text-muted">{m.releaseYear}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
