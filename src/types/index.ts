/**
 * Shared domain types for CredoBuy.
 * These mirror the Supabase schema in /supabase/schema.sql.
 */

export type UUID = string;
export type ISODate = string;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "cod" | "mock";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  imageUrl: string;
  productCount: number;
  sortOrder: number;
}

export interface Brand {
  id: UUID;
  slug: string;
  name: string;
  logoUrl: string;
}

/** A mobile phone manufacturer, e.g. Apple, Samsung. */
export interface DeviceBrand {
  id: UUID;
  slug: string;
  name: string;
  logoUrl: string;
}

/** A specific phone model, e.g. iPhone 16 Pro. */
export interface DeviceModel {
  id: UUID;
  deviceBrandId: UUID;
  slug: string;
  name: string;
  imageUrl: string;
  releaseYear: number;
}

export interface ProductVariant {
  id: UUID;
  productId: UUID;
  sku: string;
  name: string; // e.g. "Midnight Black / 65W"
  color?: string;
  material?: string;
  price: number; // selling price in INR (paise-free rupees)
  mrp: number;
  stock: number;
  isDefault: boolean;
}

export interface ProductImage {
  id: UUID;
  productId: UUID;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: UUID;
  slug: string;
  title: string;
  brandId: UUID;
  /** Denormalized for cards / client UI when brand lookup uses DB UUIDs. */
  brandName?: string;
  categoryId: UUID;
  /** Extended catalogue taxonomy (sourced from brand catalogues). */
  department: string;
  taxonomyCategory: string;
  subCategory: string;
  series: string;
  productCategory: string;
  productType: string;
  /** Display variant label (colour / finish / size). Empty when "-" in source. */
  variantLabel: string;
  /** Free-text compatibility from source catalogues (e.g. "All iPhone Models"). */
  compatibleDevice: string;
  shortDescription: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  features: string[];
  specs: ProductSpec[];
  /** device model ids this accessory is compatible with (empty = universal) */
  compatibleModelIds: UUID[];
  universal: boolean;
  connectorType?: string; // USB-C, Lightning, Micro-USB
  wattage?: number; // charging wattage
  colors: string[];
  material?: string;
  warrantyMonths: number;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags: string[];
  createdAt: ISODate;
}

export interface Address {
  id: UUID;
  userId: UUID;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: "home" | "work" | "other";
}

export interface UserProfile {
  id: UUID;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: ISODate;
}

export interface CartItem {
  productId: UUID;
  variantId: UUID;
  quantity: number;
}

export interface WishlistItem {
  productId: UUID;
  addedAt: ISODate;
}

export interface OrderItem {
  id: UUID;
  productId: UUID;
  variantId: UUID;
  title: string;
  variantName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  userId: UUID;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  placedAt: ISODate;
  timeline: OrderTimelineEntry[];
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  label: string;
  at: ISODate | null;
  done: boolean;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  active: boolean;
}

export interface Review {
  id: UUID;
  productId: UUID;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: ISODate;
  verified: boolean;
}

export interface Distributor {
  id: UUID;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  productCount: number;
  userId?: UUID;
  priority?: number;
}

/** Assignment lifecycle for a single order line. */
export type FulfillmentStatus =
  | "pending"
  | "offered"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled"
  | "packed"
  | "shipped"
  | "delivered"
  | "failed";

/**
 * One fulfillment assignment for an order item.
 * customerUnitPrice is locked at checkout; supplier cost may change on reroute
 * (CredoBuy absorbs costVariance).
 */
export interface OrderFulfillment {
  id: UUID;
  orderId: UUID;
  orderItemId: UUID;
  productId?: UUID;
  quantity: number;
  distributorId?: UUID;
  status: FulfillmentStatus;
  customerUnitPrice: number;
  supplierUnitCost?: number;
  costVariance: number;
  attemptNumber: number;
  maxAttempts: number;
  rejectReason?: string;
  slaDeadline?: ISODate;
  adminOverride: boolean;
  notes?: string;
  assignedAt?: ISODate;
  acceptedAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
  /** Joined for UI */
  productTitle?: string;
  orderNumber?: string;
  distributorName?: string;
}

export interface Banner {
  id: UUID;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  bg: string; // tailwind gradient classes
  eyebrow?: string; // small collab / collection tag above the title
  textTone?: "light" | "dark"; // overlay text colour for legibility
}

/** Where a promotion appears in the storefront. */
export type PromotionPlacement =
  | "announcement"
  | "offers_strip"
  | "deal_of_the_day";

/**
 * Unified CMS row for top bar, offers strip, and deal-of-the-day.
 * Coupons and hero banners stay in their own tables.
 */
export interface Promotion {
  id: UUID;
  placement: PromotionPlacement;
  title?: string;
  message: string;
  href?: string;
  icon?: string;
  productId?: UUID;
  sortOrder: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
}

/** @deprecated Use Promotion with placement "announcement". */
export type Announcement = Pick<
  Promotion,
  "id" | "message" | "href" | "sortOrder" | "isActive"
>;

/** Filters applied on a product listing page. */
export interface ProductFilters {
  categorySlug?: string;
  brandSlugs?: string[];
  modelId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  minDiscount?: number;
  connectorTypes?: string[];
  wattages?: number[];
  colors?: string[];
  materials?: string[];
  warrantyMonths?: number[];
  search?: string;
  sort?: SortOption;
}

export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "newest"
  | "discount_desc";
