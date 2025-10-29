# 🔐 PLAN COMPLETO: SISTEMA DE ROLES Y PERMISOS GRANULARES

**Fecha:** 26 de Octubre, 2025  
**Estado:** 📋 PLANIFICACIÓN  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo Estimado:** 16-20 horas

---

## 🎯 OBJETIVOS PRINCIPALES

### **1. Gestión de Permisos Granulares**
El administrador debe poder definir y asignar permisos granulares a cada rol:
- ✅ Crear, editar, eliminar proyectos
- ✅ Crear, editar, eliminar tareas
- ✅ Ver, crear, editar auditoría
- ✅ Gestionar base de conocimiento
- ✅ Gestionar departamentos
- ✅ Gestionar presupuestos
- ✅ Gestionar usuarios
- ✅ Gestionar roles y permisos
- ✅ Y muchos más...

### **2. Asignación de Roles a Usuarios**
El administrador debe poder:
- ✅ Crear roles personalizados
- ✅ Asignar permisos a roles
- ✅ Asignar roles a usuarios
- ✅ Cambiar roles de usuarios
- ✅ Ver qué usuarios tienen qué roles

### **3. Rol Base: Administrador**
- ✅ Único rol creado en seed
- ✅ Acceso total al sistema
- ✅ Puede crear todos los demás roles
- ✅ Puede asignar todos los permisos

---

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### **✅ YA IMPLEMENTADO (Backend)**

#### **1. Schema de Base de Datos** ✅
```prisma
model Rol {
  id               String    @id @default(uuid())
  nombre           String    @unique
  descripcion      String?
  color            String    @default("bg-primary")
  fechaEliminacion DateTime?
  
  usuarios Usuario[]
  permisos RolPermiso[]
}

model Permiso {
  id           String  @id @default(uuid())
  nombreAccion String  @unique
  descripcion  String?
  
  roles RolPermiso[]
}

model RolPermiso {
  rolId     String
  permisoId String
  
  rol     Rol
  permiso Permiso
  
  @@id([rolId, permisoId])
}

model Usuario {
  id     String @id @default(uuid())
  rolId  String
  rol    Rol    @relation(fields: [rolId], references: [id])
  // ... otros campos
}
```

#### **2. Servicio de Roles** ✅
**Archivo:** `roles.service.ts`

**Métodos Implementados:**
- ✅ `findAll()` - Obtener todos los roles
- ✅ `findAllWithDetails()` - Roles con permisos (Eager Loading)
- ✅ `findOne(id)` - Obtener rol específico con permisos
- ✅ `findAllUsersSimple()` - Usuarios simplificados
- ✅ `updatePermissions(id, dto)` - Actualizar permisos de rol
- ✅ `findAllPermissions()` - Obtener todos los permisos
- ✅ `create(dto)` - Crear nuevo rol
- ✅ `update(id, dto)` - Actualizar rol
- ✅ `remove(id)` - Eliminar rol (lógico)

**Características:**
- ✅ Transacciones para consistencia
- ✅ Validaciones completas
- ✅ Eliminación lógica
- ✅ Eager Loading optimizado

#### **3. DTOs Existentes** ✅
- ✅ `CrearRolDto`
- ✅ `ActualizarRolDto`
- ✅ `ActualizarPermisosDto`

#### **4. Guards de Autenticación** ✅
- ✅ `JwtAuthGuard` - Autenticación JWT
- ✅ `RolesGuard` - Validación de roles
- ✅ Decorator `@Roles()` - Especificar roles requeridos

---

### **❌ FALTA IMPLEMENTAR**

#### **Backend:**
1. ❌ **Seed de Permisos Completo**
   - Definir TODOS los permisos del sistema
   - Categorizar por módulos
   - Crear permisos granulares

2. ❌ **Guard de Permisos Granulares**
   - Validar permisos específicos (no solo roles)
   - Decorator `@RequiresPermission()`
   - Lógica de verificación de permisos

3. ❌ **Endpoints de Gestión de Usuarios**
   - Asignar rol a usuario
   - Cambiar rol de usuario
   - Obtener usuarios por rol

4. ❌ **Actualizar Validaciones en Módulos**
   - Reemplazar `@Roles()` por `@RequiresPermission()`
   - Aplicar permisos granulares en todos los endpoints

