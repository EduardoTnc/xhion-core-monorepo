-- ============================================
-- FASE 2: SCHEMA COMPLETO - MEJORAS CRÍTICAS
-- ============================================
-- Fecha: 9 Nov 2025
-- Autor: Eduardo Tanca
-- Descripción: Schema SQL completo para los 5 módulos de Fase 2

-- ============================================
-- MÓDULO 1: RECURSOS E INVENTARIO
-- ============================================

-- Enums
CREATE TYPE "TipoRecurso" AS ENUM ('Software', 'Hardware', 'Material', 'Espacio', 'Humano', 'Otro');
CREATE TYPE "EstadoRecurso" AS ENUM ('Disponible', 'Asignado', 'En_Mantenimiento', 'Fuera_De_Servicio', 'Agotado');
CREATE TYPE "UnidadMedida" AS ENUM ('Unidad', 'Licencia', 'Metro', 'Kilogramo', 'Hora', 'Mes');
CREATE TYPE "TipoMovimiento" AS ENUM ('Entrada', 'Salida', 'Asignacion', 'Devolucion', 'Ajuste', 'Baja');

-- Tabla: recursos
CREATE TABLE "recursos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoRecurso" NOT NULL,
    "categoria" VARCHAR(100),
    "unidadMedida" "UnidadMedida" NOT NULL,
    "costoUnitario" DECIMAL(10, 2),
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER,
    "estado" "EstadoRecurso" NOT NULL DEFAULT 'Disponible',
    "proveedor" VARCHAR(200),
    "numeroSerie" VARCHAR(100),
    "fechaAdquisicion" DATE,
    "vidaUtilMeses" INTEGER,
    "ubicacionFisica" VARCHAR(200),
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "eliminado" BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_recursos_tipo" ON "recursos"("tipo");
CREATE INDEX "idx_recursos_estado" ON "recursos"("estado");
CREATE INDEX "idx_recursos_categoria" ON "recursos"("categoria");

-- Tabla: asignaciones_recursos
CREATE TABLE "asignaciones_recursos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recursoId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "departamentoId" UUID,
    "proyectoId" UUID,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE,
    "activa" BOOLEAN NOT NULL DEFAULT TRUE,
    "proposito" TEXT,
    "observaciones" TEXT,
    "asignadoPorId" UUID NOT NULL,
    "fechaAsignacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("asignadoPorId") REFERENCES "usuarios"("id"),
    CHECK (("departamentoId" IS NOT NULL AND "proyectoId" IS NULL) OR ("departamentoId" IS NULL AND "proyectoId" IS NOT NULL))
);

CREATE INDEX "idx_asignaciones_recursos_recursoId" ON "asignaciones_recursos"("recursoId");
CREATE INDEX "idx_asignaciones_recursos_departamentoId" ON "asignaciones_recursos"("departamentoId");
CREATE INDEX "idx_asignaciones_recursos_proyectoId" ON "asignaciones_recursos"("proyectoId");
CREATE INDEX "idx_asignaciones_recursos_activa" ON "asignaciones_recursos"("activa");

-- Tabla: movimientos_recursos
CREATE TABLE "movimientos_recursos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recursoId" UUID NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAnterior" INTEGER NOT NULL,
    "stockNuevo" INTEGER NOT NULL,
    "departamentoId" UUID,
    "proyectoId" UUID,
    "motivo" TEXT,
    "costoTotal" DECIMAL(10, 2),
    "documentoReferencia" VARCHAR(100),
    "registradoPorId" UUID NOT NULL,
    "fechaMovimiento" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id"),
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id"),
    FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_movimientos_recursos_recursoId" ON "movimientos_recursos"("recursoId");
CREATE INDEX "idx_movimientos_recursos_tipo" ON "movimientos_recursos"("tipo");
CREATE INDEX "idx_movimientos_recursos_fechaMovimiento" ON "movimientos_recursos"("fechaMovimiento");

-- ============================================
-- MÓDULO 2: FINANZAS MEJORADO
-- ============================================

-- Enums
CREATE TYPE "FuenteIngreso" AS ENUM ('Ventas', 'Servicios', 'Publicidad', 'Suscripciones', 'Licencias', 'Otro');
CREATE TYPE "CategoriaGasto" AS ENUM ('Personal', 'Software', 'Hardware', 'Materiales', 'Servicios', 'Marketing', 'Infraestructura', 'Otro');
CREATE TYPE "TipoMovimientoPresupuesto" AS ENUM ('Ingreso', 'Gasto', 'Transferencia', 'Ajuste');

