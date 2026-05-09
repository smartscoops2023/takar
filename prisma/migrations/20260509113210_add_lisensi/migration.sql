-- CreateTable
CREATE TABLE "Lisensi" (
    "kode" TEXT NOT NULL PRIMARY KEY,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "catatanAdmin" TEXT,
    "aktivasiPertama" DATETIME,
    "jumlahAktivasi" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
