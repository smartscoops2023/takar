"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatRupiah } from "@/lib/types";
import type { BahanBaku, KategoriBahan, SatuanBahan } from "@/lib/types";

interface FormBahanProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: BahanBaku | null;
}

const KATEGORI_OPTIONS = [
  { value: "Kering",  label: "🌾 Kering (tepung, gula, dll)" },
  { value: "Basah",   label: "💧 Basah (telur, susu, dll)" },
  { value: "Kemasan", label: "📦 Kemasan (plastik, box, dll)" },
  { value: "Bumbu",   label: "🌶️ Bumbu (garam, vanili, dll)" },
];

const SATUAN_OPTIONS = [
  { value: "gram",    label: "gram" },
  { value: "kg",      label: "kg" },
  { value: "ml",      label: "ml" },
  { value: "liter",   label: "liter" },
  { value: "butir",   label: "butir" },
  { value: "pcs",     label: "pcs" },
  { value: "sdm",     label: "sdm (sendok makan)" },
  { value: "sdt",     label: "sdt (sendok teh)" },
  { value: "bungkus", label: "bungkus" },
  { value: "lembar",  label: "lembar" },
];

const EMPTY_FORM = {
  nama: "",
  kategori: "" as KategoriBahan | "",
  hargaBeli: "",
  jumlahBeli: "",
  satuan: "" as SatuanBahan | "",
};

export default function FormBahan({ open, onClose, onSaved, editData }: FormBahanProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const namaRef = useRef<HTMLInputElement>(null);

  // Isi form saat edit
  useEffect(() => {
    if (editData) {
      setForm({
        nama: editData.nama,
        kategori: editData.kategori as KategoriBahan,
        hargaBeli: editData.hargaBeli.toString(),
        jumlahBeli: editData.jumlahBeli.toString(),
        satuan: editData.satuan as SatuanBahan,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setApiError("");
  }, [editData, open]);

  // Focus ke input nama saat modal buka
  useEffect(() => {
    if (open) {
      setTimeout(() => namaRef.current?.focus(), 100);
    }
  }, [open]);

  // Hitung preview harga per satuan
  const hargaPerSatuan =
    form.hargaBeli && form.jumlahBeli && parseFloat(form.jumlahBeli) > 0
      ? parseFloat(form.hargaBeli) / parseFloat(form.jumlahBeli)
      : null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama bahan wajib diisi";
    if (!form.kategori) e.kategori = "Pilih kategori";
    if (!form.hargaBeli || isNaN(parseFloat(form.hargaBeli)) || parseFloat(form.hargaBeli) <= 0)
      e.hargaBeli = "Masukkan harga beli yang valid";
    if (!form.jumlahBeli || isNaN(parseFloat(form.jumlahBeli)) || parseFloat(form.jumlahBeli) <= 0)
      e.jumlahBeli = "Masukkan jumlah yang valid";
    if (!form.satuan) e.satuan = "Pilih satuan";
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
        const { updateBahan } = await import("@/lib/storage");
        updateBahan(editData.id, {
          nama: form.nama,
          kategori: form.kategori as import("@/lib/types").KategoriBahan,
          hargaBeli: parseFloat(form.hargaBeli),
          jumlahBeli: parseFloat(form.jumlahBeli),
          satuan: form.satuan as import("@/lib/types").SatuanBahan,
        });
      } else {
        const { createBahan } = await import("@/lib/storage");
        createBahan({
          nama: form.nama,
          kategori: form.kategori as import("@/lib/types").KategoriBahan,
          hargaBeli: parseFloat(form.hargaBeli),
          jumlahBeli: parseFloat(form.jumlahBeli),
          satuan: form.satuan as import("@/lib/types").SatuanBahan,
        });
      }
      onSaved();
      onClose();
    } catch {
      setApiError("Gagal menyimpan bahan");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = {...prev}; delete n[field]; return n; });
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editData ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
        className="fixed z-50 bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl
          bottom-0 left-0 right-0
          lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2
          lg:-translate-x-1/2 lg:-translate-y-1/2
          lg:w-[480px]
          max-h-[92vh] overflow-y-auto"
      >
        {/* Handle bar (mobile) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4df]">
          <div>
            <h2 className="text-base font-bold text-stone-800">
              {editData ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {editData ? "Perbarui data bahan baku" : "Input bahan dan harga belinya"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 py-4 space-y-4">

            {/* Nama */}
            <Input
              ref={namaRef}
              label="Nama Bahan"
              placeholder="cth: Tepung Terigu, Gula Pasir..."
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              error={errors.nama}
            />

            {/* Kategori */}
            <Select
              label="Kategori"
              placeholder="Pilih kategori bahan"
              options={KATEGORI_OPTIONS}
              value={form.kategori}
              onChange={(e) => handleChange("kategori", e.target.value)}
              error={errors.kategori}
            />

            {/* Harga Beli */}
            <Input
              label="Harga Beli"
              type="number"
              inputMode="numeric"
              placeholder="60000"
              prefix="Rp"
              value={form.hargaBeli}
              onChange={(e) => handleChange("hargaBeli", e.target.value)}
              error={errors.hargaBeli}
              hint="Total harga saat membeli"
            />

            {/* Jumlah + Satuan */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Jumlah Beli"
                type="number"
                inputMode="decimal"
                placeholder="25000"
                value={form.jumlahBeli}
                onChange={(e) => handleChange("jumlahBeli", e.target.value)}
                error={errors.jumlahBeli}
              />
              <Select
                label="Satuan"
                placeholder="Pilih satuan"
                options={SATUAN_OPTIONS}
                value={form.satuan}
                onChange={(e) => handleChange("satuan", e.target.value)}
                error={errors.satuan}
              />
            </div>

            {/* Preview harga per satuan */}
            {hargaPerSatuan !== null && (
              <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-3">
                <Info size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-orange-700">Harga Per Satuan (Auto)</p>
                  <p className="text-sm font-bold text-orange-600 mt-0.5">
                    {formatRupiah(hargaPerSatuan)}
                    <span className="text-xs font-normal text-orange-500">
                      {" "}/ {form.satuan || "satuan"}
                    </span>
                  </p>
                  <p className="text-xs text-orange-400 mt-0.5">
                    Dihitung otomatis: Rp {form.hargaBeli} ÷ {form.jumlahBeli} {form.satuan}
                  </p>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-6 pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              <Save size={16} />
              {editData ? "Simpan Perubahan" : "Tambah Bahan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
