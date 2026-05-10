import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const url   = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

  try {
    const db = createClient({ url, authToken });
    const result = await db.execute("SELECT COUNT(*) as count FROM Lisensi");
    return NextResponse.json({
      ok: true,
      lisensiCount: result.rows[0].count,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
    });
  }
}
