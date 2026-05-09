// ============================================================
// Types untuk Takar App
// ============================================================

export type KategoriBahan = "Kering" | "Basah" | "Kemasan" | "Bumbu";
export type KategoriResep = "Kue" | "Roti" | "Minuman" | "Makanan" | "Snack" | "Lainnya";
export type SatuanBahan = "gram" | "kg" | "ml" | "liter" | "butir" | "pcs" | "sdm" | "sdt" | "bungkus" | "lembar";
export type SatuanHasil = "potong" | "pcs" | "botol" | "porsi" | "loyang" | "bungkus";

export interface BahanBaku {
  id: string;
  nama: string;
  kategori: KategoriBahan;
  hargaBeli: number;
  jumlahBeli: number;
  satuan: SatuanBahan;
  hargaPerSatuan: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OverheadItem {
  id: string;
  nama: string;
  nominal: number;
}

export interface ResepBahan {
  id: string;
  resepId: string;
  bahanBakuId: string;
  bahanBaku: BahanBaku;
  jumlahPakai: number;
  createdAt: Date;
}

export interface Resep {
  id: string;
  nama: string;
  kategori: KategoriResep;
  deskripsi?: string | null;
  hasilProduksi: number;
  satuanHasil: SatuanHasil;
  overheadItems: string; // JSON string of OverheadItem[]
  createdAt: Date;
  updatedAt: Date;
  bahan: ResepBahan[];
}

// ============================================================
// Kalkulasi HPP
// ============================================================
export interface HasilKalkulasiHPP {
  totalBiayaBahan: number;
  totalOverhead: number;
  totalHPPBatch: number;
  hppPerPcs: number;
}

export function hitungHPP(resep: Resep): HasilKalkulasiHPP {
  const totalBiayaBahan = resep.bahan.reduce((sum, rb) => {
    return sum + rb.bahanBaku.hargaPerSatuan * rb.jumlahPakai;
  }, 0);

  const overheadItems: OverheadItem[] = JSON.parse(resep.overheadItems || "[]");
  const totalOverhead = overheadItems.reduce((sum, item) => sum + item.nominal, 0);

  const totalHPPBatch = totalBiayaBahan + totalOverhead;
  const hppPerPcs = resep.hasilProduksi > 0 ? totalHPPBatch / resep.hasilProduksi : 0;

  return { totalBiayaBahan, totalOverhead, totalHPPBatch, hppPerPcs };
}

export function hitungHargaJual(hppPerPcs: number, marginPersen: number): number {
  return hppPerPcs * (1 + marginPersen / 100);
}

// ============================================================
// Format Currency
// ============================================================
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatAngka(angka: number, desimal = 2): string {
  if (angka % 1 === 0) return angka.toString();
  return angka.toFixed(desimal).replace(/\.?0+$/, "");
}
