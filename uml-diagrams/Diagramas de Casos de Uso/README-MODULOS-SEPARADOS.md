# 📊 DIAGRAMAS DE CASOS DE USO POR MÓDULO

**Versión:** 1.8  
**Fecha:** 29 de Octubre, 2025  
**Archivo:** XHION-CORE-USE-CASES-BY-MODULE.plantuml

---

## 🎯 DESCRIPCIÓN

Este archivo contiene **16 diagramas UML de casos de uso separados por módulo**, todos en un solo archivo `.plantuml`. Cada diagrama se puede visualizar y exportar de forma independiente, facilitando la presentación y documentación de cada módulo del sistema.

---

## 📚 MÓDULOS INCLUIDOS

### **1. MODULO-AUTENTICACION**
**Casos de Uso:** 8  
**Actores:** Usuario Invitado, Usuario Autenticado

**Funcionalidades:**
- Iniciar/Cerrar sesión
- Gestión de tokens (JWT + Refresh)
- Historial de sesiones
- Sesiones remotas

---

### **2. MODULO-USUARIOS**
**Casos de Uso:** 12  
**Actores:** Usuario Invitado, Administrador, Sistema de Auditoría

**Funcionalidades:**
- Sistema de invitaciones
- Registro de usuarios
- CRUD de usuarios
- Gestión de roles
- Estadísticas de invitaciones

---

### **3. MODULO-ROLES-PERMISOS**
**Casos de Uso:** 9  
**Actores:** Administrador, Sistema de Auditoría

**Funcionalidades:**
- CRUD de roles
- Asignación de permisos (47 granulares)
- Búsqueda de permisos
- Validación automática
- 10 módulos de permisos

---

### **4. MODULO-PROYECTOS**
**Casos de Uso:** 14  
**Actores:** Usuario, Miembro, Responsable, Admin, Sistemas

**Funcionalidades:**
- CRUD de proyectos
- Gestión de miembros
- Estados y archivado
- Duplicación y exportación
- Estadísticas y filtros

---

### **5. MODULO-TAREAS**
**Casos de Uso:** 16  
**Actores:** Usuario, Miembro, Responsable, Sistema de Notificaciones

**Funcionalidades:**
- CRUD de tareas
- Asignación y estados
- Prioridades (4 niveles)
- Comentarios y adjuntos
- Vista Kanban con Drag & Drop
- Filtros y búsqueda

---

### **6. MODULO-ETAPAS**
**Casos de Uso:** 7  
**Actores:** Miembro, Responsable

**Funcionalidades:**
- CRUD de etapas
- Reordenamiento (Drag & Drop)
- Estados de etapas
- Progreso y timeline

---

### **7. MODULO-DEPARTAMENTOS**
**Casos de Uso:** 13  
**Actores:** Usuario, Jefe de Departamento, Admin, Sistemas

**Funcionalidades:**
- CRUD de departamentos
- Asignación de jefe
- Gestión de empleados
- Puestos de trabajo
- Organigrama (5 niveles)
- Contexto organizacional

---

### **8. MODULO-PRESUPUESTOS**
**Casos de Uso:** 11  
**Actores:** Usuario, Responsable, Jefe, Admin, Sistemas

**Funcionalidades:**
- Presupuestos de departamento y proyecto
- 4 tipos de movimientos
- Aprobación de presupuestos
- Alertas de sobregasto
- Exportación y análisis

---

### **9. MODULO-CONOCIMIENTO**
**Casos de Uso:** 10  
**Actores:** Usuario, Admin, Sistema de Auditoría

**Funcionalidades:**
- Base de conocimiento colaborativa
- CRUD de artículos
- Categorización y búsqueda
- Versionado de artículos
- Markdown support

---

### **10. MODULO-DOCUMENTOS**
**Casos de Uso:** 8  
**Actores:** Miembro, Responsable

