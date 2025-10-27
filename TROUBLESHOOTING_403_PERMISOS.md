# Troubleshooting: 403 Forbidden - Permisos de Proyectos

## Problema

Al intentar acceder a proyectos desde el frontend, aparecen errores 403 Forbidden:

```
GET http://localhost:3000/api/v1/proyectos/{id} 403 (Forbidden)
GET http://localhost:3000/api/v1/proyectos/{id}/miembros 403 (Forbidden)
GET http://localhost:3000/api/v1/proyectos/{id}/etapas 403 (Forbidden)
```

## Causa Raíz

Los endpoints de proyectos requieren el permiso `proyectos.ver` (y otros permisos relacionados). El error 403 indica que el usuario autenticado no tiene estos permisos asignados a su rol.

### Permisos Requeridos

| Endpoint | Permiso Requerido |
|----------|-------------------|
| `GET /proyectos` | `proyectos.ver` |
| `GET /proyectos/:id` | `proyectos.ver` |
| `GET /proyectos/:id/miembros` | `proyectos.ver` |
| `GET /proyectos/:id/etapas` | `proyectos.ver` |
| `POST /proyectos` | `proyectos.crear` |
| `PATCH /proyectos/:id` | `proyectos.editar` |
| `DELETE /proyectos/:id` | `proyectos.eliminar` |
| `POST /proyectos/:id/miembros` | `proyectos.gestionar_miembros` |
| `POST /proyectos/:id/etapas` | `proyectos.gestionar_etapas` |

## Solución

### Paso 1: Verificar y Corregir Permisos

Ejecuta el script de verificación y corrección de permisos:

```bash
cd xhion-core-api
pnpm run db:fix-permissions
```

Este script:
- ✅ Verifica que el rol Administrador exista
- ✅ Lista todos los permisos actuales del administrador
- ✅ Detecta permisos faltantes
- ✅ Asigna automáticamente los permisos faltantes
- ✅ Muestra los usuarios con rol de Administrador

### Paso 2: Cerrar Sesión y Volver a Iniciar Sesión

**IMPORTANTE**: Los permisos se almacenan en el JWT token. Después de corregir los permisos en la base de datos, debes:

1. **Cerrar sesión** en el frontend
2. **Volver a iniciar sesión**
3. Esto generará un nuevo JWT token con los permisos actualizados

### Paso 3: Verificar en el Frontend

Después de iniciar sesión nuevamente, verifica que puedas:
- Ver la lista de proyectos
- Acceder a los detalles de un proyecto
- Ver los miembros y etapas del proyecto

## Diagnóstico Adicional

### Verificar Permisos del Usuario Actual

Si el problema persiste, verifica los permisos directamente en la base de datos:

```sql
-- Ver permisos del usuario actual
SELECT 
  u.email,
  u."nombreCompleto",
  r.nombre as rol,
  p."nombreAccion" as permiso
FROM "Usuario" u
JOIN "Rol" r ON u."rolId" = r.id
JOIN "RolPermiso" rp ON r.id = rp."rolId"
JOIN "Permiso" p ON rp."permisoId" = p.id
WHERE u.email = 'admin@xhion.com'  -- Cambia por tu email
AND p."nombreAccion" LIKE 'proyectos.%'
ORDER BY p."nombreAccion";
```

### Verificar JWT Token

Puedes decodificar tu JWT token en [jwt.io](https://jwt.io) para ver qué información contiene. El token NO incluye los permisos directamente, pero sí incluye el `sub` (user ID) y `rolId`.

Los permisos se consultan en cada request mediante el `PermissionsGuard` que:
1. Lee el `sub` del JWT
2. Busca el usuario en la base de datos
3. Obtiene su rol y permisos
4. Cachea los permisos en la request

### Logs del Backend

Revisa los logs del backend para ver el mensaje de error completo:

```bash
# En la terminal donde corre el backend
# Deberías ver algo como:
{
  "message": "No tienes los permisos necesarios para realizar esta acción",
  "permisosRequeridos": "proyectos.ver",
  "permisosFaltantes": "proyectos.ver",
  "tusPermisos": ["usuarios.ver", "roles.ver", ...],
  "sugerencia": "Contacta al administrador para solicitar los permisos necesarios"
}
```

## Re-ejecutar el Seed Completo

Si necesitas reiniciar completamente la base de datos:

```bash
cd xhion-core-api

# 1. Resetear la base de datos (CUIDADO: Esto borra todos los datos)
pnpm prisma migrate reset --force

# 2. Ejecutar el seed
pnpm run db:seed

# 3. Verificar permisos
pnpm run db:fix-permissions
```

## Arquitectura del Sistema de Permisos

### Flujo de Autorización

```
1. Usuario hace request → JWT en header Authorization
2. JwtAuthGuard valida el token → Extrae user.sub y user.rolId
3. PermissionsGuard verifica permisos:
   a. Lee @RequiresPermission del endpoint
   b. Consulta permisos del usuario en DB
   c. Cachea permisos en request.userPermissions
   d. Compara permisos requeridos vs permisos del usuario
   e. Permite o rechaza (403) el acceso
```

### Estructura de Permisos

Los permisos siguen el patrón: `{modulo}.{accion}`

Ejemplos:
- `proyectos.ver`
- `proyectos.crear`
- `proyectos.editar`
- `proyectos.eliminar`
- `proyectos.gestionar_miembros`
- `proyectos.gestionar_etapas`

### Catálogo de Permisos

El catálogo completo está en: `prisma/seeds/permisos.seed.ts`

Incluye permisos para:
- Proyectos (7 permisos)
- Tareas (7 permisos)
- Departamentos (6 permisos)
- Usuarios (6 permisos)
- Roles (5 permisos)
- Invitaciones (4 permisos)
- Presupuestos (6 permisos)
- Conocimiento (4 permisos)
- Auditoria (2 permisos)

## Prevención

Para evitar este problema en el futuro:

1. **Siempre ejecuta el seed** después de crear/resetear la base de datos
2. **Cierra sesión y vuelve a iniciar** después de cambios en permisos o roles
3. **Usa el script de verificación** periódicamente: `pnpm run db:fix-permissions`
4. **Documenta los permisos** requeridos para nuevos endpoints

## Contacto

Si el problema persiste después de seguir estos pasos, revisa:
- Los logs del backend
- La configuración de CORS
- El estado de la base de datos
- La versión de las dependencias
