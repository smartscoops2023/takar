"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Resep } from "@/lib/types";

interface FormResepProps {
  open: boolean;
  onClose: () => void;
  onSaved: (id?: string) => void;
  editData?: Resep | null;
}

const KATEGORI_OPTIONS = [
  { value: "Kue",      label: "🎂 Kue" },
  { value: "Roti",     label: "🍞 Roti" },
  { value: "Minuman",  label: "🥤 Minuman" },
  { value: "Makanan",  label: "🍱 Makanan" },
  { value: "Snack",    label: "🍿 Snack" },
  { value: "Lainnya",  label: "🍽️ Lainnya" },
];

const SATUAN_HASIL_OPTIONS = [
  { value: "potong",   label: "potong" },
  { value: "pcs",      label: "pcs" },
  { value: "botol",    label: "botol" },
  { value: "porsi",    label: "porsi" },
  { value: "loyang",   label: "loyang" },
  { value: "bungkus",  label: "bungkus" },
];

const EMPTY = { nama: "", kategori: "", deskripsi: "", hasilProduksi: "", satuanHasil: "" };

export default function FormResep({ open, onClose, onSaved, editData }: FormResepProps) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const namaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editData) {
      setForm({
        nama: editData.nama,
        kategori: editData.kategori,
        deskripsi: editData.deskripsi ?? "",
        hasilProduksi: editData.hasilProduksi.toString(),
        satuanHasil: editData.satuanHasil,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setApiError("");
  }, [editData, open]);

  useEffect(() => {
    if (open) setTimeout(() => namaRef.current?.focus(), 100);
  }, [open]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nama.trim())       e.nama = "Nama resep wajib diisi";
    if (!form.kategori)          e.kategori = "Pilih kategori";
    if (!form.hasilProduksi || parseFloat(form.hasilProduksi) <= 0)
      e.hasilProduksi = "Masukkan jumlah hasil produksi";
    if (!form.satuanHasil)       e.satuanHasil = "Pilih satuan hasil";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      if (editData) {
        const { updateResep } = await import("@/lib/storage");
        updateResep(editData.id, {
          nama: form.nama,
          kategori: form.kategori as import("@/lib/types").KategoriResep,
          deskripsi: form.deskripsi || null,
          hasilProduksi: parseFloat(form.hasilProduksi),
          satuanHasil: form.satuanHasil as import("@/lib/types").SatuanHasil,
        });
        onSaved(undefined);
      } else {
        const { createResep } = await import("@/lib/storage");
        const resep = createResep({
          nama: form.nama,
          kategori: form.kategori as import("@/lib/types").KategoriResep,
          deskripsi: form.deskripsi || null,
          hasilProduksi: parseFloat(form.hasilProduksi),
          satuanHasil: form.satuanHasil as import("@/lib/types").SatuanHasil,
        });
        onSaved(resep.id);
      }
    } catch {
      setApiError("Gagal menyimpan resep");
    } finally {
      setLoading(false);
    }
  }

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true"
        className="fixed z-50 bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl
          bottom-0 left-0 right-0
          lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2
          lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[480px]
          max-h-[90vh] overflow-y-auto">

        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4df]">
          <div>
            <h2 className="text-base font-bold text-stone-800">
              {editData ? "Edit Resep" : "Buat Resep Baru"}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {editData ? "Perbarui info dasar resep" : "Isi info dasar resep, bahan ditambahkan di halaman detail"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 py-4 space-y-4">
            <Input ref={namaRef} label="Nama Resep"
              placeholder="cth: Brownies Fudgy, Bolu Kukus..."
              value={form.nama} onChange={(e) => set("nama", e.target.value)}
              error={errors.nama} />

            <Select label="Kategori" placeholder="Pilih kategori"
              options={KATEGORI_OPTIONS} value={form.kategori}
              onChange={(e) => set("kategori", e.target.value)}
              error={errors.kategori} />

            <Input label="Deskripsi (opsional)"
              placeholder="Catatan singkat tentang resep ini..."
              value={form.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Hasil Produksi" type="number" inputMode="numeric"
                placeholder="20"
                value={form.hasilProduksi}
                onChange={(e) => set("hasilProduksi", e.target.value)}
                error={errors.hasilProduksi}
                hint="Jumlah yang dihasilkan" />
              <Select label="Satuan Hasil" placeholder="Pilih satuan"
                options={SATUAN_HASIL_OPTIONS} value={form.satuanHasil}
                onChange={(e) => set("satuanHasil", e.target.value)}
                error={errors.satuanHasil} />
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}
          </div>

          <div className="px-5 pb-6 pt-2 flex gap-3">
            <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              <Save size={16} />
              {editData ? "Simpan" : "Buat & Lanjutkan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