**Funcionalidades:**
- 6 tipos de documentos de proyecto
- CRUD de documentos
- Categorización y búsqueda
- Historial de versiones
- Versionado automático

---

### **11. MODULO-AUDITORIA**
**Casos de Uso:** 8  
**Actores:** Administrador, Sistema de Auditoría

**Funcionalidades:**
- Registro automático de eventos
- Filtros y búsqueda
- Auditoría por usuario/módulo
- Exportación para compliance
- Detalles completos en JSON

---

### **12. MODULO-DASHBOARD**
**Casos de Uso:** 9  
**Actores:** Usuario, Administrador

**Funcionalidades:**
- Dashboard personalizable
- Estadísticas generales
- Gráficos interactivos
- Alertas del sistema
- Exportación de reportes

---

### **13. MODULO-CALENDARIO**
**Casos de Uso:** 9  
**Actores:** Usuario

**Funcionalidades:**
- Calendario con múltiples vistas
- Gestión de eventos
- Tareas en calendario
- Hitos de proyectos
- Sincronización externa (Google, Outlook)

---

### **14. MODULO-IDEAS**
**Casos de Uso:** 9  
**Actores:** Usuario, Responsable, Admin, Sistema de Notificaciones

**Funcionalidades:**
- Gestión de ideas
- Sistema de votación
- Comentarios colaborativos
- Conversión a proyecto
- Categorización y filtros

---

### **15. MODULO-CONFIGURACION**
**Casos de Uso:** 8  
**Actores:** Administrador

**Funcionalidades:**
- Configuración de parámetros
- Gestión de catálogos
- Configuración de seguridad
- Logs del sistema
- Backups
- Integraciones (Gemini, Email, S3)
- Monitoreo de salud

---

### **16. MODULO-PERFIL**
**Casos de Uso:** 8  
**Actores:** Usuario

**Funcionalidades:**
- Gestión de perfil personal
- Cambio de contraseña
- Avatar y preferencias
- Actividad personal
- Proyectos y tareas asignadas

---

### **17. MODULO-IA**
**Casos de Uso:** 7  
**Actores:** Responsable, Jefe, Administrador

**Funcionalidades:**
- Insights con Gemini API
- Recomendaciones inteligentes
- Análisis de tendencias
- Predicción de retrasos
- Optimización de recursos
- Reportes automáticos
- Análisis de sentimiento

---

## 📊 ESTADÍSTICAS GENERALES

| Métrica | Valor |
|---------|-------|
| **Total de módulos** | 17 |
| **Total de casos de uso** | 157 |
| **Total de actores** | 8 |
| **Total de sistemas** | 2 |
| **Relaciones include** | 15+ |
| **Relaciones extend** | 5+ |
| **Notificaciones** | 20+ |

---

## 🎨 CÓMO VISUALIZAR

### **Opción 1: VS Code con PlantUML Extension**

1. Instalar extensión: `PlantUML (jebbs.plantuml)`
2. Abrir archivo: `XHION-CORE-USE-CASES-BY-MODULE.plantuml`
3. Presionar `Alt + D` para vista previa
4. Navegar entre diagramas con scroll

### **Opción 2: Generar Imágenes Individuales**

```bash
# Generar todos los diagramas como PNG
plantuml XHION-CORE-USE-CASES-BY-MODULE.plantuml

# Esto generará 17 archivos PNG:
# - MODULO-AUTENTICACION.png
# - MODULO-USUARIOS.png
# - MODULO-ROLES-PERMISOS.png
# - ... etc
```

### **Opción 3: Generar PDF**

```bash
# Generar todos como PDF
plantuml -tpdf XHION-CORE-USE-CASES-BY-MODULE.plantuml

# Resultado: 17 archivos PDF individuales
```

### **Opción 4: Generar SVG (Escalable)**

```bash
# Generar como SVG
plantuml -tsvg XHION-CORE-USE-CASES-BY-MODULE.plantuml

# Ideal para web y presentaciones
```