#### **Frontend:**
1. ❌ **Página de Gestión de Roles**
   - Lista de roles
   - Crear/Editar/Eliminar roles
   - Asignar permisos a roles

2. ❌ **Página de Gestión de Permisos**
   - Lista de permisos por categoría
   - Búsqueda y filtrado

3. ❌ **Página de Gestión de Usuarios**
   - Asignar roles a usuarios
   - Ver usuarios por rol
   - Cambiar rol de usuario

4. ❌ **Componentes UI**
   - `RoleCard` - Card de rol
   - `PermissionSelector` - Selector de permisos
   - `UserRoleAssignment` - Asignación de roles
   - `PermissionMatrix` - Matriz de permisos

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Flujo de Permisos:**

```
Usuario → Rol → Permisos → Acciones
   ↓       ↓       ↓          ↓
  Juan  → Admin → [*]    → Todo permitido
  María → Editor → [crear_proyectos, editar_proyectos] → Solo proyectos
  Pedro → Viewer → [ver_proyectos, ver_tareas] → Solo lectura
```

### **Categorías de Permisos:**

```typescript
// PROYECTOS
- proyectos.crear
- proyectos.ver
- proyectos.editar
- proyectos.eliminar
- proyectos.archivar
- proyectos.gestionar_miembros

// TAREAS
- tareas.crear
- tareas.ver
- tareas.editar
- tareas.eliminar
- tareas.asignar
- tareas.cambiar_estado

// DEPARTAMENTOS
- departamentos.crear
- departamentos.ver
- departamentos.editar
- departamentos.eliminar
- departamentos.gestionar_empleados

// PRESUPUESTOS
- presupuestos.crear
- presupuestos.ver
- presupuestos.editar
- presupuestos.eliminar
- presupuestos.aprobar

// CONOCIMIENTO
- conocimiento.crear
- conocimiento.ver
- conocimiento.editar
- conocimiento.eliminar

// USUARIOS
- usuarios.crear
- usuarios.ver
- usuarios.editar
- usuarios.eliminar
- usuarios.gestionar_roles

// ROLES Y PERMISOS
- roles.crear
- roles.ver
- roles.editar
- roles.eliminar
- roles.asignar_permisos

// AUDITORÍA
- auditoria.ver
- auditoria.exportar

// SISTEMA
- sistema.configurar
- sistema.ver_estadisticas
```

---

## 📝 PLAN DE IMPLEMENTACIÓN DETALLADO

### **FASE 1: BACKEND - PERMISOS Y GUARDS** (6-8 horas)

#### **1.1. Definir Catálogo Completo de Permisos** ⏱️ 2h

**Archivo:** `prisma/seeds/permisos.seed.ts`

**Tareas:**
1. ✅ Crear archivo de seed de permisos
2. ✅ Definir permisos por módulo:
   - Proyectos (6 permisos)
   - Tareas (6 permisos)
   - Departamentos (5 permisos)
   - Presupuestos (5 permisos)
   - Conocimiento (4 permisos)
   - Usuarios (5 permisos)
   - Roles (5 permisos)
   - Auditoría (2 permisos)
   - Sistema (2 permisos)
3. ✅ Total: ~40 permisos granulares
4. ✅ Cada permiso con:
   - `nombreAccion` (ej: "proyectos.crear")
   - `descripcion` (ej: "Permite crear nuevos proyectos")

**Estructura:**
```typescript
const permisos = [
  // PROYECTOS
  {
    nombreAccion: 'proyectos.crear',
    descripcion: 'Permite crear nuevos proyectos'
  },
  {
    nombreAccion: 'proyectos.ver',
    descripcion: 'Permite ver proyectos existentes'
  },
  // ... más permisos
];
```

---

#### **1.2. Actualizar Seed Principal** ⏱️ 1h

**Archivo:** `prisma/seed.ts`

**Tareas:**
1. ✅ Importar seed de permisos
2. ✅ Ejecutar seed de permisos
3. ✅ Crear solo rol "Administrador"
4. ✅ Asignar TODOS los permisos al Administrador
5. ✅ Crear usuario administrador inicial

