/**
 * Upsert the ₹49 Razorpay test SKU into Supabase.
 * Usage: npx tsx scripts/upsert-payment-test-product.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products";
import { categories, brands } from "../src/data/catalog";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  } catch {
    /* ignore */
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const p = products.find((x) => x.slug === "credobuy-payment-test-49");
  if (!p) throw new Error("Test product not found in local catalogue");

  const { data: dbCats } = await sb.from("categories").select("id, slug");
  const { data: dbBrands } = await sb.from("brands").select("id, slug, name");
  const catId = (dbCats ?? []).find((c) => c.slug === "charging-cables")?.id;
  const brand =
    (dbBrands ?? []).find((b) => b.slug === "credobuy") ??
    (dbBrands ?? []).find((b) => String(b.name).toLowerCase() === "credobuy");

  const row = {
    slug: p.slug,
    title: p.title,
    brand_id: brand?.id ?? null,
    category_id: catId ?? null,
    brand_name: brand?.name ?? "CredoBuy",
    short_description: p.shortDescription,
    description: p.description,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    review_count: p.reviewCount,
    stock_status: p.stockStatus,
    stock: p.stock,
    product_images: p.images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      sort_order: i,
    })),
    product_variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      is_default: v.isDefault,
    })),
    features: p.features,
    specs: p.specs,
    colors: p.colors,
    warranty_months: p.warrantyMonths,
    universal: true,
    is_trending: false,
    is_best_seller: false,
    is_new_arrival: true,
    tags: p.tags,
    is_active: true,
  };

  const { error } = await sb.from("products").upsert(row, { onConflict: "slug" });
  if (error) throw error;
  console.log("Upserted", p.slug, "at ₹", p.price);
  console.log(
    "Local category/brand refs:",
    categories.find((c) => c.id === p.categoryId)?.slug,
    brands.find((b) => b.id === p.brandId)?.slug
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
