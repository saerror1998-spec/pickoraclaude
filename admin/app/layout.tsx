import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: "400" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Pickora Admin",
  description: "Store operations, inventory, and performance metrics for Pickora.",
  icons: {
    icon: "/pickora-icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