-- Tabla: ingresos_proyectos
CREATE TABLE "ingresos_proyectos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "proyectoId" UUID NOT NULL,
    "fuente" "FuenteIngreso" NOT NULL,
    "monto" DECIMAL(10, 2) NOT NULL,
    "descripcion" TEXT,
    "fechaIngreso" DATE NOT NULL,
    "comprobante" VARCHAR(100),
    "registradoPorId" UUID NOT NULL,
    "fechaRegistro" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_ingresos_proyectos_proyectoId" ON "ingresos_proyectos"("proyectoId");
CREATE INDEX "idx_ingresos_proyectos_fechaIngreso" ON "ingresos_proyectos"("fechaIngreso");

-- Tabla: gastos_proyectos
CREATE TABLE "gastos_proyectos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "proyectoId" UUID NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "concepto" VARCHAR(200) NOT NULL,
    "monto" DECIMAL(10, 2) NOT NULL,
    "fechaGasto" DATE NOT NULL,
    "comprobante" VARCHAR(100),
    "recursoId" UUID,
    "registradoPorId" UUID NOT NULL,
    "fechaRegistro" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("recursoId") REFERENCES "recursos"("id"),
    FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_gastos_proyectos_proyectoId" ON "gastos_proyectos"("proyectoId");
CREATE INDEX "idx_gastos_proyectos_categoria" ON "gastos_proyectos"("categoria");
CREATE INDEX "idx_gastos_proyectos_fechaGasto" ON "gastos_proyectos"("fechaGasto");

-- Tabla: presupuestos_departamentos
CREATE TABLE "presupuestos_departamentos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "departamentoId" UUID NOT NULL,
    "año" INTEGER NOT NULL,
    "montoTotal" DECIMAL(10, 2) NOT NULL,
    "montoGastado" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "montoDisponible" DECIMAL(10, 2) NOT NULL,
    "descripcion" TEXT,
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id"),
    UNIQUE ("departamentoId", "año")
);

CREATE INDEX "idx_presupuestos_departamentos_departamentoId" ON "presupuestos_departamentos"("departamentoId");
CREATE INDEX "idx_presupuestos_departamentos_año" ON "presupuestos_departamentos"("año");

-- Tabla: movimientos_presupuesto_departamento
CREATE TABLE "movimientos_presupuesto_departamento" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "presupuestoDepartamentoId" UUID NOT NULL,
    "tipo" "TipoMovimientoPresupuesto" NOT NULL,
    "monto" DECIMAL(10, 2) NOT NULL,
    "concepto" TEXT NOT NULL,
    "fechaMovimiento" TIMESTAMP NOT NULL DEFAULT NOW(),
    "registradoPorId" UUID NOT NULL,
    FOREIGN KEY ("presupuestoDepartamentoId") REFERENCES "presupuestos_departamentos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_movimientos_presupuesto_departamento_presupuestoId" ON "movimientos_presupuesto_departamento"("presupuestoDepartamentoId");
CREATE INDEX "idx_movimientos_presupuesto_departamento_tipo" ON "movimientos_presupuesto_departamento"("tipo");
CREATE INDEX "idx_movimientos_presupuesto_departamento_fecha" ON "movimientos_presupuesto_departamento"("fechaMovimiento");

-- ============================================
-- MÓDULO 3: POST-MORTEM
-- ============================================

-- Enums
CREATE TYPE "NivelCumplimiento" AS ENUM ('Completamente', 'Parcialmente', 'No_Cumplido');

-- Tabla: post_mortems
CREATE TABLE "post_mortems" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "proyectoId" UUID,
    "etapaId" UUID,
    "objetivosCumplidos" "NivelCumplimiento" NOT NULL,
    "resultadosObtenidos" TEXT NOT NULL,
    "quesFuncionoBien" TEXT NOT NULL,
    "quesNoFunciono" TEXT NOT NULL,
    "leccionesAprendidas" TEXT NOT NULL,
    "recomendaciones" TEXT NOT NULL,
    "desviacionPresupuesto" DECIMAL(5, 2),
    "desviacionTiempo" INTEGER,
    "satisfaccionEquipo" INTEGER CHECK ("satisfaccionEquipo" BETWEEN 1 AND 5),
    "satisfaccionCliente" INTEGER CHECK ("satisfaccionCliente" BETWEEN 1 AND 5),
    "embeddings" JSONB,
    "tags" TEXT[],
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("etapaId") REFERENCES "etapas"("id") ON DELETE CASCADE,
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id"),
    CHECK (("proyectoId" IS NOT NULL AND "etapaId" IS NULL) OR ("proyectoId" IS NULL AND "etapaId" IS NOT NULL))
);

