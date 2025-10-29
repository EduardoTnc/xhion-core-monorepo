# 📊 DIAGRAMAS DE ACTIVIDAD - XHION CORE

**Versión:** 1.8  
**Fecha:** 29 de Octubre, 2025  
**Autor:** Eduardo Tanca  
**Estado:** ✅ Completo

---

## 🎯 DESCRIPCIÓN GENERAL

Este directorio contiene los **diagramas de actividad** más importantes del sistema XHION CORE. Los diagramas de actividad modelan el flujo de trabajo y la lógica de negocio de los procesos críticos del sistema, mostrando las decisiones, acciones paralelas y la interacción entre diferentes actores.

---

## 📚 DIAGRAMAS DISPONIBLES

### **1. 01-ACTIVIDAD-INVITACION-USUARIO.plantuml**

**Descripción:** Proceso completo de invitación y registro de nuevos usuarios

**Actores:**
- Administrador
- Sistema
- Usuario Invitado

**Flujo Principal:**
1. Administrador genera invitación con datos del usuario
2. Sistema crea token único y enlace (válido 24 horas)
3. Usuario invitado recibe y accede al enlace
4. Sistema valida token (existencia, uso previo, expiración)
5. Usuario completa su perfil y contraseña
6. Sistema crea usuario y marca invitación como utilizada
7. Usuario accede al sistema con sesión activa

**Características Destacadas:**
- ✅ Validación de token en múltiples niveles
- ✅ Transacción atómica (usuario + invitación)
- ✅ Hasheo de contraseña con bcrypt
- ✅ Cálculo automático de puntaje de perfil
- ✅ Generación de JWT y Refresh Token
- ✅ Registro en auditoría

**Casos de Error:**
- Token no encontrado
- Token ya utilizado (muestra fecha de uso)
- Token expirado
- Datos de registro inválidos

---

### **2. 02-ACTIVIDAD-GESTION-PROYECTO.plantuml**

**Descripción:** Ciclo de vida completo de un proyecto desde su creación hasta su cierre

**Actores:**
- Responsable de Proyecto
- Miembro de Proyecto
- Sistema

**Particiones:**
1. **Configuración Inicial**
   - Creación del proyecto
   - Definición de etapas (Kanban)
   - Asignación de miembros con roles

2. **Gestión de Tareas**
   - Creación de tareas
   - Asignación a usuarios
   - Generación de resumen con IA (opcional)
   - Notificaciones automáticas

3. **Seguimiento**
   - Actualización de estados
   - Movimiento entre etapas
   - Comentarios colaborativos
   - Cálculo de progreso

4. **Gestión de Presupuesto**
   - Creación de presupuesto (opcional)
   - Registro de movimientos
   - Alertas de sobregasto
   - Actualización de balance

5. **Documentación**
   - Creación de documentos (6 tipos)
   - Adjuntos de archivos
   - Versionado por fechas

6. **Cierre de Proyecto**
   - Validación de tareas pendientes
   - Cierre de presupuesto
   - Cálculo de métricas finales
   - Generación de reporte
   - Notificación al equipo

**Características Destacadas:**
- ✅ Flujo completo end-to-end
- ✅ Gestión paralela de tareas y presupuesto
- ✅ Integración con IA para resúmenes
- ✅ Sistema de notificaciones
- ✅ Validaciones en cada etapa
- ✅ Métricas y reportes automáticos

---

### **3. 03-ACTIVIDAD-AUTENTICACION.plantuml**

**Descripción:** Proceso de autenticación, gestión de sesiones y renovación de tokens

**Actores:**
- Usuario
- Sistema

**Particiones:**
1. **Inicio de Sesión**
   - Validación de credenciales
   - Verificación de estado de cuenta
   - Control de intentos fallidos
   - Bloqueo automático por seguridad

2. **Generación de Tokens**
   - Access Token (JWT, 15 minutos)
   - Refresh Token (7 días)
   - Hasheo de Refresh Token
   - Captura de metadatos (IP, User Agent)

3. **Carga de Permisos**
   - Obtención de rol del usuario
   - Eager Loading de permisos
   - Caché de permisos en request (O(1))

