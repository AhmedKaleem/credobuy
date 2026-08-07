"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      5500
    );
    return () => clearInterval(timer);
  }, [banners.length, paused]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[68vh] overflow-hidden sm:h-[74vh] lg:h-[560px] xl:h-[620px]">
        {banners.map((b, i) => {
          const light = b.textTone !== "dark";
          return (
            <div
              key={b.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === index
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
              aria-hidden={i !== index}
            >
              <div className={cn("flex h-full w-full bg-gradient-to-br", b.bg)}>
                <div
                  className={cn(
                    "mx-auto flex h-full w-full max-w-7xl flex-col items-start justify-center gap-5 px-6 py-16 sm:px-10 lg:px-16",
                    light ? "text-white" : "text-foreground"
                  )}
                >
                  {b.eyebrow && (
                    <span
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur",
                        light
                          ? "border-white/40 bg-white/10 text-white"
                          : "border-foreground/20 bg-foreground/5"
                      )}
                    >
                      {b.eyebrow}
                    </span>
                  )}
                  <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                    {b.title}
                  </h1>
                  <p
                    className={cn(
                      "max-w-md text-base sm:text-lg",
                      light ? "text-white/85" : "text-muted"
                    )}
                  >
                    {b.subtitle}
                  </p>
                  <Link
                    href={b.ctaHref}
                    className={cn(
                      "group mt-2 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.03]",
                      light
                        ? "bg-white text-foreground"
                        : "bg-foreground text-background"
                    )}
                  >
                    {b.ctaLabel}
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-colors hover:bg-white/40 sm:flex"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition-colors hover:bg-white/40 sm:flex"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full bg-white transition-all",
                i === index ? "w-8" : "w-2.5 opacity-50 hover:opacity-80"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
