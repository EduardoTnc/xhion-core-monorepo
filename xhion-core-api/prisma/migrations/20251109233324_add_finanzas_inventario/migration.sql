-- CreateEnum
CREATE TYPE "TipoRecurso" AS ENUM ('Software', 'Hardware', 'Material', 'Espacio', 'Humano', 'Otro');

-- CreateEnum
CREATE TYPE "EstadoRecurso" AS ENUM ('Disponible', 'Asignado', 'En_Mantenimiento', 'Fuera_De_Servicio', 'Agotado');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('Unidad', 'Licencia', 'Metro', 'Kilogramo', 'Hora', 'Mes');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('Entrada', 'Salida', 'Asignacion', 'Devolucion', 'Ajuste', 'Baja');

-- CreateEnum
CREATE TYPE "FuenteIngreso" AS ENUM ('Ventas', 'Servicios', 'Publicidad', 'Suscripciones', 'Licencias', 'Otro');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('Personal', 'Software', 'Hardware', 'Materiales', 'Servicios', 'Marketing', 'Infraestructura', 'Otro');

-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "recursos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoRecurso" NOT NULL,
    "categoria" VARCHAR(100),
    "unidadMedida" "UnidadMedida" NOT NULL,
    "costoUnitario" DECIMAL(10,2),
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER,
    "estado" "EstadoRecurso" NOT NULL DEFAULT 'Disponible',
    "proveedor" VARCHAR(200),
    "numeroSerie" VARCHAR(100),
    "fechaAdquisicion" DATE,
    "vidaUtilMeses" INTEGER,
    "ubicacionFisica" VARCHAR(200),
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_recursos" (
    "id" UUID NOT NULL,
    "recursoId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "departamentoId" UUID,
    "proyectoId" UUID,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "proposito" TEXT,
    "observaciones" TEXT,
    "asignadoPorId" UUID NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_recursos" (
    "id" UUID NOT NULL,
    "recursoId" UUID NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAnterior" INTEGER NOT NULL,
    "stockNuevo" INTEGER NOT NULL,
    "departamentoId" UUID,
    "proyectoId" UUID,
    "motivo" TEXT,
    "costoTotal" DECIMAL(10,2),
    "documentoReferencia" VARCHAR(100),
    "registradoPorId" UUID NOT NULL,
    "fechaMovimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingresos_proyectos" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "fuente" "FuenteIngreso" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "fechaIngreso" DATE NOT NULL,
    "comprobante" VARCHAR(100),
    "registradoPorId" UUID NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingresos_proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_proyectos" (
    "id" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "concepto" VARCHAR(200) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fechaGasto" DATE NOT NULL,
    "comprobante" VARCHAR(100),
    "recursoId" UUID,
    "registradoPorId" UUID NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recursos_tipo_idx" ON "recursos"("tipo");

-- CreateIndex
CREATE INDEX "recursos_estado_idx" ON "recursos"("estado");

-- CreateIndex
CREATE INDEX "recursos_categoria_idx" ON "recursos"("categoria");

-- CreateIndex
CREATE INDEX "asignaciones_recursos_recursoId_idx" ON "asignaciones_recursos"("recursoId");

-- CreateIndex
CREATE INDEX "asignaciones_recursos_departamentoId_idx" ON "asignaciones_recursos"("departamentoId");

-- CreateIndex
CREATE INDEX "asignaciones_recursos_proyectoId_idx" ON "asignaciones_recursos"("proyectoId");

-- CreateIndex
CREATE INDEX "asignaciones_recursos_activa_idx" ON "asignaciones_recursos"("activa");

-- CreateIndex
CREATE INDEX "movimientos_recursos_recursoId_idx" ON "movimientos_recursos"("recursoId");

-- CreateIndex
CREATE INDEX "movimientos_recursos_tipo_idx" ON "movimientos_recursos"("tipo");

-- CreateIndex
CREATE INDEX "movimientos_recursos_fechaMovimiento_idx" ON "movimientos_recursos"("fechaMovimiento");

-- CreateIndex
CREATE INDEX "ingresos_proyectos_proyectoId_idx" ON "ingresos_proyectos"("proyectoId");

-- CreateIndex
CREATE INDEX "ingresos_proyectos_fechaIngreso_idx" ON "ingresos_proyectos"("fechaIngreso");

-- CreateIndex
CREATE INDEX "gastos_proyectos_proyectoId_idx" ON "gastos_proyectos"("proyectoId");

-- CreateIndex
CREATE INDEX "gastos_proyectos_categoria_idx" ON "gastos_proyectos"("categoria");

-- CreateIndex
CREATE INDEX "gastos_proyectos_fechaGasto_idx" ON "gastos_proyectos"("fechaGasto");

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recursos" ADD CONSTRAINT "asignaciones_recursos_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recursos" ADD CONSTRAINT "asignaciones_recursos_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recursos" ADD CONSTRAINT "asignaciones_recursos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_recursos" ADD CONSTRAINT "asignaciones_recursos_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_recursos" ADD CONSTRAINT "movimientos_recursos_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_recursos" ADD CONSTRAINT "movimientos_recursos_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_recursos" ADD CONSTRAINT "movimientos_recursos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_recursos" ADD CONSTRAINT "movimientos_recursos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingresos_proyectos" ADD CONSTRAINT "ingresos_proyectos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingresos_proyectos" ADD CONSTRAINT "ingresos_proyectos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_proyectos" ADD CONSTRAINT "gastos_proyectos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_proyectos" ADD CONSTRAINT "gastos_proyectos_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_proyectos" ADD CONSTRAINT "gastos_proyectos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
