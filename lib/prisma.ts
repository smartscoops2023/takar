/**
 * prisma.ts — Database client via Turso (LibSQL)
 *
 * Semua environment (dev & prod) menggunakan Turso.
 * Set env vars berikut di .env.local (dev) atau Vercel (prod):
 *   TURSO_DATABASE_URL  = libsql://xxxx.turso.io
 *   TURSO_AUTH_TOKEN    = eyJhbGci...
 */

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL tidak ditemukan. " +
      "Tambahkan ke .env.local untuk development atau Vercel environment variables untuk production."
    );
  }

  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter } as never);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
