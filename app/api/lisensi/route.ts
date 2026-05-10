import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { kode } = await req.json();
    if (!kode || typeof kode !== "string") {
      return NextResponse.json({ valid: false, error: "Kode tidak valid" }, { status: 400 });
    }

    const kodeNorm = kode.trim().toUpperCase();
    const db = getDb();

    const result = await db.execute({
      sql: "SELECT * FROM Lisensi WHERE kode = ?",
      args: [kodeNorm],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false, error: "Kode lisensi tidak ditemukan" }, { status: 404 });
    }

    const lisensi = result.rows[0];
    if (!lisensi.aktif) {
      return NextResponse.json({ valid: false, error: "Kode lisensi sudah tidak aktif" }, { status: 403 });
    }

    // Update statistik
    const now = new Date().toISOString();
    await db.execute({
      sql: `UPDATE Lisensi SET
              jumlahAktivasi = jumlahAktivasi + 1,
              aktivasiPertama = COALESCE(aktivasiPertama, ?)
            WHERE kode = ?`,
      args: [now, kodeNorm],
    });

    return NextResponse.json({ valid: true, kode: kodeNorm });
  } catch (err) {
    console.error("[POST /api/lisensi]", err);
    return NextResponse.json({ valid: false, error: "Gagal memvalidasi lisensi" }, { status: 500 });
  }
}
