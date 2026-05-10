/**
 * db.ts — Direct LibSQL client (tanpa Prisma)
 * Digunakan untuk operasi tabel Lisensi di production.
 */

import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

  if (!url) throw new Error("TURSO_DATABASE_URL tidak ditemukan");

  _client = createClient({ url, authToken });

  // Pastikan tabel ada
  _client.execute(`
    CREATE TABLE IF NOT EXISTS Lisensi (
      kode TEXT PRIMARY KEY,
      aktif INTEGER NOT NULL DEFAULT 1,
      catatanAdmin TEXT,
      aktivasiPertama TEXT,
      jumlahAktivasi INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `).catch(() => {}); // ignore jika sudah ada

  return _client;
}
