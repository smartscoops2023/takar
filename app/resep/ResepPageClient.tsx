"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, BookOpen, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, kategoriResepColor } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import FormResep from "@/components/resep/FormResep";
import { searchResep, deleteResep, hitungHPPLocal } from "@/lib/storage";
import { formatRupiah } from "@/lib/types";
import type { ResepLocal } from "@/lib/storage";

const KATEGORI_FILTER = ["Semua", "Kue", "Roti", "Minuman", "Makanan", "Snack", "Lainnya"];
const EMOJI: Record<string, string> = { Kue: "🎂", Roti: "🍞", Minuman: "🥤", Makanan: "🍱", Snack: "🍿", Lainnya: "🍽️" };

export default function ResepPageClient() {
  const router = useRouter();
  const [resep, setResep]           = useState<ResepLocal[]>([]);
  const [search, setSearch]         = useState("");
  const [kategori, setKategori]     = useState("Semua");
  const [formOpen, setFormOpen]     = useState(false);
  const [editData, setEditData]     = useState<ResepLocal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResepLocal | null>(null);

  const load = useCallback(() => {
    setResep(searchResep(search, kategori));
  }, [search, kategori]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteResep(deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Resep"
        subtitle={`${resep.length} resep tersimpan`}
        action={
          <Button variant="primary" size="sm"
            onClick={() => { setEditData(null); setFormOpen(true); }}>
            <Plus size={16} /> Buat Resep
          </Button>
        }
      />

      {/* Search + Filter */}
      <div className="px-4 lg:px-0 space-y-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input type="search" placeholder="Cari nama resep..."
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
          {KATEGORI_FILTER.map((k) => (
            <button key={k} onClick={() => setKategori(k)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${kategori === k
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                  : "bg-white text-stone-600 border-[#e8e4df] hover:border-orange-300 hover:text-orange-600"
                }`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-0">
        {resep.length === 0 ? (
          <EmptyState icon={BookOpen}
            title={search || kategori !== "Semua" ? "Resep tidak ditemukan" : "Belum ada resep"}
            description={search || kategori !== "Semua"
              ? "Coba ubah kata kunci atau filter"
              : "Buat resep pertama Anda dan hitung HPP secara otomatis."}
            action={!search && kategori === "Semua" ? (
              <Button variant="primary" onClick={() => { setEditData(null); setFormOpen(true); }}>
                <Plus size={16} /> Buat Resep Pertama
              </Button>
            ) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {resep.map((r) => {
              const hpp = hitungHPPLocal(r);
              return (
                <div key={r.id}
                  className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm overflow-hidden
                    hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => router.push(`/resep/${r.id}`)}>
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {EMOJI[r.kategori] ?? "🍽️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-stone-800">{r.nama}</p>
                        <Badge color={kategoriResepColor[r.kategori] ?? "stone"}>{r.kategori}</Badge>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Hasil: {r.hasilProduksi} {r.satuanHasil} · {r.bahan.length} bahan
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase tracking-wide">HPP/pcs</p>
                          <p className="text-sm font-bold text-orange-600">
                            {hpp.hppPerPcs > 0 ? formatRupiah(hpp.hppPerPcs) : "—"}
                          </p>
                        </div>
                        <div className="w-px h-6 bg-stone-100" />
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase tracking-wide">Total HPP</p>
                          <p className="text-sm font-bold text-stone-700">
                            {hpp.totalHPPBatch > 0 ? formatRupiah(hpp.totalHPPBatch) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <div className="border-t border-[#e8e4df] px-4 py-2 flex gap-2 bg-stone-50/50"
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditData(r); setFormOpen(true); }}
                      className="text-xs text-stone-500 hover:text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                      Edit Info
                    </button>
                    <button onClick={() => router.push(`/resep/${r.id}`)}
                      className="text-xs text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                      Lihat Detail →
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => setDeleteTarget(r)}
                      className="text-xs text-stone-400 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <button onClick={() => { setEditData(null); setFormOpen(true); }}
        className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white
          shadow-lg shadow-orange-300 flex items-center justify-center active:scale-95 transition-transform">
        <Plus size={24} />
      </button>

      <FormResep
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSaved={(id) => {
          setFormOpen(false); setEditData(null);
          if (id) router.push(`/resep/${id}`);
          else load();
        }}
        editData={editData}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Resep?"
        message={`"${deleteTarget?.nama}" beserta semua bahan di dalamnya akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
