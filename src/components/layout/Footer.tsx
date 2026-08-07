import Link from "next/link";
import { AtSign, MessageCircle, Send } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import type { Category } from "@/types";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Shop by Device", href: "/device" },
  { label: "Best Sellers", href: "/shop?sort=rating_desc" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sort=discount_desc" },
];

const helpLinks = [
  { label: "Track Order", href: "/track" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Shipping & Delivery", href: "/help/shipping" },
  { label: "Returns & Warranty", href: "/help/returns" },
];

const companyLinks = [
  { label: "About CredoBuy", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Distributor Enquiry", href: "/distributors" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-20 bg-secondary text-white/80">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <span className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-secondary">
                <span className="text-sm font-black leading-none tracking-tighter">C</span>
              </span>
              <span className="text-[1.35rem] font-semibold lowercase leading-none tracking-tight">
                credo<span className="text-white/50">buy</span>
              </span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Premium accessories, engineered to perform. Designed for your
              devices — proudly shipping across India from Tamil Nadu.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[AtSign, MessageCircle, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={categories.slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}` }))}
          />
          <FooterCol title="Explore" links={shopLinks} />
          <FooterCol title="Help" links={helpLinks} />
          <FooterCol title="Company" links={companyLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CredoBuy. All rights reserved.</p>
          <p>
            Free shipping over ₹499 · 2-year warranty · 30-day returns · Secure
            checkout
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
