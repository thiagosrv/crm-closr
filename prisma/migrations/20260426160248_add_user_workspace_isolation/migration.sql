-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "company" TEXT,
    "cnpj" TEXT,
    "position" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "tags" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contact" ("address", "city", "cnpj", "company", "country", "createdAt", "email", "firstName", "id", "instagram", "isActive", "lastName", "linkedin", "notes", "phone", "position", "source", "state", "tags", "updatedAt", "website", "whatsapp") SELECT "address", "city", "cnpj", "company", "country", "createdAt", "email", "firstName", "id", "instagram", "isActive", "lastName", "linkedin", "notes", "phone", "position", "source", "state", "tags", "updatedAt", "website", "whatsapp" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE TABLE "new_PipelineStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "probability" REAL NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#06B6D4',
    "rottingDays" INTEGER NOT NULL DEFAULT 14,
    "isClosedWon" BOOLEAN NOT NULL DEFAULT false,
    "isClosedLost" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PipelineStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PipelineStage" ("color", "createdAt", "id", "isClosedLost", "isClosedWon", "name", "order", "probability", "rottingDays", "updatedAt") SELECT "color", "createdAt", "id", "isClosedLost", "isClosedWon", "name", "order", "probability", "rottingDays", "updatedAt" FROM "PipelineStage";
DROP TABLE "PipelineStage";
ALTER TABLE "new_PipelineStage" RENAME TO "PipelineStage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
