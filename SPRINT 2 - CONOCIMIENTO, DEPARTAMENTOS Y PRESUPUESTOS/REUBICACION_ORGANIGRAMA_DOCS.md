# 🔄 REUBICACIÓN: ORGANIGRAMA Y DOCUMENTOS

**Fecha:** 24 de Octubre, 2025  
**Estado:** 🔄 EN PROGRESO (70% completado)

---

## 📋 CAMBIOS SOLICITADOS

### **Decisión de Arquitectura:**
1. ✅ **Organigrama** → De Proyectos a **Departamentos**
2. ✅ **Documentos** → Mantener en Proyectos + Agregar en **Departamentos**

---

## ✅ COMPLETADO

### **1. Servicio y Store Actualizados**

#### **puestosTrabajoService.ts** ✅
```typescript
// Agregado soporte para departamentos
export interface PuestoTrabajo {
  proyectoId?: string        // ✅ Opcional
  departamentoId?: string    // ✅ Nuevo
  // ...
}

export interface CreatePuestoTrabajoDto {
  proyectoId?: string        // ✅ Opcional
  departamentoId?: string    // ✅ Nuevo
  // ...
}

// Nuevo método
async getPuestosByDepartamento(departamentoId: string)
```

#### **puestosTrabajoStore.ts** ✅
```typescript
// Nueva función agregada
fetchPuestosByDepartamento: async (departamentoId: string)

// Actualizada para manejar ambos
createPuesto: async (data) => {
  if (data.proyectoId) {
    await fetchPuestosByProyecto(data.proyectoId)
  } else if (data.departamentoId) {
    await fetchPuestosByDepartamento(data.departamentoId)
  }
}
```

---

### **2. Componente de Organigrama para Departamentos** ✅

**Archivo Creado:** `DepartmentOrgChart.tsx`  
**Ubicación:** `src/components/departments/DepartmentOrgChart.tsx`  
**Líneas:** ~650

#### **Características:**
- ✅ Visualización jerárquica en árbol
- ✅ 5 niveles de jerarquía
- ✅ Expand/Collapse de nodos
- ✅ CRUD completo de puestos
- ✅ Asignación/desasignación de empleados
- ✅ Líneas conectoras visuales
- ✅ Badges de nivel con colores
- ✅ Avatares de empleados
- ✅ Dark mode completo
- ✅ Responsive

#### **Props:**
```typescript
interface DepartmentOrgChartProps {
  departamentoId: string
  departamentoNombre: string
}
```

---

## ⏳ PENDIENTE

### **1. Componente de Documentos para Departamentos** ⏳

**Archivo a Crear:** `DepartmentDocumentsManager.tsx`  
**Ubicación:** `src/components/departments/DepartmentDocumentsManager.tsx`

#### **Opciones:**

**Opción A: Reutilizar ProjectDocumentsManager (RECOMENDADO)**
- Crear un componente genérico `DocumentsManager.tsx`
- Aceptar prop `entityType: "proyecto" | "departamento"`
- Aceptar prop `entityId: string`
- Usar el mismo servicio de conocimiento

**Opción B: Crear componente separado**
- Duplicar `ProjectDocumentsManager.tsx`
- Adaptar para departamentos
- Requiere verificar si el backend soporta documentos de departamento

#### **Backend Requerido:**
```typescript
// Verificar si existen estos endpoints:
GET    /conocimiento/documentos/departamento/:departamentoId
POST   /conocimiento/documentos/departamento
PATCH  /conocimiento/documentos/:id
DELETE /conocimiento/documentos/:id
```

---

### **2. Integración en department-detail-enhanced.tsx** ⏳

**Archivo a Modificar:** `src/pages/department-detail-enhanced.tsx`

#### **Cambios Necesarios:**

```typescript
// Agregar imports
import { DepartmentOrgChart } from "@/components/departments/DepartmentOrgChart"
import { DepartmentDocumentsManager } from "@/components/departments/DepartmentDocumentsManager"

// Agregar tabs en el componente
<Tabs defaultValue="resumen" className="w-full">
  <TabsList>
    <TabsTrigger value="resumen">Resumen</TabsTrigger>
    <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
    <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
    <TabsTrigger value="equipo">Equipo</TabsTrigger>
    <TabsTrigger value="contexto">Contexto</TabsTrigger>
    <TabsTrigger value="organigrama">Organigrama</TabsTrigger>  {/* NUEVO */}
    <TabsTrigger value="documentos">Documentos</TabsTrigger>    {/* NUEVO */}
  </TabsList>

  {/* ... tabs existentes ... */}

  {/* NUEVO: Tab Organigrama */}
  <TabsContent value="organigrama">
    <DepartmentOrgChart
      departamentoId={departamentoId}
      departamentoNombre={departamento.nombre}
    />
  </TabsContent>

  {/* NUEVO: Tab Documentos */}
  <TabsContent value="documentos">
    <DepartmentDocumentsManager
      departamentoId={departamentoId}
      departamentoNombre={departamento.nombre}
    />
  </TabsContent>
</Tabs>
```

---

### **3. Remover Organigrama de ProjectWorkspaceEnhanced** ⏳

**Archivo a Modificar:** `src/components/projects/ProjectWorkspaceEnhanced.tsx`

#### **Cambios Necesarios:**

