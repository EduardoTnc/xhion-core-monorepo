# 📘 Manual del Backend - XHION Core

## Tabla de Contenidos

- [Introducción](#introducción)
- [Arquitectura General](#arquitectura-general)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Base de Datos](#base-de-datos)
- [Módulos Principales](#módulos-principales)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Guards e Interceptors](#guards-e-interceptors)
- [Validación y DTOs](#validación-y-dtos)
- [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

El backend de XHION Core está construido con **NestJS**, un framework progresivo de Node.js que utiliza TypeScript y sigue principios de arquitectura modular y orientada a objetos. Utiliza **Prisma** como ORM para interactuar con PostgreSQL.

### Principios de Diseño

- **Modularidad:** Cada funcionalidad está encapsulada en su propio módulo
- **Separación de responsabilidades:** Controllers, Services, Repositories
- **Inyección de dependencias:** Facilita testing y mantenibilidad
- **Type-safety:** TypeScript en todo el código
- **API RESTful:** Endpoints claros y semánticos

---

## Arquitectura General

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────────────────────────┐
│         NestJS API              │
│  ┌───────────────────────────┐  │
│  │   Guards (Auth, RBAC)     │  │
│  └───────────┬───────────────┘  │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │     Controllers           │  │
│  └───────────┬───────────────┘  │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │       Services            │  │
│  └───────────┬───────────────┘  │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │    Prisma Service         │  │
│  └───────────┬───────────────┘  │
└──────────────┼──────────────────┘
               ▼
       ┌───────────────┐
       │  PostgreSQL   │
       └───────────────┘
```

### Flujo de una Petición

1. **Cliente** envía petición HTTP
2. **Guards** validan autenticación y permisos
3. **Controller** recibe la petición y valida DTOs
4. **Service** ejecuta lógica de negocio
5. **Prisma** interactúa con la base de datos
6. **Interceptor** registra auditoría (si aplica)
7. **Response** se envía al cliente

---

## Estructura de Carpetas

```
xhion-core-api/
├── prisma/
│   ├── schema.prisma          # Definición del esquema
│   ├── migrations/            # Migraciones de BD
│   └── seed.ts                # Datos iniciales
│
├── src/
│   ├── app.module.ts          # Módulo raíz
│   ├── main.ts                # Punto de entrada
│   │
│   ├── auth/                  # Autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── refresh-token.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── refresh-token.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── accept-invitation.dto.ts
│   │
│   ├── usuarios/              # Gestión de usuarios
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.service.ts
│   │   ├── usuarios.module.ts
│   │   ├── usuarios-configuracion.controller.ts
│   │   └── dto/
│   │
│   ├── proyectos/             # Gestión de proyectos
│   │   ├── proyectos.controller.ts
│   │   ├── proyectos.service.ts
│   │   ├── proyectos.module.ts
│   │   └── dto/
│   │
│   ├── tareas/                # Gestión de tareas
│   │   ├── tareas.controller.ts
│   │   ├── tareas.service.ts
│   │   ├── tareas.module.ts
│   │   └── dto/
│   │
│   ├── departamentos/         # Departamentos
│   ├── presupuestos/          # Presupuestos
│   ├── roles/                 # Roles y permisos
│   ├── auditoria/             # Auditoría
│   ├── invitaciones/          # Sistema de invitaciones
│   ├── sesiones/              # Gestión de sesiones
│   │
│   ├── prisma/                # Servicio de Prisma
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── common/                # Código compartido
│   │   ├── decorators/
│   │   │   ├── auditar.decorator.ts
│   │   │   └── requires-permission.decorator.ts
│   │   ├── guards/
│   │   │   └── permissions.guard.ts
│   │   ├── interceptors/
│   │   │   └── audit.interceptor.ts
│   │   └── filters/
│   │
│   └── config/                # Configuración
│       └── configuration.ts
│
├── test/                      # Tests
├── .env                       # Variables de entorno
├── .env.example               # Ejemplo de .env
├── nest-cli.json              # Configuración de Nest CLI
├── tsconfig.json              # Configuración de TypeScript
└── package.json               # Dependencias
```

---

## Base de Datos

### Prisma Schema

El archivo `prisma/schema.prisma` define todos los modelos de datos:

```prisma
// Ejemplo: Modelo Usuario
model Usuario {
  id                String   @id @default(uuid())
  email             String   @unique
  passwordHash      String
  nombreCompleto    String
  estado            EstadoUsuario @default(ACTIVO)
  rolId             String
  rol               Rol      @relation(fields: [rolId], references: [id])
  
  // Relaciones
  proyectosCreados  Proyecto[] @relation("ProyectoCreador")
  tareasAsignadas   Tarea[]    @relation("TareaAsignado")
  comentarios       Comentario[]
  sesiones          Sesion[]
  
  fechaCreacion     DateTime @default(now())
  fechaActualizacion DateTime @updatedAt
  
  @@index([email])
  @@index([rolId])
}
```

### Modelos Principales

| Modelo | Descripción | Relaciones Clave |
|--------|-------------|------------------|
| **Usuario** | Usuarios del sistema | Rol, Proyectos, Tareas |
| **Rol** | Roles con permisos | Usuarios, Permisos |
| **Proyecto** | Proyectos | Miembros, Etapas, Tareas |
| **Tarea** | Tareas de proyectos | Proyecto, Etapa, Usuario |
| **Departamento** | Departamentos | Usuarios, Proyectos |
| **Presupuesto** | Presupuestos | Proyecto/Departamento |
| **Sesion** | Sesiones activas | Usuario |
| **Invitacion** | Invitaciones pendientes | Rol, Departamento |

### Migraciones

```bash
# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Aplicar migraciones
pnpm prisma migrate deploy

# Resetear BD (desarrollo)
pnpm prisma migrate reset
```

---

## Módulos Principales

### 1. Auth Module

**Responsabilidad:** Autenticación y gestión de sesiones

**Endpoints:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/accept-invitation` - Aceptar invitación
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión

**Flujo de Login:**
```typescript
// 1. Validar credenciales
const user = await this.validateUser(email, password)

// 2. Generar tokens
const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' })
const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

// 3. Crear sesión
await this.prisma.sesion.create({
  data: {
    usuarioId: user.id,
    refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    accessToken: await bcrypt.hash(accessToken, 10),
    userAgent: req.headers['user-agent'],
    direccionIp: req.ip,
    fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
})

// 4. Retornar tokens
return { accessToken, refreshToken, user }
```

### 2. Proyectos Module

**Responsabilidad:** CRUD de proyectos y gestión de miembros

**Endpoints principales:**
- `GET /proyectos` - Listar proyectos
- `POST /proyectos` - Crear proyecto
- `GET /proyectos/:id` - Obtener proyecto
- `PATCH /proyectos/:id` - Actualizar proyecto
- `DELETE /proyectos/:id` - Eliminar proyecto (soft delete)
- `POST /proyectos/:id/miembros` - Agregar miembro
- `DELETE /proyectos/:id/miembros/:usuarioId` - Remover miembro
- `POST /proyectos/:id/etapas` - Crear etapa
- `PATCH /proyectos/:id/etapas/reorder` - Reordenar etapas

**Control de Acceso:**
```typescript
// Solo miembros del proyecto pueden acceder
async verificarAccesoProyecto(proyectoId: string, usuarioId: string) {
  const miembro = await this.prisma.proyectoMiembro.findFirst({
    where: { proyectoId, usuarioId }
  })
  
  if (!miembro) {
    throw new ForbiddenException('No tienes acceso a este proyecto')
  }
  
  return miembro
}
```

### 3. Tareas Module

**Responsabilidad:** Gestión de tareas y comentarios

**Endpoints principales:**
- `GET /tareas` - Listar tareas (con filtros)
- `POST /tareas` - Crear tarea
- `PATCH /tareas/:id` - Actualizar tarea
- `PATCH /tareas/:id/mover` - Mover tarea entre estados/etapas
- `DELETE /tareas/:id` - Eliminar tarea
- `POST /tareas/:id/comentarios` - Agregar comentario
- `GET /tareas/mis-tareas` - Tareas asignadas al usuario actual

**Filtros Avanzados:**
```typescript
// Query con múltiples filtros
const tareas = await this.prisma.tarea.findMany({
  where: {
    AND: [
      proyectoId ? { proyectoId } : {},
      etapaId ? { etapaId } : {},
      asignadoId ? { asignadoId } : {},
      estado ? { estado } : {},
      prioridad ? { prioridad } : {},
      search ? {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
    ]
  },
  include: {
    proyecto: true,
    etapa: true,
    asignado: true,
    creadoPor: true
  },
  orderBy: [
    { prioridad: 'desc' },
    { fechaVencimiento: 'asc' }
  ]
})
```

### 4. Roles Module

**Responsabilidad:** Gestión de roles y permisos (RBAC)

**47 Permisos en 10 Módulos:**
- `proyectos.*` (8 permisos)
- `tareas.*` (8 permisos)
- `departamentos.*` (6 permisos)
- `presupuestos.*` (6 permisos)
- `conocimiento.*` (4 permisos)
- `usuarios.*` (6 permisos)
- `roles.*` (5 permisos)
- `auditoria.*` (2 permisos)
- `sistema.*` (3 permisos)
- `invitaciones.*` (3 permisos)

**Asignación de Permisos:**
```typescript
// Crear rol con permisos
const rol = await this.prisma.rol.create({
  data: {
    nombre: 'Gerente de Proyecto',
    descripcion: 'Puede gestionar proyectos y tareas',
    permisos: {
      create: [
        { permisoId: 'proyectos.crear' },
        { permisoId: 'proyectos.editar' },
        { permisoId: 'tareas.crear' },
        { permisoId: 'tareas.editar' }
      ]
    }
  }
})
```

---

## Autenticación y Autorización

### JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
    })
  }

  async validate(payload: any) {
    // Cargar usuario completo con relaciones
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.id },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true }
            }
          }
        }
      }
    })

    if (!user || user.estado !== 'ACTIVO') {
      throw new UnauthorizedException()
    }

    return user
  }
}
```

### Protección de Rutas

```typescript
// Requiere autenticación
@UseGuards(JwtAuthGuard)
@Get('perfil')
async getPerfil(@Request() req) {
  return req.user
}

