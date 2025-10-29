# 📊 DIAGRAMA DE CASOS DE USO - XHION CORE

**Versión:** 1.8  
**Fecha:** 29 de Octubre, 2025  
**Autor:** Eduardo Tanca  
**Estado:** ✅ Completo

---

## 🎯 DESCRIPCIÓN GENERAL

Este diagrama UML de Casos de Uso representa la funcionalidad completa del sistema **XHION CORE**, una plataforma de productividad operativa empresarial que integra gestión de proyectos, tareas, departamentos, presupuestos, conocimiento y más.

---

## 👥 ACTORES DEL SISTEMA

### **Actores Humanos:**

1. **Usuario Invitado** - Persona que recibe una invitación para unirse al sistema
2. **Usuario Autenticado** - Usuario con sesión activa en el sistema
3. **Miembro de Proyecto** - Usuario asignado a uno o más proyectos
4. **Responsable de Proyecto** - Usuario con permisos de gestión sobre proyectos
5. **Jefe de Departamento** - Usuario que lidera un departamento
6. **Administrador** - Usuario con permisos completos del sistema

### **Actores del Sistema:**

7. **Sistema de Auditoría** - Registra automáticamente eventos críticos
8. **Sistema de Notificaciones** - Envía notificaciones a usuarios

### **Jerarquía de Actores:**

```
Usuario Autenticado
├── Miembro de Proyecto
│   └── Responsable de Proyecto
├── Jefe de Departamento
└── Administrador
```

---

## 📦 MÓDULOS DEL SISTEMA

### **1. Autenticación y Sesiones (8 casos de uso)**
- Gestión completa de sesiones de usuario
- JWT con refresh tokens
- Historial y control de sesiones activas

### **2. Gestión de Usuarios (12 casos de uso)**
- Sistema de invitaciones con doble flujo
- CRUD completo de usuarios
- Estadísticas de invitaciones

### **3. Roles y Permisos (9 casos de uso)**
- 47 permisos granulares
- Gestión de roles personalizados
- Validación automática de permisos

### **4. Gestión de Proyectos (14 casos de uso)**
- CRUD completo de proyectos
- Gestión de miembros y responsables
- Exportación y duplicación

### **5. Gestión de Tareas (16 casos de uso)**
- Creación y asignación de tareas
- Sistema Kanban con drag & drop
- Comentarios y adjuntos

### **6. Gestión de Etapas (7 casos de uso)**
- Organización de tareas por etapas
- Reordenamiento y progreso

### **7. Gestión de Departamentos (13 casos de uso)**
- Estructura organizacional
- Organigrama interactivo
- Puestos de trabajo

### **8. Gestión de Presupuestos (11 casos de uso)**
- Presupuestos por departamento y proyecto
- Registro de movimientos
- Alertas y balances

### **9. Gestión de Conocimiento (10 casos de uso)**
- Base de conocimiento compartida
- Categorización y búsqueda
- Versionamiento

### **10. Documentos de Proyecto (8 casos de uso)**
- 6 tipos de documentos
- Historial de versiones
- Búsqueda y filtros

### **11. Auditoría y Trazabilidad (8 casos de uso)**
- Registro automático de eventos
- Filtros y búsqueda avanzada
- Exportación de auditoría

### **12. Dashboard y Estadísticas (9 casos de uso)**
- Dashboard personalizable
- Gráficos de rendimiento
- Reportes exportables

### **13. Calendario y Planificación (9 casos de uso)**
- Calendario integrado
- Eventos y hitos
- Sincronización

### **14. Ideas e Innovación (9 casos de uso)**
- Sistema de ideas colaborativo
- Votación y comentarios
- Conversión a proyectos

### **15. Configuración del Sistema (8 casos de uso)**
- Parámetros del sistema
- Gestión de catálogos
- Backups y seguridad

### **16. Perfil de Usuario (8 casos de uso)**
- Gestión de perfil personal
- Preferencias y configuración
- Actividad personal

### **17. Insights con IA (7 casos de uso)**
- Análisis predictivo
- Recomendaciones inteligentes
- Optimización de recursos

---

## 📊 ESTADÍSTICAS DEL SISTEMA

| Categoría | Cantidad |
|-----------|----------|
| **Total de Casos de Uso** | 157 |
| **Módulos Funcionales** | 17 |
| **Actores Humanos** | 6 |
| **Actores del Sistema** | 2 |
| **Relaciones Include** | 12 |
| **Relaciones Extend** | 5 |
| **Notificaciones Automáticas** | 15 |
| **Eventos de Auditoría** | 18 |

---

## 🔗 TIPOS DE RELACIONES

### **Include (<<include>>)**
Relación obligatoria donde un caso de uso siempre ejecuta otro:
- Iniciar Sesión → Validar Credenciales
- Iniciar Sesión → Generar JWT
- Aceptar Invitación → Validar Token
- Ver Detalle de Proyecto → Ver Estadísticas

### **Extend (<<extend>>)**
Relación opcional que extiende funcionalidad:
- Ver Tareas → Filtrar Tareas
- Ver Proyectos → Filtrar Proyectos
- Ver Artículos → Buscar en Base de Conocimiento

### **Notify (<<notify>>)**
Relación con actores del sistema:
- Operaciones críticas → Sistema de Auditoría
- Asignaciones y cambios → Sistema de Notificaciones

---

## 🎨 CONVENCIONES DEL DIAGRAMA

### **Colores por Módulo:**
- 🔵 **Azul claro** - Autenticación
- 🟢 **Verde claro** - Usuarios
- 🟡 **Amarillo claro** - Roles y Permisos
- 🔴 **Coral** - Proyectos
- 🟠 **Salmón** - Tareas
- 🟣 **Lavanda** - Etapas
- 🌸 **Rosa claro** - Departamentos
- 🔷 **Cian claro** - Presupuestos
- 🟨 **Amarillo dorado** - Conocimiento
- 🌺 **Cardo** - Documentos

