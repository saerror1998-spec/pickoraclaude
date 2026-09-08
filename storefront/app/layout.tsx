import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";

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

export const metadata: Metadata = {
  title: "Pickora — Premium Refurbished Laptops",
  description:
    "Ask more of your laptop. Premium refurbished laptops, professionally inspected and warrantied.",
  icons: {
    icon: "/pickoralogi.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
