import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Toaster } from "@/components/ui/Toaster";
import { getAnnouncements, getCategories, getDeviceBrands, getBestSellers } from "@/lib/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CredoBuy — Premium Mobile Accessories in India",
    template: "%s | CredoBuy",
  },
  description:
    "Shop premium yet affordable mobile accessories — cases, screen protectors, chargers, cables, power banks, earbuds and more. Fast delivery across Tamil Nadu & India.",
  keywords: [
    "mobile accessories",
    "phone cases",
    "chargers",
    "power banks",
    "earbuds",
    "India",
    "Tamil Nadu",
  ],
  openGraph: {
    title: "CredoBuy — Premium Mobile Accessories",
    description:
      "Cases, chargers, cables, power banks & audio for every phone. Shop by device and find perfectly compatible accessories.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, deviceBrands, bestSellers, announcements] =
    await Promise.all([
      getCategories(),
      getDeviceBrands(),
      getBestSellers(4),
      getAnnouncements(),
    ]);

  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <AnnouncementBar announcements={announcements} />
        <Header
          categories={categories}
          deviceBrands={deviceBrands}
          bestSellers={bestSellers}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer categories={categories} />
        <FloatingActions />
        <Toaster />
      </body>
    </html>
  );
}
