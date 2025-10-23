# 🗄️ EXTENSIONES REQUERIDAS AL SCHEMA DE PRISMA

**Archivo:** `xhion-core-api/prisma/schema.prisma`  
**Plan:** 10 Semanas (5 Sprints)  
**Última Actualización:** 23 de Octubre, 2025

---

## 📋 RESUMEN DE CAMBIOS

| Modelo | Acción | Prioridad | Sprint | Estado |
|--------|--------|-----------|--------|--------|
| **SPRINT 1** ||||| 
| Etapa | **CREAR** | CRÍTICA | 1 | ✅ COMPLETADO |
| ProyectoMiembro | **CREAR** | CRÍTICA | 1 | ✅ COMPLETADO |
| Tarea | **MODIFICAR** | CRÍTICA | 1 | ✅ COMPLETADO |
| Proyecto | **MODIFICAR** | CRÍTICA | 1 | ✅ COMPLETADO |
| Usuario | **MODIFICAR** | CRÍTICA | 1 | ✅ COMPLETADO |
| **SPRINT 2** ||||| 
| ContextoOrganizacional | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| ContextoDepartamento | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| DocumentoProyecto | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| PresupuestoDepartamento | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| MovimientoPresupuestoDepartamento | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| PresupuestoProyecto | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| MovimientoPresupuestoProyecto | **CREAR** | ALTA | 2 | ✅ COMPLETADO |
| Departamento | **MODIFICAR** | ALTA | 2 | ✅ COMPLETADO |
| Proyecto | **MODIFICAR** | ALTA | 2 | ✅ COMPLETADO |
| **SPRINT 3** ||||| 
| Idea | **CREAR** | ALTA | 3 | ⏳ PENDIENTE |
| PlantillaProyectoIA | **CREAR** | MEDIA | 3 | ⏳ PENDIENTE |
| AiQueryLog | **CREAR** | MEDIA | 3 | ⏳ PENDIENTE |
| **SPRINT 4** ||||| 
| Evento | **CREAR** | ALTA | 4 | ⏳ PENDIENTE |
| EventoParticipante | **CREAR** | ALTA | 4 | ⏳ PENDIENTE |
| Notificacion | **CREAR** | ALTA | 4 | ⏳ PENDIENTE |
| DashboardUsuario | **CREAR** | MEDIA | 4 | ⏳ PENDIENTE |
| **SPRINT 5** ||||| 
| Logro | **CREAR** | MEDIA | 5 | ⏳ PENDIENTE |
| UsuarioLogro | **CREAR** | MEDIA | 5 | ⏳ PENDIENTE |
| RegistroPuntos | **CREAR** | MEDIA | 5 | ⏳ PENDIENTE |
| ClasificacionEntrada | **CREAR** | MEDIA | 5 | ⏳ PENDIENTE |

---

## 🔴 SPRINT 1: CORE FUNCIONAL ✅

**Estado:** 100% Completado | **Migración:** `add_etapas_and_project_members`

### 1. Modelo Etapa (NUEVO) ✅

```prisma
model Etapa {
  id                 String      @id @default(uuid()) @db.Uuid
  nombre             String      @db.VarChar(100)
  descripcion        String?
  orden              Int
  proyectoId         String      @db.Uuid
  fechaInicio        DateTime?   @db.Date
  fechaFin           DateTime?   @db.Date
  estado             EstadoEtapa @default(Pendiente)
  fechaCreacion      DateTime    @default(now())
  fechaActualizacion DateTime    @updatedAt
  
  proyecto Proyecto @relation(fields: [proyectoId], references: [id], onDelete: Cascade)
  tareas   Tarea[]
  
  @@unique([proyectoId, orden])
  @@index([proyectoId])
  @@index([estado])
}

enum EstadoEtapa {
  Pendiente
  En_Progreso
  Completada
}
```

### 2. Modelo ProyectoMiembro (NUEVO) ✅

```prisma
model ProyectoMiembro {
  proyectoId String      @db.Uuid
  usuarioId  String      @db.Uuid
  rol        RolProyecto @default(Miembro)
  fechaUnion DateTime    @default(now())
  
  proyecto Proyecto @relation(fields: [proyectoId], references: [id], onDelete: Cascade)
  usuario  Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  @@id([proyectoId, usuarioId])
  @@index([proyectoId])
  @@index([usuarioId])
}

enum RolProyecto {
  Responsable
  Miembro
  Observador
}
```

