import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
import LisensiGuard from "@/components/layout/LisensiGuard";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Takar — Kalkulator HPP & Manajemen Resep",
    template: "%s | Takar",
  },
  description:
    "Aplikasi kalkulator HPP dan manajemen resep untuk pelaku UMKM Kuliner dan Home Baking Indonesia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Takar",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full`}>
      <body className="h-full bg-[#f8f7f4] antialiased">
        <LisensiGuard>

        {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────── */}
        {/* Sidebar fixed di kiri, konten di kanan */}
        <div className="hidden lg:flex min-h-screen">
          <Sidebar />

          {/* Main content area — offset kiri sesuai lebar sidebar */}
          <div className="flex-1 ml-64">
            {/* Top bar desktop */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e8e4df] px-8 py-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-stone-800">Takar</h2>
                  <p className="text-xs text-stone-400">Kalkulator HPP &amp; Manajemen Resep</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2.5 py-1 rounded-full">
                    MVP v0.1
                  </span>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="max-w-4xl mx-auto px-8 py-6">
              {children}
            </main>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (< lg) ─────────────────────────────── */}
        {/* Full width, bottom nav */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNav />
        </div>

        </LisensiGuard>
      </body>
    </html>
  );
}