**Código:**
```typescript
async function main() {
  // 1. Crear permisos
  await seedPermisos(prisma);
  
  // 2. Crear rol Administrador
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema',
      color: 'bg-destructive',
    },
  });
  
  // 3. Asignar todos los permisos al Administrador
  const todosLosPermisos = await prisma.permiso.findMany();
  await prisma.rolPermiso.createMany({
    data: todosLosPermisos.map(p => ({
      rolId: adminRol.id,
      permisoId: p.id,
    })),
    skipDuplicates: true,
  });
  
  // 4. Crear usuario administrador
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@xhion.com' },
    update: {},
    create: {
      nombreCompleto: 'Administrador',
      email: 'admin@xhion.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      estado: 'ACTIVO',
      rolId: adminRol.id,
    },
  });
}
```

---

#### **1.3. Crear Guard de Permisos Granulares** ⏱️ 2h

**Archivo:** `auth/permissions.guard.ts`

**Tareas:**
1. ✅ Crear `PermissionsGuard`
2. ✅ Implementar lógica de verificación
3. ✅ Cachear permisos del usuario
4. ✅ Manejar múltiples permisos (AND/OR)

**Código:**
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No se requieren permisos específicos
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Obtener permisos del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      return false;
    }

    const userPermissions = usuario.rol.permisos.map(
      rp => rp.permiso.nombreAccion
    );

    // Verificar si el usuario tiene todos los permisos requeridos
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}
```

---

#### **1.4. Crear Decorator de Permisos** ⏱️ 30min

**Archivo:** `auth/permissions.decorator.ts`

**Código:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const RequiresPermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Uso:
// @RequiresPermission('proyectos.crear', 'proyectos.editar')
```

---

#### **1.5. Actualizar Endpoints de Usuarios** ⏱️ 1.5h

**Archivo:** `usuarios/usuarios.service.ts` y `usuarios/usuarios.controller.ts`

**Nuevos Métodos:**
```typescript
// Service
async asignarRol(usuarioId: string, rolId: string) {
  // Verificar usuario existe
  // Verificar rol existe
  // Actualizar usuario
  // Retornar usuario actualizado
}

async cambiarRol(usuarioId: string, nuevoRolId: string) {
  // Similar a asignarRol
}

async obtenerUsuariosPorRol(rolId: string) {
  // Obtener usuarios con ese rol
}

// Controller
@Post(':id/asignar-rol')
@RequiresPermission('usuarios.gestionar_roles')
async asignarRol(@Param('id') id: string, @Body() dto: AsignarRolDto) {
  return this.usuariosService.asignarRol(id, dto.rolId);
}
```

---

#### **1.6. Aplicar Permisos en Módulos Existentes** ⏱️ 1h

**Archivos a actualizar:**
- `proyectos/proyectos.controller.ts`
- `tareas/tareas.controller.ts`
- `departamentos/departamentos.controller.ts`
- `presupuestos/presupuestos.controller.ts`
- `conocimiento/conocimiento.controller.ts`

**Ejemplo:**
```typescript
// ANTES
@Post()
@Roles('Admin', 'Gerente')
async create(@Body() dto: CreateProyectoDto) {
  return this.proyectosService.create(dto);
}

// DESPUÉS
@Post()
@RequiresPermission('proyectos.crear')
async create(@Body() dto: CreateProyectoDto) {
  return this.proyectosService.create(dto);
}
```

---

### **FASE 2: FRONTEND - UI DE GESTIÓN** (8-10 horas)

#### **2.1. Store de Roles y Permisos** ⏱️ 1h

**Archivo:** `store/rolesPermisosStore.ts`

**Tareas:**
1. ✅ Crear store con Zustand
2. ✅ Estados:
   - `roles: Rol[]`
   - `permisos: Permiso[]`
   - `selectedRole: Rol | null`
   - `isLoading: boolean`
3. ✅ Acciones:
   - `fetchRoles()`
   - `fetchPermisos()`
   - `createRole()`
   - `updateRole()`
   - `deleteRole()`
   - `updateRolePermissions()`

---

#### **2.2. Servicio de API** ⏱️ 1h

**Archivo:** `services/rolesPermisosService.ts`

**Métodos:**
```typescript
export const rolesPermisosService = {
  // Roles
  getRoles: () => api.get('/roles'),
  getRolesWithDetails: () => api.get('/roles/with-details'),
  getRole: (id: string) => api.get(`/roles/${id}`),
  createRole: (data) => api.post('/roles', data),
  updateRole: (id, data) => api.patch(`/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/roles/${id}`),
  
  // Permisos
  getPermisos: () => api.get('/roles/permisos'),
  updateRolePermissions: (id, permisosIds) => 
    api.patch(`/roles/${id}/permisos`, { permisosIds }),
  
  // Usuarios
  getUsers: () => api.get('/usuarios'),
  asignarRol: (userId, rolId) => 
    api.post(`/usuarios/${userId}/asignar-rol`, { rolId }),
};
```