4. **Navegación con Sesión Activa**
   - Validación de Access Token
   - Verificación de permisos por acción
   - Renovación automática con Refresh Token
   - Actualización de fecha de último uso

5. **Cierre de Sesión**
   - Invalidación de tokens
   - Eliminación de sesión
   - Registro en auditoría
   - Limpieza del cliente

**Características Destacadas:**
- ✅ JWT con expiración corta (seguridad)
- ✅ Refresh Token para renovación automática
- ✅ Control de intentos fallidos
- ✅ Bloqueo automático de cuentas
- ✅ Validación de estado de usuario
- ✅ Caché de permisos para performance
- ✅ Registro completo en auditoría

**Estados de Usuario:**
- ACTIVO - Puede iniciar sesión
- BLOQUEADO - No puede iniciar sesión
- SUSPENDIDO - No puede iniciar sesión
- ELIMINADO - No puede iniciar sesión

---

### **4. 04-ACTIVIDAD-GESTION-PRESUPUESTO.plantuml**

**Descripción:** Gestión completa de presupuestos departamentales con movimientos y análisis

**Actores:**
- Jefe de Departamento
- Administrador
- Sistema

**Particiones:**
1. **Creación de Presupuesto**
   - Definición de monto total
   - Configuración de período
   - Establecimiento de fechas
   - Inicialización de balance

2. **Registro de Movimientos**
   - 4 tipos: Asignación, Gasto, Ajuste, Transferencia
   - Categorización de gastos
   - Adjuntos de comprobantes
   - Validación de disponibilidad
   - Alertas de sobregasto

3. **Análisis y Reportes**
   - Gráficos de gastos diarios
   - Distribución por categoría
   - Tendencia acumulada
   - Proyección de gastos futuros
   - Exportación (Excel, PDF, CSV)

4. **Aprobación de Presupuesto**
   - Revisión por administrador
   - Aprobación o rechazo
   - Notificaciones automáticas
   - Registro en auditoría

5. **Cierre de Presupuesto**
   - Cierre automático al finalizar período
   - Cálculo de métricas finales
   - Generación de reporte de cierre
   - Archivo de presupuesto

**Características Destacadas:**
- ✅ 4 tipos de movimientos
- ✅ Validación de sobregasto
- ✅ Alertas automáticas
- ✅ Análisis con gráficos
- ✅ Proyecciones basadas en tendencias
- ✅ Exportación en múltiples formatos
- ✅ Workflow de aprobación

**Categorías de Gasto:**
- Salarios
- Equipamiento
- Marketing
- Capacitación
- Infraestructura

---

### **5. 05-ACTIVIDAD-GESTION-ROLES-PERMISOS.plantuml**

**Descripción:** Sistema completo de RBAC con 47 permisos granulares

**Actores:**
- Administrador
- Usuario
- Sistema

**Particiones:**
1. **Creación de Rol**
   - Definición de nombre único
   - Asignación de color
   - Descripción del rol

2. **Asignación de Permisos**
   - Navegación por 10 módulos
   - Selección individual o masiva
   - Búsqueda de permisos
   - Guardado transaccional
   - Invalidación de caché

3. **Asignación de Rol a Usuario**
   - Selección de usuario
   - Cambio de rol
   - Invalidación de sesiones activas
   - Notificación al usuario

4. **Validación de Permisos en Runtime**
   - Extracción de userId del JWT
   - Recuperación de permisos (caché o BD)
   - Verificación con decorador @RequiresPermission
   - Ejecución o denegación de acción

5. **Clonación de Rol**
   - Copia de rol existente
   - Modificación de nombre
   - Ajuste de permisos
   - Creación de nuevo rol

6. **Eliminación de Rol**
   - Verificación de usuarios asignados
   - Reasignación obligatoria
   - Eliminación lógica
   - Limpieza de permisos

7. **Búsqueda y Filtros**
   - Búsqueda en tiempo real
   - Filtrado por módulo
   - Vista de usuarios por rol

