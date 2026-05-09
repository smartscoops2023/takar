import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resep — list semua resep
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search") ?? "";
    const kategori = searchParams.get("kategori") ?? "";

    const resep = await prisma.resep.findMany({
      where: {
        ...(search   && { nama: { contains: search } }),
        ...(kategori && { kategori }),
      },
      include: {
        bahan: {
          include: { bahanBaku: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(resep);
  } catch (err) {
    console.error("[GET /api/resep]", err);
    return NextResponse.json({ error: "Gagal mengambil data resep" }, { status: 500 });
  }
}

// POST /api/resep — buat resep baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kategori, deskripsi, hasilProduksi, satuanHasil } = body;

    if (!nama || !kategori || !hasilProduksi || !satuanHasil) {
      return NextResponse.json({ error: "Field wajib: nama, kategori, hasilProduksi, satuanHasil" }, { status: 400 });
    }

    const resep = await prisma.resep.create({
      data: {
        nama: nama.trim(),
        kategori,
        deskripsi: deskripsi?.trim() || null,
        hasilProduksi: parseFloat(hasilProduksi),
        satuanHasil,
        overheadItems: "[]",
      },
      include: { bahan: { include: { bahanBaku: true } } },
    });

    return NextResponse.json(resep, { status: 201 });
  } catch (err) {
    console.error("[POST /api/resep]", err);
    return NextResponse.json({ error: "Gagal menyimpan resep" }, { status: 500 });
  }
}
