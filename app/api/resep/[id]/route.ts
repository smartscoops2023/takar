import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/resep/[id] — detail resep
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const resep = await prisma.resep.findUnique({
      where: { id },
      include: { bahan: { include: { bahanBaku: true } } },
    });
    if (!resep) return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });
    return NextResponse.json(resep);
  } catch (err) {
    console.error("[GET /api/resep/[id]]", err);
    return NextResponse.json({ error: "Gagal mengambil resep" }, { status: 500 });
  }
}

// PUT /api/resep/[id] — update info resep (nama, kategori, yield, overhead)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, kategori, deskripsi, hasilProduksi, satuanHasil, overheadItems } = body;

    if (!nama || !kategori || !hasilProduksi || !satuanHasil) {
      return NextResponse.json({ error: "Field wajib tidak boleh kosong" }, { status: 400 });
    }

    const resep = await prisma.resep.update({
      where: { id },
      data: {
        nama: nama.trim(),
        kategori,
        deskripsi: deskripsi?.trim() || null,
        hasilProduksi: parseFloat(hasilProduksi),
        satuanHasil,
        overheadItems: overheadItems ?? "[]",
      },
      include: { bahan: { include: { bahanBaku: true } } },
    });

    return NextResponse.json(resep);
  } catch (err) {
    console.error("[PUT /api/resep/[id]]", err);
    return NextResponse.json({ error: "Gagal mengupdate resep" }, { status: 500 });
  }
}

// DELETE /api/resep/[id] — hapus resep (cascade ke ResepBahan)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.resep.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/resep/[id]]", err);
    return NextResponse.json({ error: "Gagal menghapus resep" }, { status: 500 });
  }
}
