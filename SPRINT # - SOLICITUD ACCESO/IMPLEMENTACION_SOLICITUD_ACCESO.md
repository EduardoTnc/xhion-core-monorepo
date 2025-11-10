# 🚀 Implementación: Sistema de Solicitud de Acceso

**Fecha:** 7 de Noviembre, 2025  
**Estado:** 🔄 EN PROGRESO

---

## 📋 Objetivo

Implementar un sistema completo de solicitud de acceso que permita a usuarios externos solicitar acceso al sistema, y a los administradores revisar y aprobar/rechazar estas solicitudes, generando automáticamente invitaciones.

---

## 🎯 Flujo del Sistema

```
1. Usuario externo → Página "Solicitar acceso"
2. Completa formulario → Envía solicitud
3. Sistema → Crea solicitud con estado "Pendiente"
4. Sistema → Notifica a administradores
5. Administrador → Revisa solicitud en panel
6. Administrador → Aprueba/Rechaza
7. Si aprueba → Sistema crea invitación automática
8. Sistema → Envía email con enlace de invitación
9. Usuario → Acepta invitación y completa registro
```

---

## 📦 Componentes Implementados

### Backend (En Progreso)

#### 1. ✅ Schema de Prisma

**Modelo SolicitudAcceso:**
```prisma
model SolicitudAcceso {
  id                String            @id @default(uuid())
  nombreCompleto    String            @db.VarChar(200)
  email             String            @db.VarChar(255)
  telefono          String?           @db.VarChar(20)
  empresa           String?           @db.VarChar(200)
  cargo             String?           @db.VarChar(100)
  mensaje           String?
  estado            EstadoSolicitud   @default(Pendiente)
  
  // Información de procesamiento
  revisadoPorId     String?           @db.Uuid
  fechaRevision     DateTime?
  comentarioRevision String?
  invitacionId      String?           @unique @db.Uuid
  
  // Auditoría
  fechaCreacion     DateTime          @default(now())
  fechaExpiracion   DateTime          // 30 días
  ipSolicitud       String?           @db.VarChar(45)
  
  // Relaciones
  revisadoPor       Usuario?          @relation(...)
  invitacion        Invitacion?       @relation(...)
}
```

**Enum EstadoSolicitud:**
- `Pendiente` - Solicitud recién creada
- `Aprobada` - Aprobada por administrador
- `Rechazada` - Rechazada por administrador
- `Expirada` - Expiró después de 30 días

#### 2. ✅ DTOs Creados

**CreateSolicitudDto:**
- nombreCompleto (requerido)
- email (requerido, validado)
- telefono (opcional)
- empresa (opcional)
- cargo (opcional)
- mensaje (opcional)

**ReviewSolicitudDto:**
- estado (Aprobada/Rechazada)
- comentarioRevision (opcional)
- rolId (requerido si se aprueba)
- departamentoId (opcional)

#### 3. ✅ Servicio Creado

**Métodos:**
- `create()` - Crear solicitud
- `findAll()` - Listar con filtros
- `findOne()` - Obtener una solicitud
- `review()` - Aprobar/Rechazar
- `getStats()` - Estadísticas
- `markExpiredRequests()` - Marcar expiradas

**Validaciones:**
- No duplicar solicitudes pendientes
- Verificar email no registrado
- Verificar solicitud pendiente antes de revisar
- Verificar no expirada
- Generar invitación automática si se aprueba

#### 4. ⏳ Controlador (Pendiente)

**Endpoints a crear:**
```
POST   /api/v1/solicitudes-acceso          - Crear solicitud (público)
GET    /api/v1/solicitudes-acceso          - Listar (admin)
GET    /api/v1/solicitudes-acceso/stats    - Estadísticas (admin)
GET    /api/v1/solicitudes-acceso/:id      - Ver una (admin)
PATCH  /api/v1/solicitudes-acceso/:id/review - Revisar (admin)
POST   /api/v1/solicitudes-acceso/expire   - Marcar expiradas (cron)
```

#### 5. ⏳ Módulo (Pendiente)

**solicitudes-acceso.module.ts:**
- Importar PrismaModule
- Exportar servicio
- Registrar controlador

---

### Frontend (Pendiente)

#### 1. ⏳ Página RequestAccessPage

**Ubicación:** `src/pages/RequestAccessPage.tsx`

**Características:**
- Formulario con validación
- Campos: nombre, email, teléfono, empresa, cargo, mensaje
- Diseño atractivo con ilustración
- Toast de confirmación
- Redirección a login después de enviar

