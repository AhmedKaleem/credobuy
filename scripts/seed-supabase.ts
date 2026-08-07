/**
 * Seed Supabase from the local typed catalogue (final V1 schema).
 *
 * Usage:
 *   1. Fill .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   2. Run schema.sql, then rls.sql in Supabase SQL editor
 *   3. npm run seed:supabase
 *
 * Seeds: categories, brands, device_*, products, coupons, distributors,
 *        banners, promotions, fast_delivery_pincodes
 * Skips (runtime / Auth): users, addresses, carts, cart_items, wishlists,
 *        orders, order_items, payments, shipments, reviews, supplier_products
 */
import { createClient } from "@supabase/supabase-js";
import { brands, categories, deviceBrands, deviceModels } from "../src/data/catalog";
import { products } from "../src/data/products";
import {
  coupons,
  distributors,
  fastDeliveryPincodes,
  heroBanners,
  promotions,
} from "../src/data/marketing";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function main() {
  try {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // env may already be injected
  }

  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Seeding categories…");
  for (const c of categories) {
    const { error } = await sb.from("categories").upsert(
      {
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        image_url: c.imageUrl,
        sort_order: c.sortOrder,
        is_active: true,
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  console.log("Seeding brands…");
  for (const b of brands) {
    const { error } = await sb.from("brands").upsert(
      { slug: b.slug, name: b.name, logo_url: b.logoUrl },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  console.log("Seeding device brands…");
  for (const [i, b] of deviceBrands.entries()) {
    const { error } = await sb.from("device_brands").upsert(
      {
        slug: b.slug,
        name: b.name,
        logo_url: b.logoUrl,
        sort_order: i + 1,
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  const { data: dbDeviceBrands, error: dbErr } = await sb
    .from("device_brands")
    .select("id, slug");
  if (dbErr) throw dbErr;
  const deviceBrandIdBySlug = new Map(
    (dbDeviceBrands ?? []).map((b) => [b.slug as string, b.id as string])
  );

  console.log("Seeding device models…");
  for (const m of deviceModels) {
    const localBrand = deviceBrands.find((b) => b.id === m.deviceBrandId);
    const deviceBrandId = localBrand
      ? deviceBrandIdBySlug.get(localBrand.slug)
      : undefined;
    if (!deviceBrandId) continue;
    const { error } = await sb.from("device_models").upsert(
      {
        device_brand_id: deviceBrandId,
        slug: m.slug,
        name: m.name,
        image_url: m.imageUrl,
        release_year: m.releaseYear,
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  const { data: dbCats } = await sb.from("categories").select("id, slug");
  const { data: dbBrands } = await sb.from("brands").select("id, slug, name");
  const { data: dbModels } = await sb.from("device_models").select("id, slug");
  const catIdBySlug = new Map(
    (dbCats ?? []).map((c) => [c.slug as string, c.id as string])
  );
  const brandIdBySlug = new Map(
    (dbBrands ?? []).map((b) => [b.slug as string, b.id as string])
  );
  const brandNameBySlug = new Map(
    (dbBrands ?? []).map((b) => [b.slug as string, b.name as string])
  );
  const modelIdBySlug = new Map(
    (dbModels ?? []).map((m) => [m.slug as string, m.id as string])
  );
  const localModelSlug = new Map(deviceModels.map((m) => [m.id, m.slug]));
  const localCatSlug = new Map(categories.map((c) => [c.id, c.slug]));
  const localBrandSlug = new Map(brands.map((b) => [b.id, b.slug]));

  console.log(`Seeding ${products.length} products…`);
  let ok = 0;
  for (const p of products) {
    const catSlug = localCatSlug.get(p.categoryId);
    const brandSlug = localBrandSlug.get(p.brandId);
    const category_id = catSlug ? catIdBySlug.get(catSlug) : null;
    const brand_id = brandSlug ? brandIdBySlug.get(brandSlug) : null;
    const brand_name = brandSlug ? brandNameBySlug.get(brandSlug) : null;

    const compatible_model_ids = p.compatibleModelIds
      .map((localId) => {
        const slug = localModelSlug.get(localId);
        return slug ? modelIdBySlug.get(slug) : undefined;
      })
      .filter((id): id is string => Boolean(id));

    const product_images = p.images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      sort_order: img.sortOrder ?? i,
    }));

    const product_variants = p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      color: v.color ?? null,
      material: v.material ?? null,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      is_default: v.isDefault,
    }));

    const row: Record<string, unknown> = {
      slug: p.slug,
      title: p.title,
      brand_id: brand_id ?? null,
      category_id: category_id ?? null,
      brand_name: brand_name ?? null,
      department: p.department,
      taxonomy_category: p.taxonomyCategory,
      sub_category: p.subCategory,
      series: p.series,
      product_category: p.productCategory,
      product_type: p.productType,
      short_description: p.shortDescription,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      rating: p.rating,
      review_count: p.reviewCount,
      stock_status: p.stockStatus,
      stock: p.stock,
      product_images,
      product_variants,
      features: p.features,
      specs: p.specs,
      connector_type: p.connectorType ?? null,
      wattage: p.wattage ?? null,
      colors: p.colors,
      material: p.material ?? null,
      warranty_months: p.warrantyMonths,
      universal: p.universal,
      is_trending: p.isTrending,
      is_best_seller: p.isBestSeller,
      is_new_arrival: p.isNewArrival,
      tags: p.tags,
      is_active: true,
    };
    // Omit empty compatible_model_ids — PostgREST turns [] into invalid uuid input
    if (compatible_model_ids.length > 0) {
      row.compatible_model_ids = compatible_model_ids;
    }

    const { error } = await sb.from("products").upsert(row, { onConflict: "slug" });
    if (error) {
      console.error("Product failed", p.slug, error.message);
      continue;
    }
    ok += 1;
  }
  console.log(`Products upserted: ${ok}/${products.length}`);

  console.log("Seeding coupons…");
  for (const c of coupons) {
    const { error } = await sb.from("coupons").upsert(
      {
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value,
        min_order: c.minOrder,
        max_discount: c.maxDiscount ?? null,
        active: c.active,
      },
      { onConflict: "code" }
    );
    if (error) console.error("Coupon failed", c.code, error.message);
  }

  console.log("Seeding distributors…");
  for (const d of distributors) {
    const { data: existing } = await sb
      .from("distributors")
      .select("id")
      .eq("email", d.email)
      .maybeSingle();
    if (existing) {
      await sb
        .from("distributors")
        .update({
          name: d.name,
          contact_person: d.contactPerson,
          phone: d.phone,
          city: d.city,
          state: d.state,
        })
        .eq("id", existing.id);
    } else {
      await sb.from("distributors").insert({
        name: d.name,
        contact_person: d.contactPerson,
        phone: d.phone,
        email: d.email,
        city: d.city,
        state: d.state,
      });
    }
  }

  console.log("Seeding fast delivery pincodes…");
  for (const pin of fastDeliveryPincodes) {
    await sb.from("fast_delivery_pincodes").upsert({ pincode: pin });
  }

  console.log("Seeding promotions…");
  await sb
    .from("promotions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  for (const p of promotions) {
    const { error } = await sb.from("promotions").insert({
      placement: p.placement,
      title: p.title ?? null,
      message: p.message,
      href: p.href ?? null,
      icon: p.icon ?? null,
      product_id: p.productId ?? null,
      sort_order: p.sortOrder,
      is_active: p.isActive,
    });
    if (error) console.error("Promotion failed", p.message, error.message);
  }

  console.log("Seeding banners…");
  await sb
    .from("banners")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  let order = 1;
  for (const b of heroBanners) {
    const { error } = await sb.from("banners").insert({
      title: b.title,
      subtitle: b.subtitle,
      cta_label: b.ctaLabel,
      cta_href: b.ctaHref,
      bg: b.bg,
      sort_order: order++,
      is_active: true,
    });
    if (error) console.error("Banner failed", b.title, error.message);
  }

  console.log("Done.");
  console.log(
    "Skipped (created by app/Auth at runtime): users, addresses, carts, wishlists, orders, payments, shipments, reviews, supplier_products"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
