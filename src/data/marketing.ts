import type { Banner, Coupon, Distributor, Promotion, Review } from "@/types";
import { bannerPlaceholder } from "@/lib/placeholder";

/** Local fallback for promotions (announcement / offers_strip / deal_of_the_day). */
export const promotions: Promotion[] = [
  {
    id: "promo-ann-1",
    placement: "announcement",
    message: "BACK TO SCHOOL · Buy 2+ and get 15% off — auto-applied at checkout",
    href: "/shop",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "promo-ann-2",
    placement: "announcement",
    message: "FREE express shipping on orders over ₹499",
    href: "/shop",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "promo-ann-3",
    placement: "announcement",
    message: "NEW · Straps, charms & MagSafe wallets just dropped",
    href: "/shop?sort=newest",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "promo-ann-4",
    placement: "announcement",
    message: "2-year warranty · 30-day no-questions-asked returns",
    href: "/contact",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "promo-offer-1",
    placement: "offers_strip",
    title: "10% Instant Bank Discount",
    message: "On HDFC, ICICI & SBI credit cards",
    icon: "Landmark",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "promo-offer-2",
    placement: "offers_strip",
    title: "No Cost EMI",
    message: "Available on orders above ₹3,000",
    icon: "Wallet",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "promo-offer-3",
    placement: "offers_strip",
    title: "Extra 5% Cashback",
    message: "With CredoBuy Wallet payments",
    icon: "Percent",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "promo-offer-4",
    placement: "offers_strip",
    title: "UPI & Cards Accepted",
    message: "100% secure, encrypted checkout",
    icon: "CreditCard",
    sortOrder: 4,
    isActive: true,
  },
];

/** @deprecated Prefer `promotions` filtered by placement. */
export const announcements = promotions.filter(
  (p) => p.placement === "announcement"
);

export const heroBanners: Banner[] = [
  {
    id: "banner-1",
    eyebrow: "New Season Drop",
    title: "Show your colours",
    subtitle: "Bold, protective cases built for your exact phone. Up to 50% off.",
    ctaLabel: "Shop new arrivals",
    ctaHref: "/shop?sort=newest",
    imageUrl: bannerPlaceholder("banner-1"),
    bg: "from-[#ff5e62] via-[#ff9966] to-[#ffb199]",
    textTone: "light",
  },
  {
    id: "banner-2",
    eyebrow: "The CredoBuy Standard",
    title: "Drop-tested. Never boring.",
    subtitle: "Impact cases engineered to survive 3m drops without the bulk.",
    ctaLabel: "Shop cases",
    ctaHref: "/category/cases-and-covers",
    imageUrl: bannerPlaceholder("banner-2"),
    bg: "from-[#6a11cb] via-[#8e2de2] to-[#4a00e0]",
    textTone: "light",
  },
  {
    id: "banner-3",
    eyebrow: "Power Collection",
    title: "Charge at full speed",
    subtitle: "GaN chargers, 100W braided cables & MagSafe power banks.",
    ctaLabel: "Shop charging",
    ctaHref: "/category/chargers",
    imageUrl: bannerPlaceholder("banner-3"),
    bg: "from-[#11998e] to-[#38ef7d]",
    textTone: "light",
  },
  {
    id: "banner-4",
    eyebrow: "Snap-on Lifestyle",
    title: "MagSafe, meet everyday",
    subtitle: "Magnetic wallets, rings, mounts and straps that just click.",
    ctaLabel: "Shop MagSafe",
    ctaHref: "/category/magsafe-and-wallets",
    imageUrl: bannerPlaceholder("banner-4"),
    bg: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    textTone: "light",
  },
  {
    id: "banner-5",
    eyebrow: "Express Yourself",
    title: "Straps & charms are here",
    subtitle: "Crossbody straps, wrist straps and playful charms for your phone.",
    ctaLabel: "Shop straps & charms",
    ctaHref: "/category/straps-and-charms",
    imageUrl: bannerPlaceholder("banner-5"),
    bg: "from-[#ee0979] to-[#ff6a00]",
    textTone: "light",
  },
];

export const coupons: Coupon[] = [
  {
    code: "CREDO10",
    description: "10% off on your first order",
    type: "percent",
    value: 10,
    minOrder: 499,
    maxDiscount: 300,
    active: true,
  },
  {
    code: "FLAT150",
    description: "Flat ₹150 off on orders above ₹999",
    type: "flat",
    value: 150,
    minOrder: 999,
    active: true,
  },
  {
    code: "TN20",
    description: "Tamil Nadu special — 20% off up to ₹500",
    type: "percent",
    value: 20,
    minOrder: 1499,
    maxDiscount: 500,
    active: true,
  },
];

const reviewSeed: Array<[string, number, string, string, string]> = [
  ["Arun Kumar", 5, "Excellent quality", "Perfect fit and premium feel. Delivery to Coimbatore was quick.", "2026-06-20T10:00:00.000Z"],
  ["Priya S", 4, "Good value for money", "Works as described. Packaging could be better.", "2026-06-18T10:00:00.000Z"],
  ["Mohammed Rafi", 5, "Highly recommend", "Charges super fast, no heating issues at all.", "2026-06-15T10:00:00.000Z"],
  ["Deepa R", 4, "Nice product", "Looks premium and feels durable. Happy with the purchase.", "2026-06-10T10:00:00.000Z"],
  ["Karthik V", 3, "Decent", "Does the job but expected slightly better build.", "2026-06-05T10:00:00.000Z"],
  ["Sneha M", 5, "Loved it", "Exactly as shown. Great CredoBuy service!", "2026-05-28T10:00:00.000Z"],
];

/** Generate a few reviews per product deterministically. */
export function reviewsForProduct(productId: string, rating: number): Review[] {
  const count = 4;
  return reviewSeed.slice(0, count).map(([userName, , title, body, createdAt], i) => ({
    id: `${productId}-review-${i}`,
    productId,
    userName,
    rating: Math.min(5, Math.max(1, Math.round(rating) + (i % 2 === 0 ? 0 : -1))),
    title,
    body,
    createdAt,
    verified: i !== 2,
  }));
}

export const distributors: Distributor[] = [
  {
    id: "dist-1",
    name: "Chennai Mobile Accessories Pvt Ltd",
    contactPerson: "Suresh Babu",
    phone: "9840012345",
    email: "sales@chennaimobacc.in",
    city: "Chennai",
    state: "Tamil Nadu",
    productCount: 320,
  },
  {
    id: "dist-2",
    name: "Coimbatore Gadget Hub",
    contactPerson: "Lakshmi Narayanan",
    phone: "9842198765",
    email: "orders@cbegadgethub.in",
    city: "Coimbatore",
    state: "Tamil Nadu",
    productCount: 210,
  },
  {
    id: "dist-3",
    name: "Madurai TechTrade",
    contactPerson: "Vignesh R",
    phone: "9843321100",
    email: "contact@maduraitechtrade.in",
    city: "Madurai",
    state: "Tamil Nadu",
    productCount: 145,
  },
  {
    id: "dist-4",
    name: "Bengaluru Distribution Co",
    contactPerson: "Anil Gupta",
    phone: "9845567890",
    email: "hello@blrdistro.in",
    city: "Bengaluru",
    state: "Karnataka",
    productCount: 260,
  },
];

/** Popular Tamil Nadu PIN codes with fast delivery. */
export const fastDeliveryPincodes = [
  "600001",
  "600028",
  "641001",
  "641012",
  "625001",
  "620001",
  "636001",
  "627001",
];
