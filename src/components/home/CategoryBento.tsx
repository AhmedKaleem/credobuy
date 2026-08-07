import Link from "next/link";
import { homeTiles } from "@/data/homeTiles";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export function CategoryBento() {
  return (
    <section aria-label="Shop by category">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {homeTiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className={cn(
              "group relative overflow-hidden rounded-2xl sm:rounded-3xl",
              tile.span === "wide" &&
                "col-span-2 aspect-[16/10] sm:aspect-[2/1] lg:aspect-auto lg:min-h-[280px]",
              tile.span === "narrow" &&
                "col-span-1 aspect-[4/5] sm:aspect-square lg:min-h-[280px]",
              tile.span === "half" &&
                "col-span-1 aspect-square lg:col-span-2 lg:aspect-[2/1] lg:min-h-[240px]"
            )}
          >
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
              <SmartImage
                src={tile.imageUrl}
                alt={tile.label}
                ratio="absolute inset-0 h-full w-full"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent"
              aria-hidden
            />
            <span
              className={cn(
                "absolute left-4 top-4 text-sm font-bold tracking-tight sm:left-5 sm:top-5 sm:text-base",
                tile.textTone === "light" ? "text-white" : "text-foreground"
              )}
            >
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
