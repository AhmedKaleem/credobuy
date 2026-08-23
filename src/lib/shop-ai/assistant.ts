import type { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  getAllProducts,
  getBestSellers,
  getCategories,
  searchProducts,
} from "@/lib/queries";

export type ShopAiProductCard = {
  id: string;
  title: string;
  slug: string;
  priceLabel: string;
  imageUrl: string;
  href: string;
};

export type ShopAiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ShopAiReply = {
  reply: string;
  products: ShopAiProductCard[];
  provider: "llm" | "catalog";
};

function toCard(p: Product): ShopAiProductCard {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    priceLabel: formatINR(p.price),
    imageUrl: p.images[0]?.url ?? "",
    href: `/product/${p.slug}`,
  };
}

/** Pull keywords / budget / device hints from free text. */
function extractHints(text: string): {
  budgetMax?: number;
  tokens: string[];
} {
  const lower = text.toLowerCase();
  const tokens = lower
    .replace(/[^\p{L}\p{N}\s+]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  let budgetMax: number | undefined;
  const under = lower.match(
    /(?:under|below|less than|upto|up to|max|within)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i
  );
  const bare = lower.match(/(?:₹|rs\.?)\s*(\d{2,6})/i);
  if (under?.[1]) budgetMax = Number(under[1]);
  else if (bare?.[1]) budgetMax = Number(bare[1]);

  return { budgetMax, tokens };
}

function scoreProduct(p: Product, tokens: string[]): number {
  const hay = [
    p.title,
    p.description,
    p.shortDescription,
    p.brandName ?? "",
    p.department,
    p.taxonomyCategory,
    p.subCategory,
    p.productType,
    p.compatibleDevice,
    ...(p.tags ?? []),
    ...(p.colors ?? []),
    ...(p.features ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += t.length > 3 ? 3 : 1;
  }
  if (p.isBestSeller) score += 2;
  if (p.isNewArrival) score += 1;
  if (p.stockStatus === "out_of_stock") score -= 5;
  return score;
}

export async function findRelevantProducts(
  query: string,
  limit = 6
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return (await getBestSellers(limit)).slice(0, limit);

  const { budgetMax, tokens } = extractHints(trimmed);
  const searched = await searchProducts(trimmed);
  const all = searched.length >= 3 ? searched : await getAllProducts();

  let ranked = [...all]
    .map((p) => ({ p, s: scoreProduct(p, tokens) }))
    .filter((x) => x.s > 0 || searched.some((s) => s.id === x.p.id))
    .sort((a, b) => b.s - a.s || a.p.price - b.p.price)
    .map((x) => x.p);

  if (budgetMax != null) {
    ranked = ranked.filter((p) => p.price <= budgetMax);
  }

  if (ranked.length === 0) {
    ranked = searched.length ? searched : await getBestSellers(limit);
  }

  return ranked.slice(0, limit);
}

export function productsToContext(products: Product[]): string {
  return products
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} | ${formatINR(p.price)} | /product/${p.slug} | stock:${p.stockStatus}${
          p.brandName ? ` | brand:${p.brandName}` : ""
        }`
    )
    .join("\n");
}

export async function catalogFallbackReply(
  userMessage: string,
  history: ShopAiMessage[]
): Promise<ShopAiReply> {
  const lower = userMessage.toLowerCase();
  const categories = await getCategories();
  const products = await findRelevantProducts(userMessage, 5);
  const cards = products.map(toCard);

  const isGreeting =
    /^(hi|hello|hey|namaste|vanakkam)\b/.test(lower) ||
    lower.trim().length < 3;
  const isHelp =
    /\b(help|what can you|how do you|shipping|return|refund|cod|razorpay)\b/.test(
      lower
    );

  if (isGreeting && history.filter((m) => m.role === "user").length <= 1) {
    const catNames = categories
      .slice(0, 5)
      .map((c) => c.name)
      .join(", ");
    return {
      reply: `Hi — I’m CredoBuy’s shopping assistant. Tell me your phone model, what you need (case, charger, earbuds…), and a budget if you have one. Popular categories: ${catNames}.`,
      products: (await getBestSellers(4)).map(toCard),
      provider: "catalog",
    };
  }

  if (isHelp) {
    return {
      reply:
        "I can recommend accessories by device, budget, and use-case. We ship across India (fast in Tamil Nadu), support Razorpay checkout, and handle returns via Contact / Help. What are you shopping for today?",
      products: cards.slice(0, 3),
      provider: "catalog",
    };
  }

  if (cards.length === 0) {
    return {
      reply:
        "I couldn’t match that to our catalogue yet. Try a product type (e.g. MagSafe case), a brand, or your phone model like “iPhone 16 Pro”.",
      products: (await getBestSellers(4)).map(toCard),
      provider: "catalog",
    };
  }

  const list = cards
    .slice(0, 3)
    .map((c) => `• ${c.title} — ${c.priceLabel}`)
    .join("\n");

  return {
    reply: `Here are solid matches for “${userMessage.trim()}”:\n${list}\n\nTap a product below, or tell me your phone model / max budget and I’ll refine.`,
    products: cards,
    provider: "catalog",
  };
}

type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

function getLlmConfig(): LlmConfig | null {
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (openai) {
    return {
      apiKey: openai,
      baseUrl:
        process.env.OPENAI_BASE_URL?.trim() ||
        "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) {
    return {
      apiKey: groq,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    };
  }
  return null;
}

export function isShopAiLlmConfigured(): boolean {
  return Boolean(getLlmConfig());
}

export async function generateShopAiReply(input: {
  message: string;
  history?: ShopAiMessage[];
}): Promise<ShopAiReply> {
  const message = input.message.trim().slice(0, 2000);
  if (!message) {
    return {
      reply: "Tell me what you’re looking for — case, charger, earbuds, or your phone model.",
      products: [],
      provider: "catalog",
    };
  }

  const history = (input.history ?? []).slice(-8);
  const products = await findRelevantProducts(message, 6);
  const cards = products.map(toCard);
  const llm = getLlmConfig();

  if (!llm) {
    return catalogFallbackReply(message, history);
  }

  const system = `You are CredoBuy Shop with AI — a concise shopping assistant for premium mobile accessories in India (Tamil Nadu focus).
Rules:
- Only recommend from the CATALOGUE list below. Never invent products or prices.
- Prefer short, friendly replies (2–5 sentences). Use Indian English lightly when natural.
- Ask one clarifying question when the query is vague (device model / budget / use-case).
- Mention INR prices from the catalogue when recommending.
- If nothing fits, say so and suggest browsing categories or WhatsApp support.
- Do not discuss unrelated topics, politics, or medical/legal advice.

CATALOGUE:
${productsToContext(products) || "(no matches — ask clarifying questions)"}`;

  const messages = [
    { role: "system" as const, content: system },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 1500),
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const res = await fetch(`${llm.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llm.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: llm.model,
        temperature: 0.4,
        max_tokens: 450,
        messages,
      }),
    });

    if (!res.ok) {
      console.error("Shop AI LLM error:", await res.text());
      return catalogFallbackReply(message, history);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      (await catalogFallbackReply(message, history)).reply;

    return { reply, products: cards, provider: "llm" };
  } catch (e) {
    console.error("Shop AI LLM failed:", e);
    return catalogFallbackReply(message, history);
  }
}
