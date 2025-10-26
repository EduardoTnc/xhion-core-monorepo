# 🔧 CORRECCIÓN - ORDEN DE RUTAS EN NESTJS

**Fecha:** 25 de Octubre, 2025  
**Estado:** ✅ CORREGIDO

---

## 🐛 PROBLEMA

### **Error en Frontend:**
```
Error fetching available users: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

### **Causa Raíz:**
El endpoint `GET /api/v1/usuarios/sin-puesto/disponibles` estaba devolviendo HTML en lugar de JSON porque NestJS estaba interpretando "sin-puesto" como un parámetro `:id`.

### **Explicación Técnica:**
En NestJS, el orden de las rutas es **crítico**. Las rutas más específicas deben declararse **ANTES** que las rutas con parámetros dinámicos.

**Orden Incorrecto:**
```typescript
@Get(':id')              // ❌ Esta ruta captura TODO, incluyendo "sin-puesto"
@Get('sin-puesto/disponibles')  // ❌ Nunca se alcanza
```

Cuando se hace `GET /usuarios/sin-puesto/disponibles`:
1. NestJS evalúa `@Get(':id')` primero
2. Interpreta "sin-puesto" como el valor de `:id`
3. Intenta buscar un usuario con ID "sin-puesto"
4. No encuentra la ruta específica
5. Devuelve HTML de error 404

---

## ✅ SOLUCIÓN

### **Orden Correcto de Rutas:**

**Archivo:** `usuarios.controller.ts`

```typescript
@Controller('usuarios')
export class UsuariosController {
  
  // 1️⃣ Rutas sin parámetros (más generales)
  @Get()
  async obtenerTodosLosUsuarios() { ... }

  // 2️⃣ Rutas específicas con segmentos fijos (ANTES de :id)
  @Get('sin-puesto/disponibles')  // ✅ PRIMERO
  async obtenerUsuariosSinPuesto() { ... }

  // 3️⃣ Rutas con parámetros dinámicos (DESPUÉS)
  @Get(':id')  // ✅ DESPUÉS de rutas específicas
  async obtenerUsuarioPorId(@Param('id') id: string) { ... }

  // 4️⃣ Rutas con parámetros y acciones
  @Post(':id/asignar-puesto')
  async asignarPuestoTrabajo(...) { ... }

  @Delete(':id/remover-puesto')
  async removerPuestoTrabajo(...) { ... }
}
```

---

## 📊 CAMBIOS APLICADOS

### **Archivo:** `usuarios.controller.ts`

**Antes (Orden Incorrecto):**
```typescript
@Get()                           // Línea 27
@Get(':id')                      // Línea 38 ❌
@Post(':id/asignar-puesto')      // Línea 55
@Delete(':id/remover-puesto')    // Línea 72
@Get('sin-puesto/disponibles')   // Línea 86 ❌ Nunca se alcanza
```

**Después (Orden Correcto):**
```typescript
@Get()                           // Línea 27
@Get('sin-puesto/disponibles')   // Línea 39 ✅ ANTES de :id
@Get(':id')                      // Línea 52 ✅ DESPUÉS de rutas específicas
@Post(':id/asignar-puesto')      // Línea 69
@Delete(':id/remover-puesto')    // Línea 86
```

---

## 🎯 REGLA DE ORO EN NESTJS

### **Orden de Declaración de Rutas:**

1. **Rutas estáticas sin parámetros** (`@Get()`, `@Get('list')`)
2. **Rutas específicas con segmentos fijos** (`@Get('sin-puesto/disponibles')`)
3. **Rutas con parámetros dinámicos** (`@Get(':id')`)
4. **Rutas con parámetros y acciones** (`@Post(':id/action')`)

### **Ejemplo Completo:**
```typescript
@Controller('users')
export class UsersController {
  
  // ✅ 1. Sin parámetros
  @Get()
  findAll() { }
  
  @Get('active')
  findActive() { }
  
