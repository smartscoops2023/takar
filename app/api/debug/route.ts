import { NextResponse } from "next/server";

export async function GET() {
  const url   = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  const admin = process.env.ADMIN_PASSWORD;

  return NextResponse.json({
    hasUrl:   !!url,
    urlStart: url?.slice(0, 30) ?? "MISSING",
    hasToken: !!token,
    tokenLen: token?.length ?? 0,
    hasAdmin: !!admin,
    nodeEnv:  process.env.NODE_ENV,
  });
}
