import Link from "next/link";
import type { DeviceBrand } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";

export function BrandStrip({ brands }: { brands: DeviceBrand[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-10">
      {brands.map((b) => (
        <Link
          key={b.id}
          href={`/device/${b.slug}`}
          className="group flex flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface p-1 transition-all group-hover:border-primary group-hover:shadow-[var(--shadow-card)] sm:h-20 sm:w-20">
            <span className="h-full w-full overflow-hidden rounded-full">
              <SmartImage src={b.logoUrl} alt={`${b.name} accessories`} />
            </span>
          </span>
          <span className="text-xs font-medium group-hover:text-primary">
            {b.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
