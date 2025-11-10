-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('Pendiente', 'Aprobada', 'Rechazada', 'Expirada');

-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "solicitudes_acceso" (
    "id" UUID NOT NULL,
    "nombreCompleto" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "empresa" VARCHAR(200),
    "cargo" VARCHAR(100),
    "mensaje" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'Pendiente',
    "revisadoPorId" UUID,
    "fechaRevision" TIMESTAMP(3),
    "comentarioRevision" TEXT,
    "invitacionId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "ipSolicitud" VARCHAR(45),

    CONSTRAINT "solicitudes_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_acceso_invitacionId_key" ON "solicitudes_acceso"("invitacionId");

-- CreateIndex
CREATE INDEX "solicitudes_acceso_email_idx" ON "solicitudes_acceso"("email");

-- CreateIndex
CREATE INDEX "solicitudes_acceso_estado_idx" ON "solicitudes_acceso"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_acceso_fechaCreacion_idx" ON "solicitudes_acceso"("fechaCreacion");

-- CreateIndex
CREATE INDEX "solicitudes_acceso_fechaExpiracion_idx" ON "solicitudes_acceso"("fechaExpiracion");

-- AddForeignKey
ALTER TABLE "solicitudes_acceso" ADD CONSTRAINT "solicitudes_acceso_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_acceso" ADD CONSTRAINT "solicitudes_acceso_invitacionId_fkey" FOREIGN KEY ("invitacionId") REFERENCES "invitaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
