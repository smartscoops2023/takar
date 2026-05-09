import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/bahan/[id] — update bahan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const hargaPerSatuan = hargaBeliNum / jumlahBeliNum;

    const bahan = await prisma.bahanBaku.update({
      where: { id },
      data: {
        nama: nama.trim(),
        kategori,
        hargaBeli: hargaBeliNum,
        jumlahBeli: jumlahBeliNum,
        satuan,
        hargaPerSatuan,
      },
    });

    return NextResponse.json(bahan);
  } catch (err) {
    console.error("[PUT /api/bahan/[id]]", err);
    return NextResponse.json({ error: "Gagal mengupdate bahan" }, { status: 500 });
  }
}

// DELETE /api/bahan/[id] — hapus bahan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cek apakah bahan dipakai di resep
    const dipakai = await prisma.resepBahan.count({ where: { bahanBakuId: id } });
    if (dipakai > 0) {
      return NextResponse.json(
        { error: `Bahan ini digunakan di ${dipakai} resep. Hapus dari resep terlebih dahulu.` },
        { status: 409 }
      );
    }

    await prisma.bahanBaku.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/bahan/[id]]", err);
    return NextResponse.json({ error: "Gagal menghapus bahan" }, { status: 500 });
  }
}
