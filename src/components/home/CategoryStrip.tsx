import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { SmartImage } from "@/components/ui/SmartImage";

export function CategoryStrip({
  categories,
  variant = "grid",
}: {
  categories: Category[];
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <nav aria-label="Shop by category" className="flex flex-col">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-surface-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-foreground group-hover:bg-surface">
              <Icon name={c.icon} size={16} />
            </span>
            <span className="flex-1 font-medium leading-tight">{c.name}</span>
            <ChevronRight size={15} className="text-muted group-hover:text-accent" />
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <section aria-label="Shop by category">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
              <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]">
                <SmartImage src={c.imageUrl} alt={c.name} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold leading-tight">{c.name}</span>
              <ChevronRight
                size={16}
                className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
