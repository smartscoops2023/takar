/**
 * prisma.ts — Database client
 *
 * Development : SQLite lokal (prisma/dev.db) via better-sqlite3
 * Production  : Turso (LibSQL cloud) via @libsql/client
 *
 * Environment variables yang dibutuhkan di production (Vercel):
 *   TURSO_DATABASE_URL  = libsql://xxxx.turso.io
 *   TURSO_AUTH_TOKEN    = eyJhbGci...
 */

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  const tursoUrl     = process.env.TURSO_DATABASE_URL;
  const tursoToken   = process.env.TURSO_AUTH_TOKEN;

  if (isProduction && tursoUrl) {
    // ── PRODUCTION: Turso (LibSQL) ──
    const { createClient } = require("@libsql/client");
    const { PrismaLibSql }  = require("@prisma/adapter-libsql");

    const libsql  = createClient({ url: tursoUrl, authToken: tursoToken });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter } as never);
  }

  // ── DEVELOPMENT: SQLite lokal ──
  const path = require("path");
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const dbPath  = path.resolve(process.cwd(), "prisma/dev.db");
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter } as never);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
