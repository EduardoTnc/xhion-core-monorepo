# 🔧 Solución: Tabla de Eventos No Existe

**Fecha:** 7 de Noviembre, 2025  
**Estado:** 🔄 EN PROCESO

---

## 🎯 Problema Identificado

```
Error: The table `public.eventos` does not exist in the current database.
Code: P2021
```

**Causa:** Las tablas de `Evento`, `EventoParticipante` y `Notificacion` no existen en la base de datos porque no se ha ejecutado la migración de Prisma.

---

## ✅ Solución: Ejecutar Migración

### Opción 1: Migración de Desarrollo (Recomendada)

```bash
cd xhion-core-api
pnpm prisma migrate dev --name add_eventos_notificaciones
```

**Qué hace:**
- ✅ Crea las tablas faltantes
- ✅ Genera el SQL de migración
- ✅ Aplica los cambios a la BD
- ✅ Regenera el cliente de Prisma
- ✅ Guarda historial de migraciones

### Opción 2: Migración de Producción

```bash
cd xhion-core-api
pnpm prisma migrate deploy
```

**Qué hace:**
- ✅ Aplica migraciones pendientes
- ✅ No requiere confirmación
- ✅ Ideal para CI/CD

### Opción 3: Reset Completo (⚠️ Borra datos)

```bash
cd xhion-core-api
pnpm prisma migrate reset
```

**Qué hace:**
- ⚠️ Borra TODA la base de datos
- ✅ Recrea todas las tablas
- ✅ Ejecuta seeds si existen
- ⚠️ **SOLO para desarrollo**

---

## 📊 Tablas que se Crearán

### 1. Tabla `eventos`
```sql
CREATE TABLE "eventos" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "titulo" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "tipo" "TipoEvento" NOT NULL,
  "estado" "EstadoEvento" DEFAULT 'Pendiente',
  "fechaInicio" TIMESTAMP(3) NOT NULL,
  "fechaFin" TIMESTAMP(3) NOT NULL,
  "todoElDia" BOOLEAN DEFAULT false,
  "ubicacion" VARCHAR(500),
  "color" VARCHAR(7),
  "creadorId" UUID NOT NULL,
  "proyectoId" UUID,
  "tareaId" UUID,
  "fechaCreacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "fechaActualizacion" TIMESTAMP(3),
  "fechaEliminacion" TIMESTAMP(3),
  
  FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id"),
  FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id"),
  FOREIGN KEY ("tareaId") REFERENCES "tareas"("id")
);
```

### 2. Tabla `evento_participantes`
```sql
CREATE TABLE "evento_participantes" (
  "eventoId" UUID NOT NULL,
  "usuarioId" UUID NOT NULL,
  "confirmado" BOOLEAN DEFAULT false,
  "fechaConfirmacion" TIMESTAMP(3),
  
  PRIMARY KEY ("eventoId", "usuarioId"),
  FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
```

### 3. Tabla `notificaciones`
```sql
CREATE TABLE "notificaciones" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "titulo" VARCHAR(200) NOT NULL,
  "mensaje" TEXT NOT NULL,
  "tipo" "TipoNotificacion" NOT NULL,
  "estado" "EstadoNotificacion" DEFAULT 'NoLeida',
  "usuarioId" UUID NOT NULL,
  "proyectoId" UUID,
  "tareaId" UUID,
  "eventoId" UUID,
  "metadata" JSONB,
  "url" VARCHAR(500),
  "fechaCreacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "fechaLeida" TIMESTAMP(3),
  "fechaArchivada" TIMESTAMP(3),
  
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("tareaId") REFERENCES "tareas"("id") ON DELETE CASCADE,
  FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE
);
```

### 4. Enums Necesarios
```sql
CREATE TYPE "TipoEvento" AS ENUM (
  'Reunion',
  'Tarea',
  'Proyecto',
  'Personal',
  'Recordatorio'
);

CREATE TYPE "EstadoEvento" AS ENUM (
  'Pendiente',
  'EnCurso',
  'Completado',
  'Cancelado'
);

CREATE TYPE "TipoNotificacion" AS ENUM (
  'Sistema',
  'Tarea',
  'Proyecto',
  'Evento',
  'Mensaje',
  'Mencion',
  'Comentario',
  'Recordatorio'
);

CREATE TYPE "EstadoNotificacion" AS ENUM (
  'NoLeida',
  'Leida',
  'Archivada'
);
```

