"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { lifestyleScene } from "@/lib/placeholder";
import { DeviceFinder } from "@/components/home/DeviceFinder";
import { JumpLetters } from "@/components/home/JumpLetters";
import type { DeviceBrand, DeviceModel, Product } from "@/types";

interface Props {
  deviceBrands: DeviceBrand[];
  deviceModels: DeviceModel[];
  showcase?: Product[];
}

const STORIES = [
  {
    title: "Protect",
    caption: "Cases built for the drop — and the photo.",
    href: "/category/cases-and-covers",
    kind: "protect" as const,
  },
  {
    title: "Charge",
    caption: "GaN power that stays small in the bag.",
    href: "/category/chargers",
    kind: "charge" as const,
  },
  {
    title: "Listen",
    caption: "Everyday audio, matched to your phone.",
    href: "/category/earphones-and-earbuds",
    kind: "listen" as const,
  },
] as const;

export function HeroDeviceSelector({
  deviceBrands,
  deviceModels,
  showcase = [],
}: Props) {
  const tiles = STORIES.map((story, i) => {
    const product = showcase[i];
    const raw = product?.images[0]?.url ?? "";
    const realPhoto =
      raw.startsWith("http") &&
      !raw.includes("picsum.photos") &&
      !raw.startsWith("data:");
    return {
      ...story,
      image: realPhoto ? raw : lifestyleScene(story.kind),
      alt: product?.title || story.title,
    };
  });

  return (
    <section aria-labelledby="lifestyle-heading">
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Engineered for everyday
          </p>
          <h2
            id="lifestyle-heading"
            className="mt-3 text-[2.35rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]"
          >
            Accessories that{" "}
            <JumpLetters text="fit your life." />
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
            Cases, chargers and audio chosen for how you actually use your
            phone — then filtered to the exact model in your pocket.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              Shop all
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop?sort=rating_desc"
              className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              Best sellers
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href={tiles[0].href}
            className="group relative col-span-1 row-span-2 min-h-[280px] overflow-hidden rounded-[1.5rem] bg-surface-muted sm:min-h-[360px] lg:rounded-[1.75rem]"
          >
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]">
              <SmartImage
                src={tiles[0].image}
                alt={tiles[0].alt}
                priority
                ratio="absolute inset-0 h-full w-full"
              />
            </div>
            <TileCaption title={tiles[0].title} caption={tiles[0].caption} />
          </Link>
          {tiles.slice(1).map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative min-h-[134px] overflow-hidden rounded-[1.35rem] bg-surface-muted sm:min-h-[172px] lg:rounded-[1.5rem]"
            >
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]">
                <SmartImage
                  src={tile.image}
                  alt={tile.alt}
                  ratio="absolute inset-0 h-full w-full"
                />
              </div>
              <TileCaption title={tile.title} caption={tile.caption} compact />
            </Link>
          ))}
        </div>
      </div>

      <DeviceFinder
        deviceBrands={deviceBrands}
        deviceModels={deviceModels}
      />
    </section>
  );
}

function TileCaption({
  title,
  caption,
  compact,
}: {
  title: string;
  caption: string;
  compact?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#16150f]/80 via-[#16150f]/25 to-transparent p-4 sm:p-5">
      <p className="text-sm font-semibold text-white sm:text-base">{title}</p>
      {!compact ? (
        <p className="mt-0.5 max-w-[16rem] text-xs leading-snug text-white/75">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
