# 📁 Prisma - Estructura y Documentación

## 🗂️ Estructura de Carpetas

```
prisma/
├── migrations/          # Migraciones de base de datos (generadas automáticamente)
├── seeds/              # Módulos de seeding
│   └── permisos.seed.ts   # Catálogo completo de permisos del sistema
├── schema.prisma       # Schema de la base de datos
├── seed.ts            # Seed principal (punto de entrada)
└── README.md          # Este archivo
```

## 🚀 Uso del Sistema de Seeding

### ⚙️ Configuración Requerida

Para que `npx prisma db seed` funcione, el `package.json` debe tener:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

✅ **Ya está configurado** en este proyecto.

### Seed Completo (Default - Empresa Bigander)

**Por defecto**, el seed crea datos completos de empresa:
- ✅ 73 Permisos granulares
- ✅ 5 Roles
- ✅ 6 Departamentos
- ✅ 11 Usuarios
- ✅ 7 Proyectos
- ✅ 20 Etapas
- ✅ 11 Tareas
- ✅ 5 Presupuestos
- ✅ 3 Ideas
- ✅ 5 Eventos

```bash
npx prisma db seed
```

### Seed Básico (Solo permisos + admin)

Para crear solo lo esencial:
- ✅ Catálogo completo de permisos (73 permisos)
- ✅ Rol Administrador con TODOS los permisos
- ✅ Departamento "General"
- ✅ Usuario administrador

```bash
# PowerShell
$env:SEED_MODE="basic"; npx prisma db seed

# Bash/Linux
SEED_MODE=basic npx prisma db seed
```

**Credenciales por defecto:**
- Email: `admin@xhion.com`
- Password: `Admin12345!`

**Credenciales de empresa (Seed Completo):**
- `gerente@gmail.com` | `Password123!` (Carlos Mendoza - Administrador)
- `eduardo.tanca@gmail.com` | `Password123!` (Eduardo Tanca - Administrador)
- `luz.garcia@gmail.com` | `Password123!` (Luz García - Gerente de Proyecto)
- `lucero.sanchez@gmail.com` | `Password123!` (Lucero Sánchez - Jefe de Depto)

### Personalizar Credenciales del Admin

Puedes personalizar las credenciales del administrador usando variables de entorno:

```bash
SEED_ADMIN_EMAIL=admin@miempresa.com SEED_ADMIN_PASSWORD=MiPassword123! npx prisma db seed
```

## 🔄 Reset y Re-seed

Para limpiar completamente la base de datos y volver a ejecutar el seed:

```bash
# Reset completo (elimina datos + ejecuta seed básico)
npx prisma migrate reset --force

# Reset + seed completo
SEED_MODE=full npx prisma migrate reset --force
```

## 📋 Catálogo de Permisos

El sistema incluye **73 permisos** organizados en **10 módulos**:

### 1. Proyectos (8 permisos)
- `proyectos.crear`, `proyectos.ver`, `proyectos.ver_todos`
- `proyectos.editar`, `proyectos.eliminar`, `proyectos.archivar`
- `proyectos.gestionar_miembros`, `proyectos.gestionar_etapas`

### 2. Tareas (8 permisos)
- `tareas.crear`, `tareas.ver`, `tareas.ver_todas`
- `tareas.editar`, `tareas.eliminar`, `tareas.asignar`
- `tareas.cambiar_estado`, `tareas.comentar`

### 3. Departamentos (6 permisos)
- `departamentos.crear`, `departamentos.ver`, `departamentos.editar`
- `departamentos.eliminar`, `departamentos.gestionar_empleados`
- `departamentos.gestionar_puestos`

### 4. Usuarios (6 permisos)
- `usuarios.crear`, `usuarios.ver`, `usuarios.editar`
- `usuarios.eliminar`, `usuarios.gestionar_roles`, `usuarios.invitar`

### 5. Roles (5 permisos)
- `roles.crear`, `roles.ver`, `roles.editar`
- `roles.eliminar`, `roles.asignar_permisos`

### 6. Presupuestos (6 permisos)
- `presupuestos.crear`, `presupuestos.ver`, `presupuestos.editar`
- `presupuestos.eliminar`, `presupuestos.aprobar`
- `presupuestos.registrar_movimientos`

### 7. Conocimiento (4 permisos)
- `conocimiento.crear`, `conocimiento.ver`
- `conocimiento.editar`, `conocimiento.eliminar`

### 8. Auditoría (2 permisos)
- `auditoria.ver`, `auditoria.exportar`

### 9. Sistema (3 permisos)
- `sistema.configurar`, `sistema.ver_estadisticas`
- `sistema.gestionar_catalogos`

### 10. Otros Módulos
- **Invitaciones** (3): crear, ver, cancelar
- **Ideas** (8): crear, ver, editar, eliminar, votar, comentar, moderar, cambiar_estado
- **Recursos** (6): crear, ver, editar, eliminar, asignar, registrar_movimiento
- **Finanzas** (8): ver, registrar_ingreso, registrar_gasto, eliminar, analizar, crear_presupuesto, editar_presupuesto, aprobar_presupuesto

## 🔐 Sistema de Permisos

### Arquitectura
```
Usuario → Rol → Permisos → Acciones
```

### Características
- ✅ **Granularidad total**: Cada acción tiene su permiso específico
- ✅ **Performance óptima**: Eager Loading + caché en request
- ✅ **Seguridad robusta**: Validación en backend con `PermissionsGuard`
- ✅ **Flexibilidad**: Permisos asignables desde la UI

### Uso en Controllers

```typescript
import { RequiresPermission } from '../auth/permissions.decorator';

@Controller('proyectos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProyectosController {
  
  @Get()
  @RequiresPermission('proyectos.ver')
  async findAll() { ... }
  
  @Post()
  @RequiresPermission('proyectos.crear')
  async create() { ... }
  
  @Delete(':id')
  @RequiresPermission('proyectos.eliminar')
  async remove() { ... }
}
```

## 🛠️ Mantenimiento

### Agregar Nuevos Permisos

1. Edita `seeds/permisos.seed.ts`
2. Agrega el nuevo permiso al array `PERMISOS_CATALOGO`
3. Ejecuta el seed para crear el permiso:
   ```bash
   npx prisma db seed
   ```
4. Asigna el permiso a roles desde la UI o mediante script

### Crear Nuevas Migraciones

```bash
# Después de modificar schema.prisma
npx prisma migrate dev --name descripcion_del_cambio
```

### Verificar Estado de la BD

```bash
# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (GUI)
npx prisma studio
```

## 📝 Notas Importantes

1. **El rol Administrador siempre tiene TODOS los permisos** - Se asignan automáticamente en el seed
2. **Los permisos se validan en el backend** - El frontend solo los usa para UI
3. **Usa `upsert` en seeds** - Permite re-ejecutar sin errores de duplicados
4. **Nunca elimines migraciones aplicadas** - Puede causar inconsistencias

## 🆘 Troubleshooting

### Error: "Permisos no encontrados"
```bash
# Ejecuta el seed de permisos
npx prisma db seed
```

### Error: "403 Forbidden" después de login
```bash
# Cierra sesión y vuelve a iniciar sesión
# El JWT se genera con los permisos del momento del login
```

### Error: "Unique constraint failed"
```bash
# Usa reset para limpiar la BD
npx prisma migrate reset --force
```

## 📚 Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
