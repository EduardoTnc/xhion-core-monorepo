# 📖 GUÍA DE USO: Diagrama de Gantt Profesional

**Para:** Usuarios y Administradores  
**Versión:** 1.0  
**Fecha:** 11 Nov 2025

---

## 🎯 ¿QUÉ ES EL DIAGRAMA DE GANTT?

El diagrama de Gantt es una herramienta visual que muestra todos los proyectos y tareas de la organización en una línea de tiempo, permitiendo:

- 📊 Ver el estado de todos los proyectos de un vistazo
- 📅 Identificar fechas de inicio y fin
- 📈 Monitorear el progreso en tiempo real
- ⚠️ Detectar proyectos en riesgo
- 🔗 Ver dependencias entre tareas
- 👥 Conocer la carga de trabajo

---

## 🚀 ACCESO

### **Ubicación:**
1. Ir al **Dashboard** (página principal)
2. El Gantt Chart es el primer widget grande en la parte superior

### **Permisos Requeridos:**
- ✅ `proyectos.ver` - Ver proyectos donde eres miembro
- ✅ `proyectos.ver_todos` - Ver todos los proyectos (administradores)

---

## 📊 INTERFAZ

### **Secciones:**

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Diagrama de Gantt Profesional          🔄 📥 ⛶     │
│ 12 proyectos • 156 tareas                              │
├─────────────────────────────────────────────────────────┤
│ 📊 12  📈 67%  ✅ 8  ⚠️ 4  📝 156  ✅ 98  👥 24       │
├─────────────────────────────────────────────────────────┤
│ 🔍 [Departamento ▼] [Estado ▼] [👁️ Completados]       │
│                            [Día] [Semana] [Mes]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Barra de Proyecto 1] ━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│    └─ [Tarea 1.1] ━━━━━━━━━━━                         │
│    └─ [Tarea 1.2] ━━━━━━━━━━━━━━━                     │
│  [Barra de Proyecto 2] ━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 ELEMENTOS VISUALES

### **Barras de Proyectos:**

#### **Colores:**
- 🟢 **Verde** - Proyecto saludable (todo bien)
- 🟡 **Amarillo** - Requiere atención (posibles retrasos)
- 🔴 **Rojo** - Crítico (acción inmediata necesaria)
- 🔵 **Azul** - Estado normal

#### **Progreso:**
Cada barra muestra el progreso con un relleno más oscuro:
```
[████████░░░░░░░░░░░░] 40%
```

#### **Tareas:**
Las tareas aparecen debajo de su proyecto con una sangría:
```
Proyecto Principal ━━━━━━━━━━━━━━━━━━━━━━━
  └─ Tarea 1 ━━━━━━━━━━━
  └─ Tarea 2 ━━━━━━━━━━━━━━━
```

---

## 🖱️ INTERACCIONES

### **1. Ver Información (Hover/Click):**
- **Pasar el mouse** sobre una barra → Ver tooltip con detalles
- **Click** en una barra → Ir a los detalles del proyecto

**Tooltip muestra:**
```
📊 Proyecto: Sistema de Inventario
🏢 Departamento: Desarrollo
📌 Estado: Activo
🟢 Salud: Saludable
📈 Progreso: 67%
⏱️ Duración: 45 días
📝 Tareas: 24 (18 completadas)
👥 Miembros: 6
⚠️ Alertas: 2
```

### **2. Mover Fechas (Drag & Drop):**
1. Click y mantener presionado en una barra
2. Arrastrar a la izquierda o derecha
3. Soltar para cambiar las fechas
4. *(Nota: Cambios se guardarán en futuras versiones)*

### **3. Cambiar Duración (Resize):**
1. Pasar el mouse sobre el borde de una barra
2. El cursor cambiará a ↔️
3. Arrastrar para acortar o alargar
4. *(Nota: Cambios se guardarán en futuras versiones)*

---

## 🔍 FILTROS

### **Por Departamento:**
```
[Todos ▼]
├─ Todos
├─ Desarrollo
├─ Marketing
├─ Ventas
└─ Operaciones
```

**Uso:** Selecciona un departamento para ver solo sus proyectos

### **Por Estado:**
```
[Todos ▼]
├─ Todos
├─ Activo
├─ En Pausa
├─ Completado
└─ Archivado
```

**Uso:** Filtra proyectos según su estado actual

### **Mostrar Completados:**
```
[👁️ Completados]  ← Click para toggle
```

**Uso:** Oculta/muestra proyectos con 100% de progreso

---

## 👁️ VISTAS

### **Día:**
- Muestra cada día como una columna
- Ideal para: Planificación detallada de corto plazo
- Uso: Proyectos de 1-2 semanas

### **Semana (Por Defecto):**
- Muestra cada semana como una columna
- Ideal para: Vista general de proyectos mensuales
- Uso: Proyectos de 1-3 meses

### **Mes:**
- Muestra cada mes como una columna
- Ideal para: Planificación de largo plazo
- Uso: Proyectos de 3-12 meses

**Cambiar Vista:**
```
[Día] [Semana] [Mes]  ← Click en el botón deseado
```

---

## 📊 ESTADÍSTICAS

### **Panel Superior:**

#### **📊 Proyectos:**
Total de proyectos visibles (después de filtros)

