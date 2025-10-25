-- CreateEnum
CREATE TYPE "TipoDocumentoDepartamento" AS ENUM ('Resumen', 'Objetivos', 'Especificaciones', 'LeccionesAprendidas', 'Documentacion', 'Notas');

-- CreateTable
CREATE TABLE "DocumentoDepartamento" (
    "id" UUID NOT NULL,
    "departamentoId" UUID NOT NULL,
    "tipo" "TipoDocumentoDepartamento" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPorId" UUID NOT NULL,

    CONSTRAINT "DocumentoDepartamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentoDepartamento_departamentoId_idx" ON "DocumentoDepartamento"("departamentoId");

-- CreateIndex
CREATE INDEX "DocumentoDepartamento_tipo_idx" ON "DocumentoDepartamento"("tipo");

-- AddForeignKey
ALTER TABLE "DocumentoDepartamento" ADD CONSTRAINT "DocumentoDepartamento_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoDepartamento" ADD CONSTRAINT "DocumentoDepartamento_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