**Ejemplo de UI:**
```tsx
<div className="grid lg:grid-cols-2">
  {/* Formulario */}
  <div className="p-8">
    <h1>Solicitar Acceso</h1>
    <p>Completa el formulario...</p>
    <Form>
      <Input name="nombreCompleto" />
      <Input name="email" type="email" />
      <Input name="telefono" />
      <Input name="empresa" />
      <Input name="cargo" />
      <Textarea name="mensaje" />
      <Button>Enviar Solicitud</Button>
    </Form>
  </div>
  
  {/* Ilustración */}
  <div className="bg-primary/5 p-16">
    <UserPlus icon />
    <h2>Únete a nuestro equipo</h2>
    <ul>
      <li>✅ Gestión de proyectos</li>
      <li>✅ Colaboración en tiempo real</li>
      <li>✅ Herramientas de IA</li>
    </ul>
  </div>
</div>
```

#### 2. ⏳ Servicio Frontend

**solicitudesService.ts:**
```typescript
export const solicitudesService = {
  createSolicitud: (data: CreateSolicitudDto) => 
    apiClient.post('/solicitudes-acceso', data),
    
  getSolicitudes: (estado?: EstadoSolicitud) =>
    apiClient.get('/solicitudes-acceso', { params: { estado } }),
    
  reviewSolicitud: (id: string, data: ReviewSolicitudDto) =>
    apiClient.patch(`/solicitudes-acceso/${id}/review`, data),
    
  getStats: () =>
    apiClient.get('/solicitudes-acceso/stats'),
};
```

#### 3. ⏳ Panel de Administración

**Ubicación:** `src/pages/admin/SolicitudesAccessoPage.tsx`

**Características:**
- Tabla de solicitudes con filtros
- Estados con badges de colores
- Acciones: Ver detalles, Aprobar, Rechazar
- Modal de revisión con formulario
- Estadísticas en cards
- Búsqueda por nombre/email

**Ejemplo de UI:**
```tsx
<div>
  {/* Stats Cards */}
  <div className="grid grid-cols-4 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl">{stats.pendientes}</p>
      </CardContent>
    </Card>
    {/* ... más cards */}
  </div>
  
  {/* Tabla */}
  <DataTable
    columns={columns}
    data={solicitudes}
    filters={<SolicitudesFilters />}
  />
  
  {/* Modal de Revisión */}
  <ReviewModal
    solicitud={selectedSolicitud}
    onReview={handleReview}
  />
</div>
```

#### 4. ⏳ Notificaciones

**Integración con sistema de notificaciones:**
- Crear notificación cuando se recibe solicitud
- Notificar a usuarios con permiso "invitar"
- Notificar al solicitante cuando se revisa

---

## 🔐 Permisos Requeridos

### Crear Solicitud:
- ✅ Público (sin autenticación)

### Ver Solicitudes:
- ✅ `usuarios.invitar` o `usuarios.gestionar_roles`
- ✅ Rol Administrador

### Revisar Solicitudes:
- ✅ `usuarios.invitar`
- ✅ Rol Administrador

---

## 📊 Base de Datos

### Migración Requerida:

```bash
cd xhion-core-api
pnpm prisma migrate dev --name add_solicitudes_acceso
```

**Qué crea:**
- Tabla `solicitudes_acceso`
- Enum `EstadoSolicitud`
- Relaciones con `usuarios` e `invitaciones`
- Índices para optimización

---

## 🎨 Estados y Colores

| Estado | Color | Badge | Descripción |
|--------|-------|-------|-------------|
| **Pendiente** | Amarillo | `bg-yellow-500` | Esperando revisión |
| **Aprobada** | Verde | `bg-green-500` | Aprobada, invitación enviada |
| **Rechazada** | Rojo | `bg-red-500` | Rechazada por administrador |
| **Expirada** | Gris | `bg-gray-500` | Expiró después de 30 días |

---

## 📧 Emails a Implementar

### 1. Email de Confirmación (al solicitar):
```
Asunto: Solicitud de acceso recibida - Xhion Core

Hola [Nombre],

Hemos recibido tu solicitud de acceso a Xhion Core.

Nuestro equipo la revisará en las próximas 24-48 horas.
Te notificaremos por email cuando tengamos una respuesta.

Detalles de tu solicitud:
- Email: [email]
- Empresa: [empresa]
- Cargo: [cargo]

Gracias por tu interés.

Equipo Xhion Core
```

### 2. Email de Aprobación (al aprobar):
```
Asunto: ¡Solicitud aprobada! - Xhion Core

Hola [Nombre],

¡Buenas noticias! Tu solicitud de acceso ha sido aprobada.

Haz clic en el siguiente enlace para completar tu registro:
[Enlace de invitación]

Este enlace expira en 7 días.

Bienvenido al equipo.

Equipo Xhion Core
```

