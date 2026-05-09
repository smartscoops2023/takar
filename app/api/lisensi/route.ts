import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/lisensi — validasi kode lisensi
export async function POST(req: NextRequest) {
  try {
    const { kode } = await req.json();

    if (!kode || typeof kode !== "string") {
      return NextResponse.json({ valid: false, error: "Kode tidak valid" }, { status: 400 });
    }

    const kodeNormalized = kode.trim().toUpperCase();

    const lisensi = await prisma.lisensi.findUnique({
      where: { kode: kodeNormalized },
    });

    if (!lisensi) {
      return NextResponse.json({ valid: false, error: "Kode lisensi tidak ditemukan" }, { status: 404 });
    }

    if (!lisensi.aktif) {
      return NextResponse.json({ valid: false, error: "Kode lisensi sudah tidak aktif" }, { status: 403 });
    }

    // Update statistik aktivasi
    await prisma.lisensi.update({
      where: { kode: kodeNormalized },
      data: {
        jumlahAktivasi: { increment: 1 },
        aktivasiPertama: lisensi.aktivasiPertama ?? new Date(),
      },
    });

    return NextResponse.json({ valid: true, kode: kodeNormalized });
  } catch (err) {
    console.error("[POST /api/lisensi]", err);
    return NextResponse.json({ valid: false, error: "Gagal memvalidasi lisensi" }, { status: 500 });
  }
}
