-- CreateEnum
CREATE TYPE "EstadoEtapa" AS ENUM ('Pendiente', 'En_Progreso', 'Completada');

-- CreateEnum
CREATE TYPE "PrioridadTarea" AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');

-- CreateEnum
CREATE TYPE "RolProyecto" AS ENUM ('Responsable', 'Miembro', 'Observador');

-- AlterTable
ALTER TABLE "Tarea" ADD COLUMN     "etapaId" UUID,
ADD COLUMN     "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'Media';

-- CreateTable
CREATE TABLE "Etapa" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "proyectoId" UUID NOT NULL,
    "fechaInicio" DATE,
    "fechaFin" DATE,
    "estado" "EstadoEtapa" NOT NULL DEFAULT 'Pendiente',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoMiembro" (
    "proyectoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "rol" "RolProyecto" NOT NULL DEFAULT 'Miembro',
    "fechaUnion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProyectoMiembro_pkey" PRIMARY KEY ("proyectoId","usuarioId")
);

-- CreateIndex
CREATE INDEX "Etapa_proyectoId_idx" ON "Etapa"("proyectoId");

-- CreateIndex
CREATE INDEX "Etapa_estado_idx" ON "Etapa"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_proyectoId_orden_key" ON "Etapa"("proyectoId", "orden");

-- CreateIndex
CREATE INDEX "ProyectoMiembro_proyectoId_idx" ON "ProyectoMiembro"("proyectoId");

-- CreateIndex
CREATE INDEX "ProyectoMiembro_usuarioId_idx" ON "ProyectoMiembro"("usuarioId");

-- CreateIndex
CREATE INDEX "Tarea_proyectoId_idx" ON "Tarea"("proyectoId");

-- CreateIndex
CREATE INDEX "Tarea_etapaId_idx" ON "Tarea"("etapaId");

-- CreateIndex
CREATE INDEX "Tarea_asignadoId_idx" ON "Tarea"("asignadoId");

-- CreateIndex
CREATE INDEX "Tarea_estado_idx" ON "Tarea"("estado");

-- CreateIndex
CREATE INDEX "Tarea_prioridad_idx" ON "Tarea"("prioridad");

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoMiembro" ADD CONSTRAINT "ProyectoMiembro_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoMiembro" ADD CONSTRAINT "ProyectoMiembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
