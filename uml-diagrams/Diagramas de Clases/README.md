# 📊 DIAGRAMAS UML DE CLASES - XHION CORE

**Plataforma de Productividad Operativa v1.8**  
**Autor:** Eduardo Tanca  
**Fecha:** 29 de Octubre, 2025  
**Estado:** ✅ Completado

---

## 🔄 ACTUALIZACIÓN IMPORTANTE (29/Oct/2025)

**Cambios aplicados:**
- ✅ Eliminadas todas las relaciones con cardinalidad (1, 0..*, etc.)
- ✅ Reemplazadas por asociaciones simples con roles descriptivos
- ✅ Enumeraciones ahora usan relaciones de dependencia (<<use>>)
- ✅ Tablas pivot claramente identificadas
- ✅ Relaciones bidireccionales convertidas a unidireccionales
- ✅ Cumplimiento estricto con estándares UML de clases

---

## 🎯 INTRODUCCIÓN

Este directorio contiene los **diagramas UML de clases** completos del sistema XHION CORE, una plataforma empresarial de productividad operativa. Los diagramas están organizados por módulos funcionales y siguen los estándares UML 2.5.

### **Propósito:**
- Documentar la arquitectura del sistema
- Facilitar el entendimiento de relaciones entre entidades
- Servir como referencia para desarrollo
- Apoyar el onboarding de nuevos desarrolladores

### **Tecnologías Documentadas:**
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React 19 + TypeScript + Zustand
- **Autenticación:** JWT + Refresh Tokens
- **IA:** Gemini API (integración planificada)

---

## 🗂️ ESTRUCTURA DE DIAGRAMAS

### **Diagrama Completo:**
- `XHION-CORE-COMPLETE.puml` - Vista general de todo el sistema

### **Diagramas Modulares:**
1. `01-MODULO-ORGANIZACIONAL.puml` - Departamentos, Usuarios, Roles
2. `02-MODULO-PROYECTOS-TAREAS.puml` - Proyectos, Tareas, Etapas
3. `03-MODULO-PRESUPUESTOS.puml` - Gestión Financiera
4. `04-MODULO-CONOCIMIENTO.puml` - Base de Conocimiento
5. `05-MODULO-SEGURIDAD.puml` - RBAC y Auditoría

---

## 🎨 CONVENCIONES Y ESTÁNDARES