### **Iconografía:**
- `<<Usuario>>` - Actor humano
- `<<Sistema>>` - Actor automatizado
- `<<include>>` - Relación obligatoria
- `<<extend>>` - Relación opcional
- `<<notify>>` - Notificación al sistema

---

## 📋 CASOS DE USO PRINCIPALES

### **Top 10 Casos de Uso Más Utilizados:**

1. **Iniciar Sesión** (UC01) - Punto de entrada al sistema
2. **Ver Dashboard Principal** (UC200) - Pantalla principal
3. **Ver Tareas** (UC71) - Gestión diaria
4. **Ver Proyectos** (UC51) - Seguimiento de proyectos
5. **Crear Tarea** (UC70) - Acción más frecuente
6. **Cambiar Estado de Tarea** (UC76) - Actualización de progreso
7. **Ver Perfil** (UC280) - Información personal
8. **Comentar en Tarea** (UC78) - Colaboración
9. **Ver Calendario** (UC220) - Planificación
10. **Buscar Tareas** (UC82) - Navegación rápida

---

## 🔒 SEGURIDAD Y PERMISOS

### **Permisos Requeridos por Módulo:**

| Módulo | Permiso Base | Acciones |
|--------|--------------|----------|
| Proyectos | `proyectos.*` | crear, ver, editar, eliminar, archivar |
| Tareas | `tareas.*` | crear, ver, editar, eliminar, asignar |
| Usuarios | `usuarios.*` | crear, ver, editar, eliminar, invitar |
| Roles | `roles.*` | crear, ver, editar, eliminar, asignar_permisos |
| Departamentos | `departamentos.*` | crear, ver, editar, eliminar |
| Presupuestos | `presupuestos.*` | crear, ver, editar, aprobar |
| Auditoría | `auditoria.*` | ver, exportar |

---

## 📈 FLUJOS PRINCIPALES

### **Flujo 1: Onboarding de Usuario**
```
1. Admin: Invitar Usuario (UC12)
2. Sistema: Generar Enlace (UC21)
3. Invitado: Aceptar Invitación (UC10)
4. Invitado: Completar Registro (UC11)
5. Usuario: Iniciar Sesión (UC01)
6. Usuario: Ver Dashboard (UC200)
```

### **Flujo 2: Gestión de Proyecto**
```
1. Responsable: Crear Proyecto (UC50)
2. Responsable: Asignar Responsable (UC59)
3. Responsable: Gestionar Miembros (UC58)
4. Responsable: Crear Etapas (UC90)
5. Miembro: Crear Tareas (UC70)
6. Miembro: Asignar Tareas (UC75)
7. Miembro: Cambiar Estado (UC76)
```

### **Flujo 3: Gestión de Presupuesto**
```
1. Jefe: Crear Presupuesto (UC120)
2. Admin: Aprobar Presupuesto (UC125)
3. Jefe: Registrar Movimiento (UC126)
4. Jefe: Ver Balance (UC128)
5. Jefe: Ver Alertas (UC130)
```

---

## 🔄 INTEGRACIONES DEL SISTEMA

### **Auditoría Automática:**
- Todas las operaciones CRUD críticas
- Cambios de estado importantes
- Asignaciones y aprobaciones

### **Notificaciones Automáticas:**
- Asignación de tareas
- Cambios de estado
- Comentarios y menciones
- Aprobaciones de presupuesto

---

## 📝 NOTAS IMPORTANTES

1. **Validación de Permisos** (UC38) se ejecuta automáticamente en cada operación
2. **Registro de Auditoría** (UC187) se activa en operaciones críticas
3. **Conversión de Idea a Proyecto** (UC246) requiere aprobación administrativa
4. **Aprobación de Presupuesto** (UC125) requiere permisos especiales

---

## 🚀 CASOS DE USO FUTUROS (Roadmap)

### **Fase 2:**
- Integración con calendarios externos (Google, Outlook)
- Chat en tiempo real
- Videollamadas integradas
- Firma digital de documentos

### **Fase 3:**
- App móvil nativa
- Modo offline completo
- Sincronización multi-dispositivo
- Widgets personalizables

---

## 📖 CÓMO USAR ESTE DIAGRAMA

### **Para Desarrolladores:**
1. Identificar casos de uso a implementar
2. Verificar permisos requeridos
3. Implementar relaciones include/extend
4. Agregar auditoría y notificaciones

### **Para Product Owners:**
1. Priorizar casos de uso por valor
2. Definir historias de usuario
3. Estimar esfuerzo por módulo
4. Planificar sprints

### **Para Testers:**
1. Crear casos de prueba por UC
2. Verificar permisos y restricciones
3. Probar flujos completos
4. Validar integraciones

---

## 🛠️ HERRAMIENTAS

**Diagrama creado con:**
- PlantUML
- Estándares UML 2.5
- Tema: Cerulean Outline

**Para visualizar:**
```bash
# Instalar PlantUML
npm install -g plantuml

# Generar imagen
plantuml XHION-CORE-USE-CASES.plantuml

# O usar extensión de VS Code
# PlantUML (jebbs.plantuml)
```

---

## ✅ VALIDACIÓN

- ✅ Todos los módulos del sistema representados
- ✅ Actores con jerarquía correcta
- ✅ Relaciones include/extend apropiadas
- ✅ Notificaciones y auditoría identificadas
- ✅ Permisos documentados
- ✅ Flujos principales mapeados
- ✅ Estándares UML aplicados

---

**Última actualización:** 29 de Octubre, 2025  
**Versión del sistema:** 1.8  
**Total de casos de uso:** 157