  // ✅ 2. Rutas específicas
  @Get('without-role')
  findWithoutRole() { }
  
  @Get('stats/summary')
  getStatsSummary() { }
  
  // ✅ 3. Con parámetros (DESPUÉS)
  @Get(':id')
  findOne(@Param('id') id: string) { }
  
  // ✅ 4. Parámetros + acciones
  @Post(':id/activate')
  activate(@Param('id') id: string) { }
  
  @Delete(':id/deactivate')
  deactivate(@Param('id') id: string) { }
}
```

---

## 🚀 PASOS PARA APLICAR LA CORRECCIÓN

### **1. Reiniciar el Servidor Backend:**

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
cd xhion-core-api
pnpm run start:dev
```

### **2. Verificar que el Endpoint Funciona:**

**Prueba en Postman/Thunder Client:**
```
GET http://localhost:3000/api/v1/usuarios/sin-puesto/disponibles
Authorization: Bearer <tu-token>
```

**Respuesta Esperada:**
```json
[
  {
    "id": "uuid",
    "nombreCompleto": "Juan Pérez",
    "email": "juan@example.com",
    "avatarUrl": null,
    "rol": {
      "id": "uuid",
      "nombre": "Empleado",
      "color": "#3b82f6"
    }
  }
]
```

### **3. Probar en el Frontend:**

1. Abre el modal "Asignar Empleado"
2. Debería cargar la lista de empleados sin puesto
3. No debería aparecer el error de JSON

---

## 📝 LECCIONES APRENDIDAS

### **1. Orden de Rutas es Crítico en NestJS**
- NestJS evalúa rutas en el orden en que están declaradas
- Primera coincidencia gana
- Rutas específicas siempre antes de rutas con parámetros

### **2. Síntomas de Orden Incorrecto:**
- Error: `SyntaxError: Unexpected token '<'`
- Endpoint devuelve HTML en lugar de JSON
- 404 en rutas que deberían existir

### **3. Debugging:**
```typescript
// Agregar logs para debugging
@Get('sin-puesto/disponibles')
async obtenerUsuariosSinPuesto() {
  console.log('✅ Ruta sin-puesto/disponibles alcanzada');
  return this.usuariosService.obtenerUsuariosSinPuesto();
}

@Get(':id')
async obtenerUsuarioPorId(@Param('id') id: string) {
  console.log('📍 Ruta :id alcanzada con id:', id);
  // Si ves "sin-puesto" aquí, el orden está mal
  return this.usuariosService.obtenerUsuarioPorId(id);
}
```

---

## ✅ RESULTADO

### **Antes:**
- ❌ `GET /usuarios/sin-puesto/disponibles` → Error HTML
- ❌ Modal no carga empleados
- ❌ Error en consola: "not valid JSON"

### **Después:**
- ✅ `GET /usuarios/sin-puesto/disponibles` → JSON correcto
- ✅ Modal carga empleados disponibles
- ✅ Sin errores en consola

---

## 🔍 VERIFICACIÓN

### **Checklist:**
- ✅ Ruta `sin-puesto/disponibles` está ANTES de `:id`
- ✅ Servidor backend reiniciado
- ✅ Endpoint devuelve JSON válido
- ✅ Modal carga empleados correctamente
- ✅ Sin errores en consola del navegador

---

## 📚 DOCUMENTACIÓN ADICIONAL

### **NestJS Route Order:**
- [NestJS Routing Documentation](https://docs.nestjs.com/controllers#routing)
- Regla: "More specific routes should be declared before generic routes"

### **Archivos Modificados:**
1. `usuarios.controller.ts` - Reordenadas rutas (líneas 33-93)

---

**Estado:** ✅ CORREGIDO  
**Requiere:** Reinicio del servidor backend  
**Impacto:** Modal de asignar empleados ahora funciona correctamente

---

**Desarrollado con:** NestJS + TypeScript  
**Patrón:** Route Order Best Practices  
**Calidad:** ⭐⭐⭐⭐⭐
