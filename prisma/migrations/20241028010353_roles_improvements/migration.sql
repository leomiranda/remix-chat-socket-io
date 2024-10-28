/*
  Warnings:

  - You are about to drop the column `role` on the `account_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "chat_message" ADD COLUMN "editedAt" DATETIME;

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "account_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "usuarioOnline" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_account_user" ("dateJoined", "email", "id", "isActive", "isStaff", "isSuperuser", "lastLogin", "name", "usuarioOnline") SELECT "dateJoined", "email", "id", "isActive", "isStaff", "isSuperuser", "lastLogin", "name", "usuarioOnline" FROM "account_user";
DROP TABLE "account_user";
ALTER TABLE "new_account_user" RENAME TO "account_user";
CREATE UNIQUE INDEX "account_user_email_key" ON "account_user"("email");
CREATE TABLE "new_chat_room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "url" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    "evento" TEXT,
    "local" TEXT,
    "arquivado" INTEGER NOT NULL DEFAULT 0,
    "nivelGravidade" INTEGER NOT NULL DEFAULT 0,
    "usuarioOnline" INTEGER NOT NULL DEFAULT 0,
    "eventoAtivo" INTEGER NOT NULL DEFAULT 0,
    "ultimaMensagem" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accesstimeAgent" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "funcionario" INTEGER NOT NULL DEFAULT 0,
    "novaConversa" INTEGER NOT NULL DEFAULT 0,
    "ultimaMensagemUsuario" DATETIME,
    "ultimaMensagemAgente" DATETIME,
    "relatorio" TEXT NOT NULL DEFAULT '',
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "lastMessage" TEXT,
    "lastViewed" DATETIME,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "chat_room_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "account_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chat_room" ("accesstimeAgent", "agentId", "arquivado", "client", "createdAt", "evento", "eventoAtivo", "funcionario", "id", "isGroup", "lastMessage", "local", "name", "nivelGravidade", "novaConversa", "relatorio", "status", "ultimaMensagem", "ultimaMensagemAgente", "ultimaMensagemUsuario", "url", "usuarioOnline", "uuid") SELECT "accesstimeAgent", "agentId", "arquivado", "client", "createdAt", "evento", "eventoAtivo", "funcionario", "id", "isGroup", "lastMessage", "local", "name", "nivelGravidade", "novaConversa", "relatorio", "status", "ultimaMensagem", "ultimaMensagemAgente", "ultimaMensagemUsuario", "url", "usuarioOnline", "uuid" FROM "chat_room";
DROP TABLE "chat_room";
ALTER TABLE "new_chat_room" RENAME TO "chat_room";
CREATE UNIQUE INDEX "chat_room_uuid_key" ON "chat_room"("uuid");
CREATE TABLE "new_chat_room_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "muteNotifications" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    CONSTRAINT "chat_room_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_room_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "account_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_chat_room_participants" ("id", "isAdmin", "joinedAt", "leftAt", "roomId", "userId") SELECT "id", "isAdmin", "joinedAt", "leftAt", "roomId", "userId" FROM "chat_room_participants";
DROP TABLE "chat_room_participants";
ALTER TABLE "new_chat_room_participants" RENAME TO "chat_room_participants";
CREATE UNIQUE INDEX "chat_room_participants_roomId_userId_key" ON "chat_room_participants"("roomId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");
