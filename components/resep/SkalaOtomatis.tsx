"use client";

import { useState } from "react";
import { Scale, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatRupiah, formatAngka } from "@/lib/types";
import type { ResepLocal } from "@/lib/storage";
import type { OverheadItem } from "@/lib/types";

interface Props {
  resep: ResepLocal;
}

export default function SkalaOtomatis({ resep }: Props) {
  const [open, setOpen]       = useState(false);
  const [target, setTarget]   = useState(resep.hasilProduksi);

  const overhead = resep.overheadItems as OverheadItem[];
  const faktor   = target / resep.hasilProduksi;

  // Hitung total modal untuk target produksi
  const totalBahanSkala = resep.bahan.reduce((sum, rb) => {
    return sum + rb.hargaPerSatuanSnapshot * rb.jumlahPakai * faktor;
  }, 0);
  const totalOverheadSkala = overhead.reduce((s, o) => s + o.nominal, 0) * faktor;
  const totalModalSkala    = totalBahanSkala + totalOverheadSkala;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Scale size={16} className="text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-700">Skala Otomatis</p>
          <p className="text-xs text-stone-400">Hitung kebutuhan bahan untuk jumlah berbeda</p>
        </div>
        {open
          ? <ChevronUp size={16} className="text-stone-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-stone-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-[#e8e4df]">
          {/* Input target */}
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1.5 block">
                Saya mau membuat berapa {resep.satuanHasil}?
              </label>
              <div className="flex items-center gap-3">
                {/* Tombol kurang */}
                <button
                  onClick={() => setTarget((t) => Math.max(1, t - resep.hasilProduksi))}
                  className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center
                    text-stone-600 font-bold text-lg hover:bg-stone-200 transition-colors flex-shrink-0"
                >
                  −
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={target}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v > 0) setTarget(v);
                    }}
                    className="w-full h-10 rounded-xl border border-[#e8e4df] bg-white px-3 text-center
                      text-base font-bold text-stone-800
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
                    {resep.satuanHasil}
                  </span>
                </div>
                {/* Tombol tambah */}
                <button
                  onClick={() => setTarget((t) => t + resep.hasilProduksi)}
                  className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center
                    text-stone-600 font-bold text-lg hover:bg-stone-200 transition-colors flex-shrink-0"
                >
                  +
                </button>
              </div>

              {/* Preset cepat */}
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 5].map((x) => {
                  const val = resep.hasilProduksi * x;
                  return (
                    <button key={x}
                      onClick={() => setTarget(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${target === val
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-stone-600 border-[#e8e4df] hover:border-blue-300"
                        }`}
                    >
                      {x}× <span className="font-normal opacity-70">({val})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faktor skala */}
            {faktor !== 1 && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                <Scale size={13} className="text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-600">
                  Skala <strong>{formatAngka(faktor, 2)}×</strong> dari resep asli
                  ({resep.hasilProduksi} {resep.satuanHasil})
                </p>
              </div>
            )}
          </div>

          {/* Tabel bahan yang diskalakan */}
          <div className="border-t border-[#e8e4df]">
            <div className="px-4 py-2 bg-stone-50">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Kebutuhan Bahan untuk {target} {resep.satuanHasil}
              </p>
            </div>
            <div className="divide-y divide-[#e8e4df]">
              {resep.bahan.map((rb) => {
                const jumlahSkala = rb.jumlahPakai * faktor;
                const biayaSkala  = rb.hargaPerSatuanSnapshot * jumlahSkala;
                return (
                  <div key={rb.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">
                        {rb.kategoriSnapshot === "Kering"  && "🌾"}
                        {rb.kategoriSnapshot === "Basah"   && "💧"}
                        {rb.kategoriSnapshot === "Kemasan" && "📦"}
                        {rb.kategoriSnapshot === "Bumbu"   && "🌶️"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-stone-700 truncate">{rb.namaSnapshot}</p>
                        {faktor !== 1 && (
                          <p className="text-xs text-stone-400">
                            asli: {formatAngka(rb.jumlahPakai)} {rb.satuanSnapshot}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-stone-800">
                        {formatAngka(jumlahSkala)} {rb.satuanSnapshot}
                      </p>
                      <p className="text-xs text-stone-400">{formatRupiah(biayaSkala)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Overhead skala */}
              {overhead.length > 0 && overhead.map((item) => (
                <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-3 bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <p className="text-sm text-stone-600">{item.nama}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-700">
                    {formatRupiah(item.nominal * faktor)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total modal */}
            <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Total Modal Dibutuhkan
                  </p>
                  <p className="text-xs text-blue-400 mt-0.5">
                    untuk {target} {resep.satuanHasil}
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {formatRupiah(totalModalSkala)}
                </p>
              </div>
              {faktor !== 1 && (
                <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between text-xs text-blue-400">
                  <span>Bahan: {formatRupiah(totalBahanSkala)}</span>
                  <span>Overhead: {formatRupiah(totalOverheadSkala)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
