# 🚀 FASE 2: MEJORAS CRÍTICAS - PLAN EJECUTIVO

**Fecha:** 9 Nov 2025 | **Duración:** 8-10 semanas | **Prioridad:** ALTA

---

## 📊 RESUMEN

5 módulos críticos basados en análisis de necesidades del gerente:

1. **Recursos/Inventario** (4 sem) - Materiales, software, hardware
2. **Finanzas Mejorado** (5 sem) - Control financiero y rentabilidad
3. **Post-Mortem** (2 sem) - Lecciones aprendidas + IA
4. **Tiempo Real** (3 sem) - Dashboard de actividad del equipo
5. **Integración Notion** (2 sem) - Sincronización bidireccional

**Total:** 16 semanas (paralelo) → 10 semanas (secuencial optimizado)

---

## 🎯 OBJETIVOS

- ✅ Satisfacer necesidades inmediatas (Presupuesto, Materiales, Resultados)
- ✅ Superar expectativas (Tiempo Real, IA Estratégica)
- ✅ Integrar herramientas existentes (Notion)
- ✅ Transformar en herramienta de inteligencia de negocios

---

## 📦 MÓDULO 1: RECURSOS/INVENTARIO (4 semanas)

### Schema Principal
```prisma
model Recurso {
  id                 String            @id @default(uuid())
  nombre             String
  tipo               TipoRecurso       // Software, Hardware, Material, Espacio, Humano
  stockActual        Int
  stockMinimo        Int?
  costoUnitario      Decimal?
  estado             EstadoRecurso
  asignaciones       AsignacionRecurso[]
  movimientos        MovimientoRecurso[]
}

model AsignacionRecurso {
  id                 String      @id @default(uuid())
  recursoId          String
  cantidad           Int
  departamentoId     String?
  proyectoId         String?
  fechaInicio        DateTime
  fechaFin           DateTime?
  activa             Boolean
}
```

### Endpoints (15)
- CRUD recursos
- Inventario y alertas
- Asignaciones
- Movimientos
- Reportes

### UI Principal
- RecursosPage con tabla filtrable
- Alertas de stock bajo
- Modales de asignación
- Dashboard de costos

---

## 💰 MÓDULO 2: FINANZAS MEJORADO (5 semanas)

### Schema Principal
```prisma
model IngresoProyecto {
  id                 String         @id @default(uuid())
  proyectoId         String
  fuente             FuenteIngreso  // Ventas, Servicios, Publicidad
  monto              Decimal
  fechaIngreso       DateTime
}

model GastoProyecto {
  id                 String         @id @default(uuid())
  proyectoId         String
  categoria          CategoriaGasto // Personal, Software, Hardware
  monto              Decimal
  fechaGasto         DateTime
}

model PresupuestoDepartamento {
  id                 String         @id @default(uuid())
  departamentoId     String
  año                Int
  montoTotal         Decimal
  montoGastado       Decimal
}
```

### Funcionalidades Clave
- Registro de ingresos/gastos
- Análisis de rentabilidad (ROI, margen)
- Comparativa de proyectos
- Dashboard financiero ejecutivo
- Alertas de desviación presupuestaria

### UI Principal
- FinancialDashboard con KPIs
- Gráficos de ingresos vs gastos
- Top proyectos rentables
- Estado de resultados

---

## 📝 MÓDULO 3: POST-MORTEM (2 semanas)

### Schema Principal
```prisma
model PostMortem {
  id                    String    @id @default(uuid())
  proyectoId            String?
  etapaId               String?
  objetivosCumplidos    NivelCumplimiento
  resultadosObtenidos   String
  quesFuncionoBien      String
  quesNoFunciono        String
  leccionesAprendidas   String
  recomendaciones       String
  embeddings            Json?     // Para IA
  tags                  String[]
}
```

### Flujo
1. Usuario marca proyecto/etapa como "Completado"
2. Sistema muestra formulario de post-mortem
3. Respuestas se guardan en KB
4. IA usa embeddings para búsqueda semántica
5. Al crear proyecto similar, IA sugiere lecciones