### 3. Modificar Modelo Tarea ✅

```prisma
model Tarea {
  id                 String         @id @default(uuid()) @db.Uuid
  titulo             String         @db.VarChar(255)
  descripcion        String?
  estado             EstadoTarea    @default(Por_Hacer)
  prioridad          PrioridadTarea @default(Media)  // NUEVO
  fechaVencimiento   DateTime?      @db.Date
  proyectoId         String         @db.Uuid
  etapaId            String?        @db.Uuid         // NUEVO
  asignadoId         String?        @db.Uuid
  creadorId          String         @db.Uuid
  resumenIa          String?
  fechaCreacion      DateTime       @default(now())
  fechaActualizacion DateTime       @updatedAt
  fechaCompletado    DateTime?
  fechaEliminacion   DateTime?
  
  proyecto    Proyecto     @relation(fields: [proyectoId], references: [id])
  etapa       Etapa?       @relation(fields: [etapaId], references: [id])  // NUEVO
  asignado    Usuario?     @relation("TareasAsignadas", fields: [asignadoId], references: [id])
  creador     Usuario      @relation("TareasCreadas", fields: [creadorId], references: [id])
  comentarios Comentario[]
  
  @@index([proyectoId])
  @@index([etapaId])      // NUEVO
  @@index([asignadoId])
  @@index([estado])
}

enum PrioridadTarea {  // NUEVO
  Baja
  Media
  Alta
  Urgente
}
```

### 4. Modificar Modelo Proyecto ✅

```prisma
model Proyecto {
  id                 String         @id @default(uuid()) @db.Uuid
  nombre             String         @db.VarChar(255)
  descripcion        String?
  estado             EstadoProyecto @default(Activo)
  responsableId      String         @db.Uuid
  departamentoId     String?        @db.Uuid
  fechaCreacion      DateTime       @default(now())
  fechaActualizacion DateTime       @updatedAt
  fechaEliminacion   DateTime?
  
  responsable  Usuario            @relation(fields: [responsableId], references: [id])
  departamento Departamento?      @relation(fields: [departamentoId], references: [id])
  tareas       Tarea[]
  miembros     ProyectoMiembro[]  // NUEVO
  etapas       Etapa[]            // NUEVO
}
```

### 5. Modificar Modelo Usuario ✅

```prisma
model Usuario {
  // ... campos existentes ...
  
  // Relaciones existentes
  invitaciones_enviadas     Invitacion[]
  rol                       Rol
  puestoTrabajo             PuestoTrabajo?
  supervisor                Usuario?
  subordinados              Usuario[]
  archivoCv                 Archivo?
  contactos                 UsuarioContacto[]
  enlacesProfesionales      UsuarioEnlaceProfesional[]
  habilidades               UsuarioHabilidad[]
  proyectosResponsable      Proyecto[]
  tareasAsignadas           Tarea[]
  tareasCreadas             Tarea[]
  comentarios               Comentario[]
  plantillasProyectoCreadas PlantillaProyectoIA[]
  logsQueriesIA             AiQueryLog[]
  archivosSubidos           Archivo[]
  canalesCreados            Canal[]
  miembroDeCanales          CanalMiembro[]
  mensajesEnviados          Mensaje[]
  estadosLecturaMensajes    MensajeEstadoLectura[]
  configuraciones           ConfiguracionUsuario[]
  dashboardsPropios         DashboardUsuario[]
  logros                    UsuarioLogro[]
  registrosPuntos           RegistroPuntos[]
  entradasClasificacion     ClasificacionEntrada[]
  registrosAuditoria        RegistroAuditoria[]
  sesiones                  Sesion[]
  
  // NUEVAS RELACIONES
  proyectosComoMiembro      ProyectoMiembro[]
}
```

---

## 🟡 SPRINT 2: Base de Conocimiento + Departamentos + Presupuestos ✅

**Estado:** 100% Completado | **Migración:** `20251022234553_add_budget_management`

### 1. Modelo ContextoOrganizacional (NUEVO) ✅

```prisma
model ContextoOrganizacional {
  id                    String   @id @default(uuid()) @db.Uuid
  mision                String?
  vision                String?
  objetivosEstrategicos String?
  descripcionGeneral    String?
  industria             String?  @db.VarChar(100)
  tamanoEmpresa         String?  @db.VarChar(50)
  valoresEmpresariales  String?
  fechaActualizacion    DateTime @updatedAt
  actualizadoPorId      String   @db.Uuid
  
  actualizadoPor Usuario @relation(fields: [actualizadoPorId], references: [id])
}
```

