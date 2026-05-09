/**
 * prisma.ts — Database client
 *
 * Production  : Turso (LibSQL) — TURSO_DATABASE_URL wajib di-set di Vercel
 * Development : SQLite lokal via better-sqlite3 (optional dep)
 */

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl   = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN ?? "";

  if (tursoUrl) {
    // ── PRODUCTION / PREVIEW: Turso ──
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const libsql  = createClient({ url: tursoUrl, authToken: tursoToken });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter } as never);
  }

  // ── DEVELOPMENT: SQLite lokal ──
  // better-sqlite3 hanya tersedia di dev (optionalDependencies)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path    = require("path");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const dbPath  = path.resolve(process.cwd(), "prisma/dev.db");
    const sqlite  = new Database(dbPath);
    const adapter = new PrismaBetterSqlite3(sqlite);
    return new PrismaClient({ adapter } as never);
  } catch {
    throw new Error(
      "Database tidak terkonfigurasi. Set TURSO_DATABASE_URL untuk production, " +
      "atau install better-sqlite3 untuk development."
    );
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
