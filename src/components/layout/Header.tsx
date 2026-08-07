"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Smartphone,
  User,
  X,
} from "lucide-react";
import type { Category, DeviceBrand, Product } from "@/types";
import { verticals } from "@/data/navigation";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";
import { Container } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

interface HeaderProps {
  categories: Category[];
  deviceBrands: DeviceBrand[];
  bestSellers: Product[];
}

const navLinks = [
  { label: "Shop by Device", href: "/device" },
  { label: "New Arrival", href: "/shop?sort=newest" },
  { label: "Best Sellers", href: "/shop?sort=rating_desc" },
];

export function Header({ categories, deviceBrands, bestSellers }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useMounted();

  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlist((s) => s.ids.length);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <Container>
        {/* Main row: logo (left) · nav (center) · actions (right) */}
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="-ml-1 rounded-lg p-2 hover:bg-surface-muted lg:hidden"
            >
              <Menu size={22} />
            </button>
            <Logo />
          </div>

          {/* Center nav (desktop) */}
          <nav className="hidden items-center justify-center gap-7 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                aria-expanded={catOpen}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent"
              >
                Shop
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", catOpen && "rotate-180")}
                />
              </button>
              {catOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setCatOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute left-1/2 top-full z-40 mt-3 w-[580px] -translate-x-1/2 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-hover)]">
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/category/${c.slug}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface-muted"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-foreground">
                            <Icon name={c.icon} size={18} />
                          </span>
                          <span className="text-sm font-medium">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/device"
                      onClick={() => setCatOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                    >
                      <Smartphone size={16} /> Shop by Device
                    </Link>
                  </div>
                </>
              )}
            </div>

            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ))}

            {/* Sale — hidden for now
            <Link
              href="/shop?sort=discount_desc"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
            >
              Sale
            </Link>
            */}
          </nav>

          {/* Right actions */}
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center rounded-lg px-2.5 py-1.5 text-foreground transition-colors hover:text-accent"
            >
              <Search size={21} strokeWidth={1.6} />
              <span className="mt-0.5 hidden text-[11px] font-medium lg:block">Search</span>
            </button>
            <HeaderIcon href="/account" label="Account" icon={User} />
            <HeaderIcon
              href="/account/wishlist"
              label="Wishlist"
              icon={Heart}
              count={mounted ? wishlistCount : 0}
            />
            <HeaderIcon
              href="/cart"
              label="Cart"
              icon={ShoppingBag}
              count={mounted ? cartCount : 0}
            />
          </div>
        </div>
      </Container>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        bestSellers={bestSellers}
      />

      {menuOpen && (
        <MobileMenu
          categories={categories}
          deviceBrands={deviceBrands}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}

function HeaderIcon({
  href,
  label,
  icon: IconCmp,
  count,
}: {
  href: string;
  label: string;
  icon: typeof User;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex flex-col items-center rounded-lg px-2.5 py-1.5 text-foreground transition-colors hover:text-accent"
    >
      <IconCmp size={21} strokeWidth={1.6} />
      <span className="mt-0.5 hidden text-[11px] font-medium lg:block">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

function MobileMenu({
  categories,
  deviceBrands,
  onClose,
}: {
  categories: Category[];
  deviceBrands: DeviceBrand[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-surface p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-surface-muted"
          >
            <X size={22} />
          </button>
        </div>

        <Link
          href="/device"
          onClick={onClose}
          className="mb-3 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
        >
          <Smartphone size={18} />
          Shop by Device
        </Link>

        <p className="px-1 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Shop by category
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium hover:bg-surface-muted"
            >
              All Products
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-muted"
              >
                <span className="text-foreground">
                  <Icon name={c.icon} size={18} />
                </span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="px-1 py-2 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          More
        </p>
        <div className="flex flex-wrap gap-2">
          {verticals
            .filter((v) => v.soon)
            .map((v) => (
              <span
                key={v.label}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
              >
                {v.label}
              </span>
            ))}
        </div>

        <p className="px-1 py-2 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Shop by brand
        </p>
        <div className="flex flex-wrap gap-2">
          {deviceBrands.map((b) => (
            <Link
              key={b.id}
              href={`/device/${b.slug}`}
              onClick={onClose}
              className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
            >
              {b.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 space-y-1 border-t border-border pt-4">
          <Link href="/account" onClick={onClose} className="block rounded-lg px-3 py-2.5 hover:bg-surface-muted">
            My Account
          </Link>
          <Link href="/account/orders" onClick={onClose} className="block rounded-lg px-3 py-2.5 hover:bg-surface-muted">
            My Orders
          </Link>
          <Link href="/track" onClick={onClose} className="block rounded-lg px-3 py-2.5 hover:bg-surface-muted">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