### 2. Modelo ContextoDepartamento (NUEVO) ✅

```prisma
model ContextoDepartamento {
  id                 String   @id @default(uuid()) @db.Uuid
  departamentoId     String   @unique @db.Uuid
  funciones          String?
  responsabilidades  String?
  procesosClave      String?
  objetivos          String?
  kpis               String?
  fechaActualizacion DateTime @updatedAt
  actualizadoPorId   String   @db.Uuid
  
  departamento   Departamento @relation(fields: [departamentoId], references: [id], onDelete: Cascade)
  actualizadoPor Usuario      @relation(fields: [actualizadoPorId], references: [id])
}
```

### 3. Modelo DocumentoProyecto (NUEVO) ✅

```prisma
model DocumentoProyecto {
  id                 String                @id @default(uuid()) @db.Uuid
  proyectoId         String                @db.Uuid
  tipo               TipoDocumentoProyecto
  titulo             String                @db.VarChar(255)
  contenido          String
  archivoId          String?               @db.Uuid
  fechaCreacion      DateTime              @default(now())
  fechaActualizacion DateTime              @updatedAt
  creadoPorId        String                @db.Uuid
  
  proyecto   Proyecto @relation(fields: [proyectoId], references: [id], onDelete: Cascade)
  archivo    Archivo? @relation(fields: [archivoId], references: [id])
  creadoPor  Usuario  @relation(fields: [creadoPorId], references: [id])
  
  @@index([proyectoId])
  @@index([tipo])
}

enum TipoDocumentoProyecto {
  Resumen
  Objetivos
  Especificaciones
  LeccionesAprendidas
  Documentacion
  Notas
}
```

### 4. Modificar Modelo Departamento ✅

```prisma
model Departamento {
  id               String    @id @default(uuid()) @db.Uuid
  nombre           String    @unique @db.VarChar(100)
  descripcion      String?                              // NUEVO
  color            String?   @db.VarChar(50)            // NUEVO
  jefeId           String?   @db.Uuid                   // NUEVO
  fechaCreacion    DateTime  @default(now())
  fechaEliminacion DateTime?
  
  jefe           Usuario?                      @relation("JefeDepartamento", fields: [jefeId], references: [id])  // NUEVO
  puestosTrabajo PuestoTrabajo[]
  proyectos      Proyecto[]
  invitaciones   Invitacion[]
  contexto       ContextoDepartamento?          // NUEVO
  presupuesto    PresupuestoDepartamento?       // NUEVO
}
```

### 5. Modelo PresupuestoDepartamento (NUEVO) ✅

```prisma
model PresupuestoDepartamento {
  id                   String             @id @default(uuid()) @db.Uuid
  departamentoId       String             @unique @db.Uuid
  montoTotal           Decimal            @db.Decimal(15, 2)
  montoGastado         Decimal            @default(0) @db.Decimal(15, 2)
  montoDisponible      Decimal            @db.Decimal(15, 2)
  periodo              String             @db.VarChar(50) // Ej: "2025-Q1", "2025", "Enero 2025"
  fechaInicio          DateTime
  fechaFin             DateTime
  estado               EstadoPresupuesto  @default(Activo)
  descripcion          String?
  fechaCreacion        DateTime           @default(now())
  fechaActualizacion   DateTime           @updatedAt
  creadoPorId          String             @db.Uuid
  
  departamento         Departamento       @relation(fields: [departamentoId], references: [id], onDelete: Cascade)
  creadoPor            Usuario            @relation("PresupuestosDepartamentoCreados", fields: [creadoPorId], references: [id])
  movimientos          MovimientoPresupuestoDepartamento[]
  
  @@index([departamentoId, periodo])
  @@index([estado])
}

enum EstadoPresupuesto {
  Activo
  Agotado
  Cerrado
  Suspendido
}
```

### 6. Modelo MovimientoPresupuestoDepartamento (NUEVO) ✅

