# 🔄 REINICIAR SERVIDORES - GUÍA COMPLETA

**Fecha:** 25 de Octubre, 2025  
**Problema:** Errores 404 y JSON inválido después de cambios en el backend

---

## 🚨 PROBLEMA ACTUAL

### **Errores en Consola:**

1. **404 en endpoint de conocimiento:**
   ```
   GET http://localhost:3000/api/v1/conocimiento/departamento/cc4c5d92-... 404 (Not Found)
   ```

2. **Error de JSON en modal:**
   ```
   Error fetching available users: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
   ```

### **Causa:**
El servidor backend **NO se reinició** después de los cambios en `usuarios.controller.ts`. Los cambios en el código no se aplican hasta que reinicies el servidor.

---

## ✅ SOLUCIÓN: REINICIAR AMBOS SERVIDORES

### **Paso 1: Detener Servidores Actuales**

#### **En Windows (PowerShell/CMD):**

**Opción A: Si los servidores están en terminales visibles:**
- Presiona `Ctrl + C` en cada terminal

**Opción B: Si no encuentras las terminales:**
```powershell
# Detener proceso de Node.js en puerto 3000 (Backend)
netstat -ano | findstr :3000
# Anota el PID (última columna)
taskkill /PID <PID> /F

# Detener proceso de Vite en puerto 5173 (Frontend)
netstat -ano | findstr :5173
# Anota el PID
taskkill /PID <PID> /F
```

**Opción C: Matar todos los procesos de Node:**
```powershell
taskkill /IM node.exe /F
```
⚠️ **ADVERTENCIA:** Esto cerrará TODOS los procesos de Node.js

---

### **Paso 2: Reiniciar Backend**

```powershell
# Navegar al directorio del backend
cd c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-api

# Reiniciar en modo desarrollo
pnpm run start:dev
```

**Espera a ver:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] UsuariosController {/api/v1/usuarios}:
[Nest] INFO Mapped {/api/v1/usuarios, GET} route
[Nest] INFO Mapped {/api/v1/usuarios/sin-puesto/disponibles, GET} route  ✅
[Nest] INFO Mapped {/api/v1/usuarios/:id, GET} route
[Nest] INFO [NestApplication] Nest application successfully started
```

**Verifica que aparezca:**
- ✅ `Mapped {/api/v1/usuarios/sin-puesto/disponibles, GET} route`

---

### **Paso 3: Reiniciar Frontend**

**En otra terminal:**
```powershell
# Navegar al directorio del frontend
cd c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-client

# Reiniciar en modo desarrollo
pnpm run dev
```

**Espera a ver:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Paso 4: Verificar en el Navegador**

1. **Abre el navegador**
2. **Ve a:** `http://localhost:5173`
3. **Presiona:** `Ctrl + Shift + R` (recarga forzada, limpia caché)
4. **Abre DevTools:** `F12`
5. **Ve a la pestaña Network**
6. **Navega a un departamento**
7. **Verifica que NO haya errores 404**

---

## 🔍 VERIFICACIÓN DE ENDPOINTS

### **Verificar que el Backend Funciona:**

**Opción A: Usar el navegador (si tienes token):**
```
http://localhost:3000/api/v1/usuarios/sin-puesto/disponibles
```

**Opción B: Usar PowerShell:**
```powershell
# Obtener token (reemplaza con tus credenciales)
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body (@{email="admin@example.com"; password="tu-password"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.access_token

# Probar endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/usuarios/sin-puesto/disponibles" -Method GET -Headers @{Authorization="Bearer $token"}
```

**Respuesta Esperada:**
```json
[
  {
    "id": "uuid",
    "nombreCompleto": "Usuario Sin Puesto",
    "email": "usuario@example.com",
    "rol": {
      "nombre": "Empleado"
    }
  }
]
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### **Backend:**
- [ ] Servidor backend detenido
- [ ] Servidor backend reiniciado con `pnpm run start:dev`
- [ ] Mensaje "Nest application successfully started" visible
- [ ] Ruta `/api/v1/usuarios/sin-puesto/disponibles` mapeada
- [ ] Sin errores en consola del backend

### **Frontend:**
- [ ] Servidor frontend detenido
- [ ] Servidor frontend reiniciado con `pnpm run dev`
- [ ] Mensaje "VITE ready" visible
- [ ] Navegador abierto en `http://localhost:5173`
- [ ] Recarga forzada con `Ctrl + Shift + R`

