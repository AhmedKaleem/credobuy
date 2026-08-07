import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log(JSON.stringify({ ok: false, reason: "missing env" }, null, 2));
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cats = await sb
    .from("categories")
    .select("id,slug,name,is_active")
    .eq("is_active", true);
  const prods = await sb
    .from("products")
    .select("id,slug,title,is_active", { count: "exact" })
    .eq("is_active", true)
    .limit(5);

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  console.log(
    JSON.stringify(
      {
        ok: true,
        configured: true,
        categories: {
          error: cats.error?.message ?? null,
          count: cats.data?.length ?? 0,
          sample: (cats.data ?? []).slice(0, 5).map((c) => ({
            slug: c.slug,
            idIsUuid: uuidRe.test(String(c.id)),
          })),
        },
        products: {
          error: prods.error?.message ?? null,
          count: prods.count,
          sample: (prods.data ?? []).map((p) => ({
            slug: p.slug,
            title: p.title,
            idIsUuid: uuidRe.test(String(p.id)),
          })),
        },
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
