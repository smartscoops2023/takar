"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat, Package, BookOpen, Calculator,
  TrendingUp, ChevronRight, Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, kategoriResepColor } from "@/components/ui/Badge";
import { hitungHPP, formatRupiah } from "@/lib/types";
import type { Resep } from "@/lib/types";

interface DashboardData {
  totalBahan: number;
  totalResep: number;
  resepTerbaru: Resep[];
}

export default function BerandaClient() {
  const router = useRouter();
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Baca langsung dari storage lokal — tidak perlu fetch API
    import("@/lib/storage").then(({ getAllBahan, getAllResep, hitungHPPLocal }) => {
      const bahan = getAllBahan();
      const resep = getAllResep();
      setData({
        totalBahan: bahan.length,
        totalResep: resep.length,
        resepTerbaru: resep.slice(0, 5) as unknown as Resep[],
      });
      setLoading(false);
    });
  }, []);

  const EMOJI: Record<string, string> = {
    Kue: "🎂", Roti: "🍞", Minuman: "🥤",
    Makanan: "🍱", Snack: "🍿", Lainnya: "🍽️",
  };

  return (
    <div className="page-enter">

      {/* ── HERO MOBILE ── */}
      <div className="lg:hidden bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ChefHat size={20} className="text-white" />
          </div>
          <span className="text-white/80 text-sm font-medium">Selamat datang di</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Takar</h1>
        <p className="text-orange-100 text-sm mt-1 leading-relaxed">
          Kalkulator HPP &amp; Manajemen Resep untuk UMKM Kuliner
        </p>
      </div>

      {/* ── HEADER DESKTOP ── */}
      <div className="hidden lg:block mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Beranda</h1>
        <p className="text-stone-400 text-sm mt-1">
          Ringkasan data dan aktivitas terbaru
        </p>
      </div>

      <div className="px-4 lg:px-0 -mt-4 lg:mt-0 space-y-4 pb-6">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Bahan Baku */}
          <Card
            className="flex flex-col gap-1 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
            onClick={() => router.push("/bahan")}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package size={16} className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {loading ? <span className="inline-block w-8 h-6 bg-stone-100 rounded animate-pulse" /> : data?.totalBahan ?? 0}
            </p>
            <p className="text-xs text-stone-400">Bahan Baku</p>
          </Card>

          {/* Resep */}
          <Card
            className="flex flex-col gap-1 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
            onClick={() => router.push("/resep")}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <BookOpen size={16} className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {loading ? <span className="inline-block w-8 h-6 bg-stone-100 rounded animate-pulse" /> : data?.totalResep ?? 0}
            </p>
            <p className="text-xs text-stone-400">Resep</p>
          </Card>

          {/* HPP Terendah — desktop only */}
          <Card className="hidden lg:flex flex-col gap-1">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {loading || !data?.resepTerbaru?.length
                ? "—"
                : formatRupiah(
                    Math.min(...data.resepTerbaru.map((r) => hitungHPP(r).hppPerPcs).filter((v) => v > 0))
                  )
              }
            </p>
            <p className="text-xs text-stone-400">HPP Terendah</p>
          </Card>

          {/* Kalkulator — desktop only */}
          <Card
            className="hidden lg:flex flex-col gap-1 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
            onClick={() => router.push("/pengaturan")}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calculator size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {loading ? "—" : (data?.totalBahan ?? 0) + (data?.totalResep ?? 0)}
            </p>
            <p className="text-xs text-stone-400">Total Data</p>
          </Card>
        </div>

        {/* ── QUICK ACTION ── */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8e4df]">
            <p className="text-sm font-semibold text-stone-700">Aksi Cepat</p>
          </div>
          <div className="divide-y divide-[#e8e4df] lg:grid lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
            {[
              { href: "/bahan",  icon: Package,    label: "Tambah Bahan",   desc: "Input bahan & harga beli" },
              { href: "/resep",  icon: BookOpen,   label: "Buat Resep",     desc: "Hitung HPP & harga jual" },
              { href: "/resep",  icon: Calculator, label: "Konversi Dapur", desc: "Panduan takaran standar" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <a key={label} href={href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 active:bg-stone-100 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{label}</p>
                  <p className="text-xs text-stone-400">{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>

        {/* ── RESEP TERBARU ── */}
        {!loading && data && data.resepTerbaru.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4df]">
              <p className="text-sm font-semibold text-stone-700">Resep Terbaru</p>
              <button onClick={() => router.push("/resep")}
                className="text-xs text-orange-500 font-medium hover:underline">
                Lihat semua →
              </button>
            </div>
            <div className="divide-y divide-[#e8e4df]">
              {data.resepTerbaru.map((r) => {
                const hpp = hitungHPP(r);
                return (
                  <button key={r.id}
                    onClick={() => router.push(`/resep/${r.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                      {EMOJI[r.kategori] ?? "🍽️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{r.nama}</p>
                        <Badge color={kategoriResepColor[r.kategori] ?? "stone"} className="flex-shrink-0">
                          {r.kategori}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {r.bahan.length} bahan · HPP{" "}
                        <span className="text-orange-600 font-semibold">
                          {hpp.hppPerPcs > 0 ? formatRupiah(hpp.hppPerPcs) : "—"}
                        </span>
                        /{r.satuanHasil}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-stone-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && data && data.totalResep === 0 && (
          <Card className="text-center py-4">
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm font-semibold text-stone-700">Mulai perjalanan Anda!</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Tambahkan bahan baku terlebih dahulu, lalu buat resep pertama Anda.
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => router.push("/bahan")}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors">
                <Plus size={14} /> Tambah Bahan
              </button>
              <button onClick={() => router.push("/resep")}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-200 transition-colors">
                <BookOpen size={14} /> Buat Resep
              </button>
            </div>
          </Card>
        )}

        {/* ── TIPS (desktop only) ── */}
        <Card className="hidden lg:block">
          <p className="text-sm font-semibold text-stone-700 mb-3">💡 Tips Penggunaan</p>
          <ul className="space-y-2 text-sm text-stone-500">
            {[
              ["1.", "Mulai dengan menambahkan", "Bahan Baku", "beserta harga belinya."],
              ["2.", "Buat", "Resep", "dan pilih bahan dari database yang sudah diinput."],
              ["3.", "Tambahkan", "Biaya Overhead", "(gas, listrik, dll) untuk HPP yang akurat."],
              ["4.", "Gunakan fitur", "Skala Otomatis", "untuk menghitung kebutuhan bahan pesanan besar."],
            ].map(([num, pre, bold, post]) => (
              <li key={num} className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">{num}</span>
                <span>{pre} <strong className="text-stone-700">{bold}</strong> {post}</span>
              </li>
            ))}
          </ul>
        </Card>

      </div>
    </div>
  );
}
