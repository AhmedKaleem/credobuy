"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom-right action stack — Shop with AI above WhatsApp.
 * AI button matches WhatsApp size; label expands on hover or click.
 */
export function FloatingActions() {
  const pushToast = useToast((s) => s.push);
  const [aiOpen, setAiOpen] = useState(false);
  const aiRef = useRef<HTMLButtonElement>(null);

  const phone =
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "919000000000";
  const text = encodeURIComponent(
    "Hi CredoBuy, I need help with my order / a product."
  );

  useEffect(() => {
    if (!aiOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) {
        setAiOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [aiOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <button
        ref={aiRef}
        type="button"
        aria-label="Shop with AI"
        aria-expanded={aiOpen}
        onClick={() => {
          setAiOpen((v) => !v);
          if (!aiOpen) pushToast("Shop with AI coming soon", "info");
        }}
        className={cn(
          "group flex h-14 items-center overflow-hidden rounded-full bg-foreground text-background shadow-[var(--shadow-hover)]",
          "transition-[width,transform,padding] duration-300 ease-out hover:scale-[1.03]",
          aiOpen ? "w-auto gap-2 pl-3.5 pr-5" : "w-14 justify-center hover:w-auto hover:gap-2 hover:pl-3.5 hover:pr-5"
        )}
      >
        <Sparkles size={22} strokeWidth={1.7} className="shrink-0" />
        <span
          className={cn(
            "whitespace-nowrap text-sm font-semibold transition-[max-width,opacity] duration-300",
            aiOpen
              ? "max-w-[9rem] opacity-100"
              : "max-w-0 opacity-0 group-hover:max-w-[9rem] group-hover:opacity-100"
          )}
        >
          Shop with AI
        </span>
      </button>

      <a
        href={`https://wa.me/${phone}?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-hover)] transition-transform hover:scale-105"
      >
        <MessageCircle size={26} className="fill-white/20" />
      </a>
    </div>
  );
}