---

## 📋 ESTRUCTURA DEL ARCHIVO

Cada diagrama en el archivo sigue esta estructura:

```plantuml
@startuml NOMBRE-MODULO
!theme cerulean-outline
title XHION CORE - Casos de Uso\nMódulo: Nombre del Módulo

' Definición de actores
actor "Actor 1" as Actor1
actor "Actor 2" as Actor2

' Relaciones de herencia (si aplica)
Actor1 <|-- Actor2

' Package del módulo
package "Nombre del Módulo" #Color {
  usecase "Caso de Uso 1" as UC01
  usecase "Caso de Uso 2" as UC02
  ' ... más casos de uso
}

' Relaciones actor-caso de uso
Actor1 --> UC01
Actor2 --> UC02

' Relaciones entre casos de uso
UC01 ..> UC02 : <<include>>
UC01 ..> UC03 : <<extend>>

' Notificaciones a sistemas
UC01 --> Sistema : <<notify>>

' Notas explicativas
note right of UC01
  Descripción adicional
  del caso de uso
end note

@enduml
```

---

## 🎯 CASOS DE USO POR ACTOR

### **Usuario Invitado (2 módulos):**
- Autenticación: Iniciar sesión
- Usuarios: Aceptar invitación, Completar registro

### **Usuario Autenticado (10 módulos):**
- Autenticación, Proyectos, Tareas, Departamentos
- Presupuestos, Conocimiento, Dashboard, Calendario
- Ideas, Perfil

### **Miembro de Proyecto (4 módulos):**
- Proyectos, Tareas, Etapas, Documentos

### **Responsable de Proyecto (6 módulos):**
- Proyectos, Tareas, Etapas, Presupuestos
- Documentos, Ideas, IA

### **Jefe de Departamento (4 módulos):**
- Departamentos, Presupuestos, IA

### **Administrador (9 módulos):**
- Usuarios, Roles y Permisos, Proyectos
- Presupuestos, Conocimiento, Auditoría
- Ideas, Configuración, IA

---

## 🔄 RELACIONES ENTRE MÓDULOS

### **Dependencias Principales:**

1. **Autenticación** → Base para todos los módulos
2. **Usuarios + Roles** → Control de acceso
3. **Proyectos** → Tareas, Etapas, Documentos, Presupuestos
4. **Departamentos** → Proyectos, Presupuestos, Usuarios
5. **Auditoría** → Registra eventos de todos los módulos
6. **IA** → Analiza datos de Proyectos, Tareas, Presupuestos

---

## 📖 GUÍA DE USO

### **Para Presentaciones:**

1. **Presentación por módulo:**
   - Exportar PNG de cada módulo
   - Una diapositiva por módulo
   - Tiempo: 2-3 minutos por módulo

2. **Presentación ejecutiva:**
   - Seleccionar 5-7 módulos clave
   - Enfoque en valor de negocio
   - Tiempo: 20-30 minutos

### **Para Documentación:**

1. **Manual técnico:**
   - Incluir todos los diagramas
   - Agregar descripción detallada
   - Casos de prueba por UC

2. **Manual de usuario:**
   - Seleccionar módulos relevantes
   - Simplificar notación técnica
   - Agregar ejemplos prácticos

### **Para Desarrollo:**

1. **Planificación de sprints:**
   - Un módulo = un sprint (aprox.)
   - Priorizar por dependencias
   - Estimar por casos de uso

2. **Testing:**
   - Un test por caso de uso
   - Validar relaciones include/extend
   - Verificar permisos por actor

---

## ✅ VENTAJAS DE ESTA ESTRUCTURA

### **Organización:**
- ✅ Módulos claramente separados
- ✅ Fácil navegación
- ✅ Búsqueda rápida por módulo

