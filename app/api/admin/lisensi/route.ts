import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "@/lib/nanoid";

function checkAuth(req: NextRequest): boolean {
  const pw = process.env.ADMIN_PASSWORD ?? "takar-admin-2024";
  return req.headers.get("x-admin-password") === pw;
}

// GET — list semua lisensi
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDb();
    const result = await db.execute("SELECT * FROM Lisensi ORDER BY createdAt DESC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("[GET /api/admin/lisensi]", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST — generate kode baru
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body  = await req.json().catch(() => ({}));
    const catatan = body.catatan ?? null;
    const jumlah  = Math.min(parseInt(body.jumlah ?? "1"), 50);

    const db = getDb();
    const created: string[] = [];

    for (let i = 0; i < jumlah; i++) {
      const kode = `TAKAR-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
      await db.execute({
        sql: "INSERT INTO Lisensi (kode, catatanAdmin) VALUES (?, ?)",
        args: [kode, catatan],
      });
      created.push(kode);
    }

    return NextResponse.json({ created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/lisensi]", err);
    return NextResponse.json({ error: "Gagal membuat lisensi" }, { status: 500 });
  }
}

// PATCH — toggle aktif/nonaktif
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { kode, aktif } = await req.json();
    const db = getDb();
    await db.execute({
      sql: "UPDATE Lisensi SET aktif = ? WHERE kode = ?",
      args: [aktif ? 1 : 0, kode],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/lisensi]", err);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}
