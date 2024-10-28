-- CreateTable
CREATE TABLE "account_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperuser" BOOLEAN NOT NULL DEFAULT false,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "dateJoined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "role" TEXT NOT NULL,
    "usuarioOnline" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "account_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "metadata" TEXT,
    CONSTRAINT "chat_message_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "account_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_room" (
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
    CONSTRAINT "chat_room_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "account_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_room_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomId" INTEGER NOT NULL,
    "messageId" INTEGER NOT NULL,
    CONSTRAINT "chat_room_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_room_messages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "chat_message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_room_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "chat_room_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_room_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "account_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "account_user_email_key" ON "account_user"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_uuid_key" ON "chat_room"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_messages_roomId_messageId_key" ON "chat_room_messages"("roomId", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_participants_roomId_userId_key" ON "chat_room_participants"("roomId", "userId");
