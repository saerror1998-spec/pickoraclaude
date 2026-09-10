import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: "400",
});

const SITE_URL = "https://pickoraonline.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Refurbished Laptops Dubai & UAE – Up to 40% Off | Pickora",
  description:
    "Shop certified refurbished laptops in Dubai & the UAE — Dell, HP & Lenovo, inspected and warrantied 90 days. Free shipping, 0% APR with Tabby/Tamara.",
  icons: {
    icon: "/pickoralogi.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Pickora",
    title: "Refurbished Laptops Dubai & UAE – Up to 40% Off | Pickora",
    description:
      "Shop certified refurbished laptops in Dubai & the UAE — Dell, HP & Lenovo, inspected and warrantied 90 days.",
  },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pickora",
  url: SITE_URL,
  logo: `${SITE_URL}/pickoralogi.svg`,
  email: "hello@pickoraonline.com",
  sameAs: ["https://www.instagram.com/pickora.online", "https://www.tiktok.com/@pickora.online"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <PageTransition />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
