"use client";

import { useState } from "react";
import type { ProductImage } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      <div className="flex-1 overflow-hidden rounded-[var(--radius-card)] border border-border">
        <SmartImage src={current.url} alt={current.alt} priority />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors",
                i === active ? "border-primary" : "border-border"
              )}
            >
              <SmartImage src={img.url} alt={img.alt} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
