"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Search, Smartphone, X } from "lucide-react";
import type { Product } from "@/types";
import { homeTiles } from "@/data/homeTiles";
import { SmartImage } from "@/components/ui/SmartImage";
import { Container } from "@/components/ui/primitives";
import { discountPercent } from "@/lib/utils";
import { useToast } from "@/store/toast";

const POPULAR = [
  "phone case",
  "MagSafe",
  "watch band",
  "charger",
  "AirPods case",
  "screen protector",
];

const USEFUL_LINKS = [
  { label: "Contact & FAQs", href: "/contact" },
  { label: "Shipping & Returns", href: "/help/shipping" },
  { label: "Reviews", href: "/shop?sort=rating_desc" },
  { label: "B2B Orders", href: "/distributors" },
  { label: "Warranty", href: "/help/returns" },
];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  bestSellers: Product[];
}

export function SearchOverlay({
  open,
  onClose,
  bestSellers,
}: SearchOverlayProps) {
  const router = useRouter();
  const pushToast = useToast((s) => s.push);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function goSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    goSearch(query);
  }

  function openImageSearch() {
    fileRef.current?.click();
  }

  if (!open || !mounted) return null;

  // Portal to body — header uses backdrop-blur which traps position:fixed
  // inside the header height, which made search look like a thin strip only.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="sr-only">
        Search products
      </h2>

      {/* Top search bar */}
      <div className="border-b border-black/10 bg-white">
        <Container>
          <form
            onSubmit={submit}
            className="flex h-14 items-center gap-3 sm:h-[4.25rem]"
          >
            <Search size={20} className="shrink-0 text-black/45" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our products"
              aria-label="Search our products"
              className="min-w-0 flex-1 bg-transparent text-base text-black placeholder:text-black/40 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className="rounded-lg p-2 text-black hover:bg-black/5"
            >
              <X size={22} strokeWidth={1.6} />
            </button>
          </form>
        </Container>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Container className="py-8 sm:py-12">
          <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[260px_minmax(0,1fr)]">
            {/* Left column */}
            <aside className="space-y-9">
              <div>
                <h3 className="text-[15px] font-bold text-black">
                  Popular Searches
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {POPULAR.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => goSearch(term)}
                        className="text-sm text-black/55 transition-colors hover:text-black"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-black">
                  Useful Links
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {USEFUL_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={onClose}
                        className="text-sm text-black/55 transition-colors hover:text-black"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 border-t border-black/10 pt-6">
                <Link
                  href="/device"
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm font-semibold text-black transition-colors hover:opacity-70"
                >
                  <Smartphone size={16} strokeWidth={1.7} />
                  Search by Device
                </Link>
                <button
                  type="button"
                  onClick={openImageSearch}
                  className="flex items-center gap-2 text-sm font-semibold text-black transition-colors hover:opacity-70"
                >
                  <Camera size={16} strokeWidth={1.7} />
                  Image Search
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-hidden
                  onChange={() => {
                    pushToast("Image search coming soon", "info");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                >
                  View All Products
                </Link>
              </div>
            </aside>

            {/* Right column */}
            <div className="space-y-12">
              <section>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[15px] font-bold text-black">
                    Best Sellers
                  </h3>
                  <Link
                    href="/shop?sort=rating_desc"
                    onClick={onClose}
                    className="rounded-full border border-black px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-black transition-colors hover:bg-black hover:text-white"
                  >
                    View All Products
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
                  {bestSellers.map((p) => {
                    const off = discountPercent(p.mrp, p.price);
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="group flex flex-col"
                      >
                        {off > 0 && (
                          <span className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#b45309]">
                            {off}% off
                          </span>
                        )}
                        <div className="overflow-hidden bg-[#f3f3f3]">
                          <SmartImage
                            src={p.images[0]?.url ?? ""}
                            alt={p.title}
                            ratio="aspect-square"
                          />
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-black group-hover:underline">
                          {p.title}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-[15px] font-bold text-black">
                  All Product Categories
                </h3>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {homeTiles.map((tile) => (
                    <li key={tile.id}>
                      <Link
                        href={tile.href}
                        onClick={onClose}
                        className="text-sm text-black/55 transition-colors hover:text-black"
                      >
                        {tile.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </Container>
      </div>
    </div>,
    document.body
  );
}