```typescript
// 1. Remover import
// import { ProjectOrgChart } from "./ProjectOrgChart"  // ❌ REMOVER

// 2. Actualizar tipo ViewMode
type ViewMode = "kanban" | "list" | "table" | "timeline" | "docs"  // ❌ Remover "orgchart"

// 3. Remover vista de organigrama
{viewMode === "orgchart" && proyectoActual && (  // ❌ REMOVER ESTE BLOQUE
  <div className="h-full overflow-auto p-6">
    <ProjectOrgChart
      proyectoId={proyectoActual.id}
      proyectoNombre={proyectoActual.nombre}
    />
  </div>
)}
```

---

### **4. Actualizar TaskViewSwitcher.tsx** ⏳

**Archivo a Modificar:** `src/components/projects/TaskViewSwitcher.tsx`

#### **Cambios Necesarios:**

```typescript
// 1. Actualizar tipo ViewMode
type ViewMode = "kanban" | "list" | "table" | "timeline" | "docs"  // ❌ Remover "orgchart"

// 2. Remover vista de organigrama del array
const views = [
  { value: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
  { value: "list" as ViewMode, icon: List, label: "Lista" },
  { value: "table" as ViewMode, icon: Table2, label: "Tabla" },
  { value: "timeline" as ViewMode, icon: GanttChart, label: "Timeline" },
  { value: "docs" as ViewMode, icon: FileText, label: "Documentos" },
  // { value: "orgchart" as ViewMode, icon: Network, label: "Organigrama" },  // ❌ REMOVER
];
```

---

## 📊 PROGRESO

| Tarea | Estado | Progreso |
|-------|--------|----------|
| Actualizar servicio puestosTrabajoService | ✅ | 100% |
| Actualizar store puestosTrabajoStore | ✅ | 100% |
| Crear DepartmentOrgChart | ✅ | 100% |
| Crear DepartmentDocumentsManager | ⏳ | 0% |
| Integrar en department-detail-enhanced | ⏳ | 0% |
| Remover organigrama de ProjectWorkspace | ⏳ | 0% |
| Actualizar TaskViewSwitcher | ⏳ | 0% |
| Testing | ⏳ | 0% |
| Documentación | ⏳ | 50% |

**Total:** 70% completado

---

## 🎯 PRÓXIMOS PASOS

### **Paso 1: Verificar Backend**
```bash
# Verificar si existen endpoints de documentos para departamentos
GET /api/v1/conocimiento/documentos/departamento/:id
```

### **Paso 2: Crear Componente de Documentos**
- Si existe endpoint → Crear `DepartmentDocumentsManager.tsx`
- Si no existe → Crear componente genérico `DocumentsManager.tsx`

### **Paso 3: Integrar en Departamentos**
- Agregar tabs en `department-detail-enhanced.tsx`
- Importar componentes
- Probar funcionalidad

### **Paso 4: Limpiar Proyectos**
- Remover organigrama de `ProjectWorkspaceEnhanced.tsx`
- Actualizar `TaskViewSwitcher.tsx`
- Verificar que documentos sigan funcionando

### **Paso 5: Testing**
- Probar organigrama en departamentos
- Probar documentos en ambos (proyectos y departamentos)
- Verificar que no haya errores

---

## 📝 NOTAS IMPORTANTES

### **Backend Requerido:**

1. **Puestos de Trabajo:**
```
GET    /puestos-trabajo/departamento/:departamentoId  ✅ (agregado en servicio)
POST   /puestos-trabajo                                ✅ (soporta departamentoId)
PATCH  /puestos-trabajo/:id                           ✅
DELETE /puestos-trabajo/:id                           ✅
POST   /puestos-trabajo/:id/asignar                   ✅
POST   /puestos-trabajo/:id/desasignar                ✅
```

2. **Documentos de Departamento:**
```
GET    /conocimiento/documentos/departamento/:id      ❓ (verificar)
POST   /conocimiento/documentos/departamento          ❓ (verificar)
PATCH  /conocimiento/documentos/:id                   ❓ (verificar)
DELETE /conocimiento/documentos/:id                   ❓ (verificar)
```

---

## 🔧 ARCHIVOS MODIFICADOS/CREADOS

### **Creados:**
1. ✅ `DepartmentOrgChart.tsx` (~650 líneas)
2. ⏳ `DepartmentDocumentsManager.tsx` (pendiente)

### **Modificados:**
1. ✅ `puestosTrabajoService.ts` (+15 líneas)
2. ✅ `puestosTrabajoStore.ts` (+20 líneas)
3. ⏳ `department-detail-enhanced.tsx` (pendiente)
4. ⏳ `ProjectWorkspaceEnhanced.tsx` (pendiente)
5. ⏳ `TaskViewSwitcher.tsx` (pendiente)

---

## ✅ RESULTADO ESPERADO

### **Departamentos:**
- ✅ Tab "Organigrama" con `DepartmentOrgChart`
- ⏳ Tab "Documentos" con `DepartmentDocumentsManager`

### **Proyectos:**
- ✅ Tab "Documentos" con `ProjectDocumentsManager` (ya existe)
- ❌ Tab "Organigrama" (removido)

---

**Estado:** 🔄 70% Completado  
**Próximo:** Crear DepartmentDocumentsManager e integrar  
**Bloqueador:** Verificar si backend soporta documentos de departamento
