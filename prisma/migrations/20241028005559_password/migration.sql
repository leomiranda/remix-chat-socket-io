/*
  Warnings:

  - You are about to drop the column `password` on the `account_user` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "account_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_account_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperuser" BOOLEAN NOT NULL DEFAULT false,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "dateJoined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "role" TEXT NOT NULL,
    "usuarioOnline" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_account_user" ("dateJoined", "email", "id", "isActive", "isStaff", "isSuperuser", "lastLogin", "name", "role", "usuarioOnline") SELECT "dateJoined", "email", "id", "isActive", "isStaff", "isSuperuser", "lastLogin", "name", "role", "usuarioOnline" FROM "account_user";
DROP TABLE "account_user";
ALTER TABLE "new_account_user" RENAME TO "account_user";
CREATE UNIQUE INDEX "account_user_email_key" ON "account_user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");
