import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalBahan, totalResep, resepTerbaru] = await Promise.all([
      prisma.bahanBaku.count(),
      prisma.resep.count(),
      prisma.resep.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { bahan: { include: { bahanBaku: true } } },
      }),
    ]);

    return NextResponse.json({ totalBahan, totalResep, resepTerbaru });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