---

#### **2.3. Página de Gestión de Roles** ⏱️ 3h

**Archivo:** `pages/RolesPage.tsx`

**Componentes:**
- Lista de roles con cards
- Botón "Crear Rol"
- Búsqueda y filtrado
- Estadísticas (total roles, usuarios por rol)

**Características:**
- ✅ Grid responsive
- ✅ Cards con color personalizado
- ✅ Contador de usuarios
- ✅ Acciones: Editar, Eliminar, Gestionar Permisos
- ✅ Modal de confirmación para eliminar

---

#### **2.4. Modal de Crear/Editar Rol** ⏱️ 1.5h

**Archivo:** `components/roles/CreateEditRoleModal.tsx`

**Campos:**
- Nombre del rol (required)
- Descripción (optional)
- Color (selector de colores Tailwind)

**Validación:**
- Nombre único
- Nombre no vacío
- Color válido

---

#### **2.5. Modal de Gestión de Permisos** ⏱️ 2.5h

**Archivo:** `components/roles/ManagePermissionsModal.tsx`

**Características:**
- ✅ Lista de permisos agrupados por módulo
- ✅ Checkboxes para seleccionar/deseleccionar
- ✅ "Seleccionar todos" por módulo
- ✅ Búsqueda de permisos
- ✅ Contador de permisos seleccionados
- ✅ Guardar cambios con transacción

**Estructura:**
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
    <TabsTrigger value="tareas">Tareas</TabsTrigger>
    <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
    // ... más tabs
  </TabsList>
  
  <TabsContent value="proyectos">
    <div className="space-y-2">
      <Checkbox id="proyectos.crear" label="Crear proyectos" />
      <Checkbox id="proyectos.ver" label="Ver proyectos" />
      <Checkbox id="proyectos.editar" label="Editar proyectos" />
      // ... más permisos
    </div>
  </TabsContent>
