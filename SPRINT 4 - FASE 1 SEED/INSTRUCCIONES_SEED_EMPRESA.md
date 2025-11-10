# 📋 INSTRUCCIONES - Seed de Empresa Completa

**Fecha:** 8 de Noviembre, 2025  
**Estado:** ⚠️ REQUIERE CORRECCIONES

---

## 🎯 Objetivo

Crear un seed completo y realista basado en la estructura real de **Negocios Asociados Bigander S.A.C.** con:

- 6 Departamentos
- 11 Usuarios con roles específicos
- 7 Proyectos (5 principales + 2 sub-proyectos)
- 20+ Etapas
- 30+ Tareas
- 5 Presupuestos
- 3 Ideas con comentarios
- 5 Eventos de calendario

---

## ⚠️ Errores Detectados

El seed actual tiene errores de tipos debido a diferencias entre el schema de Prisma y el código:

### 1. **Nombres de Campos (snake_case vs camelCase)**

**Problema:** El schema usa `camelCase` pero el seed usa `snake_case`

**Ejemplos:**
- ❌ `proyecto_id` → ✅ `proyectoId`
- ❌ `fecha_inicio` → ✅ `fechaInicio`
- ❌ `fecha_fin` → ✅ `fechaFin`
- ❌ `jefe_id` → ✅ `jefeId`
- ❌ `idea_id` → ✅ `ideaId`

### 2. **Enums Incorrectos**

**EstadoProyecto:**
- ❌ `EnProgreso` → ✅ `Activo`
- ❌ `Planificacion` → ✅ `Activo` (no existe Planificacion)

**EstadoTarea:**
- ❌ `Completada` → ✅ `Hecho`
- ❌ `EnProgreso` → ✅ `En_Progreso`
- ❌ `Pendiente` → ✅ `Por_Hacer`

**EstadoIdea:**
- ❌ `"Pendiente"` → ✅ `Pendiente` (enum)
- ❌ `"En Análisis"` → ✅ `En_Analisis`
- ❌ `"Aprobada"` → ✅ `Aprobada`

**TipoEvento:**
- ❌ `Presentacion` → ✅ `Reunion`
- ❌ `Evento` → ✅ `Proyecto`

### 3. **Campos que No Existen**

**Departamento:**
- ❌ `contexto` → No existe en el schema

**Usuario:**
- ❌ `password` → ✅ `contrasena`

**Presupuesto:**
- ❌ `prisma.presupuesto` → No existe este modelo en Prisma

### 4. **RolProyecto**

El campo `rol` en `miembros` debe ser un enum `RolProyecto`, no un string libre.

**Valores válidos:**
- `Lider`
- `Miembro`
- `Observador`

---

## 🔧 Solución

### Opción 1: Corregir el Seed Actual

Necesitarías corregir manualmente todos los errores listados arriba. Esto tomaría tiempo y es propenso a errores.

### Opción 2: Usar el Schema Real (RECOMENDADO)

Voy a crear un seed simplificado que use correctamente el schema de Prisma actual.

---

## 📝 Plan de Acción

### FASE 1: Seed Simplificado (AHORA)

Crear un seed básico pero funcional con:
- 6 Departamentos ✅
- 10 Usuarios ✅
- 5 Proyectos principales ✅
- 10 Etapas ✅
- 20 Tareas ✅
- 3 Ideas ✅
- 5 Eventos ✅

**Sin incluir:**
- Contexto de departamentos (no existe en schema)
- Presupuestos (modelo no existe)
- Campos incorrectos

### FASE 2: Verificar Schema

Antes de crear seeds complejos, necesitamos:

1. **Verificar qué campos existen realmente:**
   ```bash
   cd xhion-core-api
   pnpm prisma generate
   ```

2. **Revisar el schema:**
   - ¿Existe `contexto` en Departamento?
   - ¿Existe modelo `Presupuesto`?
   - ¿Cuál es el nombre correcto del campo password?

3. **Ajustar el seed según el schema real**

