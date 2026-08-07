import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Check,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Container, Badge, SectionHeader } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Rating } from "@/components/ui/Rating";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { PincodeChecker } from "@/components/product/PincodeChecker";
import { FrequentlyBought } from "@/components/product/FrequentlyBought";
import { Reviews } from "@/components/product/Reviews";
import { ProductRow } from "@/components/product/ProductGrid";
import {
  getAllProducts,
  getBrandById,
  getBrands,
  getCategories,
  getCategoryById,
  getDeviceModels,
  getModelById,
  getProductBySlug,
  getRelatedProducts,
  getReviews,
} from "@/lib/queries";
import { discountPercent, formatINR } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [product.images[0].url],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getReviews(product),
  ]);
  await Promise.all([getBrands(), getCategories(), getDeviceModels()]);
  const brandName = product.brandName ?? getBrandById(product.brandId)?.name;
  const category = getCategoryById(product.categoryId);
  const companions = related.slice(0, 2);

  const compatibleNames = product.universal
    ? []
    : product.compatibleModelIds
        .map((id) => getModelById(id)?.name)
        .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: brandName ?? "CredoBuy" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stockStatus === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <Container className="py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="space-y-5">
          <div>
            {brandName && (
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                {brandName}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{product.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} />
              <StockPill status={product.stockStatus} />
              {discountPercent(product.mrp, product.price) > 0 && (
                <Badge tone="accent">
                  Save {formatINR(product.mrp - product.price)}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted">{product.shortDescription}</p>

          {/* Device compatibility */}
          <div className="flex items-start gap-2 rounded-[var(--radius-card)] bg-surface-muted p-3 text-sm">
            <Smartphone size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <span className="font-semibold">Compatibility: </span>
              {product.universal ? (
                <span className="text-muted">
                  Universal — works with most phones
                  {product.connectorType ? ` (${product.connectorType})` : ""}
                </span>
              ) : (
                <span className="text-muted">{compatibleNames.join(", ")}</span>
              )}
            </div>
          </div>

          <PurchasePanel product={product} />

          <PincodeChecker />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border p-3">
              <ShieldCheck size={18} className="text-primary" />
              <span>
                {product.warrantyMonths > 0
                  ? `${product.warrantyMonths}-month warranty`
                  : "No warranty"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border p-3">
              <RotateCcw size={18} className="text-primary" />
              <span>7-day easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key features */}
      <section className="mt-12">
        <SectionHeader title="Key features" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check size={18} className="mt-0.5 shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Specifications */}
      <section className="mt-12">
        <SectionHeader title="Specifications" />
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
          <table className="w-full text-sm">
            <tbody>
              {product.specs.map((s, i) => (
                <tr
                  key={s.label}
                  className={i % 2 === 0 ? "bg-surface" : "bg-surface-muted"}
                >
                  <th
                    scope="row"
                    className="w-1/3 px-4 py-3 text-left font-medium text-muted"
                  >
                    {s.label}
                  </th>
                  <td className="px-4 py-3">{s.value}</td>
                </tr>
              ))}
              {product.material && (
                <tr className="bg-surface">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-muted">
                    Material
                  </th>
                  <td className="px-4 py-3">{product.material}</td>
                </tr>
              )}
              <tr className="bg-surface-muted">
                <th scope="row" className="px-4 py-3 text-left font-medium text-muted">
                  Warranty
                </th>
                <td className="px-4 py-3">
                  {product.warrantyMonths > 0
                    ? `${product.warrantyMonths} months manufacturer warranty`
                    : "Not applicable"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently bought together */}
      {companions.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Frequently bought together" />
          <FrequentlyBought main={product} companions={companions} />
        </section>
      )}

      {/* Reviews */}
      <section className="mt-12">
        <SectionHeader title="Ratings & reviews" />
        <Reviews product={product} reviews={reviews} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Related products" />
          <ProductRow products={related} />
        </section>
      )}
    </Container>
  );
}

function StockPill({ status }: { status: string }) {
  if (status === "out_of_stock")
    return <Badge tone="danger">Out of stock</Badge>;
  if (status === "low_stock")
    return <Badge tone="accent">Low stock</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
