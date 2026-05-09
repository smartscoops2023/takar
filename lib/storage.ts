/**
 * storage.ts — Local Storage layer untuk Takar (Opsi C)
 *
 * Semua data bahan baku dan resep disimpan di localStorage browser.
 * Server hanya menyimpan tabel lisensi.
 *
 * Key structure:
 *   takar:bahan    → BahanBaku[]
 *   takar:resep    → ResepStored[]  (tanpa relasi, bahan disimpan inline)
 *   takar:lisensi  → string (kode lisensi yang aktif)
 */

import { nanoid } from "@/lib/nanoid";
import type { KategoriBahan, SatuanBahan, KategoriResep, SatuanHasil, OverheadItem } from "@/lib/types";

// ─────────────────────────────────────────────
// TIPE DATA (localStorage-friendly, tanpa relasi Prisma)
// ─────────────────────────────────────────────

export interface BahanBakuLocal {
  id: string;
  nama: string;
  kategori: KategoriBahan;
  hargaBeli: number;
  jumlahBeli: number;
  satuan: SatuanBahan;
  hargaPerSatuan: number;   // auto: hargaBeli / jumlahBeli
  createdAt: string;        // ISO string
  updatedAt: string;
}

export interface ResepBahanLocal {
  id: string;
  bahanBakuId: string;
  jumlahPakai: number;
  // Snapshot data bahan saat ditambahkan (agar tidak rusak kalau bahan diedit)
  namaSnapshot: string;
  satuanSnapshot: string;
  hargaPerSatuanSnapshot: number;
  kategoriSnapshot: KategoriBahan;
}

