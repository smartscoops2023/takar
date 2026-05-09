"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  Flame, Package, Calculator, Tag, Pencil, Info,
} from "lucide-react";
import SkalaOtomatis from "@/components/resep/SkalaOtomatis";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, kategoriResepColor } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import FormResep from "@/components/resep/FormResep";
import TambahBahanResep from "@/components/resep/TambahBahanResep";
import OverheadManager from "@/components/resep/OverheadManager";
import {
  getResepById, deleteResep, removeBahanFromResep,
  hitungHPPLocal,
} from "@/lib/storage";
import { hitungHargaJual, formatRupiah, formatAngka } from "@/lib/types";
import type { ResepLocal, ResepBahanLocal } from "@/lib/storage";
import type { OverheadItem } from "@/lib/types";

export default function ResepDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [resep, setResep]           = useState<ResepLocal | null>(null);
  const [loading, setLoading]       = useState(true);
  const [editFormOpen, setEditFormOpen]     = useState(false);
  const [tambahBahanOpen, setTambahBahanOpen] = useState(false);
  const [overheadOpen, setOverheadOpen]     = useState(false);
  const [deleteResepOpen, setDeleteResepOpen] = useState(false);
  const [deleteBahanTarget, setDeleteBahanTarget] = useState<ResepBahanLocal | null>(null);
  const [margin, setMargin]         = useState(50);
  const [showHargaJual, setShowHargaJual] = useState(true);

  const load = useCallback(() => {
    const data = getResepById(id);
    if (!data) { router.push("/resep"); return; }
    setResep(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  function hapusBahan() {
    if (!deleteBahanTarget || !resep) return;
    removeBahanFromResep(resep.id, deleteBahanTarget.id);
    setDeleteBahanTarget(null);
    load();
  }

  function hapusResep() {
    deleteResep(id);
    router.push("/resep");
  }

  if (loading || !resep) {
    return (
      <div className="px-4 lg:px-0 pt-4 space-y-4 animate-pulse">
        <div className="h-8 bg-stone-100 rounded-xl w-1/3" />
        <div className="h-32 bg-stone-100 rounded-2xl" />
        <div className="h-48 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  const hpp       = hitungHPPLocal(resep);
  const overhead  = resep.overheadItems as OverheadItem[];
  const hargaJual = hitungHargaJual(hpp.hppPerPcs, margin);

  const EMOJI: Record<string, string> = {
    Kue: "🎂", Roti: "🍞", Minuman: "🥤",
    Makanan: "🍱", Snack: "🍿", Lainnya: "🍽️",
  };

  return (
    <div className="page-enter pb-8">
      {/* Header */}
      <div className="px-4 lg:px-0 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => router.push("/resep")}
          className="w-9 h-9 rounded-xl bg-white border border-[#e8e4df] flex items-center justify-center
            text-stone-500 hover:bg-stone-50 transition-colors flex-shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-stone-800 truncate">{resep.nama}</h1>
            <Badge color={kategoriResepColor[resep.kategori] ?? "stone"}>{resep.kategori}</Badge>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Hasil: {resep.hasilProduksi} {resep.satuanHasil}
            {resep.deskripsi && ` · ${resep.deskripsi}`}
          </p>
        </div>
        <button onClick={() => setEditFormOpen(true)}
          className="w-9 h-9 rounded-xl bg-white border border-[#e8e4df] flex items-center justify-center
            text-stone-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-colors flex-shrink-0">
          <Pencil size={15} />
        </button>
      </div>

      <div className="px-4 lg:px-0 space-y-4">

        {/* ── RINGKASAN HPP ── */}
        <Card padding="none" className="overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={16} className="text-orange-200" />
              <p className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Kalkulasi HPP</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Biaya Bahan", value: hpp.totalBiayaBahan },
                { label: "Overhead",    value: hpp.totalOverhead },
                { label: "Total HPP",   value: hpp.totalHPPBatch },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-orange-200 uppercase tracking-wide">{label}</p>
                  <p className="text-base font-bold text-white mt-0.5">{formatRupiah(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HPP per pcs */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#e8e4df]">
            <div>
              <p className="text-xs text-stone-400">HPP per {resep.satuanHasil}</p>
              <p className="text-2xl font-bold text-orange-600 mt-0.5">
                {hpp.hppPerPcs > 0 ? formatRupiah(hpp.hppPerPcs) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400">{resep.hasilProduksi} {resep.satuanHasil}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {resep.bahan.length} bahan · {overhead.length} overhead
              </p>
            </div>
          </div>

          {/* Rekomendasi Harga Jual */}
          <div className="px-4 py-3">
            <button onClick={() => setShowHargaJual(!showHargaJual)}
              className="flex items-center gap-2 w-full text-left">
              <Tag size={14} className="text-orange-500" />
              <p className="text-sm font-semibold text-stone-700 flex-1">Rekomendasi Harga Jual</p>
              {showHargaJual ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
            </button>

            {showHargaJual && (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-xs text-stone-500">Margin Keuntungan</p>
                    <p className="text-xs font-bold text-orange-600">{margin}%</p>
                  </div>
                  <input type="range" min={10} max={200} step={5}
                    value={margin} onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-orange-500
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-stone-400">10%</span>
                    <span className="text-[10px] text-stone-400">200%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[30, 50, 75, 100].map((m) => (
                    <button key={m} onClick={() => setMargin(m)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${margin === m ? "bg-orange-500 text-white border-orange-500" : "bg-white text-stone-600 border-[#e8e4df] hover:border-orange-300"}`}>
                      {m}%
                    </button>
                  ))}
                </div>
                <div className="bg-orange-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Harga Jual Disarankan</p>
                    <p className="text-2xl font-bold text-orange-700 mt-0.5">
                      {hpp.hppPerPcs > 0 ? formatRupiah(hargaJual) : "—"}
                    </p>
                    <p className="text-xs text-orange-400 mt-0.5">
                      per {resep.satuanHasil} · untung {formatRupiah(hargaJual - hpp.hppPerPcs)} / {resep.satuanHasil}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-400">Total omzet</p>
                    <p className="text-sm font-bold text-orange-600">
                      {hpp.hppPerPcs > 0 ? formatRupiah(hargaJual * resep.hasilProduksi) : "—"}
                    </p>
                    <p className="text-xs text-orange-400">jika semua terjual</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── DAFTAR BAHAN ── */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4df]">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-stone-500" />
              <p className="text-sm font-semibold text-stone-700">Bahan ({resep.bahan.length})</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setTambahBahanOpen(true)}>
              <Plus size={14} /> Tambah Bahan
            </Button>
          </div>

          {resep.bahan.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-400">Belum ada bahan ditambahkan</p>
              <button onClick={() => setTambahBahanOpen(true)}
                className="mt-2 text-sm text-orange-500 font-medium hover:underline">
                + Tambah bahan pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e8e4df]">
              {resep.bahan.map((rb) => {
                const biaya  = rb.hargaPerSatuanSnapshot * rb.jumlahPakai;
                const persen = hpp.totalBiayaBahan > 0 ? (biaya / hpp.totalBiayaBahan) * 100 : 0;
                return (
                  <div key={rb.id} className="px-4 py-3 flex items-center gap-3 group">
                    <div className="text-lg flex-shrink-0">
                      {rb.kategoriSnapshot === "Kering"  && "🌾"}
                      {rb.kategoriSnapshot === "Basah"   && "💧"}
                      {rb.kategoriSnapshot === "Kemasan" && "📦"}
                      {rb.kategoriSnapshot === "Bumbu"   && "🌶️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{rb.namaSnapshot}</p>
                        <p className="text-sm font-bold text-stone-700 flex-shrink-0">{formatRupiah(biaya)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-stone-400">
                          {formatAngka(rb.jumlahPakai)} {rb.satuanSnapshot}
                          <span className="mx-1">·</span>
                          {formatRupiah(rb.hargaPerSatuanSnapshot)}/{rb.satuanSnapshot}
                        </p>
                        <p className="text-xs text-stone-400">{persen.toFixed(1)}%</p>
                      </div>
                      <div className="mt-1.5 h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all"
                          style={{ width: `${Math.min(persen, 100)}%` }} />
                      </div>
                    </div>
                    <button onClick={() => setDeleteBahanTarget(rb)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300
                        hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0
                        opacity-0 group-hover:opacity-100 lg:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── BIAYA OVERHEAD ── */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4df]">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-stone-500" />
              <p className="text-sm font-semibold text-stone-700">Biaya Overhead ({overhead.length})</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setOverheadOpen(true)}>
              <Plus size={14} /> Kelola
            </Button>
          </div>

          {overhead.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-stone-400">Belum ada biaya overhead</p>
              <p className="text-xs text-stone-300 mt-1">Gas, listrik, kemasan, dll</p>
              <button onClick={() => setOverheadOpen(true)}
                className="mt-2 text-sm text-orange-500 font-medium hover:underline">
                + Tambah biaya overhead
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e8e4df]">
              {overhead.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Flame size={13} className="text-amber-500" />
                    </div>
                    <p className="text-sm text-stone-700">{item.nama}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-700">{formatRupiah(item.nominal)}</p>
                </div>
              ))}
              <div className="px-4 py-3 flex items-center justify-between bg-stone-50">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Total Overhead</p>
                <p className="text-sm font-bold text-stone-700">{formatRupiah(hpp.totalOverhead)}</p>
              </div>
            </div>
          )}
        </Card>

        {resep.bahan.length > 0 && (
          <div className="flex items-start gap-2 px-1">
            <Info size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-stone-400 leading-relaxed">
              HPP dihitung otomatis dari total biaya bahan + overhead, dibagi hasil produksi ({resep.hasilProduksi} {resep.satuanHasil}).
            </p>
          </div>
        )}

        {/* ── SKALA OTOMATIS ── */}
        {resep.bahan.length > 0 && <SkalaOtomatis resep={resep} />}

        {/* Hapus resep */}
        <div className="pt-2">
          <button onClick={() => setDeleteResepOpen(true)}
            className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
            Hapus Resep Ini
          </button>
        </div>
      </div>

      {/* Modals */}
      <FormResep
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        onSaved={() => { setEditFormOpen(false); load(); }}
        editData={resep}
      />

      <TambahBahanResep
        open={tambahBahanOpen}
        onClose={() => setTambahBahanOpen(false)}
        onSaved={() => { setTambahBahanOpen(false); load(); }}
        resepId={id}
        bahanSudahAda={resep.bahan.map((rb) => rb.bahanBakuId)}
      />

      <OverheadManager
        open={overheadOpen}
        onClose={() => setOverheadOpen(false)}
        onSaved={() => { setOverheadOpen(false); load(); }}
        resepId={id}
        currentOverhead={overhead}
      />

      <ConfirmDialog
        open={!!deleteBahanTarget}
        title="Hapus Bahan dari Resep?"
        message={`"${deleteBahanTarget?.namaSnapshot}" akan dihapus dari resep ini.`}
        confirmLabel="Hapus"
        onConfirm={hapusBahan}
        onCancel={() => setDeleteBahanTarget(null)}
      />

      <ConfirmDialog
        open={deleteResepOpen}
        title="Hapus Resep?"
        message={`"${resep.nama}" beserta semua bahan dan kalkulasinya akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Resep"
        onConfirm={hapusResep}
        onCancel={() => setDeleteResepOpen(false)}
      />
    </div>
  );
}
