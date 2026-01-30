import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "MMO Store - Hệ thống bán tài khoản tự động Enterprise",
  description: "Cung cấp tài khoản Gmail, Facebook, TikTok... chất lượng cao, giao hàng tự động 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <div className="fixed inset-0 premium-gradient pointer-events-none -z-10 opacity-50" />
        <Toaster position="top-right" richColors theme="dark" />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