### UI Principal
- Modal de post-mortem (obligatorio)
- Dashboard de lecciones aprendidas
- Búsqueda semántica de experiencias
- Reportes de mejora continua

---

## ⏱️ MÓDULO 4: TIEMPO REAL (3 semanas)

### Schema Principal
```prisma
model ActividadUsuario {
  id                 String    @id @default(uuid())
  usuarioId          String
  tareaId            String?
  accion             TipoAccion // Inicio, Pausa, Fin
  timestamp          DateTime
  duracionMinutos    Int?
}

model SesionTrabajo {
  id                 String    @id @default(uuid())
  usuarioId          String
  tareaId            String
  inicio             DateTime
  fin                DateTime?
  activa             Boolean
}
```

### Funcionalidades
- Botón "Empezar Tarea" en header
- Dashboard "¿Qué están haciendo ahora?"
- Tracking de tiempo por tarea
- Reportes de productividad
- Heatmap de actividad semanal

### UI Principal
- Widget "Actividad en Tiempo Real"
- Lista de usuarios con tarea actual
- Cronómetro de sesión activa
- Gráficos de productividad

---

## 🔗 MÓDULO 5: INTEGRACIÓN NOTION (2 semanas)

### Arquitectura
```
XHION Core ←→ Notion API
   ↓              ↓
Sincronización Bidireccional
   ↓              ↓
Timeline      Databases
Calendario    Pages
Tareas        Tasks
```

### Funcionalidades
- Importar tareas de Notion
- Sincronizar estados
- Mostrar en Timeline/Calendario
- Actualización bidireccional
- Mapeo de usuarios

### Endpoints
```typescript
@Post('notion/sync')
sincronizarNotion()

@Get('notion/databases')
obtenerDatabasesNotion()

@Post('notion/import-tasks')
importarTareasNotion(@Body() dto: ImportNotionDto)
```

---

## 📅 CRONOGRAMA OPTIMIZADO

### Semanas 1-4: Recursos/Inventario
- S1: Schema + Backend CRUD
- S2: Backend asignaciones + movimientos
- S3: Frontend componentes
- S4: Testing + refinamiento

### Semanas 3-7: Finanzas (Paralelo desde S3)
- S3-4: Schema + Backend ingresos/gastos
- S5-6: Backend análisis + reportes
- S6-7: Frontend dashboard
- S7: Testing

### Semanas 5-6: Post-Mortem (Paralelo desde S5)
- S5: Schema + Backend + IA embeddings
- S6: Frontend modal + dashboard

### Semanas 7-9: Tiempo Real (Paralelo desde S7)
- S7: Schema + Backend tracking
- S8: WebSockets + Frontend widget
- S9: Dashboard + reportes

### Semanas 8-9: Notion (Paralelo desde S8)
- S8: Integración API + sincronización
- S9: Frontend + testing

### Semana 10: Testing Final + Deployment

---

## 🎯 MÉTRICAS DE ÉXITO

| Módulo | Métrica | Objetivo |
|--------|---------|----------|
| Recursos | Adopción departamentos | 100% |
| Finanzas | Proyectos con presupuesto | 90%+ |
| Post-Mortem | Tasa de completado | 80%+ |
| Tiempo Real | Tareas trackeadas | 90%+ |
| Notion | Sincronización exitosa | 95%+ |

---

## 🚀 PRÓXIMOS PASOS

1. **Aprobar plan** con gerente
2. **Priorizar módulos** (sugerencia: Finanzas → Recursos → Tiempo Real → Post-Mortem → Notion)
3. **Asignar equipo** (Eduardo + Omar)
4. **Iniciar Sprint 1** (Finanzas - Schema + Backend)

---

## 📚 DOCUMENTACIÓN TÉCNICA

Cada módulo tendrá:
- ✅ Especificación técnica detallada
- ✅ Diagramas de arquitectura
- ✅ Documentación API (Swagger)
- ✅ Guías de usuario
- ✅ Tests unitarios + E2E

---

**Estado:** ✅ PLAN COMPLETO - LISTO PARA EJECUCIÓN
