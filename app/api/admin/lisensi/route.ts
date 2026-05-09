import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "@/lib/nanoid";

// Middleware: cek admin password dari header
function checkAdminAuth(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "takar-admin-2024";
  const authHeader    = req.headers.get("x-admin-password");
  return authHeader === adminPassword;
}

// GET /api/admin/lisensi — list semua lisensi
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lisensiList = await prisma.lisensi.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(lisensiList);
}

// POST /api/admin/lisensi — generate kode baru
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const catatan = body.catatan ?? null;
    const jumlah  = Math.min(parseInt(body.jumlah ?? "1"), 50); // max 50 sekaligus

    const kodeList: string[] = [];
    for (let i = 0; i < jumlah; i++) {
      // Format: TAKAR-XXXX-XXXX (huruf besar + angka)
      const part1 = nanoid(4).toUpperCase();
      const part2 = nanoid(4).toUpperCase();
      kodeList.push(`TAKAR-${part1}-${part2}`);
    }

    const created = await Promise.all(
      kodeList.map((kode) =>
        prisma.lisensi.create({
          data: { kode, catatanAdmin: catatan },
        })
      )
    );

    return NextResponse.json({ created: created.map((l) => l.kode) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/lisensi]", err);
    return NextResponse.json({ error: "Gagal membuat lisensi" }, { status: 500 });
  }
}

// PATCH /api/admin/lisensi — nonaktifkan/aktifkan kode
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kode, aktif } = await req.json();
  const updated = await prisma.lisensi.update({
    where: { kode },
    data: { aktif },
  });

  return NextResponse.json(updated);
}
