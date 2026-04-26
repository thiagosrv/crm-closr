-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'REP',
    "plano" TEXT NOT NULL DEFAULT 'FREE',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "teamId" TEXT,
    "goal" REAL NOT NULL DEFAULT 0,
    "goalPeriod" TEXT NOT NULL DEFAULT 'MENSAL',
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "goal", "goalPeriod", "id", "image", "name", "password", "plano", "role", "teamId", "theme", "timezone", "updatedAt") SELECT "createdAt", "email", "emailVerified", "goal", "goalPeriod", "id", "image", "name", "password", "plano", "role", "teamId", "theme", "timezone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
