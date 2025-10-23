-- CreateEnum
CREATE TYPE "TipoMovimientoPresupuesto" AS ENUM ('Asignacion', 'Gasto', 'Ajuste', 'Transferencia');

-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('Activo', 'Agotado', 'Cerrado', 'Suspendido');

-- CreateTable
CREATE TABLE "PresupuestoDepartamento" (
    "id" UUID NOT NULL,
    "departamentoId" UUID NOT NULL,
    "montoTotal" DECIMAL(15,2) NOT NULL,
    "montoGastado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montoDisponible" DECIMAL(15,2) NOT NULL,
    "periodo" VARCHAR(50) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'Activo',
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPorId" UUID NOT NULL,

    CONSTRAINT "PresupuestoDepartamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoPresupuestoDepartamento" (
    "id" UUID NOT NULL,
    "presupuestoDepartamentoId" UUID NOT NULL,
    "tipo" "TipoMovimientoPresupuesto" NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" VARCHAR(100),
    "comprobante" TEXT,
    "archivoId" UUID,
    "fechaMovimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" UUID NOT NULL,

    CONSTRAINT "MovimientoPresupuestoDepartamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresupuestoProyecto" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "montoTotal" DECIMAL(15,2) NOT NULL,
    "montoGastado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montoDisponible" DECIMAL(15,2) NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'Activo',
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "creadoPorId" UUID NOT NULL,

    CONSTRAINT "PresupuestoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoPresupuestoProyecto" (
    "id" UUID NOT NULL,
    "presupuestoProyectoId" UUID NOT NULL,
    "tipo" "TipoMovimientoPresupuesto" NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" VARCHAR(100),
    "comprobante" TEXT,
    "archivoId" UUID,
    "fechaMovimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" UUID NOT NULL,

    CONSTRAINT "MovimientoPresupuestoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresupuestoDepartamento_departamentoId_key" ON "PresupuestoDepartamento"("departamentoId");

-- CreateIndex
CREATE INDEX "PresupuestoDepartamento_departamentoId_periodo_idx" ON "PresupuestoDepartamento"("departamentoId", "periodo");

-- CreateIndex
CREATE INDEX "PresupuestoDepartamento_estado_idx" ON "PresupuestoDepartamento"("estado");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoDepartamento_presupuestoDepartamentoId_idx" ON "MovimientoPresupuestoDepartamento"("presupuestoDepartamentoId");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoDepartamento_tipo_idx" ON "MovimientoPresupuestoDepartamento"("tipo");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoDepartamento_fechaMovimiento_idx" ON "MovimientoPresupuestoDepartamento"("fechaMovimiento");

-- CreateIndex
CREATE UNIQUE INDEX "PresupuestoProyecto_proyectoId_key" ON "PresupuestoProyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "PresupuestoProyecto_proyectoId_idx" ON "PresupuestoProyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "PresupuestoProyecto_estado_idx" ON "PresupuestoProyecto"("estado");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoProyecto_presupuestoProyectoId_idx" ON "MovimientoPresupuestoProyecto"("presupuestoProyectoId");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoProyecto_tipo_idx" ON "MovimientoPresupuestoProyecto"("tipo");

-- CreateIndex
CREATE INDEX "MovimientoPresupuestoProyecto_fechaMovimiento_idx" ON "MovimientoPresupuestoProyecto"("fechaMovimiento");

-- AddForeignKey
ALTER TABLE "PresupuestoDepartamento" ADD CONSTRAINT "PresupuestoDepartamento_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoDepartamento" ADD CONSTRAINT "PresupuestoDepartamento_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoDepartamento" ADD CONSTRAINT "MovimientoPresupuestoDepartamento_presupuestoDepartamentoI_fkey" FOREIGN KEY ("presupuestoDepartamentoId") REFERENCES "PresupuestoDepartamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoDepartamento" ADD CONSTRAINT "MovimientoPresupuestoDepartamento_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoDepartamento" ADD CONSTRAINT "MovimientoPresupuestoDepartamento_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoProyecto" ADD CONSTRAINT "PresupuestoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoProyecto" ADD CONSTRAINT "PresupuestoProyecto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoProyecto" ADD CONSTRAINT "MovimientoPresupuestoProyecto_presupuestoProyectoId_fkey" FOREIGN KEY ("presupuestoProyectoId") REFERENCES "PresupuestoProyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoProyecto" ADD CONSTRAINT "MovimientoPresupuestoProyecto_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoPresupuestoProyecto" ADD CONSTRAINT "MovimientoPresupuestoProyecto_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
