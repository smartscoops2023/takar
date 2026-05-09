"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Package, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import FormBahan from "@/components/bahan/FormBahan";
import KartuBahan from "@/components/bahan/KartuBahan";
import { searchBahan, deleteBahan } from "@/lib/storage";
import type { BahanBakuLocal } from "@/lib/storage";
// Adapter agar KartuBahan & FormBahan tetap pakai tipe BahanBaku lama
import type { BahanBaku } from "@/lib/types";

const KATEGORI_FILTER = ["Semua", "Kering", "Basah", "Kemasan", "Bumbu"];

function toOldType(b: BahanBakuLocal): BahanBaku {
  return { ...b, createdAt: new Date(b.createdAt), updatedAt: new Date(b.updatedAt) } as unknown as BahanBaku;
}

export default function BahanPageClient() {
  const [bahan, setBahan]           = useState<BahanBakuLocal[]>([]);
  const [search, setSearch]         = useState("");
  const [kategori, setKategori]     = useState("Semua");
  const [formOpen, setFormOpen]     = useState(false);
  const [editData, setEditData]     = useState<BahanBaku | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BahanBakuLocal | null>(null);
  const [deleteError, setDeleteError]   = useState("");

  const load = useCallback(() => {
    setBahan(searchBahan(search, kategori));
  }, [search, kategori]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  function handleEdit(b: BahanBaku) {
    setEditData(b);
    setFormOpen(true);
  }

  function handleDelete(b: BahanBaku) {
    setDeleteError("");
    setDeleteTarget(bahan.find((x) => x.id === b.id) ?? null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const result = deleteBahan(deleteTarget.id);
    if (!result.ok) {
      setDeleteError(result.error ?? "Gagal menghapus");
      return;
    }
    setDeleteTarget(null);
    load();
  }

  const jumlahPerKategori = bahan.reduce<Record<string, number>>((acc, b) => {
    acc[b.kategori] = (acc[b.kategori] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-enter">
      <PageHeader
        title="Bahan Baku"
        subtitle={`${bahan.length} bahan tersimpan`}
        action={
          <Button variant="primary" size="sm"
            onClick={() => { setEditData(null); setFormOpen(true); }}>
            <Plus size={16} /> Tambah
          </Button>
        }
      />

      {/* Search + Filter */}
      <div className="px-4 lg:px-0 space-y-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input type="search" placeholder="Cari nama bahan..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#e8e4df] bg-white pl-9 pr-9 text-sm
              placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {KATEGORI_FILTER.map((k) => {
            const isActive = kategori === k;
            const count    = k === "Semua" ? bahan.length : (jumlahPerKategori[k] ?? 0);
            return (
              <button key={k} onClick={() => setKategori(k)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                    : "bg-white text-stone-600 border-[#e8e4df] hover:border-orange-300 hover:text-orange-600"
                  }`}>
                {k}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-0">
        {bahan.length === 0 ? (
          <EmptyState icon={Package}
            title={search || kategori !== "Semua" ? "Bahan tidak ditemukan" : "Belum ada bahan baku"}
            description={search || kategori !== "Semua"
              ? "Coba ubah kata kunci atau filter kategori"
              : "Mulai tambahkan bahan baku beserta harga belinya."}
            action={!search && kategori === "Semua" ? (
              <Button variant="primary" onClick={() => { setEditData(null); setFormOpen(true); }}>
                <Plus size={16} /> Tambah Bahan Pertama
              </Button>
            ) : undefined}
          />
        ) : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e4df] bg-stone-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Bahan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Kategori</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Harga Beli</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Jumlah</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Harga/Satuan</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e4df]">
                    {bahan.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">
                              {b.kategori === "Kering" && "🌾"}
                              {b.kategori === "Basah"  && "💧"}
                              {b.kategori === "Kemasan"&& "📦"}
                              {b.kategori === "Bumbu"  && "🌶️"}
                            </span>
                            <span className="font-medium text-stone-800">{b.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">{b.kategori}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-stone-600">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(b.hargaBeli)}
                        </td>
                        <td className="px-4 py-3 text-right text-stone-600">{b.jumlahBeli} {b.satuan}</td>
                        <td className="px-4 py-3 text-right font-bold text-orange-600">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(b.hargaPerSatuan)}
                          <span className="text-xs font-normal text-stone-400">/{b.satuan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(toOldType(b))}
                              className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(toOldType(b))}
                              className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: card list */}
            <div className="lg:hidden space-y-3">
              {bahan.map((b) => (
                <KartuBahan key={b.id} bahan={toOldType(b)}
                  onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB mobile */}
      <button onClick={() => { setEditData(null); setFormOpen(true); }}
        className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white
          shadow-lg shadow-orange-300 flex items-center justify-center active:scale-95 transition-transform">
        <Plus size={24} />
      </button>

      <FormBahan
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSaved={() => { load(); }}
        editData={editData}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Bahan Baku?"
        message={deleteError || `"${deleteTarget?.nama}" akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(""); }}
      />
    </div>
  );
}