export interface ResepLocal {
  id: string;
  nama: string;
  kategori: KategoriResep;
  deskripsi: string | null;
  hasilProduksi: number;
  satuanHasil: SatuanHasil;
  overheadItems: OverheadItem[];
  bahan: ResepBahanLocal[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// KEYS
// ─────────────────────────────────────────────

const KEY_BAHAN   = "takar:bahan";
const KEY_RESEP   = "takar:resep";
const KEY_LISENSI = "takar:lisensi";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function now(): string {
  return new Date().toISOString();
}

// ─────────────────────────────────────────────
// LISENSI
// ─────────────────────────────────────────────

export function getLisensi(): string | null {
  return readJSON<string | null>(KEY_LISENSI, null);
}

export function setLisensi(kode: string): void {
  writeJSON(KEY_LISENSI, kode);
}

export function clearLisensi(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_LISENSI);
}

// ─────────────────────────────────────────────
// BAHAN BAKU
// ─────────────────────────────────────────────

export function getAllBahan(): BahanBakuLocal[] {
  return readJSON<BahanBakuLocal[]>(KEY_BAHAN, []);
}

export function getBahanById(id: string): BahanBakuLocal | null {
  return getAllBahan().find((b) => b.id === id) ?? null;
}

export interface CreateBahanInput {
  nama: string;
  kategori: KategoriBahan;
  hargaBeli: number;
  jumlahBeli: number;
  satuan: SatuanBahan;
}

export function createBahan(input: CreateBahanInput): BahanBakuLocal {
  const bahan: BahanBakuLocal = {
    id: nanoid(),
    nama: input.nama.trim(),
    kategori: input.kategori,
    hargaBeli: input.hargaBeli,
    jumlahBeli: input.jumlahBeli,
    satuan: input.satuan,
    hargaPerSatuan: input.hargaBeli / input.jumlahBeli,
    createdAt: now(),
    updatedAt: now(),
  };
  const list = getAllBahan();
  writeJSON(KEY_BAHAN, [bahan, ...list]);
  return bahan;
}

export function updateBahan(id: string, input: CreateBahanInput): BahanBakuLocal | null {
  const list = getAllBahan();
  const idx  = list.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const updated: BahanBakuLocal = {
    ...list[idx],
    ...input,
    nama: input.nama.trim(),
    hargaPerSatuan: input.hargaBeli / input.jumlahBeli,
    updatedAt: now(),
  };
  list[idx] = updated;
  writeJSON(KEY_BAHAN, list);

  // Update snapshot di semua resep yang pakai bahan ini
  _updateSnapshotBahan(id, updated);

  return updated;
}

export function deleteBahan(id: string): { ok: boolean; error?: string } {
  // Cek apakah dipakai di resep
  const resepList = getAllResep();
  const dipakai   = resepList.filter((r) => r.bahan.some((rb) => rb.bahanBakuId === id));
  if (dipakai.length > 0) {
    return {
      ok: false,
      error: `Bahan ini digunakan di ${dipakai.length} resep: ${dipakai.map((r) => r.nama).join(", ")}. Hapus dari resep terlebih dahulu.`,
    };
  }
  const list = getAllBahan().filter((b) => b.id !== id);
  writeJSON(KEY_BAHAN, list);
  return { ok: true };
}

/** Update snapshot bahan di semua resep yang memakainya */
function _updateSnapshotBahan(bahanId: string, updated: BahanBakuLocal): void {
  const resepList = getAllResep();
  let changed = false;
  const newList = resepList.map((r) => {
    const newBahan = r.bahan.map((rb) => {
      if (rb.bahanBakuId !== bahanId) return rb;
      changed = true;
      return {
        ...rb,
        namaSnapshot: updated.nama,
        satuanSnapshot: updated.satuan,
        hargaPerSatuanSnapshot: updated.hargaPerSatuan,
        kategoriSnapshot: updated.kategori,
      };
    });
    return { ...r, bahan: newBahan };
  });
  if (changed) writeJSON(KEY_RESEP, newList);
}

// ─────────────────────────────────────────────
// RESEP
// ─────────────────────────────────────────────

export function getAllResep(): ResepLocal[] {
  return readJSON<ResepLocal[]>(KEY_RESEP, []);
}

export function getResepById(id: string): ResepLocal | null {
  return getAllResep().find((r) => r.id === id) ?? null;
}

export interface CreateResepInput {
  nama: string;
  kategori: KategoriResep;
  deskripsi?: string | null;
  hasilProduksi: number;
  satuanHasil: SatuanHasil;
}

export function createResep(input: CreateResepInput): ResepLocal {
  const resep: ResepLocal = {
    id: nanoid(),
    nama: input.nama.trim(),
    kategori: input.kategori,
    deskripsi: input.deskripsi?.trim() || null,
    hasilProduksi: input.hasilProduksi,
    satuanHasil: input.satuanHasil,
    overheadItems: [],
    bahan: [],
    createdAt: now(),
    updatedAt: now(),
  };
  const list = getAllResep();
  writeJSON(KEY_RESEP, [resep, ...list]);
  return resep;
}

export function updateResep(id: string, input: Partial<CreateResepInput> & { overheadItems?: OverheadItem[] }): ResepLocal | null {
  const list = getAllResep();
  const idx  = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const updated: ResepLocal = {
    ...list[idx],
    ...(input.nama           !== undefined && { nama: input.nama.trim() }),
    ...(input.kategori       !== undefined && { kategori: input.kategori }),
    ...(input.deskripsi      !== undefined && { deskripsi: input.deskripsi?.trim() || null }),
    ...(input.hasilProduksi  !== undefined && { hasilProduksi: input.hasilProduksi }),
    ...(input.satuanHasil    !== undefined && { satuanHasil: input.satuanHasil }),
    ...(input.overheadItems  !== undefined && { overheadItems: input.overheadItems }),
    updatedAt: now(),
  };
  list[idx] = updated;
  writeJSON(KEY_RESEP, list);
  return updated;
}

export function deleteResep(id: string): boolean {
  const list = getAllResep().filter((r) => r.id !== id);
  writeJSON(KEY_RESEP, list);
  return true;
}

// ─────────────────────────────────────────────
// BAHAN DALAM RESEP
// ─────────────────────────────────────────────

export function addBahanToResep(
  resepId: string,
  bahanBakuId: string,
  jumlahPakai: number
): ResepLocal | null {
  const bahan = getBahanById(bahanBakuId);
  if (!bahan) return null;

  const list = getAllResep();
  const idx  = list.findIndex((r) => r.id === resepId);
  if (idx === -1) return null;

  const resep = list[idx];

  // Cek apakah sudah ada (upsert)
  const existingIdx = resep.bahan.findIndex((rb) => rb.bahanBakuId === bahanBakuId);

  const resepBahan: ResepBahanLocal = {
    id: existingIdx >= 0 ? resep.bahan[existingIdx].id : nanoid(),
    bahanBakuId,
    jumlahPakai,
    namaSnapshot: bahan.nama,
    satuanSnapshot: bahan.satuan,
    hargaPerSatuanSnapshot: bahan.hargaPerSatuan,
    kategoriSnapshot: bahan.kategori,
  };

  if (existingIdx >= 0) {
    resep.bahan[existingIdx] = resepBahan;
  } else {
    resep.bahan.push(resepBahan);
  }

  resep.updatedAt = now();
  list[idx] = resep;
  writeJSON(KEY_RESEP, list);
  return resep;
}

export function updateJumlahBahanResep(
  resepId: string,
  resepBahanId: string,
  jumlahPakai: number
): ResepLocal | null {
  const list = getAllResep();
  const idx  = list.findIndex((r) => r.id === resepId);
  if (idx === -1) return null;

  const resep = list[idx];
  const rbIdx = resep.bahan.findIndex((rb) => rb.id === resepBahanId);
  if (rbIdx === -1) return null;

  resep.bahan[rbIdx].jumlahPakai = jumlahPakai;
  resep.updatedAt = now();
  list[idx] = resep;
  writeJSON(KEY_RESEP, list);
  return resep;
}

export function removeBahanFromResep(resepId: string, resepBahanId: string): ResepLocal | null {
  const list = getAllResep();
  const idx  = list.findIndex((r) => r.id === resepId);
  if (idx === -1) return null;

  list[idx].bahan    = list[idx].bahan.filter((rb) => rb.id !== resepBahanId);
  list[idx].updatedAt = now();
  writeJSON(KEY_RESEP, list);
  return list[idx];
}

// ─────────────────────────────────────────────
// KALKULASI HPP (dari data lokal)
// ─────────────────────────────────────────────

export interface HasilHPPLocal {
  totalBiayaBahan: number;
  totalOverhead: number;
  totalHPPBatch: number;
  hppPerPcs: number;
}

export function hitungHPPLocal(resep: ResepLocal): HasilHPPLocal {
  const totalBiayaBahan = resep.bahan.reduce(
    (sum, rb) => sum + rb.hargaPerSatuanSnapshot * rb.jumlahPakai,
    0
  );
  const totalOverhead = resep.overheadItems.reduce((sum, o) => sum + o.nominal, 0);
  const totalHPPBatch = totalBiayaBahan + totalOverhead;
  const hppPerPcs     = resep.hasilProduksi > 0 ? totalHPPBatch / resep.hasilProduksi : 0;
  return { totalBiayaBahan, totalOverhead, totalHPPBatch, hppPerPcs };
}

// ─────────────────────────────────────────────
// SEARCH & FILTER
// ─────────────────────────────────────────────

export function searchBahan(query: string, kategori?: string): BahanBakuLocal[] {
  let list = getAllBahan();
  if (query)   list = list.filter((b) => b.nama.toLowerCase().includes(query.toLowerCase()));
  if (kategori && kategori !== "Semua") list = list.filter((b) => b.kategori === kategori);
  return list;
}

export function searchResep(query: string, kategori?: string): ResepLocal[] {
  let list = getAllResep();
  if (query)   list = list.filter((r) => r.nama.toLowerCase().includes(query.toLowerCase()));
  if (kategori && kategori !== "Semua") list = list.filter((r) => r.kategori === kategori);
  return list;
}

// ─────────────────────────────────────────────
// EXPORT / IMPORT (untuk backup sederhana)
// ─────────────────────────────────────────────

export function exportData(): string {
  return JSON.stringify({
    version: 1,
    exportedAt: now(),
    bahan: getAllBahan(),
    resep: getAllResep(),
  }, null, 2);
}

export function importData(jsonString: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.bahan || !data.resep) return { ok: false, error: "Format file tidak valid" };
    writeJSON(KEY_BAHAN, data.bahan);
    writeJSON(KEY_RESEP, data.resep);
    return { ok: true };
  } catch {
    return { ok: false, error: "File tidak dapat dibaca" };
  }
}