CREATE INDEX "idx_post_mortems_proyectoId" ON "post_mortems"("proyectoId");
CREATE INDEX "idx_post_mortems_etapaId" ON "post_mortems"("etapaId");
CREATE INDEX "idx_post_mortems_tags" ON "post_mortems" USING GIN("tags");
CREATE INDEX "idx_post_mortems_embeddings" ON "post_mortems" USING GIN("embeddings");

-- ============================================
-- MÓDULO 4: ACTIVIDAD EN TIEMPO REAL
-- ============================================

-- Enums
CREATE TYPE "TipoAccion" AS ENUM ('Inicio', 'Pausa', 'Reanudacion', 'Fin');
CREATE TYPE "EstadoSesion" AS ENUM ('Activa', 'Pausada', 'Finalizada');

-- Tabla: actividades_usuarios
CREATE TABLE "actividades_usuarios" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "usuarioId" UUID NOT NULL,
    "tareaId" UUID,
    "accion" "TipoAccion" NOT NULL,
    "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    "duracionMinutos" INTEGER,
    "notas" TEXT,
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_actividades_usuarios_usuarioId" ON "actividades_usuarios"("usuarioId");
CREATE INDEX "idx_actividades_usuarios_tareaId" ON "actividades_usuarios"("tareaId");
CREATE INDEX "idx_actividades_usuarios_timestamp" ON "actividades_usuarios"("timestamp");

-- Tabla: sesiones_trabajo
CREATE TABLE "sesiones_trabajo" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "usuarioId" UUID NOT NULL,
    "tareaId" UUID NOT NULL,
    "inicio" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fin" TIMESTAMP,
    "duracionMinutos" INTEGER,
    "estado" "EstadoSesion" NOT NULL DEFAULT 'Activa',
    "pausas" INTEGER NOT NULL DEFAULT 0,
    "tiempoPausaMinutos" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_sesiones_trabajo_usuarioId" ON "sesiones_trabajo"("usuarioId");
CREATE INDEX "idx_sesiones_trabajo_tareaId" ON "sesiones_trabajo"("tareaId");
CREATE INDEX "idx_sesiones_trabajo_estado" ON "sesiones_trabajo"("estado");
CREATE INDEX "idx_sesiones_trabajo_inicio" ON "sesiones_trabajo"("inicio");

-- ============================================
-- MÓDULO 5: INTEGRACIÓN NOTION
-- ============================================

-- Tabla: notion_sync_config
CREATE TABLE "notion_sync_config" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "databaseId" VARCHAR(100) NOT NULL UNIQUE,
    "databaseName" VARCHAR(200) NOT NULL,
    "departamentoId" UUID,
    "proyectoId" UUID,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "syncDirection" VARCHAR(20) NOT NULL CHECK ("syncDirection" IN ('import', 'export', 'bidirectional')),
    "lastSync" TIMESTAMP,
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id")
);

CREATE INDEX "idx_notion_sync_config_databaseId" ON "notion_sync_config"("databaseId");
CREATE INDEX "idx_notion_sync_config_departamentoId" ON "notion_sync_config"("departamentoId");
CREATE INDEX "idx_notion_sync_config_proyectoId" ON "notion_sync_config"("proyectoId");

-- Tabla: notion_sync_log
CREATE TABLE "notion_sync_log" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "configId" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL CHECK ("tipo" IN ('import', 'export')),
    "estado" VARCHAR(20) NOT NULL CHECK ("estado" IN ('success', 'error', 'partial')),
    "registrosAfectados" INTEGER NOT NULL DEFAULT 0,
    "errores" JSONB,
    "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("configId") REFERENCES "notion_sync_config"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_notion_sync_log_configId" ON "notion_sync_log"("configId");
CREATE INDEX "idx_notion_sync_log_timestamp" ON "notion_sync_log"("timestamp");

-- Tabla: notion_task_mapping
CREATE TABLE "notion_task_mapping" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tareaId" UUID NOT NULL UNIQUE,
    "notionPageId" VARCHAR(100) NOT NULL UNIQUE,
    "lastSyncXhion" TIMESTAMP,
    "lastSyncNotion" TIMESTAMP,
    "conflicto" BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_notion_task_mapping_tareaId" ON "notion_task_mapping"("tareaId");