### **Visualización:**
- ✅ Diagramas más simples y legibles
- ✅ Menos sobrecarga visual
- ✅ Enfoque en un módulo a la vez

### **Mantenimiento:**
- ✅ Actualización por módulo
- ✅ Versionamiento granular
- ✅ Menos conflictos en Git

### **Presentación:**
- ✅ Exportación individual
- ✅ Presentaciones modulares
- ✅ Documentación específica

### **Desarrollo:**
- ✅ Planificación por módulo
- ✅ Asignación de equipos
- ✅ Testing modular

---

## 🔧 COMANDOS ÚTILES

### **Generar todos los diagramas:**
```bash
plantuml XHION-CORE-USE-CASES-BY-MODULE.plantuml
```

### **Generar solo un módulo específico:**
```bash
# Extraer un diagrama específico
sed -n '/@startuml MODULO-PROYECTOS/,/@enduml/p' XHION-CORE-USE-CASES-BY-MODULE.plantuml > temp.puml
plantuml temp.puml
```

### **Generar con alta resolución:**
```bash
plantuml -DPLANTUML_LIMIT_SIZE=8192 -tpng XHION-CORE-USE-CASES-BY-MODULE.plantuml
```

### **Generar con tema personalizado:**
```bash
plantuml -theme cerulean XHION-CORE-USE-CASES-BY-MODULE.plantuml
```

---

## 📦 ARCHIVOS GENERADOS

Al ejecutar PlantUML sobre este archivo, se generarán:

```
Diagramas de Casos de Uso/
├── MODULO-AUTENTICACION.png
├── MODULO-USUARIOS.png
├── MODULO-ROLES-PERMISOS.png
├── MODULO-PROYECTOS.png
├── MODULO-TAREAS.png
├── MODULO-ETAPAS.png
├── MODULO-DEPARTAMENTOS.png
├── MODULO-PRESUPUESTOS.png
├── MODULO-CONOCIMIENTO.png
├── MODULO-DOCUMENTOS.png
├── MODULO-AUDITORIA.png
├── MODULO-DASHBOARD.png
├── MODULO-CALENDARIO.png
├── MODULO-IDEAS.png
├── MODULO-CONFIGURACION.png
├── MODULO-PERFIL.png
└── MODULO-IA.png
```

---

## 🎨 COLORES POR MÓDULO

| Módulo | Color | Significado |
|--------|-------|-------------|
| Autenticación | LightBlue | Seguridad |
| Usuarios | LightGreen | Gestión de personas |
| Roles y Permisos | LightYellow | Control de acceso |
| Proyectos | LightCoral | Gestión principal |
| Tareas | LightSalmon | Ejecución |
| Etapas | Lavender | Organización |
| Departamentos | LightPink | Estructura org. |
| Presupuestos | LightCyan | Finanzas |
| Conocimiento | LightGoldenRodYellow | Información |
| Documentos | Thistle | Archivos |
| Auditoría | MistyRose | Trazabilidad |
| Dashboard | Honeydew | Visualización |
| Calendario | AliceBlue | Planificación |
| Ideas | LemonChiffon | Innovación |
| Configuración | Seashell | Sistema |
| Perfil | LavenderBlush | Personal |
| IA | PowderBlue | Inteligencia |

---

## 📊 COMPARATIVA

| Aspecto | Diagrama Completo | Diagramas por Módulo |
|---------|-------------------|---------------------|
| **Casos de uso** | 157 | 157 (distribuidos) |
| **Legibilidad** | Baja (sobrecarga) | Alta (enfocado) |
| **Mantenimiento** | Difícil | Fácil |
| **Presentación** | Complejo | Simple |
| **Exportación** | 1 archivo grande | 17 archivos pequeños |
| **Uso recomendado** | Vista general | Documentación detallada |

---

**Última actualización:** 29 de Octubre, 2025  
**Versión:** 1.8  
**Total de diagramas:** 17  
**Total de casos de uso:** 157
