"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { productPlaceholder } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

export function CategoryScroll({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [categories.length]);

  function scrollByDir(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.7, 420);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  if (!categories.length) return null;

  return (
    <section
      aria-label="Shop by category"
      className="relative bg-white py-5 sm:py-6"
    >
      <div className="relative mx-auto max-w-[1400px]">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth px-4 sm:gap-8 sm:px-8 lg:px-12"
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex w-[88px] shrink-0 flex-col items-center gap-2.5 sm:w-[104px]"
            >
              <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-2xl bg-[#f7f6f3] transition-transform duration-300 group-hover:scale-[1.04] sm:h-[104px] sm:w-[104px]">
                <SmartImage
                  src={c.imageUrl || productPlaceholder(c.name, c.slug)}
                  alt=""
                  ratio="aspect-square h-full w-full"
                />
              </div>
              <span className="line-clamp-2 text-center text-[12px] font-medium leading-snug text-foreground sm:text-[13px]">
                {c.name}
              </span>
            </Link>
          ))}
          {/* Trailing spacer so last item clears the arrow */}
          <div className="w-6 shrink-0 sm:w-10" aria-hidden />
        </div>

        <ScrollButton
          direction="prev"
          disabled={!canPrev}
          onClick={() => scrollByDir(-1)}
          className="left-2 sm:left-3"
        />
        <ScrollButton
          direction="next"
          disabled={!canNext}
          onClick={() => scrollByDir(1)}
          className="right-2 sm:right-3"
        />
      </div>
    </section>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={
        direction === "prev"
          ? "Scroll categories left"
          : "Scroll categories right"
      }
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-[44px] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#ececec] text-foreground shadow-sm transition-opacity sm:top-[52px] sm:flex",
        "hover:bg-[#e2e2e2] disabled:pointer-events-none disabled:opacity-0",
        className
      )}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}
