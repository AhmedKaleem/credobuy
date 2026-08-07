import { Quote } from "lucide-react";
import { StarRow } from "@/components/ui/Rating";

const testimonials = [
  {
    name: "Ananya R.",
    city: "Chennai",
    rating: 5,
    text: "Ordered a case and tempered glass for my iPhone 16 Pro. Perfect fit and delivered in 2 days. Will shop again!",
  },
  {
    name: "Vijay K.",
    city: "Coimbatore",
    rating: 5,
    text: "The 67W GaN charger is fantastic and priced better than everywhere else. Genuine product with warranty.",
  },
  {
    name: "Fatima S.",
    city: "Madurai",
    rating: 4,
    text: "Loved the Shop by Device feature — made it so easy to find accessories for my Galaxy S24.",
  },
];

export function ReviewsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((t) => (
        <figure
          key={t.name}
          className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6"
        >
          <Quote size={28} className="text-primary/30" />
          <blockquote className="mt-2 flex-1 text-sm text-foreground">
            {t.text}
          </blockquote>
          <StarRow value={t.rating} size={14} />
          <figcaption className="mt-2 text-sm font-semibold">
            {t.name}
            <span className="font-normal text-muted"> · {t.city}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
