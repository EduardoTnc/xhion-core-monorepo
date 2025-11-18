-- CreateEnum
CREATE TYPE "AiEntityType" AS ENUM ('PROJECT', 'TASK', 'USER', 'IDEA', 'DOCUMENT', 'DEPARTMENT', 'KNOWLEDGE');

-- DropForeignKey
ALTER TABLE "public"."AiQueryLog" DROP CONSTRAINT "AiQueryLog_usuarioId_fkey";

-- AlterTable
ALTER TABLE "AiQueryLog" ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Proyecto" ADD COLUMN     "usaEtapas" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "AiEmbedding" (
    "id" UUID NOT NULL,
    "entityType" "AiEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "chunkText" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "source" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiEmbedding_entityType_source_idx" ON "AiEmbedding"("entityType", "source");

-- CreateIndex
CREATE UNIQUE INDEX "AiEmbedding_entityType_entityId_chunkIndex_key" ON "AiEmbedding"("entityType", "entityId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