// Requiere permisos específicos
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequiresPermission('proyectos.crear')
@Post()
async create(@Body() dto: CreateProyectoDto) {
  return this.service.create(dto)
}
```

---

## Guards e Interceptors

### JwtAuthGuard

Valida que el token JWT sea válido y el usuario esté activo.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException()
    }
    return user
  }
}
```

### PermissionsGuard

Valida que el usuario tenga los permisos requeridos.

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    )

    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Extraer códigos de permisos del usuario
    const userPermissions = user.rol.permisos.map(rp => rp.permiso.codigo)

    // Verificar si tiene algún permiso requerido
    return requiredPermissions.some(p => userPermissions.includes(p))
  }
}
```

### AuditInterceptor

Registra automáticamente las acciones auditables.

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService, private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    const handler = context.getHandler()
    
    const accion = this.reflector.get('auditAccion', handler)
    
    if (!accion) {
      return next.handle()
    }

    // Ejecutar endpoint
    const result = await next.handle().toPromise()

    // Registrar auditoría
    await this.prisma.registroAuditoria.create({
      data: {
        usuarioId: request.user?.id,
        accion,
        modulo: this.extractModule(request.url),
        detalles: request.auditDetalles || JSON.stringify(request.body),
        direccionIp: request.ip,
        userAgent: request.headers['user-agent']
      }
    })

    return result
  }
}
```