### FASE 3: Seed Completo

Una vez corregidos los errores, crear el seed completo con todos los datos.

---

## 🚀 Cómo Ejecutar (Cuando esté Corregido)

```bash
cd xhion-core-api

# Ejecutar seed
npx ts-node prisma/seeds/empresa-completa.seed.ts

# O agregarlo a package.json
"prisma": {
  "seed": "ts-node prisma/seeds/empresa-completa.seed.ts"
}

# Y ejecutar
pnpm prisma db seed
```

---

## 📊 Estructura de Datos Planificada

### Departamentos (6)
1. **Ventas** - Tiendas Fontech y Fumanía
2. **Marketing** - Promoción de marcas
3. **Diseño** - Activos visuales (usa Notion)
4. **Sistemas** - XHION Core y Chatbot
5. **RRHH** - Gestión de personal
6. **Mantenimiento** - Infraestructura y fabricación

### Usuarios (11)
1. **Carlos Mendoza** - Gerente General (Admin)
2. **Eduardo Tanca** - Desarrollador (Admin, Sistemas)
3. **Luz García** - Gerente Fumanía (Ventas)
4. **Maitet Rodríguez** - Gerente Fontech (Ventas)
5. **Lucero Sánchez** - Jefa Marketing
6. **Ricardo Torres** - Técnico Mantenimiento
7. **Omar Pérez** - Desarrollador Sistemas
8. **Ana Flores** - Diseñadora
9. **María Castro** - Diseñadora
10. **Juan Ramírez** - Vendedor
11. **(Más usuarios según necesidad)**

### Proyectos (7)

#### 1. Negocio de Telefonía
- **Sub-proyecto 1.1:** Call Center
  - Etapas: Planificación, Adquisición, Contratación, Lanzamiento
  - Tareas: 5+
- **Sub-proyecto 1.2:** Chatbot Inteligente
  - Etapas: Análisis, Desarrollo, Entrenamiento, Integración
  - Tareas: 6+

#### 2. Bumblebee (Eventos)
- Etapas: Reservas, Logística, Ejecución, Mantenimiento
- Clientes: Municipalidad Caima, Senati

#### 3. Proyecto Sostenible Perú
- Etapas: Diseño, Fabricación, Instalación, Mantenimiento, Publicidad
- Meta: 50 estaciones solares

#### 4. Agencia de Marketing (Futuro)
- Etapas: Definición, Equipos, Acondicionamiento, Clientes
- Estado: Planificación

#### 5. XHION Core
- Etapas: (Por definir)
- Equipo: Eduardo, Omar

---

## 🎯 Próximos Pasos

1. ✅ **Identificar errores** (COMPLETADO)
2. ⏳ **Verificar schema real de Prisma**
3. ⏳ **Crear seed corregido y simplificado**
4. ⏳ **Probar seed**
5. ⏳ **Expandir con más datos**

---

## 📞 Notas Importantes

### Para el Gerente:

Este seed poblará la base de datos con:
- ✅ Estructura real de la empresa
- ✅ Proyectos actuales y futuros
- ✅ Usuarios reales (con datos de ejemplo)
- ✅ Tareas y eventos realistas

**Beneficios:**
- Demostración inmediata del sistema
- Datos de prueba realistas
- Fácil de entender y navegar
- Base para capacitación

### Para el Desarrollador:

**Antes de ejecutar:**
1. Verificar que el schema esté actualizado
2. Ejecutar `pnpm prisma generate`
3. Revisar que todos los modelos existan
4. Ajustar nombres de campos según schema

**Después de ejecutar:**
1. Verificar datos en Prisma Studio
2. Probar login con usuarios creados
3. Verificar relaciones entre entidades
4. Ajustar datos según feedback

---

**Estado Actual:** ⚠️ Requiere correcciones antes de ejecutar  
**Tiempo Estimado de Corrección:** 30-60 minutos  
**Prioridad:** Alta (necesario para demostración)

---

© 2025 Eduardo Tanca - Todos los derechos reservados