```prisma
model MovimientoPresupuestoDepartamento {
  id                        String                    @id @default(uuid()) @db.Uuid
  presupuestoDepartamentoId String                    @db.Uuid
  tipo                      TipoMovimientoPresupuesto
  monto                     Decimal                   @db.Decimal(15, 2)
  descripcion               String
  categoria                 String?                   @db.VarChar(100)
  comprobante               String?                   // Número de comprobante
  archivoId                 String?                   @db.Uuid
  fechaMovimiento           DateTime                  @default(now())
  registradoPorId           String                    @db.Uuid
  
  presupuestoDepartamento   PresupuestoDepartamento   @relation(fields: [presupuestoDepartamentoId], references: [id], onDelete: Cascade)
  registradoPor             Usuario                   @relation("MovimientosDepartamentoRegistrados", fields: [registradoPorId], references: [id])
  archivo                   Archivo?                  @relation("ComprobantesDepartamento", fields: [archivoId], references: [id])
  
  @@index([presupuestoDepartamentoId])
  @@index([fechaMovimiento])
  @@index([tipo])
}

enum TipoMovimientoPresupuesto {
  Asignacion
  Gasto
  Ajuste
  Transferencia
}
```

### 7. Modelo PresupuestoProyecto (NUEVO) ✅

```prisma
model PresupuestoProyecto {
  id                   String             @id @default(uuid()) @db.Uuid
  proyectoId           String             @unique @db.Uuid
  montoTotal           Decimal            @db.Decimal(15, 2)
  montoGastado         Decimal            @default(0) @db.Decimal(15, 2)
  montoDisponible      Decimal            @db.Decimal(15, 2)
  estado               EstadoPresupuesto  @default(Activo)
  descripcion          String?
  fechaCreacion        DateTime           @default(now())
  fechaActualizacion   DateTime           @updatedAt
  creadoPorId          String             @db.Uuid
  
  proyecto             Proyecto           @relation(fields: [proyectoId], references: [id], onDelete: Cascade)
  creadoPor            Usuario            @relation("PresupuestosProyectoCreados", fields: [creadoPorId], references: [id])
  movimientos          MovimientoPresupuestoProyecto[]
  
  @@index([proyectoId])
  @@index([estado])
}
```

### 8. Modelo MovimientoPresupuestoProyecto (NUEVO) ✅

```prisma
model MovimientoPresupuestoProyecto {
  id                     String                    @id @default(uuid()) @db.Uuid
  presupuestoProyectoId  String                    @db.Uuid
  tipo                   TipoMovimientoPresupuesto
  monto                  Decimal                   @db.Decimal(15, 2)
  descripcion            String
  categoria              String?                   @db.VarChar(100)
  comprobante            String?                   // Número de comprobante
  archivoId              String?                   @db.Uuid
  fechaMovimiento        DateTime                  @default(now())
  registradoPorId        String                    @db.Uuid
  
  presupuestoProyecto    PresupuestoProyecto       @relation(fields: [presupuestoProyectoId], references: [id], onDelete: Cascade)
  registradoPor          Usuario                   @relation("MovimientosProyectoRegistrados", fields: [registradoPorId], references: [id])
  archivo                Archivo?                  @relation("ComprobantesProyecto", fields: [archivoId], references: [id])
  
  @@index([presupuestoProyectoId])
  @@index([fechaMovimiento])
  @@index([tipo])
}
```

### 9. Modificar Modelo Proyecto ✅

```prisma
model Proyecto {
  id                 String         @id @default(uuid()) @db.Uuid
  nombre             String         @db.VarChar(255)
  descripcion        String?
  estado             EstadoProyecto @default(Activo)
  responsableId      String         @db.Uuid
  departamentoId     String?        @db.Uuid
  fechaCreacion      DateTime       @default(now())
  fechaActualizacion DateTime       @updatedAt
  fechaEliminacion   DateTime?
  
  responsable  Usuario                @relation(fields: [responsableId], references: [id])
  departamento Departamento?          @relation(fields: [departamentoId], references: [id])
  tareas       Tarea[]
  miembros     ProyectoMiembro[]
  etapas       Etapa[]
  documentos   DocumentoProyecto[]
  presupuesto  PresupuestoProyecto?   // NUEVO
}
```

---

## 🟢 SPRINT 3: Inteligencia Artificial Completa

**Objetivo:** Implementar TODA la funcionalidad de IA (RF-IA01-IA05)

### 1. Modelo Idea (NUEVO)

