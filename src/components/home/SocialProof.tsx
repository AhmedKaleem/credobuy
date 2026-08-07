import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ananya R.",
    city: "Chennai",
    product: "Impact Case · iPhone 16 Pro",
    text: "Perfect fit and genuinely premium in the hand. Survived a nasty drop on day two — not a scratch on the phone.",
  },
  {
    name: "Vijay K.",
    city: "Coimbatore",
    product: "67W GaN Charger",
    text: "Tiny, powerful and cheaper than everywhere else. Charges my laptop and phone. Genuine product with warranty.",
  },
  {
    name: "Fatima S.",
    city: "Madurai",
    product: "Tempered Glass · Galaxy S24",
    text: "The 'find your device' selector made it effortless. Everything I ordered fit my phone exactly. Delivered in 2 days.",
  },
];

export function SocialProof() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 sm:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-1 text-[var(--color-rating)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={20} className="fill-[var(--color-rating)]" />
          ))}
        </div>
        <p className="text-2xl font-semibold tracking-tight">
          4.8 · Loved by 20,000+ customers
        </p>
        <p className="text-sm text-muted">
          Rated across cases, chargers, audio and more.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl bg-surface-muted/60 p-6"
          >
            <div className="flex items-center gap-0.5 text-[var(--color-rating)]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="fill-[var(--color-rating)]" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
              “{t.text}”
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-muted"> · {t.city}</span>
              <span className="mt-0.5 block text-xs text-muted">{t.product}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