CREATE INDEX "idx_notion_task_mapping_notionPageId" ON "notion_task_mapping"("notionPageId");

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Recursos con Stock Bajo
CREATE VIEW "v_recursos_stock_bajo" AS
SELECT 
    r."id",
    r."nombre",
    r."tipo",
    r."stockActual",
    r."stockMinimo",
    r."stockMinimo" - r."stockActual" AS "deficit"
FROM "recursos" r
WHERE r."stockActual" <= r."stockMinimo"
  AND r."eliminado" = FALSE
ORDER BY "deficit" DESC;

-- Vista: Rentabilidad de Proyectos
CREATE VIEW "v_rentabilidad_proyectos" AS
SELECT 
    p."id",
    p."nombre",
    COALESCE(SUM(i."monto"), 0) AS "ingresosTotales",
    COALESCE(SUM(g."monto"), 0) AS "gastosTotales",
    COALESCE(SUM(i."monto"), 0) - COALESCE(SUM(g."monto"), 0) AS "utilidadNeta",
    CASE 
        WHEN COALESCE(SUM(g."monto"), 0) > 0 
        THEN ((COALESCE(SUM(i."monto"), 0) - COALESCE(SUM(g."monto"), 0)) / SUM(g."monto")) * 100
        ELSE NULL
    END AS "roi"
FROM "proyectos" p
LEFT JOIN "ingresos_proyectos" i ON p."id" = i."proyectoId"
LEFT JOIN "gastos_proyectos" g ON p."id" = g."proyectoId"
GROUP BY p."id", p."nombre";

-- Vista: Actividad en Tiempo Real
CREATE VIEW "v_actividad_tiempo_real" AS
SELECT 
    u."id" AS "usuarioId",
    u."nombre" AS "usuarioNombre",
    u."email",
    t."id" AS "tareaId",
    t."titulo" AS "tareaTitulo",
    s."inicio",
    s."estado",
    EXTRACT(EPOCH FROM (NOW() - s."inicio")) / 60 AS "minutosTranscurridos"
FROM "sesiones_trabajo" s
JOIN "usuarios" u ON s."usuarioId" = u."id"
JOIN "tareas" t ON s."tareaId" = t."id"
WHERE s."estado" = 'Activa'
ORDER BY s."inicio" DESC;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Calcular ROI de Proyecto
CREATE OR REPLACE FUNCTION calcular_roi_proyecto(proyecto_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    ingresos DECIMAL(10, 2);
    gastos DECIMAL(10, 2);
    roi DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(monto), 0) INTO ingresos
    FROM ingresos_proyectos
    WHERE "proyectoId" = proyecto_id;
    
    SELECT COALESCE(SUM(monto), 0) INTO gastos
    FROM gastos_proyectos
    WHERE "proyectoId" = proyecto_id;
    
    IF gastos > 0 THEN
        roi := ((ingresos - gastos) / gastos) * 100;
    ELSE
        roi := NULL;
    END IF;
    
    RETURN roi;
END;
$$ LANGUAGE plpgsql;

-- Función: Actualizar Stock de Recurso
CREATE OR REPLACE FUNCTION actualizar_stock_recurso()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recursos
    SET "stockActual" = NEW."stockNuevo",
        "fechaActualizacion" = NOW()
    WHERE "id" = NEW."recursoId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON movimientos_recursos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_recurso();

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE "recursos" IS 'Catálogo de recursos de la empresa (software, hardware, materiales, etc.)';
COMMENT ON TABLE "asignaciones_recursos" IS 'Asignación de recursos a departamentos o proyectos';
COMMENT ON TABLE "movimientos_recursos" IS 'Historial de movimientos de inventario';
COMMENT ON TABLE "ingresos_proyectos" IS 'Registro de ingresos generados por proyectos';
COMMENT ON TABLE "gastos_proyectos" IS 'Registro de gastos de proyectos';
COMMENT ON TABLE "post_mortems" IS 'Lecciones aprendidas al finalizar proyectos/etapas';
COMMENT ON TABLE "actividades_usuarios" IS 'Registro de actividades de usuarios para tracking';
COMMENT ON TABLE "sesiones_trabajo" IS 'Sesiones de trabajo activas de usuarios en tareas';
COMMENT ON TABLE "notion_sync_config" IS 'Configuración de sincronización con Notion';

-- FIN DEL SCHEMA