```prisma
model Idea {
  id                 String      @id @default(uuid()) @db.Uuid
  titulo             String      @db.VarChar(255)
  descripcion        String
  categoria          String?     @db.VarChar(100)
  estado             EstadoIdea  @default(Propuesta)
  prioridad          Int         @default(0)
  viabilidad         Int?        // 1-10, calculado por IA
  creadoPorId        String      @db.Uuid
  departamentoId     String?     @db.Uuid
  analisisIA         Json?       // Resultado del análisis de IA
  fechaCreacion      DateTime    @default(now())
  fechaActualizacion DateTime    @updatedAt
  
  creadoPor    Usuario       @relation(fields: [creadoPorId], references: [id])
  departamento Departamento? @relation(fields: [departamentoId], references: [id])
  
  @@index([estado])
  @@index([creadoPorId])
  @@index([departamentoId])
}

enum EstadoIdea {
  Propuesta
  En_Revision
  Aprobada
  Rechazada
  Convertida_Proyecto
}
```

### 2. Modelo PlantillaProyectoIA (NUEVO)

```prisma
model PlantillaProyectoIA {
  id                 String   @id @default(uuid()) @db.Uuid
  nombre             String   @db.VarChar(255)
  descripcion        String?
  estructura         Json     // Estructura generada por IA (etapas, tareas)
  categoria          String?  @db.VarChar(100)
  vecesUsada         Int      @default(0)
  creadoPorId        String   @db.Uuid
  fechaCreacion      DateTime @default(now())
  fechaActualizacion DateTime @updatedAt
  
  creadoPor Usuario @relation(fields: [creadoPorId], references: [id])
  
  @@index([categoria])
  @@index([vecesUsada])
}
```

### 3. Modelo AiQueryLog (NUEVO)

```prisma
model AiQueryLog {
  id                String   @id @default(uuid()) @db.Uuid
  usuarioId         String   @db.Uuid
  query             String   // Query del usuario
  respuesta         String?  // Respuesta de la IA
  tipo              String   @db.VarChar(50) // 'search', 'generate', 'analyze', etc.
  tokensUsados      Int?
  tiempoRespuesta   Int?     // En milisegundos
  exitoso           Boolean  @default(true)
  error             String?
  fechaCreacion     DateTime @default(now())
  
  usuario Usuario @relation(fields: [usuarioId], references: [id])
  
  @@index([usuarioId])
  @@index([tipo])
  @@index([fechaCreacion])
}
```

---

## 🔵 SPRINT 4: Dashboard + Calendario + Notificaciones

### 1. Modelo Evento (NUEVO)

```prisma
model Evento {
  id                 String      @id @default(uuid()) @db.Uuid
  titulo             String      @db.VarChar(255)
  descripcion        String?
  tipo               TipoEvento
  fechaInicio        DateTime
  fechaFin           DateTime
  todoElDia          Boolean     @default(false)
  ubicacion          String?     @db.VarChar(255)
  urlReunion         String?     // Para reuniones virtuales
  proyectoId         String?     @db.Uuid
  tareaId            String?     @db.Uuid
  creadorId          String      @db.Uuid
  fechaCreacion      DateTime    @default(now())
  fechaActualizacion DateTime    @updatedAt
  
  creador       Usuario                @relation(fields: [creadorId], references: [id])
  proyecto      Proyecto?              @relation(fields: [proyectoId], references: [id])
  tarea         Tarea?                 @relation(fields: [tareaId], references: [id])
  participantes EventoParticipante[]
  
  @@index([fechaInicio])
  @@index([tipo])
  @@index([creadorId])
  @@index([proyectoId])
}

enum TipoEvento {
  Reunion
  Deadline
  Hito
  Personal
  Festivo
}
```

### 2. Modelo EventoParticipante (NUEVO)

```prisma
model EventoParticipante {
  eventoId  String          @db.Uuid
  usuarioId String          @db.Uuid
  respuesta RespuestaEvento @default(Pendiente)
  esOpcional Boolean        @default(false)
  
  evento  Evento  @relation(fields: [eventoId], references: [id], onDelete: Cascade)
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  @@id([eventoId, usuarioId])
  @@index([usuarioId])
}

enum RespuestaEvento {
  Pendiente
  Aceptado
  Rechazado
  Tentativo
}
```

### 3. Modelo Notificacion (NUEVO)

