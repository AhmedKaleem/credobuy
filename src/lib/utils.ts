import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a rupee amount for the Indian market. */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Discount percentage from MRP and selling price. */
export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** A short, human-friendly relative time. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/** Format a date for display, e.g. "15 Jul 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Deterministic slugify. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Validate an Indian 6-digit PIN code. */
export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

/** Validate a 10-digit Indian mobile number. */
export function isValidPhone(phone: string): boolean {
  return /^[6-9][0-9]{9}$/.test(phone.replace(/\D/g, ""));
}

/** Generate a readable order number. */
export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CB${y}${rand}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
