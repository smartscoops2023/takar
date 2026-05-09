-- CreateTable
CREATE TABLE "BahanBaku" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "hargaBeli" REAL NOT NULL,
    "jumlahBeli" REAL NOT NULL,
    "satuan" TEXT NOT NULL,
    "hargaPerSatuan" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Resep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT,
    "hasilProduksi" REAL NOT NULL,
    "satuanHasil" TEXT NOT NULL,
    "overheadItems" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResepBahan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resepId" TEXT NOT NULL,
    "bahanBakuId" TEXT NOT NULL,
    "jumlahPakai" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResepBahan_resepId_fkey" FOREIGN KEY ("resepId") REFERENCES "Resep" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResepBahan_bahanBakuId_fkey" FOREIGN KEY ("bahanBakuId") REFERENCES "BahanBaku" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ResepBahan_resepId_bahanBakuId_key" ON "ResepBahan"("resepId", "bahanBakuId");
