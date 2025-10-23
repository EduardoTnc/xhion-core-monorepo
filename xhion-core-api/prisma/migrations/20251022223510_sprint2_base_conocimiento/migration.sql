-- CreateEnum
CREATE TYPE "TipoDocumentoProyecto" AS ENUM ('Resumen', 'Objetivos', 'Especificaciones', 'LeccionesAprendidas', 'Documentacion', 'Notas');

-- AlterTable
ALTER TABLE "Departamento" ADD COLUMN     "color" VARCHAR(50),
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "jefeId" UUID;

-- CreateTable
CREATE TABLE "ContextoOrganizacional" (
    "id" UUID NOT NULL,
    "mision" TEXT,
    "vision" TEXT,
    "objetivosEstrategicos" TEXT,
    "descripcionGeneral" TEXT,
    "industria" VARCHAR(100),
    "tamanoEmpresa" VARCHAR(50),
    "valoresEmpresariales" TEXT,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "actualizadoPorId" UUID NOT NULL,

    CONSTRAINT "ContextoOrganizacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextoDepartamento" (
    "id" UUID NOT NULL,
    "departamentoId" UUID NOT NULL,
    "funciones" TEXT,
    "responsabilidades" TEXT,
    "procesosClave" TEXT,
    "objetivos" TEXT,
    "kpis" TEXT,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "actualizadoPorId" UUID NOT NULL,

    CONSTRAINT "ContextoDepartamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoProyecto" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "tipo" "TipoDocumentoProyecto" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "contenido" TEXT NOT NULL,
    "archivoId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPorId" UUID NOT NULL,

    CONSTRAINT "DocumentoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContextoDepartamento_departamentoId_key" ON "ContextoDepartamento"("departamentoId");

-- CreateIndex
CREATE INDEX "DocumentoProyecto_proyectoId_idx" ON "DocumentoProyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "DocumentoProyecto_tipo_idx" ON "DocumentoProyecto"("tipo");

-- AddForeignKey
ALTER TABLE "Departamento" ADD CONSTRAINT "Departamento_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextoOrganizacional" ADD CONSTRAINT "ContextoOrganizacional_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextoDepartamento" ADD CONSTRAINT "ContextoDepartamento_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextoDepartamento" ADD CONSTRAINT "ContextoDepartamento_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoProyecto" ADD CONSTRAINT "DocumentoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoProyecto" ADD CONSTRAINT "DocumentoProyecto_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoProyecto" ADD CONSTRAINT "DocumentoProyecto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
