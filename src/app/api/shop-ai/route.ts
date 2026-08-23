import { NextResponse } from "next/server";
import {
  generateShopAiReply,
  type ShopAiMessage,
} from "@/lib/shop-ai/assistant";

export const runtime = "nodejs";

type Body = {
  message?: string;
  history?: ShopAiMessage[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message : "";
  if (!message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is ShopAiMessage =>
            !!m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .slice(-8)
    : [];

  try {
    const result = await generateShopAiReply({ message, history });
    return NextResponse.json(result);
  } catch (e) {
    console.error("shop-ai route:", e);
    return NextResponse.json(
      { error: "Assistant is temporarily unavailable." },
      { status: 500 }
    );
  }
}
