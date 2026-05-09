import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; bahanId: string }> };

// PUT /api/resep/[id]/bahan/[bahanId] — update jumlah pakai
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { bahanId } = await params;
    const { jumlahPakai } = await req.json();

    if (!jumlahPakai || parseFloat(jumlahPakai) <= 0) {
      return NextResponse.json({ error: "jumlahPakai harus lebih dari 0" }, { status: 400 });
    }

    const resepBahan = await prisma.resepBahan.update({
      where: { id: bahanId },
      data: { jumlahPakai: parseFloat(jumlahPakai) },
      include: { bahanBaku: true },
    });

    return NextResponse.json(resepBahan);
  } catch (err) {
    console.error("[PUT /api/resep/[id]/bahan/[bahanId]]", err);
    return NextResponse.json({ error: "Gagal mengupdate bahan" }, { status: 500 });
  }
}

// DELETE /api/resep/[id]/bahan/[bahanId] — hapus bahan dari resep
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { bahanId } = await params;
    await prisma.resepBahan.delete({ where: { id: bahanId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/resep/[id]/bahan/[bahanId]]", err);
    return NextResponse.json({ error: "Gagal menghapus bahan dari resep" }, { status: 500 });
  }
}