</Tabs>
```

---

#### **2.6. Página de Asignación de Roles a Usuarios** ⏱️ 2h

**Archivo:** `pages/UserRolesPage.tsx`

**Características:**
- ✅ Tabla de usuarios con rol actual
- ✅ Selector de rol por usuario
- ✅ Búsqueda y filtrado
- ✅ Filtro por rol
- ✅ Actualización en tiempo real

**Componentes:**
- `UserRoleRow` - Fila de usuario con selector de rol
- `RoleSelector` - Dropdown de roles
- `UserFilters` - Filtros de búsqueda

---

### **FASE 3: TESTING Y DOCUMENTACIÓN** (2 horas)

#### **3.1. Testing Backend** ⏱️ 1h

**Archivos:**
- `permissions.guard.spec.ts`
- `roles.service.spec.ts`
- `usuarios.service.spec.ts`

**Tests:**
- ✅ Guard valida permisos correctamente
- ✅ Servicio crea roles
- ✅ Servicio asigna permisos
- ✅ Servicio asigna roles a usuarios

---

#### **3.2. Documentación** ⏱️ 1h

**Archivos:**
- `ROLES_PERMISOS_GUIA.md` - Guía de uso
- `PERMISOS_CATALOGO.md` - Catálogo completo de permisos
- `API_ROLES_PERMISOS.md` - Documentación de API

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Backend:**
- [ ] 1.1. Crear seed de permisos completo
- [ ] 1.2. Actualizar seed principal
- [ ] 1.3. Crear PermissionsGuard
- [ ] 1.4. Crear decorator @RequiresPermission
- [ ] 1.5. Actualizar endpoints de usuarios
- [ ] 1.6. Aplicar permisos en módulos existentes
- [ ] 1.7. Ejecutar migración y seed
- [ ] 1.8. Probar endpoints con Postman

### **Frontend:**
- [ ] 2.1. Crear store de roles y permisos
- [ ] 2.2. Crear servicio de API
- [ ] 2.3. Crear página de gestión de roles
- [ ] 2.4. Crear modal de crear/editar rol
- [ ] 2.5. Crear modal de gestión de permisos
- [ ] 2.6. Crear página de asignación de roles
- [ ] 2.7. Integrar en navegación principal
- [ ] 2.8. Probar flujo completo

### **Testing:**
- [ ] 3.1. Tests unitarios backend
- [ ] 3.2. Tests de integración
- [ ] 3.3. Tests E2E frontend

### **Documentación:**
- [ ] 3.4. Guía de uso
- [ ] 3.5. Catálogo de permisos
- [ ] 3.6. Documentación de API

---

## 🎯 CASOS DE USO

### **Caso 1: Crear Rol "Editor de Proyectos"**
1. Admin va a "Gestión de Roles"
2. Click "Crear Rol"
3. Nombre: "Editor de Proyectos"
4. Descripción: "Puede crear y editar proyectos"
5. Color: "bg-blue-500"
6. Guardar
7. Click "Gestionar Permisos"
8. Seleccionar:
   - proyectos.crear
   - proyectos.ver
   - proyectos.editar
   - tareas.crear
   - tareas.ver
   - tareas.editar
9. Guardar

### **Caso 2: Asignar Rol a Usuario**
1. Admin va a "Usuarios"
2. Busca usuario "Juan Pérez"
3. Click en selector de rol
4. Selecciona "Editor de Proyectos"
5. Confirmar
6. Juan ahora puede crear/editar proyectos

### **Caso 3: Usuario Intenta Acción Sin Permiso**
1. Juan (Editor) intenta eliminar proyecto
2. Backend valida permisos
3. Juan NO tiene "proyectos.eliminar"
4. Backend retorna 403 Forbidden
5. Frontend muestra mensaje: "No tienes permiso para esta acción"

---

## 📊 MÉTRICAS DE ÉXITO

### **Backend:**
- ✅ 40+ permisos granulares definidos
- ✅ Guard de permisos funcionando
- ✅ 100% de endpoints protegidos
- ✅ Seed completo ejecutado

### **Frontend:**
- ✅ Página de roles funcional
- ✅ Asignación de permisos visual
- ✅ Asignación de roles a usuarios
- ✅ UX intuitiva y responsive

### **Seguridad:**
- ✅ Validación en backend (no solo frontend)
- ✅ Permisos verificados en cada request
- ✅ Auditoría de cambios de roles/permisos
- ✅ Rol Admin con acceso total

---

## 🚀 RESULTADO ESPERADO

Al finalizar la implementación:

1. **Administrador puede:**
   - ✅ Crear roles personalizados
   - ✅ Asignar permisos granulares a roles
   - ✅ Asignar roles a usuarios
   - ✅ Ver matriz de permisos
   - ✅ Auditar cambios

2. **Sistema tiene:**
   - ✅ 40+ permisos granulares
   - ✅ Validación en backend
   - ✅ UI intuitiva
   - ✅ Seguridad robusta

3. **Usuarios pueden:**
   - ✅ Solo realizar acciones permitidas
   - ✅ Ver mensajes claros de permisos
   - ✅ Solicitar permisos adicionales

---

## 📚 TECNOLOGÍAS UTILIZADAS

### **Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Guards y Decorators

### **Frontend:**
- React 19
- TypeScript
- Zustand (state)
- shadcn/ui (components)
- React Hook Form
- Zod (validation)

---

## ⏱️ CRONOGRAMA

| Fase | Tiempo | Descripción |
|------|--------|-------------|
| **Fase 1** | 6-8h | Backend - Permisos y Guards |
| **Fase 2** | 8-10h | Frontend - UI de Gestión |
| **Fase 3** | 2h | Testing y Documentación |
| **TOTAL** | **16-20h** | Implementación completa |

---

## 🎉 CONCLUSIÓN

Este plan proporciona una implementación completa y robusta de un sistema de Roles y Permisos Granulares de nivel empresarial, permitiendo:

- ✅ Control total sobre quién puede hacer qué
- ✅ Flexibilidad para crear roles personalizados
- ✅ Seguridad en backend y frontend
- ✅ UI intuitiva para gestión
- ✅ Escalabilidad para futuros permisos

**Estado:** 📋 Listo para implementación  
**Prioridad:** 🔴 Crítica  
**Calidad Esperada:** ⭐⭐⭐⭐⭐ Excelente
