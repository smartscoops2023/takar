"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, kategoriBahanColor } from "@/components/ui/Badge";
import { formatRupiah, formatAngka } from "@/lib/types";
import type { BahanBaku } from "@/lib/types";

interface KartuBahanProps {
  bahan: BahanBaku;
  onEdit: (bahan: BahanBaku) => void;
  onDelete: (bahan: BahanBaku) => void;
}

export default function KartuBahan({ bahan, onEdit, onDelete }: KartuBahanProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm p-4 flex items-start gap-3 group">
      {/* Icon kategori */}
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-lg">
        {bahan.kategori === "Kering"  && "🌾"}
        {bahan.kategori === "Basah"   && "💧"}
        {bahan.kategori === "Kemasan" && "📦"}
        {bahan.kategori === "Bumbu"   && "🌶️"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-stone-800 truncate">{bahan.nama}</p>
          <Badge color={kategoriBahanColor[bahan.kategori] ?? "stone"}>
            {bahan.kategori}
          </Badge>
        </div>

        {/* Harga per satuan — info utama */}
        <p className="text-base font-bold text-orange-600 mt-1">
          {formatRupiah(bahan.hargaPerSatuan)}
          <span className="text-xs font-normal text-stone-400"> / {bahan.satuan}</span>
        </p>

        {/* Detail pembelian */}
        <p className="text-xs text-stone-400 mt-0.5">
          Beli {formatRupiah(bahan.hargaBeli)} untuk{" "}
          <span className="text-stone-500 font-medium">
            {formatAngka(bahan.jumlahBeli)} {bahan.satuan}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(bahan)}
          className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500
            hover:bg-orange-100 hover:text-orange-600 transition-colors"
          aria-label={`Edit ${bahan.nama}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(bahan)}
          className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500
            hover:bg-red-100 hover:text-red-600 transition-colors"
          aria-label={`Hapus ${bahan.nama}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
