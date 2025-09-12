-- CreateEnum
CREATE TYPE "public"."EstadoProyecto" AS ENUM ('Activo', 'Completado', 'En_Pausa', 'Archivado');

-- CreateEnum
CREATE TYPE "public"."EstadoTarea" AS ENUM ('Por_Hacer', 'En_Progreso', 'Hecho', 'Bloqueado');

-- CreateEnum
CREATE TYPE "public"."TipoContacto" AS ENUM ('telefono_principal', 'telefono_secundario', 'email_personal');

-- CreateEnum
CREATE TYPE "public"."TipoEnlaceProfesional" AS ENUM ('linkedin', 'portafolio_personal', 'blog_tecnico');

-- CreateEnum
CREATE TYPE "public"."NivelHabilidad" AS ENUM ('Basico', 'Intermedio', 'Avanzado', 'Experto');

-- CreateEnum
CREATE TYPE "public"."CategoriaHabilidad" AS ENUM ('Frontend', 'Backend', 'DevOps', 'Diseno_UI_UX', 'Gestion_Proyectos', 'Habilidad_Blanda');

-- CreateEnum
CREATE TYPE "public"."TipoCanal" AS ENUM ('directo', 'grupo_privado', 'proyecto', 'anuncios_departamento');

-- CreateEnum
CREATE TYPE "public"."RolCanal" AS ENUM ('miembro', 'admin');

-- CreateEnum
CREATE TYPE "public"."TipoDatoConfiguracion" AS ENUM ('booleano', 'texto', 'numero', 'seleccion');

-- CreateEnum
CREATE TYPE "public"."PeriodoClasificacion" AS ENUM ('diario', 'semanal', 'mensual', 'trimestral', 'historico');

-- CreateTable
CREATE TABLE "public"."Departamento" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PuestoTrabajo" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "departamentoId" UUID NOT NULL,

    CONSTRAINT "PuestoTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rol" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" UUID NOT NULL,
    "nombreCompleto" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "rolId" UUID NOT NULL,
    "puestoTrabajoId" UUID,
    "supervisorId" UUID,
    "avatarUrl" TEXT,
    "biografia" TEXT,
    "fechaNacimiento" DATE,
    "fechaIngreso" DATE,
    "archivoCvId" UUID,
    "puntajePerfilCompleto" INTEGER NOT NULL DEFAULT 0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsuarioContacto" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" "public"."TipoContacto" NOT NULL,
    "valor" VARCHAR(255) NOT NULL,
    "esPrivado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsuarioContacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsuarioEnlaceProfesional" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" "public"."TipoEnlaceProfesional" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "UsuarioEnlaceProfesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Habilidad" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "categoria" "public"."CategoriaHabilidad",

    CONSTRAINT "Habilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsuarioHabilidad" (
    "usuarioId" UUID NOT NULL,
    "habilidadId" UUID NOT NULL,
    "nivel" "public"."NivelHabilidad",
    "sugeridoPorIa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsuarioHabilidad_pkey" PRIMARY KEY ("usuarioId","habilidadId")
);

-- CreateTable
CREATE TABLE "public"."Proyecto" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "estado" "public"."EstadoProyecto" NOT NULL DEFAULT 'Activo',
    "responsableId" UUID NOT NULL,
    "departamentoId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tarea" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "estado" "public"."EstadoTarea" NOT NULL DEFAULT 'Por_Hacer',
    "fechaVencimiento" DATE,
    "proyectoId" UUID NOT NULL,
    "asignadoId" UUID,
    "creadorId" UUID NOT NULL,
    "resumenIa" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaCompletado" TIMESTAMP(3),
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comentario" (
    "id" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tareaId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlantillaProyectoIA" (
    "id" UUID NOT NULL,
    "nombrePlantilla" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "promptGenerador" TEXT NOT NULL,
    "estructuraJson" JSONB NOT NULL,
    "creadoPorId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantillaProyectoIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiQueryLog" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "consultaLenguajeNatural" TEXT NOT NULL,
    "consultaSqlGenerada" TEXT,
    "estadoEjecucion" VARCHAR(50) NOT NULL,
    "fueUtil" BOOLEAN,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQueryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Archivo" (
    "id" UUID NOT NULL,
    "nombreArchivo" VARCHAR(255) NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tipoArchivo" VARCHAR(100),
    "tamanoBytes" INTEGER,
    "subidoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArchivoAdjunto" (
    "archivoId" UUID NOT NULL,
    "entidadPadreTipo" VARCHAR(50) NOT NULL,
    "entidadPadreId" UUID NOT NULL,

    CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY ("archivoId","entidadPadreTipo","entidadPadreId")
);

