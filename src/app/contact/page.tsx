import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";
import { getContactToEmail, getSupportWhatsAppNumber } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CredoBuy — order help, product questions, and WhatsApp support.",
};

export default function ContactPage() {
  const phone = getSupportWhatsAppNumber();
  const contactEmail = getContactToEmail();
  const waText = encodeURIComponent(
    "Hi CredoBuy, I need help with my order / a product."
  );
  const whatsappHref = `https://wa.me/${phone}?text=${waText}`;

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">Contact us</h1>
        <p className="mt-2 text-sm text-muted">
          Questions about an order, product fit, or bulk enquiry? Reach us
          below — we typically reply within a few hours on business days.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <MessageCircle size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold">WhatsApp</p>
            <p className="mt-1 text-xs text-muted">Fastest for order help</p>
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Mail size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold">Email</p>
            <p className="mt-1 break-all text-xs text-muted">{contactEmail}</p>
          </a>
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Phone size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold">Call</p>
            <p className="mt-1 text-xs text-muted">
              +{phone.slice(0, 2)} {phone.slice(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface-muted/50 p-4 text-sm text-muted">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
          <p>
            CredoBuy ships across India from Tamil Nadu. Track an existing order
            anytime on the{" "}
            <Link href="/track" className="font-semibold text-foreground underline">
              Track Order
            </Link>{" "}
            page.
          </p>
        </div>

        <ContactForm whatsappHref={whatsappHref} />
      </div>
    </Container>
  );
}
