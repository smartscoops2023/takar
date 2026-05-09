import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bahan — ambil semua bahan baku
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const kategori = searchParams.get("kategori") ?? "";

    const bahan = await prisma.bahanBaku.findMany({
      where: {
        ...(search && {
          nama: { contains: search },
        }),
        ...(kategori && { kategori }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(bahan);
  } catch (err) {
    console.error("[GET /api/bahan]", err);
    return NextResponse.json({ error: "Gagal mengambil data bahan" }, { status: 500 });
  }
}

// POST /api/bahan — tambah bahan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kategori, hargaBeli, jumlahBeli, satuan } = body;

    if (!nama || !kategori || !hargaBeli || !jumlahBeli || !satuan) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const hargaBeliNum = parseFloat(hargaBeli);
    const jumlahBeliNum = parseFloat(jumlahBeli);

    if (isNaN(hargaBeliNum) || isNaN(jumlahBeliNum) || jumlahBeliNum <= 0) {
      return NextResponse.json({ error: "Harga dan jumlah harus berupa angka valid" }, { status: 400 });
    }

    // Auto-calculate harga per satuan dasar
    const hargaPerSatuan = hargaBeliNum / jumlahBeliNum;

    const bahan = await prisma.bahanBaku.create({
      data: {
        nama: nama.trim(),
        kategori,
        hargaBeli: hargaBeliNum,
        jumlahBeli: jumlahBeliNum,
        satuan,
        hargaPerSatuan,
      },
    });

    return NextResponse.json(bahan, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bahan]", err);
    return NextResponse.json({ error: "Gagal menyimpan bahan" }, { status: 500 });
  }
}
