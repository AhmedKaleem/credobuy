import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartImage } from "@/components/ui/SmartImage";
import { getDeviceBrands } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop by Device",
  description:
    "Select your mobile brand and model to see only accessories that are perfectly compatible with your phone.",
};

export default async function DeviceIndexPage() {
  const brands = await getDeviceBrands();

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Shop by Device" }]}
      />

      <div className="mb-8 flex flex-col items-center rounded-[var(--radius-card)] bg-gradient-to-br from-primary-soft to-white p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <Smartphone size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
          Find accessories for your phone
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Step 1 of 3 — choose your mobile brand. Then pick your model and we&apos;ll
          show only compatible accessories.
        </p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Select your brand</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/device/${b.slug}`}
            className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-all hover:border-primary hover:shadow-[var(--shadow-card)]"
          >
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <SmartImage src={b.logoUrl} alt={b.name} />
            </span>
            <span className="flex-1 font-medium">{b.name}</span>
            <ArrowRight
              size={16}
              className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
            />
          </Link>
        ))}
      </div>
    </Container>
  );
}
