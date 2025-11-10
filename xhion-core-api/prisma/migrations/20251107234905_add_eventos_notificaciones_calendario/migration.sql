/*
  Warnings:

  - The primary key for the `ConfiguracionUsuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `configuracionId` on the `ConfiguracionUsuario` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `ConfiguracionUsuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `ConfiguracionUsuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessToken]` on the table `sesiones` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fechaActualizacion` to the `ConfiguracionUsuario` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ConfiguracionUsuario` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "CategoriaIdea" AS ENUM ('Feature', 'Improvement', 'Innovation', 'Recommendation');

-- CreateEnum
CREATE TYPE "EstadoIdea" AS ENUM ('Evaluating', 'Approved', 'InDevelopment', 'Implemented', 'Rejected');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('Reunion', 'Tarea', 'Proyecto', 'Personal', 'Recordatorio');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('Pendiente', 'En_Curso', 'Completado', 'Cancelado');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('Sistema', 'Tarea', 'Proyecto', 'Evento', 'Mensaje', 'Mencion', 'Comentario', 'Recordatorio');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('NoLeida', 'Leida', 'Archivada');

-- DropForeignKey
ALTER TABLE "public"."ConfiguracionUsuario" DROP CONSTRAINT "ConfiguracionUsuario_configuracionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConfiguracionUsuario" DROP CONSTRAINT "ConfiguracionUsuario_usuarioId_fkey";

-- AlterTable
ALTER TABLE "ConfiguracionUsuario" DROP CONSTRAINT "ConfiguracionUsuario_pkey",
DROP COLUMN "configuracionId",
DROP COLUMN "valor",
ADD COLUMN     "fechaActualizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "notificaciones" JSONB,
ADD COLUMN     "preferencias" JSONB,
ADD CONSTRAINT "ConfiguracionUsuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "accessToken" VARCHAR(500),
ADD COLUMN     "fechaExpiracion" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "Idea" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "CategoriaIdea" NOT NULL,
    "estado" "EstadoIdea" NOT NULL DEFAULT 'Evaluating',
    "autorId" UUID NOT NULL,
    "aiScore" INTEGER,
    "aiInsight" TEXT,
    "tags" TEXT[],
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotoIdea" (
    "id" UUID NOT NULL,
    "ideaId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "fechaVoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotoIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioIdea" (
    "id" UUID NOT NULL,
    "ideaId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComentarioIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoEvento" NOT NULL,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'Pendiente',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "todoElDia" BOOLEAN NOT NULL DEFAULT false,
    "ubicacion" VARCHAR(300),
    "color" VARCHAR(20),
    "proyectoId" UUID,
    "tareaId" UUID,
    "creadorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_participantes" (
    "id" UUID NOT NULL,
    "eventoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "fechaRespuesta" TIMESTAMP(3),

    CONSTRAINT "evento_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'NoLeida',
    "usuarioId" UUID NOT NULL,
    "proyectoId" UUID,
    "tareaId" UUID,
    "eventoId" UUID,
    "metadata" JSONB,
    "url" VARCHAR(500),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLeida" TIMESTAMP(3),
    "fechaArchivada" TIMESTAMP(3),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_autorId_idx" ON "Idea"("autorId");

-- CreateIndex
CREATE INDEX "Idea_categoria_idx" ON "Idea"("categoria");

-- CreateIndex
CREATE INDEX "Idea_estado_idx" ON "Idea"("estado");

-- CreateIndex
CREATE INDEX "Idea_fechaCreacion_idx" ON "Idea"("fechaCreacion");

-- CreateIndex
CREATE INDEX "VotoIdea_ideaId_idx" ON "VotoIdea"("ideaId");

-- CreateIndex
CREATE INDEX "VotoIdea_usuarioId_idx" ON "VotoIdea"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "VotoIdea_ideaId_usuarioId_key" ON "VotoIdea"("ideaId", "usuarioId");

-- CreateIndex
CREATE INDEX "ComentarioIdea_ideaId_idx" ON "ComentarioIdea"("ideaId");

-- CreateIndex
CREATE INDEX "ComentarioIdea_usuarioId_idx" ON "ComentarioIdea"("usuarioId");

-- CreateIndex
CREATE INDEX "ComentarioIdea_fechaCreacion_idx" ON "ComentarioIdea"("fechaCreacion");

-- CreateIndex
CREATE INDEX "eventos_creadorId_idx" ON "eventos"("creadorId");

-- CreateIndex
CREATE INDEX "eventos_proyectoId_idx" ON "eventos"("proyectoId");

-- CreateIndex
CREATE INDEX "eventos_tareaId_idx" ON "eventos"("tareaId");

-- CreateIndex
CREATE INDEX "eventos_tipo_idx" ON "eventos"("tipo");

-- CreateIndex
CREATE INDEX "eventos_estado_idx" ON "eventos"("estado");

-- CreateIndex
CREATE INDEX "eventos_fechaInicio_idx" ON "eventos"("fechaInicio");

-- CreateIndex
CREATE INDEX "eventos_fechaFin_idx" ON "eventos"("fechaFin");

-- CreateIndex
CREATE INDEX "evento_participantes_eventoId_idx" ON "evento_participantes"("eventoId");

-- CreateIndex
CREATE INDEX "evento_participantes_usuarioId_idx" ON "evento_participantes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "evento_participantes_eventoId_usuarioId_key" ON "evento_participantes"("eventoId", "usuarioId");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_idx" ON "notificaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "notificaciones_proyectoId_idx" ON "notificaciones"("proyectoId");

-- CreateIndex
CREATE INDEX "notificaciones_tareaId_idx" ON "notificaciones"("tareaId");

-- CreateIndex
CREATE INDEX "notificaciones_eventoId_idx" ON "notificaciones"("eventoId");

-- CreateIndex
CREATE INDEX "notificaciones_tipo_idx" ON "notificaciones"("tipo");

-- CreateIndex
CREATE INDEX "notificaciones_estado_idx" ON "notificaciones"("estado");

-- CreateIndex
CREATE INDEX "notificaciones_fechaCreacion_idx" ON "notificaciones"("fechaCreacion");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionUsuario_usuarioId_key" ON "ConfiguracionUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_accessToken_key" ON "sesiones"("accessToken");

-- CreateIndex
CREATE INDEX "sesiones_usuarioId_idx" ON "sesiones"("usuarioId");

-- CreateIndex
CREATE INDEX "sesiones_fechaExpiracion_idx" ON "sesiones"("fechaExpiracion");

-- AddForeignKey
ALTER TABLE "ConfiguracionUsuario" ADD CONSTRAINT "ConfiguracionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoIdea" ADD CONSTRAINT "VotoIdea_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoIdea" ADD CONSTRAINT "VotoIdea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioIdea" ADD CONSTRAINT "ComentarioIdea_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioIdea" ADD CONSTRAINT "ComentarioIdea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_participantes" ADD CONSTRAINT "evento_participantes_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_participantes" ADD CONSTRAINT "evento_participantes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