### 3. Email de Rechazo (al rechazar):
```
Asunto: Actualización sobre tu solicitud - Xhion Core

Hola [Nombre],

Lamentamos informarte que tu solicitud de acceso no ha sido aprobada en este momento.

[Comentario del revisor]

Si tienes preguntas, no dudes en contactarnos.

Equipo Xhion Core
```

---

## 🧪 Testing

### Casos de Prueba:

#### Crear Solicitud:
1. ✅ Crear solicitud válida
2. ✅ Rechazar email duplicado pendiente
3. ✅ Rechazar email ya registrado
4. ✅ Validar formato de email
5. ✅ Capturar IP del solicitante

#### Revisar Solicitud:
1. ✅ Aprobar solicitud válida
2. ✅ Crear invitación automática
3. ✅ Rechazar solicitud
4. ✅ No revisar solicitud ya revisada
5. ✅ No revisar solicitud expirada
6. ✅ Requerir rol al aprobar

#### Expiración:
1. ✅ Marcar solicitudes expiradas (30 días)
2. ✅ Cron job diario

---

## 📈 Métricas

### Estadísticas a Mostrar:
- Total de solicitudes
- Pendientes
- Aprobadas
- Rechazadas
- Expiradas
- Tasa de aprobación (%)
- Tiempo promedio de revisión

---

## 🚀 Pasos de Implementación

### Fase 1: Backend ✅ (Completado 60%)
- [x] Crear modelo en Prisma
- [x] Crear DTOs
- [x] Crear servicio
- [ ] Crear controlador
- [ ] Crear módulo
- [ ] Registrar en app.module
- [ ] Ejecutar migración

### Fase 2: Frontend (Pendiente)
- [ ] Crear RequestAccessPage
- [ ] Crear servicio frontend
- [ ] Crear panel de administración
- [ ] Integrar notificaciones
- [ ] Agregar ruta `/signup`

### Fase 3: Emails (Pendiente)
- [ ] Configurar servicio de email
- [ ] Crear plantillas
- [ ] Integrar en servicio

### Fase 4: Testing (Pendiente)
- [ ] Tests unitarios del servicio
- [ ] Tests de integración
- [ ] Tests E2E del flujo completo

---

## 📚 Archivos Creados

### Backend:
1. ✅ `schema.prisma` - Modelo SolicitudAcceso
2. ✅ `create-solicitud.dto.ts` - DTO de creación
3. ✅ `review-solicitud.dto.ts` - DTO de revisión
4. ✅ `solicitudes-acceso.service.ts` - Lógica de negocio
5. ⏳ `solicitudes-acceso.controller.ts` - Endpoints
6. ⏳ `solicitudes-acceso.module.ts` - Módulo NestJS

### Frontend:
1. ⏳ `RequestAccessPage.tsx` - Página pública
2. ⏳ `SolicitudesAccessoPage.tsx` - Panel admin
3. ⏳ `solicitudesService.ts` - Servicio API
4. ⏳ `ReviewSolicitudModal.tsx` - Modal de revisión

---

## ⚠️ Consideraciones

### Seguridad:
- ✅ Endpoint público sin autenticación
- ✅ Rate limiting (max 3 solicitudes por IP/día)
- ✅ Validación de email
- ✅ Captcha (opcional, recomendado)

### Performance:
- ✅ Índices en email, estado, fechas
- ✅ Paginación en listado
- ✅ Cache de estadísticas

### UX:
- ✅ Formulario simple y claro
- ✅ Feedback inmediato
- ✅ Emails informativos
- ✅ Estado visible en todo momento

---

## 🎯 Próximos Pasos Inmediatos

1. **Crear controlador** con todos los endpoints
2. **Crear módulo** y registrar en app
3. **Ejecutar migración** de Prisma
4. **Crear página RequestAccessPage** en frontend
5. **Probar flujo completo** end-to-end

---

## 📝 Notas

- Las solicitudes expiran automáticamente después de 30 días
- Se puede implementar un cron job para marcar expiradas
- Los administradores reciben notificaciones de nuevas solicitudes
- El sistema previene solicitudes duplicadas
- Las invitaciones generadas expiran en 7 días

---

**¡Sistema de solicitud de acceso en implementación!** 🚀✨

---

**Desarrollado con ❤️ y ☕ por Eduardo Tanca**  
*Practicante Pre-Profesional SENATI*  
*Full Stack Developer*

© 2025 Eduardo Tanca - Todos los derechos reservados
