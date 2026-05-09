"use client";

import { useState } from "react";
import { Scale, ChevronDown, ChevronUp, Info, Database, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ── Data konversi dapur standar Indonesia ──
const KONVERSI_GROUPS = [
  {
    judul: "Sendok & Cangkir",
    emoji: "🥄",
    items: [
      { dari: "1 sdt (sendok teh)",   ke: "5 ml" },
      { dari: "1 sdm (sendok makan)", ke: "15 ml" },
      { dari: "1 sdm tepung",         ke: "8 gram" },
      { dari: "1 sdm gula pasir",     ke: "12 gram" },
      { dari: "1 sdm mentega",        ke: "14 gram" },
      { dari: "1 sdm minyak",         ke: "14 ml" },
      { dari: "1 cup",                ke: "240 ml" },
      { dari: "1 cup tepung terigu",  ke: "120 gram" },
      { dari: "1 cup gula pasir",     ke: "200 gram" },
      { dari: "1 cup gula halus",     ke: "120 gram" },
      { dari: "1 cup mentega",        ke: "225 gram" },
    ],
  },
  {
    judul: "Berat & Volume",
    emoji: "⚖️",
    items: [
      { dari: "1 kg",    ke: "1.000 gram" },
      { dari: "1 liter", ke: "1.000 ml" },
      { dari: "1 liter", ke: "4 cup" },
      { dari: "1 cup",   ke: "16 sdm" },
      { dari: "1 sdm",   ke: "3 sdt" },
    ],
  },
  {
    judul: "Bahan Umum",
    emoji: "🧁",
    items: [
      { dari: "1 butir telur ayam",    ke: "±55 gram" },
      { dari: "1 butir telur bebek",   ke: "±70 gram" },
      { dari: "1 sachet ragi instan",  ke: "11 gram" },
      { dari: "1 sachet baking powder",ke: "14 gram" },
      { dari: "1 sachet vanili bubuk", ke: "1 gram" },
      { dari: "1 batang coklat DCC",   ke: "±58 gram" },
      { dari: "1 kaleng susu kental",  ke: "395 gram" },
      { dari: "1 kaleng susu evap",    ke: "370 ml" },
    ],
  },
  {
    judul: "Suhu Oven",
    emoji: "🌡️",
    items: [
      { dari: "Rendah",  ke: "150–160°C" },
      { dari: "Sedang",  ke: "170–180°C" },
      { dari: "Tinggi",  ke: "190–210°C" },
      { dari: "Sangat Tinggi", ke: "220–230°C" },
      { dari: "160°C",   ke: "320°F" },
      { dari: "180°C",   ke: "356°F" },
      { dari: "200°C",   ke: "392°F" },
    ],
  },
];

export default function PengaturanClient() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Sendok & Cangkir": true });
  const [resetOpen, setResetOpen]   = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  function toggleGroup(judul: string) {
    setOpenGroups((prev) => ({ ...prev, [judul]: !prev[judul] }));
  }

  async function handleReset() {
    setResetLoading(true);
    import("@/lib/storage").then(({ exportData }) => {
      // Auto-backup sebelum reset
      const json = exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `takar-backup-sebelum-reset-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Reset data
      localStorage.removeItem("takar:bahan");
      localStorage.removeItem("takar:resep");
      setResetLoading(false);
      setResetOpen(false);
      window.location.reload();
    });
  }

  return (
    <div className="page-enter">
      <PageHeader title="Pengaturan" subtitle="Konfigurasi & referensi dapur" />

      <div className="px-4 lg:px-0 space-y-4 pb-6">

        {/* Info Aplikasi */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8e4df] flex items-center gap-2">
            <Info size={15} className="text-stone-400" />
            <p className="text-sm font-semibold text-stone-700">Tentang Takar</p>
          </div>
          <div className="divide-y divide-[#e8e4df]">
            {[
              ["Versi",       "0.1.0 (MVP)"],
              ["Database",    "SQLite Lokal"],
              ["Framework",   "Next.js 16 + Prisma 7"],
              ["Dibuat untuk","UMKM Kuliner & Home Baking 🇮🇩"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-stone-500">{label}</p>
                <p className="text-sm font-medium text-stone-700">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── KALKULATOR KONVERSI DAPUR ── */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Scale size={16} className="text-orange-500" />
            <p className="text-sm font-semibold text-stone-700">Kalkulator Konversi Dapur</p>
          </div>
          <p className="text-xs text-stone-400 mb-3 px-1">
            Panduan konversi takaran standar untuk membantu input resep.
          </p>

          <div className="space-y-3">
            {KONVERSI_GROUPS.map((group) => {
              const isOpen = !!openGroups[group.judul];
              return (
                <Card key={group.judul} padding="none" className="overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group.judul)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-xl">{group.emoji}</span>
                    <p className="text-sm font-semibold text-stone-700 flex-1">{group.judul}</p>
                    {isOpen
                      ? <ChevronUp size={16} className="text-stone-400" />
                      : <ChevronDown size={16} className="text-stone-400" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#e8e4df]">
                      {group.items.map((item, i) => (
                        <div key={i}
                          className={`flex items-center justify-between px-4 py-2.5
                            ${i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}>
                          <p className="text-sm text-stone-600">{item.dari}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-stone-300 text-xs">=</span>
                            <p className="text-sm font-semibold text-orange-600">{item.ke}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Data Management */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8e4df] flex items-center gap-2">
            <Database size={15} className="text-stone-400" />
            <p className="text-sm font-semibold text-stone-700">Manajemen Data</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-stone-400 leading-relaxed">
              Data tersimpan di browser perangkat ini. Gunakan fitur backup untuk mencegah kehilangan data.
            </p>

            {/* Export */}
            <button
              onClick={() => {
                import("@/lib/storage").then(({ exportData }) => {
                  const json = exportData();
                  const blob = new Blob([json], { type: "application/json" });
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href     = url;
                  a.download = `takar-backup-${new Date().toISOString().slice(0,10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-[#e8e4df]
                text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Backup Data (Export JSON)
            </button>

            {/* Import */}
            <label className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-[#e8e4df]
              text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Pulihkan Data (Import JSON)
              <input type="file" accept=".json" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    import("@/lib/storage").then(({ importData }) => {
                      const result = importData(ev.target?.result as string);
                      if (result.ok) {
                        alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
                        window.location.reload();
                      } else {
                        alert(`Gagal: ${result.error}`);
                      }
                    });
                  };
                  reader.readAsText(file);
                }}
              />
            </label>

            {/* Logout lisensi */}
            <button
              onClick={() => {
                if (confirm("Yakin ingin keluar? Anda perlu memasukkan kode lisensi lagi untuk masuk.")) {
                  import("@/lib/storage").then(({ clearLisensi }) => {
                    clearLisensi();
                    window.location.href = "/aktivasi";
                  });
                }
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-amber-200
                text-amber-600 text-sm font-medium hover:bg-amber-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Keluar (Hapus Lisensi dari Perangkat)
            </button>

            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-red-200
                text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
              Reset Semua Data
            </button>
          </div>
        </Card>

      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset Semua Data?"
        message="Semua bahan baku dan resep akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Reset"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
        loading={resetLoading}
      />
    </div>
  );
}
