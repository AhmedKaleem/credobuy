import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/ui/primitives";
import { TrustBar } from "@/components/layout/TrustBar";
import { HeroDeviceSelector } from "@/components/home/HeroDeviceSelector";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryScroll } from "@/components/home/CategoryScroll";
import { CategoryBento } from "@/components/home/CategoryBento";
import { BrandStrip } from "@/components/home/BrandStrip";
import { OffersStrip } from "@/components/home/OffersStrip";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { TechHighlights } from "@/components/home/TechHighlights";
import { SocialProof } from "@/components/home/SocialProof";
import { Newsletter } from "@/components/home/Newsletter";
import { BundlesSection } from "@/components/home/BundlesSection";
import { ProductRow } from "@/components/product/ProductGrid";
import { cn } from "@/lib/utils";
import {
  getAllProducts,
  getBanners,
  getBestSellers,
  getCategories,
  getDealOfTheDay,
  getDeviceBrands,
  getDeviceModels,
  getNewArrivals,
  getPromotions,
  getSpecialOffers,
  getTrending,
} from "@/lib/queries";

/** Alternating soft bands — warm stone / linen / sage within brand palette. */
const bands = {
  white: "bg-white",
  stone: "bg-[#f3f1ec]",
  linen: "bg-[#f7f4ef]",
  mist: "bg-[#ebe8e1]",
  sage: "bg-[#e9eeea]",
  sand: "bg-[#f1ebe3]",
} as const;

type Band = keyof typeof bands;

export default async function HomePage() {
  const [
    banners,
    categories,
    deviceBrands,
    deviceModels,
    trending,
    bestSellers,
    newArrivals,
    offers,
    allProducts,
    dealOfDay,
    offerStrip,
  ] = await Promise.all([
    getBanners(),
    getCategories(),
    getDeviceBrands(),
    getDeviceModels(),
    getTrending(),
    getBestSellers(),
    getNewArrivals(),
    getSpecialOffers(),
    getAllProducts(),
    getDealOfTheDay(),
    getPromotions("offers_strip"),
  ]);

  return (
    <div className="pb-10 sm:pb-12">
      <HeroBanner banners={banners} />
      <CategoryScroll categories={categories} />

      <HomeBand tone="stone">
        <HeroDeviceSelector
          deviceBrands={deviceBrands}
          deviceModels={deviceModels}
        />
      </HomeBand>

      <HomeBand tone="mist">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          action={<ViewAll href="/shop" label="All products" />}
        />
        <CategoryBento />
      </HomeBand>

      <HomeBand tone="sage">
        <SectionHeader
          eyebrow="Most loved"
          title="Best sellers"
          action={<ViewAll href="/shop?sort=rating_desc" />}
        />
        <ProductRow products={bestSellers} />
      </HomeBand>

      <HomeBand tone="linen">
        <SectionHeader
          eyebrow="The CredoBuy standard"
          title="Engineered to protect"
          subtitle="Real-world tested technology in every product we make."
        />
        <TechHighlights />
      </HomeBand>

      {dealOfDay && (
        <HomeBand tone="sand">
          <DealOfTheDay
            product={dealOfDay.product}
            headline={dealOfDay.promo?.title}
            subtitle={dealOfDay.promo?.message}
          />
        </HomeBand>
      )}

      <HomeBand tone="white">
        <SectionHeader
          eyebrow="Made to fit"
          title="Shop by device brand"
          subtitle="Accessories precision-built for your phone"
          action={<ViewAll href="/device" label="All devices" />}
        />
        <BrandStrip brands={deviceBrands} />
      </HomeBand>

      <HomeBand tone="sage">
        <SectionHeader
          eyebrow="Right now"
          title="Trending accessories"
          action={<ViewAll href="/shop?sort=rating_desc" />}
        />
        <ProductRow products={trending} />
      </HomeBand>

      <HomeBand tone="linen">
        <SectionHeader
          eyebrow="Just dropped"
          title="New arrivals"
          action={<ViewAll href="/shop?sort=newest" />}
        />
        <ProductRow products={newArrivals} />
      </HomeBand>

      <HomeBand tone="mist">
        <SectionHeader
          eyebrow="Save more"
          title="Complete the set"
          subtitle="Curated bundles at a better price together"
        />
        <BundlesSection products={allProducts} />
      </HomeBand>

      <HomeBand tone="sand">
        <SectionHeader
          eyebrow="Limited time"
          title="On sale"
          action={<ViewAll href="/shop?sort=discount_desc" />}
        />
        <ProductRow products={offers} />
      </HomeBand>

      <HomeBand tone="linen">
        <OffersStrip offers={offerStrip} />
      </HomeBand>

      <HomeBand tone="mist">
        <SocialProof />
      </HomeBand>

      <HomeBand tone="stone">
        <Newsletter />
      </HomeBand>

      <HomeBand tone="white" className="pb-12 sm:pb-14">
        <TrustBar />
      </HomeBand>
    </div>
  );
}

function HomeBand({
  tone,
  children,
  className,
}: {
  tone: Band;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(bands[tone], "py-8 sm:py-10", className)}>
      <Container>{children}</Container>
    </section>
  );
}

function ViewAll({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-accent"
    >
      {label}
      <ArrowRight size={15} />
    </Link>
  );
}