### **Funcionalidad:**
- [ ] No hay errores 404 en Network tab
- [ ] Modal "Asignar Empleado" abre correctamente
- [ ] Lista de empleados disponibles se carga
- [ ] No hay error "not valid JSON"

---

## 🐛 SI AÚN HAY ERRORES

### **Error 1: Puerto 3000 ya en uso**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```powershell
# Encontrar proceso en puerto 3000
netstat -ano | findstr :3000

# Matar proceso (reemplaza <PID>)
taskkill /PID <PID> /F

# Reintentar
pnpm run start:dev
```

---

### **Error 2: Puerto 5173 ya en uso**
```
Port 5173 is in use, trying another one...
```

**Solución:**
```powershell
# Encontrar proceso en puerto 5173
netstat -ano | findstr :5173

# Matar proceso
taskkill /PID <PID> /F

# Reintentar
pnpm run dev
```

---

### **Error 3: Módulos no encontrados**
```
Error: Cannot find module '@nestjs/common'
```

**Solución:**
```powershell
# Reinstalar dependencias
cd xhion-core-api
pnpm install

# Reiniciar
pnpm run start:dev
```

---

### **Error 4: Caché de Vite corrupta**
```
[vite] Internal server error
```

**Solución:**
```powershell
# Limpiar caché de Vite
cd xhion-core-client
rm -r node_modules/.vite

# Reiniciar
pnpm run dev
```

---

## 🎯 COMANDOS RÁPIDOS

### **Reinicio Completo (Copiar y Pegar):**

```powershell
# Matar todos los procesos de Node
taskkill /IM node.exe /F

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar Backend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-api; pnpm run start:dev"

# Esperar 5 segundos para que backend inicie
Start-Sleep -Seconds 5

# Iniciar Frontend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\eduar\Desktop\Proyectos\xhion-core-monorepo\xhion-core-client; pnpm run dev"
```

---

## 📚 NOTAS IMPORTANTES

### **¿Cuándo Reiniciar?**

**Backend (SIEMPRE reiniciar):**
- ✅ Cambios en archivos `.ts` (controllers, services, etc.)
- ✅ Cambios en `schema.prisma`
- ✅ Instalación de nuevas dependencias
- ✅ Cambios en configuración (`.env`, `main.ts`)

**Frontend (SIEMPRE reiniciar):**
- ✅ Instalación de nuevas dependencias
- ✅ Cambios en `vite.config.ts`
- ✅ Cambios en variables de entorno

**Frontend (NO necesita reinicio):**
- ❌ Cambios en componentes React (`.tsx`)
- ❌ Cambios en estilos (`.css`)
- ❌ Hot Module Replacement (HMR) maneja esto

---

## ✅ RESULTADO ESPERADO

Después de reiniciar ambos servidores:

1. **Backend:**
   - ✅ Servidor corriendo en `http://localhost:3000`
   - ✅ Rutas correctamente mapeadas
   - ✅ Sin errores en consola

2. **Frontend:**
   - ✅ Servidor corriendo en `http://localhost:5173`
   - ✅ Hot reload funcionando
   - ✅ Sin errores en consola del navegador

3. **Funcionalidad:**
   - ✅ Modal "Asignar Empleado" funciona
   - ✅ Lista de empleados se carga
   - ✅ Todos los endpoints responden correctamente

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecuta el comando de reinicio completo** (arriba)
2. **Espera a que ambos servidores inicien** (~10-15 segundos)
3. **Abre el navegador** en `http://localhost:5173`
4. **Recarga la página** con `Ctrl + Shift + R`
5. **Prueba el modal** "Asignar Empleado"
6. **Verifica que funcione** sin errores

---

**¡Los servidores deben reiniciarse para aplicar los cambios!** 🔄

**Estado:** ⚠️ REQUIERE REINICIO INMEDIATO  
**Prioridad:** 🔴 CRÍTICO  
**Tiempo estimado:** 30 segundos