### **Colores:**
- 🟢 **Verde (#E8F5E9):** Entidades principales
- 🟡 **Amarillo (#FFF9C4):** Enumeraciones
- 🔵 **Azul (#E1F5FE):** Tablas pivote

### **Notación:**
```
+ público
- privado
# protegido
~ package

<<PK>> Primary Key
<<FK>> Foreign Key
<<unique>> Restricción única
```

### **Relaciones (Corregidas):**

**Asociaciones Simples:**
```plantuml
ClaseA --> ClaseB : rol descriptivo
```
- Flecha simple unidireccional
- Sin cardinalidad (eliminada según estándares UML de clases)
- Rol descriptivo que explica la relación

**Dependencias (Enumeraciones):**
```plantuml
Clase ..> Enumeracion : <<use>>
```
- Línea punteada para dependencias
- Estereotipo `<<use>>` para enumeraciones

**Ejemplos:**
```plantuml
' ✅ CORRECTO - Asociación simple
Proyecto --> Usuario : responsable
Departamento --> PuestoTrabajo : contiene

' ✅ CORRECTO - Dependencia
Usuario ..> EstadoUsuario : <<use>>

' ❌ INCORRECTO - No usar cardinalidad
Proyecto "1" -- "0..*" Tarea : contiene
```

### **Estereotipos:**
- `<<entity>>` - Entidad de dominio
- `<<enumeration>>` - Tipo enumerado
- `<<pivot>>` - Tabla de relación muchos a muchos
- `<<use>>` - Dependencia de uso (para enumeraciones)

---

## 📚 DIAGRAMAS DISPONIBLES

### **1. XHION-CORE-COMPLETE.puml**

**Descripción:** Vista panorámica de todo el sistema

**Módulos incluidos:**
- ✅ Núcleo Organizacional
- ✅ Proyectos y Tareas
- ✅ Presupuestos
- ✅ Base de Conocimiento
- ✅ Seguridad y Permisos
- ✅ Archivos

**Entidades:** 20+  
**Relaciones:** 50+  
**Enumeraciones:** 10+

**Ideal para:**
- Vista general del sistema
- Presentaciones ejecutivas
- Documentación de alto nivel

---

### **2. 01-MODULO-ORGANIZACIONAL.puml**

**Descripción:** Gestión de la estructura organizacional

**Entidades principales:**
- `Departamento` - Unidades organizacionales
- `Usuario` - Perfiles de empleados
- `Rol` - Roles y permisos
- `PuestoTrabajo` - Catálogo de puestos
- `Invitacion` - Sistema de invitaciones
- `Sesion` - Gestión de sesiones

**Características destacadas:**
- ✅ Jerarquía de supervisión (Usuario → Usuario)
- ✅ Sistema de invitaciones con doble flujo
- ✅ Perfil profesional completo (habilidades, contactos, enlaces)
- ✅ Gestión de sesiones con refresh tokens
- ✅ Puntaje de completitud de perfil

**Relaciones clave:**
- Usuario supervisa a otros usuarios
- Departamento tiene un jefe (Usuario)
- Usuario tiene un rol con permisos
- Usuario ocupa un puesto de trabajo

---

### **3. 02-MODULO-PROYECTOS-TAREAS.puml**

**Descripción:** Gestión de proyectos y tareas

**Entidades principales:**
- `Proyecto` - Proyectos de la organización
- `Tarea` - Unidades de trabajo
- `Etapa` - Fases del proyecto (Kanban)
- `Comentario` - Comunicación en tareas
- `ProyectoMiembro` - Miembros del proyecto

**Características destacadas:**
- ✅ Sistema Kanban con etapas personalizables
- ✅ Priorización de tareas (Baja, Media, Alta, Urgente)
- ✅ Roles en proyecto (Responsable, Miembro, Observador)
- ✅ Comentarios colaborativos
- ✅ Resumen generado por IA
- ✅ Soft delete en proyectos y tareas

**Flujo de trabajo:**
```
Proyecto → Etapas → Tareas → Comentarios
```

---

### **4. 03-MODULO-PRESUPUESTOS.puml**

**Descripción:** Gestión financiera de departamentos y proyectos

**Entidades principales:**
- `PresupuestoDepartamento` - Presupuesto departamental
- `MovimientoPresupuestoDepartamento` - Transacciones
- `PresupuestoProyecto` - Presupuesto de proyecto
- `MovimientoPresupuestoProyecto` - Transacciones

**Características destacadas:**
- ✅ Presupuestos por período (mensual, trimestral, anual)
- ✅ Cálculo automático de disponible
- ✅ 4 tipos de movimiento (Asignación, Gasto, Ajuste, Transferencia)
- ✅ Categorización de gastos
- ✅ Comprobantes adjuntos
- ✅ Estados (Activo, Agotado, Cerrado, Suspendido)

**Categorías comunes:**
- **Departamento:** Salarios, Equipamiento, Marketing, Capacitación
- **Proyecto:** Desarrollo, Infraestructura, Licencias, Testing

---

### **5. 04-MODULO-CONOCIMIENTO.puml**

**Descripción:** Base de conocimiento organizacional

**Entidades principales:**
- `ContextoOrganizacional` - Contexto global de la empresa
- `ContextoDepartamento` - Contexto por departamento
- `DocumentoProyecto` - Documentos de proyecto
- `DocumentoDepartamento` - Documentos de departamento
- `Archivo` - Sistema de archivos

**Características destacadas:**
- ✅ Contexto organizacional único (misión, visión, valores)
- ✅ Contexto por departamento (funciones, KPIs, procesos)
- ✅ 6 tipos de documentos (Resumen, Objetivos, Especificaciones, etc.)
- ✅ Búsqueda por contenido
- ✅ Resumen generado por IA
- ✅ Archivos adjuntos
- ✅ Cálculo de completitud

**Alimenta a:**
- Sistema de IA (Gemini API)
- Búsqueda semántica
- Generación de plantillas

---

### **6. 05-MODULO-SEGURIDAD.puml**

**Descripción:** RBAC, permisos y auditoría

**Entidades principales:**
- `Permiso` - Catálogo de permisos
- `Rol` - Roles del sistema
- `RolPermiso` - Asignación de permisos
- `RegistroAuditoria` - Trazabilidad de acciones

**Características destacadas:**
- ✅ 47 permisos granulares en 10 módulos
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Auditoría inmutable de acciones
- ✅ Tracking de IP y timestamp
- ✅ Detalles en JSON
- ✅ Búsqueda y exportación

**Permisos por módulo:**
- Proyectos: 8 permisos
- Tareas: 8 permisos
- Departamentos: 6 permisos
- Presupuestos: 6 permisos
- Conocimiento: 4 permisos
- Usuarios: 6 permisos
- Roles: 5 permisos
- Auditoría: 2 permisos
- Sistema: 3 permisos
- Invitaciones: 3 permisos

**Formato de permisos:** `modulo.accion`  
**Ejemplo:** `proyectos.crear`, `tareas.asignar`

---

## 🖥️ CÓMO VISUALIZAR

### **Opción 1: PlantUML en VS Code**

1. Instalar extensión: **PlantUML** (jebbs.plantuml)
2. Abrir archivo `.puml`
3. Presionar `Alt + D` para preview

### **Opción 2: PlantUML Online**

1. Visitar: https://www.plantuml.com/plantuml/uml/
2. Copiar contenido del archivo `.puml`
3. Pegar y visualizar

### **Opción 3: Generar Imágenes**

```bash
# Instalar PlantUML
npm install -g node-plantuml

# Generar PNG
puml generate *.puml --png

# Generar SVG
puml generate *.puml --svg
```

---

## 📊 MÉTRICAS DEL SISTEMA

### **Estadísticas Generales:**

| Categoría | Cantidad |
|-----------|----------|
| **Modelos/Entidades** | 42 |
| **Enumeraciones** | 15 |
| **Tablas Pivote** | 5 |
| **Relaciones** | 80+ |
| **Campos Totales** | 350+ |

### **Por Módulo:**

| Módulo | Entidades | Enumeraciones | Relaciones |
|--------|-----------|---------------|------------|
| Organizacional | 10 | 5 | 25 |
| Proyectos/Tareas | 5 | 4 | 15 |
| Presupuestos | 4 | 2 | 10 |
| Conocimiento | 5 | 2 | 8 |
| Seguridad | 3 | 0 | 5 |
| Otros | 15 | 2 | 17 |

### **Complejidad:**

- **Entidad más compleja:** `Usuario` (30+ campos, 20+ relaciones)
- **Módulo más grande:** Organizacional (10 entidades)
- **Relaciones más complejas:** Usuario ↔ Proyecto ↔ Tarea

---

## 🔗 RELACIONES PRINCIPALES

### **Usuario (Hub Central):**
```
Usuario
├── supervisa → Usuario[]
├── pertenece a → Departamento
├── tiene → Rol
├── ocupa → PuestoTrabajo
├── responsable de → Proyecto[]
├── miembro de → ProyectoMiembro[]
├── asignado a → Tarea[]
├── crea → Tarea[]
├── comenta → Comentario[]
├── invita → Invitacion[]
├── sube → Archivo[]
└── genera → RegistroAuditoria[]
```

### **Proyecto (Unidad de Trabajo):**
```
Proyecto
├── pertenece a → Departamento
├── responsable → Usuario
├── contiene → Tarea[]
├── organizado en → Etapa[]
├── tiene → ProyectoMiembro[]
├── documenta → DocumentoProyecto[]
└── presupuesto → PresupuestoProyecto
```

### **Departamento (Unidad Organizacional):**
```
Departamento
├── jefe → Usuario
├── tiene → PuestoTrabajo[]
├── gestiona → Proyecto[]
├── contexto → ContextoDepartamento
├── presupuesto → PresupuestoDepartamento
└── documenta → DocumentoDepartamento[]
```

---

## 📝 NOTAS IMPORTANTES

### **Eliminación Lógica:**
Entidades con `fechaEliminacion`:
- Usuario
- Departamento
- Rol
- Proyecto
- Tarea
- Archivo
- DashboardUsuario

### **Campos de Auditoría:**
Todas las entidades principales incluyen:
- `fechaCreacion` - Timestamp de creación
- `fechaActualizacion` - Timestamp de última modificación

### **Relaciones Polimórficas:**
- `ArchivoAdjunto` - Adjunta archivos a múltiples entidades
- `Canal` - Asocia canales a diferentes entidades

### **Índices Importantes:**
```sql
-- Proyectos
INDEX(proyectoId)
INDEX(departamentoId)

-- Tareas
INDEX(proyectoId, estado)
INDEX(asignadoId)
INDEX(etapaId)
INDEX(prioridad)

-- Presupuestos
INDEX(departamentoId, periodo)
INDEX(estado)
INDEX(fechaMovimiento)
```

---

## 🚀 PRÓXIMOS PASOS

### **Módulos Pendientes de Diagrama:**
- [ ] Módulo de IA (Gemini API)
- [ ] Módulo de Mensajería
- [ ] Módulo de Gamificación
- [ ] Módulo de Dashboards
- [ ] Módulo de Configuración

### **Mejoras Planificadas:**
- [ ] Diagramas de secuencia
- [ ] Diagramas de casos de uso
- [ ] Diagramas de componentes
- [ ] Diagramas de despliegue

---

## 📖 REFERENCIAS

- **Prisma Schema:** `xhion-core-api/prisma/schema.prisma`
- **Documentación UML:** https://plantuml.com/
- **Estándar UML:** UML 2.5 Specification

---

## ✅ VALIDACIÓN

**Diagramas validados contra:**
- ✅ Schema de Prisma v1.8
- ✅ Modelos de NestJS
- ✅ Base de datos PostgreSQL
- ✅ Estándares UML 2.5

**Última actualización:** 29 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** Producción

---

**Desarrollado por:** Eduardo Tanca  
**Proyecto:** XHION CORE - Plataforma de Productividad Operativa