```prisma
model Notificacion {
  id                 String            @id @default(uuid()) @db.Uuid
  usuarioId          String            @db.Uuid
  tipo               TipoNotificacion
  titulo             String            @db.VarChar(255)
  mensaje            String
  leida              Boolean           @default(false)
  entidadTipo        String?           @db.VarChar(50)  // 'Proyecto', 'Tarea', etc.
  entidadId          String?           @db.Uuid
  fechaCreacion      DateTime          @default(now())
  fechaLeida         DateTime?
  
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  @@index([usuarioId, leida])
  @@index([fechaCreacion])
}

enum TipoNotificacion {
  TareaAsignada
  TareaVencida
  ComentarioNuevo
  MencionEnComentario
  ProyectoActualizado
  InvitacionProyecto
  LogroDesbloqueado
  RiesgoDetectado
  EventoProximo
  Sistema
}
```

### 4. Modelo DashboardUsuario (NUEVO)

```prisma
model DashboardUsuario {
  id                 String   @id @default(uuid()) @db.Uuid
  usuarioId          String   @db.Uuid
  nombre             String   @db.VarChar(100)
  configuracion      Json     // Layout y widgets configurados
  esDefault          Boolean  @default(false)
  fechaCreacion      DateTime @default(now())
  fechaActualizacion DateTime @updatedAt
  
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  @@index([usuarioId])
}
```

---

## 🟣 SPRINT 5: Roles + Auditoría + Gamificación + Polish

**Objetivo:** Completar TODOS los requisitos restantes (RF-ADM, RF-S, Gamificación)

### 1. Modelo Logro (NUEVO)

```prisma
model Logro {
  id                 String   @id @default(uuid()) @db.Uuid
  nombre             String   @db.VarChar(100)
  descripcion        String
  icono              String?  @db.VarChar(50)
  puntos             Int      @default(0)
  categoria          String?  @db.VarChar(50)
  condicion          Json     // Condiciones para desbloquear
  fechaCreacion      DateTime @default(now())
  
  usuariosLogros UsuarioLogro[]
  
  @@index([categoria])
}
```

### 2. Modelo UsuarioLogro (NUEVO)

```prisma
model UsuarioLogro {
  usuarioId         String   @db.Uuid
  logroId           String   @db.Uuid
  fechaDesbloqueado DateTime @default(now())
  
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  logro   Logro   @relation(fields: [logroId], references: [id], onDelete: Cascade)
  
  @@id([usuarioId, logroId])
  @@index([usuarioId])
  @@index([fechaDesbloqueado])
}
```

### 3. Modelo RegistroPuntos (NUEVO)

```prisma
model RegistroPuntos {
  id                 String   @id @default(uuid()) @db.Uuid
  usuarioId          String   @db.Uuid
  puntos             Int
  razon              String   @db.VarChar(255)
  entidadTipo        String?  @db.VarChar(50) // 'Tarea', 'Proyecto', etc.
  entidadId          String?  @db.Uuid
  fechaCreacion      DateTime @default(now())
  
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  @@index([usuarioId])
  @@index([fechaCreacion])
}
```

### 4. Modelo ClasificacionEntrada (NUEVO)

```prisma
model ClasificacionEntrada {
  id                 String   @id @default(uuid()) @db.Uuid
  usuarioId          String   @db.Uuid
  puntosTotales      Int      @default(0)
  posicion           Int
  periodo            String   @db.VarChar(50) // 'semanal', 'mensual', 'anual', 'total'
  departamentoId     String?  @db.Uuid
  fechaActualizacion DateTime @updatedAt
  
  usuario      Usuario       @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  departamento Departamento? @relation(fields: [departamentoId], references: [id])
  
  @@unique([usuarioId, periodo, departamentoId])
  @@index([periodo, posicion])
  @@index([departamentoId, periodo])
}
```

---

## 🛠️ COMANDOS DE MIGRACIÓN

### Sprint 1 ✅ (COMPLETADO)
```bash
cd xhion-core-api
npx prisma migrate dev --name add_etapas_and_project_members
npx prisma generate
```

### Sprint 2 ✅ (COMPLETADO)
```bash
npx prisma migrate dev --name add_budget_management
npx prisma generate
```
**Nota:** Esta migración incluye Base de Conocimiento + Departamentos + Presupuestos

### Sprint 3 ⏳ (PENDIENTE)
```bash
npx prisma migrate dev --name add_ai_modules
npx prisma generate
```
**Incluye:** Idea, PlantillaProyectoIA, AiQueryLog

