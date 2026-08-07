import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
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

  const { isSupabaseConfigured } = await import("../src/lib/config");
  const { getCategories, getAllProducts } = await import("../src/lib/queries");
  const { products: localProducts } = await import("../src/data/products");

  const configured = isSupabaseConfigured();
  const categories = await getCategories();
  const products = await getAllProducts();

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const productIdsUuid = products.filter((p) => uuidRe.test(p.id)).length;
  const categoryIdsUuid = categories.filter((c) => uuidRe.test(c.id)).length;
  const localIdOverlap = products.filter((p) =>
    localProducts.some((lp) => lp.id === p.id)
  ).length;

  const source =
    configured && productIdsUuid > 0 && localIdOverlap === 0
      ? "supabase"
      : configured && localIdOverlap > 0
        ? "local-fallback-or-mixed"
        : "local";

  console.log(
    JSON.stringify(
      {
        isSupabaseConfigured: configured,
        categoriesCount: categories.length,
        categoriesWithUuidIds: categoryIdsUuid,
        productsCount: products.length,
        productsWithUuidIds: productIdsUuid,
        overlapWithLocalProductIds: localIdOverlap,
        localProductsCount: localProducts.length,
        verdict: source,
        categorySample: categories.slice(0, 3).map((c) => ({
          slug: c.slug,
          id: c.id,
          productCount: c.productCount,
        })),
        productSample: products.slice(0, 3).map((p) => ({
          slug: p.slug,
          id: p.id,
          title: p.title,
        })),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