#### **📈 Progreso:**
Promedio de progreso de todos los proyectos

#### **✅ Saludables:**
Proyectos con estado "saludable" (🟢)

#### **⚠️ En Riesgo:**
Proyectos con estado "atención" o "crítico" (🟡 🔴)

#### **📝 Tareas:**
Total de tareas en todos los proyectos

#### **✅ Completadas:**
Tareas marcadas como completadas

#### **👥 Miembros:**
Número de personas únicas trabajando en proyectos

---

## 🎬 ACCIONES

### **🔄 Actualizar:**
- **Ubicación:** Botón en la esquina superior derecha
- **Función:** Refresca los datos del backend
- **Uso:** Click cuando necesites datos actualizados

### **📥 Exportar:**
- **Ubicación:** Botón junto a Actualizar
- **Función:** Descarga el Gantt como imagen PNG
- **Uso:** Para reportes, presentaciones o documentación
- **Archivo:** `gantt-chart-YYYY-MM-DD.png`

### **⛶ Fullscreen:**
- **Ubicación:** Botón en la esquina superior derecha
- **Función:** Expande el Gantt a pantalla completa
- **Uso:** Para mejor visualización o presentaciones
- **Salir:** Click en el mismo botón o presiona `ESC`

---

## 💡 CASOS DE USO

### **1. Revisar Estado General:**
```
1. Abrir Dashboard
2. Ver estadísticas en el panel superior
3. Identificar proyectos en riesgo (🔴 🟡)
4. Click en proyecto para ver detalles
```

### **2. Planificar Recursos:**
```
1. Cambiar a vista "Mes"
2. Ver todos los proyectos en timeline
3. Identificar solapamientos
4. Ajustar fechas si es necesario
```

### **3. Reportar a Gerencia:**
```
1. Aplicar filtros necesarios
2. Cambiar a vista adecuada
3. Click en "Exportar"
4. Usar imagen en presentación
```

### **4. Monitorear Departamento:**
```
1. Seleccionar departamento en filtro
2. Ver solo proyectos del departamento
3. Revisar progreso y salud
4. Tomar acciones si hay riesgos
```

### **5. Seguimiento Semanal:**
```
1. Mantener vista "Semana"
2. Ver proyectos de la semana actual
3. Identificar tareas atrasadas
4. Actualizar progreso si es necesario
```

---

## ⚠️ NOTAS IMPORTANTES

### **Permisos:**
- Solo verás proyectos donde eres **miembro** o **responsable**
- Administradores ven **todos** los proyectos

### **Actualización:**
- Los datos se cargan al abrir el Dashboard
- Usa el botón "Actualizar" para refrescar
- Los cambios de drag & drop no se guardan automáticamente (próximamente)

### **Rendimiento:**
- El Gantt maneja hasta **100 proyectos** sin problemas
- Si tienes muchos proyectos, usa filtros para mejor rendimiento

### **Navegación:**
- Click en proyecto → Ir a detalles completos
- Usa el navegador "Atrás" para volver al Dashboard

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **No veo proyectos:**
✅ Verifica que tengas permisos de `proyectos.ver`  
✅ Revisa los filtros (pueden estar ocultando proyectos)  
✅ Click en "Actualizar" para refrescar datos

### **Gantt no carga:**
✅ Refresca la página (F5)  
✅ Verifica tu conexión a internet  
✅ Contacta a soporte si persiste

### **Exportar no funciona:**
✅ Verifica que el navegador permita descargas  
✅ Intenta con otro navegador  
✅ Contacta a soporte si persiste

### **Drag & drop no guarda:**
ℹ️ Esta funcionalidad guardará cambios en futuras versiones  
ℹ️ Por ahora, los cambios son solo visuales

---

## 📞 SOPORTE

### **Contacto:**
- **Email:** soporte@xhion.com
- **Chat:** Botón de ayuda en la esquina inferior derecha
- **Documentación:** https://docs.xhion.com/gantt

### **Reportar Problemas:**
1. Describe el problema
2. Incluye captura de pantalla si es posible
3. Menciona navegador y sistema operativo
4. Indica pasos para reproducir

---

## 🎓 TIPS Y TRUCOS

### **Tip 1: Usa Fullscreen para Presentaciones**
Antes de presentar a gerencia, activa el modo fullscreen para una vista más profesional.

### **Tip 2: Exporta Regularmente**
Exporta el Gantt semanalmente para tener un histórico visual del progreso.

### **Tip 3: Filtra por Departamento**
Si eres jefe de departamento, filtra por tu departamento para enfocarte en tus proyectos.

### **Tip 4: Oculta Completados**
Para enfocarte en trabajo activo, oculta los proyectos completados.

### **Tip 5: Usa Vista Semana**
La vista semanal es la más balanceada para la mayoría de casos de uso.

---

## 📚 RECURSOS ADICIONALES

- 📖 **Manual Completo:** `IMPLEMENTACION_GANTT_PROFESIONAL.md`
- 📋 **Resumen Técnico:** `RESUMEN_GANTT_IMPLEMENTACION.md`
- 🎥 **Video Tutorial:** *(Próximamente)*
- 💬 **FAQ:** *(Próximamente)*

---

**¿Preguntas?** Contacta al equipo de soporte o consulta la documentación completa.

**¡Feliz gestión de proyectos! 🚀**
