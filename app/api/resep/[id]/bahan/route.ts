import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/resep/[id]/bahan — tambah bahan ke resep
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: resepId } = await params;
    const { bahanBakuId, jumlahPakai } = await req.json();

    if (!bahanBakuId || !jumlahPakai || parseFloat(jumlahPakai) <= 0) {
      return NextResponse.json({ error: "bahanBakuId dan jumlahPakai wajib diisi" }, { status: 400 });
    }

    // Upsert: kalau sudah ada, update jumlahnya
    const resepBahan = await prisma.resepBahan.upsert({
      where: { resepId_bahanBakuId: { resepId, bahanBakuId } },
      update: { jumlahPakai: parseFloat(jumlahPakai) },
      create: { resepId, bahanBakuId, jumlahPakai: parseFloat(jumlahPakai) },
      include: { bahanBaku: true },
    });

    return NextResponse.json(resepBahan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/resep/[id]/bahan]", err);
    return NextResponse.json({ error: "Gagal menambah bahan ke resep" }, { status: 500 });
  }
}
