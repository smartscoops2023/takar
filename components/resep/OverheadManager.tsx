"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Flame, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatRupiah } from "@/lib/types";
import type { OverheadItem } from "@/lib/types";
import { nanoid } from "@/lib/nanoid";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  resepId: string;
  currentOverhead: OverheadItem[];
}

export default function OverheadManager({ open, onClose, onSaved, resepId, currentOverhead }: Props) {
  const [items, setItems]     = useState<OverheadItem[]>([]);
  const [nama, setNama]       = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Reset state setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      setItems([...currentOverhead]);
      setNama("");
      setNominal("");
      setError("");
    }
  }, [open, currentOverhead]);

  function tambahItem() {
    if (!nama.trim()) { setError("Nama biaya wajib diisi"); return; }
    if (!nominal || parseFloat(nominal) <= 0) { setError("Masukkan nominal yang valid"); return; }
    setItems((prev) => [...prev, { id: nanoid(), nama: nama.trim(), nominal: parseFloat(nominal) }]);
    setNama(""); setNominal(""); setError("");
  }

  function hapusItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const { updateResep } = await import("@/lib/storage");
      updateResep(resepId, { overheadItems: items });
      onSaved();
    } catch {
      setError("Gagal menyimpan overhead");
    } finally {
      setLoading(false);
    }
  }

  const total = items.reduce((s, i) => s + i.nominal, 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} aria-hidden />
      <div className="fixed z-50 bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl
        bottom-0 left-0 right-0
        lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2
        lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[480px]
        max-h-[88vh] flex flex-col">

        <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4df] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-stone-800">Biaya Overhead</h2>
            <p className="text-xs text-stone-400 mt-0.5">Gas, listrik, kemasan, dan biaya lainnya</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200">
            <X size={16} />
          </button>
        </div>

        {/* List overhead */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">Belum ada biaya overhead</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Flame size={13} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.nama}</p>
                    <p className="text-xs text-amber-600 font-semibold">{formatRupiah(item.nominal)}</p>
                  </div>
                  <button onClick={() => hapusItem(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400
                      hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold text-stone-700">{formatRupiah(total)}</p>
              </div>
            </>
          )}
        </div>

        {/* Form tambah item */}
        <div className="px-5 py-3 border-t border-[#e8e4df] bg-stone-50/50 flex-shrink-0 space-y-3">
          <p className="text-xs font-semibold text-stone-600">Tambah Biaya Baru</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="cth: Gas LPG" value={nama}
              onChange={(e) => { setNama(e.target.value); setError(""); }} />
            <Input type="number" inputMode="numeric" placeholder="5000"
              prefix="Rp" value={nominal}
              onChange={(e) => { setNominal(e.target.value); setError(""); }} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button variant="secondary" fullWidth onClick={tambahItem}>
            <Plus size={14} /> Tambah Item
          </Button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 flex gap-3 flex-shrink-0 border-t border-[#e8e4df]">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>Batal</Button>
          <Button variant="primary" fullWidth onClick={handleSave} loading={loading}>
            <Save size={16} /> Simpan Overhead
          </Button>
        </div>
      </div>
    </>
  );
}