-- CreateTable
CREATE TABLE "public"."Canal" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255),
    "tipo" "public"."TipoCanal" NOT NULL,
    "descripcion" TEXT,
    "entidadAsociadaTipo" VARCHAR(50),
    "entidadAsociadaId" UUID,
    "creadorId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CanalMiembro" (
    "canalId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "fechaUnion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rol" "public"."RolCanal" NOT NULL DEFAULT 'miembro',

    CONSTRAINT "CanalMiembro_pkey" PRIMARY KEY ("canalId","usuarioId")
);

-- CreateTable
CREATE TABLE "public"."Mensaje" (
    "id" UUID NOT NULL,
    "canalId" UUID NOT NULL,
    "remitenteId" UUID NOT NULL,
    "contenido" TEXT,
    "mensajePadreId" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MensajeEstadoLectura" (
    "mensajeId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "canalId" UUID NOT NULL,
    "fechaLectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeEstadoLectura_pkey" PRIMARY KEY ("usuarioId","canalId","mensajeId")
);

-- CreateTable
CREATE TABLE "public"."CatalogoConfiguracion" (
    "id" UUID NOT NULL,
    "clave" VARCHAR(100) NOT NULL,
    "nombreVisible" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipoDato" "public"."TipoDatoConfiguracion" NOT NULL,
    "valorPorDefecto" TEXT NOT NULL,
    "rolMinimoRequeridoId" UUID NOT NULL,

    CONSTRAINT "CatalogoConfiguracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfiguracionUsuario" (
    "usuarioId" UUID NOT NULL,
    "configuracionId" UUID NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "ConfiguracionUsuario_pkey" PRIMARY KEY ("usuarioId","configuracionId")
);

-- CreateTable
CREATE TABLE "public"."CatalogoWidget" (
    "id" UUID NOT NULL,
    "tipoWidget" VARCHAR(100) NOT NULL,
    "nombreVisible" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "rolMinimoRequeridoId" UUID NOT NULL,

    CONSTRAINT "CatalogoWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlantillaDashboard" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "rolId" UUID NOT NULL,
    "configuracionWidgets" JSONB NOT NULL,

    CONSTRAINT "PlantillaDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardUsuario" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "propietarioId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEliminacion" TIMESTAMP(3),

    CONSTRAINT "DashboardUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WidgetInstancia" (
    "id" UUID NOT NULL,
    "dashboardId" UUID NOT NULL,
    "widgetCatalogoId" UUID NOT NULL,
    "tituloPersonalizado" VARCHAR(255),
    "configuracionEspecifica" JSONB,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "ancho" INTEGER NOT NULL,
    "alto" INTEGER NOT NULL,

    CONSTRAINT "WidgetInstancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Logro" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "urlIcono" TEXT,
    "puntosRecompensa" INTEGER NOT NULL DEFAULT 0,
    "accionDisparador" VARCHAR(100),

    CONSTRAINT "Logro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsuarioLogro" (
    "usuarioId" UUID NOT NULL,
    "logroId" UUID NOT NULL,
    "fechaDesbloqueo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioLogro_pkey" PRIMARY KEY ("usuarioId","logroId")
);

-- CreateTable
CREATE TABLE "public"."RegistroPuntos" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "tipoOrigen" VARCHAR(50),
    "idOrigen" UUID,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroPuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Clasificacion" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "periodo" "public"."PeriodoClasificacion" NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "estaActiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Clasificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClasificacionEntrada" (
    "id" UUID NOT NULL,
    "clasificacionId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "posicion" INTEGER NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClasificacionEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permiso" (
    "id" UUID NOT NULL,
    "nombreAccion" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolPermiso" (
    "rolId" UUID NOT NULL,
    "permisoId" UUID NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "public"."RegistroAuditoria" (
    "id" UUID NOT NULL,
    "usuarioId" UUID,
    "accion" VARCHAR(255) NOT NULL,
    "detalles" JSONB,
    "direccionIp" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "public"."Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PuestoTrabajo_titulo_key" ON "public"."PuestoTrabajo"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "public"."Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_archivoCvId_key" ON "public"."Usuario"("archivoCvId");

-- CreateIndex
CREATE UNIQUE INDEX "Habilidad_nombre_key" ON "public"."Habilidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PlantillaProyectoIA_nombrePlantilla_key" ON "public"."PlantillaProyectoIA"("nombrePlantilla");

-- CreateIndex
CREATE INDEX "ArchivoAdjunto_entidadPadreTipo_entidadPadreId_idx" ON "public"."ArchivoAdjunto"("entidadPadreTipo", "entidadPadreId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoConfiguracion_clave_key" ON "public"."CatalogoConfiguracion"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoWidget_tipoWidget_key" ON "public"."CatalogoWidget"("tipoWidget");

-- CreateIndex
CREATE UNIQUE INDEX "PlantillaDashboard_rolId_key" ON "public"."PlantillaDashboard"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "Logro_accionDisparador_key" ON "public"."Logro"("accionDisparador");

-- CreateIndex
CREATE INDEX "ClasificacionEntrada_clasificacionId_posicion_idx" ON "public"."ClasificacionEntrada"("clasificacionId", "posicion");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_nombreAccion_key" ON "public"."Permiso"("nombreAccion");

-- AddForeignKey
ALTER TABLE "public"."PuestoTrabajo" ADD CONSTRAINT "PuestoTrabajo_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_puestoTrabajoId_fkey" FOREIGN KEY ("puestoTrabajoId") REFERENCES "public"."PuestoTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."Usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_archivoCvId_fkey" FOREIGN KEY ("archivoCvId") REFERENCES "public"."Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioContacto" ADD CONSTRAINT "UsuarioContacto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioEnlaceProfesional" ADD CONSTRAINT "UsuarioEnlaceProfesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioHabilidad" ADD CONSTRAINT "UsuarioHabilidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioHabilidad" ADD CONSTRAINT "UsuarioHabilidad_habilidadId_fkey" FOREIGN KEY ("habilidadId") REFERENCES "public"."Habilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proyecto" ADD CONSTRAINT "Proyecto_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proyecto" ADD CONSTRAINT "Proyecto_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlantillaProyectoIA" ADD CONSTRAINT "PlantillaProyectoIA_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiQueryLog" ADD CONSTRAINT "AiQueryLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Archivo" ADD CONSTRAINT "Archivo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArchivoAdjunto" ADD CONSTRAINT "ArchivoAdjunto_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "public"."Archivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Canal" ADD CONSTRAINT "Canal_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CanalMiembro" ADD CONSTRAINT "CanalMiembro_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "public"."Canal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CanalMiembro" ADD CONSTRAINT "CanalMiembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensaje" ADD CONSTRAINT "Mensaje_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "public"."Canal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensaje" ADD CONSTRAINT "Mensaje_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensaje" ADD CONSTRAINT "Mensaje_mensajePadreId_fkey" FOREIGN KEY ("mensajePadreId") REFERENCES "public"."Mensaje"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MensajeEstadoLectura" ADD CONSTRAINT "MensajeEstadoLectura_mensajeId_fkey" FOREIGN KEY ("mensajeId") REFERENCES "public"."Mensaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MensajeEstadoLectura" ADD CONSTRAINT "MensajeEstadoLectura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MensajeEstadoLectura" ADD CONSTRAINT "MensajeEstadoLectura_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "public"."Canal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CatalogoConfiguracion" ADD CONSTRAINT "CatalogoConfiguracion_rolMinimoRequeridoId_fkey" FOREIGN KEY ("rolMinimoRequeridoId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionUsuario" ADD CONSTRAINT "ConfiguracionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionUsuario" ADD CONSTRAINT "ConfiguracionUsuario_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "public"."CatalogoConfiguracion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CatalogoWidget" ADD CONSTRAINT "CatalogoWidget_rolMinimoRequeridoId_fkey" FOREIGN KEY ("rolMinimoRequeridoId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlantillaDashboard" ADD CONSTRAINT "PlantillaDashboard_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardUsuario" ADD CONSTRAINT "DashboardUsuario_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WidgetInstancia" ADD CONSTRAINT "WidgetInstancia_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "public"."DashboardUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WidgetInstancia" ADD CONSTRAINT "WidgetInstancia_widgetCatalogoId_fkey" FOREIGN KEY ("widgetCatalogoId") REFERENCES "public"."CatalogoWidget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioLogro" ADD CONSTRAINT "UsuarioLogro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioLogro" ADD CONSTRAINT "UsuarioLogro_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "public"."Logro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroPuntos" ADD CONSTRAINT "RegistroPuntos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClasificacionEntrada" ADD CONSTRAINT "ClasificacionEntrada_clasificacionId_fkey" FOREIGN KEY ("clasificacionId") REFERENCES "public"."Clasificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClasificacionEntrada" ADD CONSTRAINT "ClasificacionEntrada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "public"."Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