---

## 🔍 Verificar Estado de Migraciones

### Ver migraciones pendientes:
```bash
cd xhion-core-api
pnpm prisma migrate status
```

### Ver historial de migraciones:
```bash
cd xhion-core-api
ls prisma/migrations
```

---

## ✅ Pasos Completos para Solucionar

### 1. Ejecutar Migración
```bash
cd xhion-core-api
pnpm prisma migrate dev --name add_eventos_notificaciones
```

### 2. Verificar Tablas Creadas
```bash
# Conectar a la BD y verificar
pnpm prisma studio
```

### 3. Reiniciar Servidor
```bash
# El servidor debería reiniciarse automáticamente
# Si no, detener con Ctrl+C y ejecutar:
pnpm run start:dev
```

### 4. Probar Endpoints
```bash
# Abrir Swagger
http://localhost:3000/api/docs

# Probar endpoint de eventos
GET http://localhost:3000/api/v1/eventos
```

---

## 🐛 Solución de Problemas

### Error: "Migration already exists"
```bash
# Eliminar última migración y recrear
rm -rf prisma/migrations/[última_migración]
pnpm prisma migrate dev --name add_eventos_notificaciones
```

### Error: "Database is not empty"
```bash
# Opción 1: Crear migración baseline
pnpm prisma migrate resolve --applied [nombre_migración]

# Opción 2: Reset completo (⚠️ borra datos)
pnpm prisma migrate reset
```

### Error: "Connection refused"
```bash
# Verificar variables de entorno
cat .env | grep DATABASE_URL

# Verificar conexión
pnpm prisma db pull
```

---

## 📋 Checklist de Verificación

### Antes de la Migración:
- [ ] Backup de la base de datos (si es producción)
- [ ] Variables de entorno configuradas
- [ ] Schema de Prisma actualizado
- [ ] Servidor detenido (opcional)

### Durante la Migración:
- [ ] Comando ejecutado sin errores
- [ ] Tablas creadas correctamente
- [ ] Enums creados correctamente
- [ ] Índices aplicados

### Después de la Migración:
- [ ] Cliente de Prisma regenerado
- [ ] Servidor reiniciado
- [ ] Endpoints funcionando
- [ ] Sin errores en consola

---

## 🎯 Resultado Esperado

Después de ejecutar la migración, deberías ver:

```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Database schema updated

Your database is now in sync with your Prisma schema.

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client
```

Y el servidor debería mostrar:

```
[Nest] LOG [NestApplication] Nest application successfully started
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation available at: http://localhost:3000/api/docs
```

**Sin errores de "table does not exist"** ✅

---

## 📚 Comandos Útiles de Prisma

```bash
# Ver estado de migraciones
pnpm prisma migrate status

# Crear nueva migración
pnpm prisma migrate dev --name [nombre]

# Aplicar migraciones pendientes
pnpm prisma migrate deploy

# Resetear base de datos (⚠️ borra datos)
pnpm prisma migrate reset

# Regenerar cliente
pnpm prisma generate

# Abrir Prisma Studio
pnpm prisma studio

# Ver schema actual de la BD
pnpm prisma db pull

# Sincronizar schema sin migración (⚠️ solo dev)
pnpm prisma db push
```

---

## 🚀 Próximos Pasos

Una vez completada la migración:

1. ✅ Verificar que el servidor funciona sin errores
2. ✅ Probar crear un evento desde el frontend
3. ✅ Verificar que las notificaciones se crean
4. ✅ Probar todas las vistas del calendario
5. ✅ Verificar Drag & Drop
6. ✅ Probar WebSocket
7. ✅ Activar notificaciones push

---

## ✅ Conclusión

**La solución es simple:**

1. Ejecutar: `pnpm prisma migrate dev --name add_eventos_notificaciones`
2. Esperar a que se creen las tablas
3. Verificar que el servidor funciona
4. ¡Probar el calendario!

**El problema NO es del código, solo falta crear las tablas en la base de datos.** 🎉

---

**Desarrollado con ❤️ y ☕ por Eduardo Tanca**  
*Practicante Pre-Profesional SENATI*  
*Full Stack Developer*

© 2025 Eduardo Tanca - Todos los derechos reservados