### Sprint 4 ⏳ (PENDIENTE)
```bash
npx prisma migrate dev --name add_calendar_and_notifications
npx prisma generate
```
**Incluye:** Evento, EventoParticipante, Notificacion, DashboardUsuario

### Sprint 5 ⏳ (PENDIENTE)
```bash
npx prisma migrate dev --name add_gamification
npx prisma generate
```
**Incluye:** Logro, UsuarioLogro, RegistroPuntos, ClasificacionEntrada

---

## 📊 ESTADÍSTICAS DEL SCHEMA

### Modelos Totales por Sprint
- **Sprint 1:** 2 nuevos + 3 modificados = **5 modelos** ✅
- **Sprint 2:** 7 nuevos + 2 modificados = **9 modelos** ✅
- **Sprint 3:** 3 nuevos = **3 modelos** ⏳
- **Sprint 4:** 4 nuevos = **4 modelos** ⏳
- **Sprint 5:** 4 nuevos = **4 modelos** ⏳

**Total:** 20 nuevos modelos + 5 modificados = **25 cambios**

### Enums Agregados
- **Sprint 1:** EstadoEtapa, RolProyecto, PrioridadTarea (3)
- **Sprint 2:** TipoDocumentoProyecto, EstadoPresupuesto, TipoMovimientoPresupuesto (3)
- **Sprint 3:** EstadoIdea (1)
- **Sprint 4:** TipoEvento, RespuestaEvento, TipoNotificacion (3)

**Total:** 10 enums

### Índices Críticos
- ✅ Todos los campos de búsqueda frecuente tienen índices
- ✅ Índices compuestos para queries complejas
- ✅ Índices en foreign keys para performance

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Migraciones en Producción
- **Backup** de BD antes de cada migración
- Ejecutar en horario de bajo tráfico
- Tener plan de rollback preparado
- Probar primero en staging

### 2. Datos Existentes
- Sprint 2: Requiere seed de contexto organizacional inicial
- Sprint 3: Requiere seed de plantillas IA básicas
- Sprint 5: Requiere seed de logros predefinidos
- Verificar integridad referencial post-migración

### 3. Performance
- Todos los índices críticos están incluidos
- Considerar particionamiento para tablas grandes (AiQueryLog, RegistroAuditoria)
- Monitorear query performance post-migración
- Implementar archivado de datos antiguos

### 4. Relaciones Circulares
- Departamento ↔ Usuario (jefe)
- Usuario ↔ Usuario (supervisor)
- Usar `@relation(name: "...")` para disambiguar
- Usar `onDelete: NoAction` donde sea necesario

### 5. Campos JSON
- `analisisIA` en Idea
- `estructura` en PlantillaProyectoIA
- `configuracion` en DashboardUsuario
- `condicion` en Logro
- Validar estructura en capa de aplicación

---

## 📝 CHECKLIST PRE-MIGRACIÓN

### Antes de Migrar
- [ ] Backup de base de datos completo
- [ ] Revisar schema completo en Prisma Studio
- [ ] Verificar nombres de campos (camelCase)
- [ ] Verificar tipos de datos (Decimal para dinero)
- [ ] Verificar índices en campos de búsqueda
- [ ] Verificar relaciones y cascadas (onDelete)
- [ ] Probar en ambiente de desarrollo local
- [ ] Probar en ambiente de staging

### Después de Migrar
- [ ] Ejecutar `npx prisma generate`
- [ ] Actualizar DTOs en backend (NestJS)
- [ ] Actualizar tipos en frontend (TypeScript)
- [ ] Actualizar documentación de API (Swagger)
- [ ] Ejecutar seeds si es necesario
- [ ] Verificar integridad de datos
- [ ] Ejecutar tests de integración
- [ ] Monitorear logs de errores

---

## 🎯 PROGRESO ACTUAL

**Sprint 1:** ✅ 100% Completado  
**Sprint 2:** ✅ 100% Completado  
**Sprint 3:** ⏳ 0% Pendiente  
**Sprint 4:** ⏳ 0% Pendiente  
**Sprint 5:** ⏳ 0% Pendiente  

**Total Schema:** 40% Completado (10/25 modelos)

---

**Última Actualización:** 23 de Octubre, 2025  
**Versión:** 2.0 (Actualizado según Plan de 10 Semanas)  
**Desarrollado por:** Eduardo Tanca
