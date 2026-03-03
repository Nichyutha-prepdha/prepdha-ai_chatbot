-- CreateTable
CREATE TABLE "ChatContext" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "context_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference_text" TEXT,
    "message_order" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatContext_chapter_id_idx" ON "ChatContext"("chapter_id");

-- CreateIndex
CREATE INDEX "ChatContext_thread_id_idx" ON "ChatContext"("thread_id");

-- CreateIndex
CREATE INDEX "ChatMessage_thread_id_idx" ON "ChatMessage"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_thread_id_message_order_key" ON "ChatMessage"("thread_id", "message_order");

-- CreateIndex
CREATE INDEX "ChatThread_chapter_id_idx" ON "ChatThread"("chapter_id");

-- CreateIndex
CREATE INDEX "ChatThread_created_at_idx" ON "ChatThread"("created_at");

-- CreateIndex
CREATE INDEX "ChatThread_user_id_idx" ON "ChatThread"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "UserSession"("sessionToken");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "UserSession_sessionToken_idx" ON "UserSession"("sessionToken");

-- AddForeignKey
ALTER TABLE "ChatContext" ADD CONSTRAINT "ChatContext_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
