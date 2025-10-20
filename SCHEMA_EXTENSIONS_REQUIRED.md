# 🗄️ EXTENSIONES REQUERIDAS AL SCHEMA DE PRISMA

**Archivo:** `xhion-core-api/prisma/schema.prisma`  
**Prioridad:** CRÍTICA - Requerido para Sprint 1

---

## 📋 RESUMEN DE CAMBIOS

| Modelo | Acción | Prioridad | Sprint |
|--------|--------|-----------|--------|
| Etapa | **CREAR** | CRÍTICA | 1 |
| ProyectoMiembro | **CREAR** | CRÍTICA | 1 |
| Tarea | **MODIFICAR** | CRÍTICA | 1 |
| Proyecto | **MODIFICAR** | CRÍTICA | 1 |
| Usuario | **MODIFICAR** | CRÍTICA | 1 |
| ContextoOrganizacional | **CREAR** | ALTA | 2 |
| ContextoDepartamento | **CREAR** | ALTA | 2 |
| DocumentoProyecto | **CREAR** | ALTA | 2 |
| Departamento | **MODIFICAR** | MEDIA | 2 |
| Idea | **CREAR** | MEDIA | 4 |
| Evento | **CREAR** | ALTA | 5 |
| EventoParticipante | **CREAR** | ALTA | 5 |
| Notificacion | **CREAR** | MEDIA | 5 |

---

## 🔴 SPRINT 1: Modelos Críticos

### 1. Modelo Etapa (NUEVO)

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

### 2. Modelo ProyectoMiembro (NUEVO)

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

### 3. Modificar Modelo Tarea

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

### 4. Modificar Modelo Proyecto

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

### 5. Modificar Modelo Usuario

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

## 🟡 SPRINT 2: Base de Conocimiento

### 1. Modelo ContextoOrganizacional (NUEVO)

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

### 2. Modelo ContextoDepartamento (NUEVO)

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

### 3. Modelo DocumentoProyecto (NUEVO)

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

### 4. Modificar Modelo Departamento

```prisma
model Departamento {
  id               String    @id @default(uuid()) @db.Uuid
  nombre           String    @unique @db.VarChar(100)
  descripcion      String?                              // NUEVO
  color            String?   @db.VarChar(50)            // NUEVO
  jefeId           String?   @db.Uuid                   // NUEVO
  fechaCreacion    DateTime  @default(now())
  fechaEliminacion DateTime?
  
  jefe           Usuario?              @relation("JefeDepartamento", fields: [jefeId], references: [id])  // NUEVO
  puestosTrabajo PuestoTrabajo[]
  proyectos      Proyecto[]
  invitaciones   Invitacion[]
  contexto       ContextoDepartamento?  // NUEVO
}
```

---

## 🟢 SPRINT 4: Ideas con IA

### Modelo Idea (NUEVO)

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

---

## 🔵 SPRINT 5: Calendario y Notificaciones

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

---

## 🛠️ COMANDOS DE MIGRACIÓN

### Sprint 1
```bash
cd xhion-core-api
npx prisma migrate dev --name add_etapas_and_project_members
npx prisma generate
```

### Sprint 2
```bash
npx prisma migrate dev --name add_knowledge_base
npx prisma generate
```

### Sprint 4
```bash
npx prisma migrate dev --name add_ideas_module
npx prisma generate
```

### Sprint 5
```bash
npx prisma migrate dev --name add_events_and_notifications
npx prisma generate
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Migraciones en Producción
- **Backup** de BD antes de cada migración
- Ejecutar en horario de bajo tráfico
- Tener plan de rollback preparado

### 2. Datos Existentes
- Algunas migraciones pueden requerir seeds
- Verificar integridad referencial
- Actualizar datos legacy si es necesario

### 3. Performance
- Todos los índices críticos están incluidos
- Considerar particionamiento para tablas grandes
- Monitorear query performance post-migración

### 4. Relaciones Circulares
- Departamento ↔ Usuario (jefe)
- Usuario ↔ Usuario (supervisor)
- Usar `onDelete: NoAction` donde sea necesario

---

## 📝 CHECKLIST PRE-MIGRACIÓN

- [ ] Backup de base de datos
- [ ] Revisar schema completo
- [ ] Verificar nombres de campos (camelCase)
- [ ] Verificar tipos de datos
- [ ] Verificar índices
- [ ] Verificar relaciones y cascadas
- [ ] Probar en ambiente de desarrollo
- [ ] Documentar cambios
- [ ] Actualizar DTOs en backend
- [ ] Actualizar tipos en frontend
