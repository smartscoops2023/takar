"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Plus, Check, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatRupiah } from "@/lib/types";
import type { BahanBaku } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  resepId: string;
  bahanSudahAda: string[];
}

type Mode = "pilih" | "buat-baru";

const KATEGORI_OPTIONS = [
  { value: "Kering",  label: "🌾 Kering" },
  { value: "Basah",   label: "💧 Basah" },
  { value: "Kemasan", label: "📦 Kemasan" },
  { value: "Bumbu",   label: "🌶️ Bumbu" },
];

const SATUAN_OPTIONS = [
  { value: "gram",    label: "gram" },
  { value: "kg",      label: "kg" },
  { value: "ml",      label: "ml" },
  { value: "liter",   label: "liter" },
  { value: "butir",   label: "butir" },
  { value: "pcs",     label: "pcs" },
  { value: "sdm",     label: "sdm" },
  { value: "sdt",     label: "sdt" },
  { value: "bungkus", label: "bungkus" },
  { value: "lembar",  label: "lembar" },
];

const EMPTY_BAHAN = { nama: "", kategori: "", hargaBeli: "", jumlahBeli: "", satuan: "" };

export default function TambahBahanResep({ open, onClose, onSaved, resepId, bahanSudahAda }: Props) {
  const [mode, setMode]             = useState<Mode>("pilih");
  const [semuaBahan, setSemuaBahan] = useState<BahanBaku[]>([]);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<BahanBaku | null>(null);
  const [jumlah, setJumlah]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // State form bahan baru
  const [formBaru, setFormBaru]     = useState(EMPTY_BAHAN);
  const [errorsBaru, setErrorsBaru] = useState<Record<string, string>>({});
  const [jumlahBaru, setJumlahBaru] = useState("");
  const namaBaruRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // Reset semua state
    setMode("pilih");
    setSearch(""); setSelected(null); setJumlah(""); setError("");
    setFormBaru(EMPTY_BAHAN); setErrorsBaru({}); setJumlahBaru("");
    // Fetch daftar bahan
    // Fetch daftar bahan dari storage lokal
    import("@/lib/storage").then(({ getAllBahan }) => {
      setSemuaBahan(getAllBahan() as unknown as BahanBaku[]);
    });
  }, [open]);

  useEffect(() => {
    if (mode === "buat-baru") {
      setTimeout(() => namaBaruRef.current?.focus(), 100);
    }
  }, [mode]);

  const filtered = semuaBahan.filter((b) =>
    b.nama.toLowerCase().includes(search.toLowerCase())
  );

  const biayaPreview =
    selected && jumlah && parseFloat(jumlah) > 0
      ? selected.hargaPerSatuan * parseFloat(jumlah)
      : null;

  // Harga per satuan preview untuk form bahan baru
  const hargaPerSatuanBaru =
    formBaru.hargaBeli && formBaru.jumlahBeli && parseFloat(formBaru.jumlahBeli) > 0
      ? parseFloat(formBaru.hargaBeli) / parseFloat(formBaru.jumlahBeli)
      : null;

  const biayaBaruPreview =
    hargaPerSatuanBaru && jumlahBaru && parseFloat(jumlahBaru) > 0
      ? hargaPerSatuanBaru * parseFloat(jumlahBaru)
      : null;

  // ── Tambah bahan yang sudah ada ke resep ──
  async function handleTambahBahanLama() {
    if (!selected) { setError("Pilih bahan terlebih dahulu"); return; }
    if (!jumlah || parseFloat(jumlah) <= 0) { setError("Masukkan jumlah yang valid"); return; }
    setLoading(true); setError("");
    try {
      const { addBahanToResep } = await import("@/lib/storage");
      const result = addBahanToResep(resepId, selected.id, parseFloat(jumlah));
      if (!result) { setError("Gagal menambah bahan"); return; }
      onSaved();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  // ── Buat bahan baru lalu langsung tambahkan ke resep ──
  function validateBaru() {
    const e: Record<string, string> = {};
    if (!formBaru.nama.trim())   e.nama = "Nama bahan wajib diisi";
    if (!formBaru.kategori)      e.kategori = "Pilih kategori";
    if (!formBaru.hargaBeli || parseFloat(formBaru.hargaBeli) <= 0) e.hargaBeli = "Masukkan harga beli";
    if (!formBaru.jumlahBeli || parseFloat(formBaru.jumlahBeli) <= 0) e.jumlahBeli = "Masukkan jumlah";
    if (!formBaru.satuan)        e.satuan = "Pilih satuan";
    if (!jumlahBaru || parseFloat(jumlahBaru) <= 0) e.jumlahBaru = "Masukkan jumlah pakai";
    setErrorsBaru(e);
    return Object.keys(e).length === 0;
  }

  async function handleBuatDanTambah() {
    if (!validateBaru()) return;
    setLoading(true); setError("");
    try {
      const { createBahan, addBahanToResep } = await import("@/lib/storage");
      const bahan = createBahan({
        nama: formBaru.nama,
        kategori: formBaru.kategori as import("@/lib/types").KategoriBahan,
        hargaBeli: parseFloat(formBaru.hargaBeli),
        jumlahBeli: parseFloat(formBaru.jumlahBeli),
        satuan: formBaru.satuan as import("@/lib/types").SatuanBahan,
      });
      const result = addBahanToResep(resepId, bahan.id, parseFloat(jumlahBaru));
      if (!result) { setError("Gagal menambah ke resep"); return; }
      onSaved();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function setBaru(field: string, value: string) {
    setFormBaru((p) => ({ ...p, [field]: value }));
    if (errorsBaru[field]) setErrorsBaru((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} aria-hidden />
      <div className="fixed z-50 bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl
        bottom-0 left-0 right-0
        lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2
        lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[520px]
        max-h-[92vh] flex flex-col">

        <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8e4df] flex-shrink-0">
          {mode === "buat-baru" && (
            <button onClick={() => { setMode("pilih"); setError(""); setErrorsBaru({}); }}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 flex-shrink-0">
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-base font-bold text-stone-800">
              {mode === "pilih" ? "Tambah Bahan ke Resep" : "Buat Bahan Baru"}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {mode === "pilih"
                ? "Pilih bahan lalu masukkan jumlah pemakaian"
                : "Bahan baru akan disimpan & langsung ditambahkan ke resep"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ══════════════════════════════════════════
            MODE: PILIH BAHAN YANG SUDAH ADA
        ══════════════════════════════════════════ */}
        {mode === "pilih" && (
          <>
            {/* Search */}
            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input type="search" placeholder="Cari bahan..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[#e8e4df] bg-stone-50 pl-9 pr-3 text-sm
                    placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* List bahan */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {/* Tombol buat bahan baru */}
              <button
                onClick={() => { setMode("buat-baru"); setError(""); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed
                  border-orange-200 text-orange-500 hover:bg-orange-50 transition-all mb-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  <Plus size={16} className="text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Buat Bahan Baru</p>
                  <p className="text-xs text-orange-400">Bahan belum ada di database? Tambah di sini</p>
                </div>
              </button>

              {filtered.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-6">Bahan tidak ditemukan</p>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map((b) => {
                    const sudahAda  = bahanSudahAda.includes(b.id);
                    const isSelected = selected?.id === b.id;
                    return (
                      <button key={b.id}
                        onClick={() => { if (!sudahAda) { setSelected(isSelected ? null : b); setJumlah(""); setError(""); } }}
                        disabled={sudahAda}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                          ${sudahAda
                            ? "opacity-40 cursor-not-allowed bg-stone-50 border-stone-100"
                            : isSelected
                              ? "bg-orange-50 border-orange-300"
                              : "bg-white border-[#e8e4df] hover:border-orange-200 hover:bg-orange-50/50"
                          }`}>
                        <span className="text-lg flex-shrink-0">
                          {b.kategori === "Kering"  && "🌾"}
                          {b.kategori === "Basah"   && "💧"}
                          {b.kategori === "Kemasan" && "📦"}
                          {b.kategori === "Bumbu"   && "🌶️"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{b.nama}</p>
                          <p className="text-xs text-stone-400">
                            {formatRupiah(b.hargaPerSatuan)}/{b.satuan}
                          </p>
                        </div>
                        {sudahAda && <span className="text-xs text-stone-400 flex-shrink-0 bg-stone-100 px-2 py-0.5 rounded-full">Sudah ada</span>}
                        {isSelected && <Check size={16} className="text-orange-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input jumlah + preview */}
            {selected && (
              <div className="px-5 py-3 border-t border-[#e8e4df] bg-orange-50/50 flex-shrink-0 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-stone-600 mb-1 block">
                      Jumlah Pakai ({selected.satuan})
                    </label>
                    <input type="number" inputMode="decimal"
                      placeholder={`cth: 200`}
                      value={jumlah}
                      onChange={(e) => { setJumlah(e.target.value); setError(""); }}
                      className="w-full h-10 rounded-xl border border-[#e8e4df] bg-white px-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  {biayaPreview !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-stone-400">Biaya</p>
                      <p className="text-base font-bold text-orange-600">{formatRupiah(biayaPreview)}</p>
                    </div>
                  )}
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 pb-6 pt-3 flex gap-3 flex-shrink-0 border-t border-[#e8e4df]">
              <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>Batal</Button>
              <Button variant="primary" fullWidth onClick={handleTambahBahanLama}
                loading={loading} disabled={!selected}>
                <Plus size={16} /> Tambah ke Resep
              </Button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            MODE: BUAT BAHAN BARU
        ══════════════════════════════════════════ */}
        {mode === "buat-baru" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Info banner */}
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
                <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-600 leading-relaxed">
                  Bahan ini akan disimpan ke database Bahan Baku dan langsung ditambahkan ke resep ini.
                </p>
              </div>

              {/* Form bahan baru */}
              <Input
                ref={namaBaruRef}
                label="Nama Bahan"
                placeholder="cth: Susu UHT, Coklat Bubuk..."
                value={formBaru.nama}
                onChange={(e) => setBaru("nama", e.target.value)}
                error={errorsBaru.nama}
              />

              <Select
                label="Kategori"
                placeholder="Pilih kategori"
                options={KATEGORI_OPTIONS}
                value={formBaru.kategori}
                onChange={(e) => setBaru("kategori", e.target.value)}
                error={errorsBaru.kategori}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Harga Beli"
                  type="number" inputMode="numeric"
                  placeholder="15000"
                  prefix="Rp"
                  value={formBaru.hargaBeli}
                  onChange={(e) => setBaru("hargaBeli", e.target.value)}
                  error={errorsBaru.hargaBeli}
                />
                <Input
                  label="Jumlah Beli"
                  type="number" inputMode="decimal"
                  placeholder="1000"
                  value={formBaru.jumlahBeli}
                  onChange={(e) => setBaru("jumlahBeli", e.target.value)}
                  error={errorsBaru.jumlahBeli}
                />
              </div>

              <Select
                label="Satuan"
                placeholder="Pilih satuan"
                options={SATUAN_OPTIONS}
                value={formBaru.satuan}
                onChange={(e) => setBaru("satuan", e.target.value)}
                error={errorsBaru.satuan}
              />

              {/* Preview harga per satuan */}
              {hargaPerSatuanBaru !== null && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-3">
                  <p className="text-xs font-semibold text-orange-700">Harga Per Satuan (Auto)</p>
                  <p className="text-sm font-bold text-orange-600 mt-0.5">
                    {formatRupiah(hargaPerSatuanBaru)}
                    <span className="text-xs font-normal text-orange-400"> / {formBaru.satuan || "satuan"}</span>
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-dashed border-[#e8e4df] pt-4">
                <p className="text-xs font-semibold text-stone-600 mb-3">Jumlah Pakai di Resep Ini</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      label=""
                      type="number" inputMode="decimal"
                      placeholder={`cth: 200`}
                      suffix={formBaru.satuan || "satuan"}
                      value={jumlahBaru}
                      onChange={(e) => { setJumlahBaru(e.target.value); if (errorsBaru.jumlahBaru) setErrorsBaru((p) => { const n = {...p}; delete n.jumlahBaru; return n; }); }}
                      error={errorsBaru.jumlahBaru}
                    />
                  </div>
                  {biayaBaruPreview !== null && (
                    <div className="text-right flex-shrink-0 pb-1">
                      <p className="text-xs text-stone-400">Biaya</p>
                      <p className="text-base font-bold text-orange-600">{formatRupiah(biayaBaruPreview)}</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-6 pt-3 flex gap-3 flex-shrink-0 border-t border-[#e8e4df]">
              <Button variant="ghost" fullWidth
                onClick={() => { setMode("pilih"); setError(""); setErrorsBaru({}); }}
                disabled={loading}>
                Kembali
              </Button>
              <Button variant="primary" fullWidth onClick={handleBuatDanTambah} loading={loading}>
                <Plus size={16} /> Simpan & Tambahkan
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
