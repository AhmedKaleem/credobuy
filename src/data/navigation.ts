/**
 * Top-level shopping verticals shown in the mega navigation bar.
 * CredoBuy launches with mobile accessories; the other verticals are part of
 * the roadmap (mobiles, laptops, TVs, car electronics, smart devices) and are
 * flagged "soon" until their catalogues go live.
 */
export interface Vertical {
  label: string;
  href: string;
  icon: string; // lucide icon name
  soon?: boolean;
}

export const verticals: Vertical[] = [
  { label: "Accessories", href: "/shop", icon: "Headphones" },
  { label: "Mobiles", href: "/shop", icon: "Smartphone", soon: true },
  { label: "Laptops", href: "/shop", icon: "Laptop", soon: true },
  { label: "Smart TVs", href: "/shop", icon: "Tv", soon: true },
  { label: "Smart Watches", href: "/shop", icon: "Watch", soon: true },
  { label: "Car Electronics", href: "/shop", icon: "Car", soon: true },
  { label: "Smart Devices", href: "/shop", icon: "House", soon: true },
];
