"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { productPlaceholder } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

type ProductCard = {
  id: string;
  title: string;
  slug: string;
  priceLabel: string;
  imageUrl: string;
  href: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
};

const STARTERS = [
  "Case for iPhone 16 Pro under ₹1500",
  "Best MagSafe charger",
  "Earbuds for commuting",
  "Screen protector for Galaxy S24",
];

export function ShopAiPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I’m your CredoBuy shopping assistant. Ask for a case, charger, earbuds, or tell me your phone model and budget.",
    },
  ]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/shop-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        products?: ProductCard[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Sorry — I couldn’t answer that.",
          products: data.products,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Something went wrong on my side. Try again in a moment, or browse Shop while I recover.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close Shop with AI"
        className="absolute inset-0 bg-[#16150f]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-[61] flex h-[min(92dvh,640px)] w-full flex-col overflow-hidden",
          "rounded-t-2xl border border-border bg-surface shadow-[var(--shadow-hover)]",
          "sm:h-[min(80vh,640px)] sm:max-w-md sm:rounded-2xl"
        )}
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-sm font-bold tracking-tight">
              Shop with AI
            </h2>
            <p className="truncate text-xs text-muted">
              Product advice from the CredoBuy catalogue
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-2",
                m.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-surface-muted text-foreground"
                )}
              >
                {m.content}
              </div>
              {m.products && m.products.length > 0 ? (
                <ul className="grid w-full max-w-[92%] gap-2">
                  {m.products.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={p.href}
                        onClick={onClose}
                        className="flex gap-3 rounded-xl border border-border bg-surface p-2 transition-colors hover:bg-surface-muted"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                          <SmartImage
                            src={
                              p.imageUrl ||
                              productPlaceholder(p.title, p.slug)
                            }
                            alt={p.title}
                            ratio="aspect-square"
                          />
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug">
                            {p.title}
                          </p>
                          <p className="mt-1 text-xs font-bold text-accent">
                            {p.priceLabel}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {busy ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 size={14} className="animate-spin" />
              Finding matches…
            </div>
          ) : null}
        </div>

        {messages.length <= 2 ? (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-muted/50 p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about cases, chargers, earbuds…"
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
