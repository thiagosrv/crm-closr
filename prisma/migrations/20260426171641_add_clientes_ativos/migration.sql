-- CreateTable
CREATE TABLE "ClienteAtivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa" TEXT NOT NULL,
    "contato" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "segmento" TEXT,
    "valorNota" REAL NOT NULL DEFAULT 0,
    "valorLiquido" REAL NOT NULL DEFAULT 0,
    "impostos" REAL NOT NULL DEFAULT 0,
    "comissoes" REAL NOT NULL DEFAULT 0,
    "custosExtras" REAL NOT NULL DEFAULT 0,
    "custosFixos" REAL NOT NULL DEFAULT 0,
    "numeroPostos" INTEGER NOT NULL DEFAULT 1,
    "metaMensal" REAL NOT NULL DEFAULT 0,
    "metaAnual" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClienteAtivo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClienteAtivoMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "metaMensal" REAL NOT NULL DEFAULT 0,
    "metaAnual" REAL NOT NULL DEFAULT 0,
    "percPublicidade" REAL NOT NULL DEFAULT 10,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClienteAtivoMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClienteAtivoMeta_userId_key" ON "ClienteAtivoMeta"("userId");