---

## Validación y DTOs

### Uso de class-validator

```typescript
import { IsString, IsEmail, MinLength, IsOptional, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProyectoDto {
  @ApiProperty({ description: 'Nombre del proyecto' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre: string

  @ApiPropertyOptional({ description: 'Descripción del proyecto' })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ description: 'ID del responsable' })
  @IsUUID('4', { message: 'El ID del responsable debe ser un UUID válido' })
  responsableId: string

  @ApiPropertyOptional({ description: 'ID del departamento' })
  @IsOptional()
  @IsUUID('4')
  departamentoId?: string
}
```

### Transformación de Datos

```typescript
import { Transform } from 'class-transformer'

export class QueryTareasDto {
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  search?: string

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20
}
```

---

## Mejores Prácticas

### 1. Manejo de Errores

```typescript
// Usar excepciones específicas de NestJS
if (!proyecto) {
  throw new NotFoundException('Proyecto no encontrado')
}

if (!tienePermiso) {
  throw new ForbiddenException('No tienes permiso para esta acción')
}

if (emailDuplicado) {
  throw new ConflictException('El email ya está registrado')
}
```

### 2. Transacciones

```typescript
// Usar transacciones para operaciones complejas
await this.prisma.$transaction(async (tx) => {
  const proyecto = await tx.proyecto.create({ data: proyectoData })
  
  await tx.proyectoMiembro.create({
    data: {
      proyectoId: proyecto.id,
      usuarioId: responsableId,
      rol: 'Responsable'
    }
  })
  
  return proyecto
})
```

### 3. Soft Delete

```typescript
// No eliminar físicamente, marcar como eliminado
async remove(id: string) {
  return this.prisma.proyecto.update({
    where: { id },
    data: {
      estado: 'Archivado',
      fechaEliminacion: new Date()
    }
  })
}
```

### 4. Paginación

```typescript
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    this.prisma.proyecto.findMany({
      skip,
      take: limit,
      orderBy: { fechaCreacion: 'desc' }
    }),
    this.prisma.proyecto.count()
  ])

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}
```

### 5. Logging

```typescript
import { Logger } from '@nestjs/common'

@Injectable()
export class ProyectosService {
  private readonly logger = new Logger(ProyectosService.name)

  async create(dto: CreateProyectoDto) {
    this.logger.log(`Creando proyecto: ${dto.nombre}`)
    
    try {
      const proyecto = await this.prisma.proyecto.create({ data: dto })
      this.logger.log(`Proyecto creado: ${proyecto.id}`)
      return proyecto
    } catch (error) {
      this.logger.error(`Error al crear proyecto: ${error.message}`, error.stack)
      throw error
    }
  }
}
```

---

## Conclusión

El backend de XHION Core sigue una arquitectura modular y escalable, con separación clara de responsabilidades y uso extensivo de TypeScript para type-safety. La combinación de NestJS + Prisma + PostgreSQL proporciona una base sólida para construir una aplicación empresarial robusta y mantenible.

Para más detalles sobre flujos específicos, consulta el [Análisis Técnico Completo](../ANALISIS_TECNICO_COMPLETO.md).