**Características Destacadas:**
- ✅ 47 permisos granulares en 10 módulos
- ✅ Caché de permisos (O(1) lookup)
- ✅ Eager Loading para performance
- ✅ Validación automática con decoradores
- ✅ Invalidación de sesiones al cambiar rol
- ✅ Búsqueda instantánea
- ✅ Clonación de roles
- ✅ Eliminación lógica

**Módulos de Permisos:**
1. Proyectos (8)
2. Tareas (8)
3. Departamentos (6)
4. Presupuestos (6)
5. Conocimiento (4)
6. Usuarios (6)
7. Roles (5)
8. Auditoría (2)
9. Sistema (3)
10. Invitaciones (3)

---

## 🎨 CONVENCIONES UML

### **Elementos de Actividad:**

```plantuml
start                    ' Inicio del flujo
:Acción;                 ' Actividad simple
stop                     ' Fin del flujo

if (¿Condición?) then (sí)
  :Acción A;
else (no)
  :Acción B;
endif

repeat
  :Acción repetida;
repeat while (¿Continuar?) is (sí)

fork
  :Acción paralela 1;
fork again
  :Acción paralela 2;
end fork

partition "Nombre" {
  :Acciones agrupadas;
}

|Actor|                  ' Cambio de swimlane
```

### **Notas:**
```plantuml
note right
  Información adicional
  sobre la actividad
end note
```

---

## 📊 ESTADÍSTICAS

| Diagrama | Actores | Particiones | Decisiones | Acciones Paralelas |
|----------|---------|-------------|------------|-------------------|
| Invitación Usuario | 3 | 0 | 5 | 2 |
| Gestión Proyecto | 3 | 6 | 8 | 4 |
| Autenticación | 2 | 5 | 7 | 2 |
| Gestión Presupuesto | 3 | 5 | 6 | 3 |
| Roles y Permisos | 3 | 7 | 9 | 2 |
| **TOTAL** | **14** | **23** | **35** | **13** |

---

## 🔄 PATRONES IDENTIFICADOS

### **1. Validación en Capas:**
Todos los diagramas implementan validación en múltiples niveles:
- Validación de formato (frontend)
- Validación de negocio (backend)
- Validación de permisos (RBAC)
- Validación de estado (workflow)

### **2. Transacciones Atómicas:**
Operaciones críticas usan transacciones de BD:
- Creación de usuario + actualización de invitación
- Creación de movimiento + actualización de presupuesto
- Eliminación de permisos + inserción de nuevos

### **3. Auditoría Completa:**
Todas las operaciones críticas se registran:
- Quién realizó la acción
- Qué acción se realizó
- Cuándo se realizó
- Desde qué IP
- Detalles adicionales en JSON

### **4. Notificaciones Automáticas:**
El sistema notifica a usuarios relevantes:
- Asignación de tareas
- Cambios de estado
- Alertas de presupuesto
- Cambios de rol
- Invitaciones

### **5. Caché Inteligente:**
Optimización de performance:
- Permisos en caché (O(1))
- Sesiones en Redis
- Resultados de queries frecuentes

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
plantuml 01-ACTIVIDAD-INVITACION-USUARIO.plantuml

# O usar extensión de VS Code
# PlantUML (jebbs.plantuml)
```

---

## 📖 CASOS DE USO RELACIONADOS

Cada diagrama de actividad implementa uno o más casos de uso:

| Diagrama | Casos de Uso |
|----------|--------------|
| Invitación Usuario | UC10, UC11, UC12, UC13 |
| Gestión Proyecto | UC50-UC63, UC70-UC85, UC90-UC96 |
| Autenticación | UC01, UC02, UC03, UC04, UC05 |
| Gestión Presupuesto | UC120-UC130 |
| Roles y Permisos | UC30-UC38 |

---

## ✅ VALIDACIÓN

- ✅ Todos los flujos tienen inicio y fin
- ✅ Todas las decisiones tienen ramas definidas
- ✅ Actores claramente identificados
- ✅ Particiones lógicas agrupan actividades relacionadas
- ✅ Notas explican lógica compleja
- ✅ Acciones paralelas correctamente sincronizadas
- ✅ Cumplimiento con UML 2.5

---

**Última actualización:** 29 de Octubre, 2025  
**Versión del sistema:** 1.8  
**Total de diagramas:** 5
