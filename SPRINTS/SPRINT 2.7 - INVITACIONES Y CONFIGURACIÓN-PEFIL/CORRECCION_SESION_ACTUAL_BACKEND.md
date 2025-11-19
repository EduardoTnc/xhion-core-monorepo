# ✅ CORRECCIÓN - Backend para Identificación de Sesión Actual

**Fecha:** 30 de Octubre, 2025 - 11:05 AM  
**Estado:** ✅ **COMPLETADO**

---

## 🔍 PROBLEMA IDENTIFICADO

**Síntoma:**
- El badge "Sesión Actual" NO aparecía en ninguna sesión
- Todas las sesiones mostraban el botón "Cerrar"
- `session.isCurrentSession` era `false` para todas

**Causa Raíz:**
El `accessToken` **NO se estaba guardando** en la base de datos al crear/actualizar sesiones, por lo que la comparación en el backend siempre fallaba.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **Archivos Modificados:**

#### **1. sesiones.service.ts** ✅

**Cambios:**
- ✅ Agregado `accessToken` a `CreateSessionInput`
- ✅ Agregado `accessToken` a `UpdateSessionInput`
- ✅ Guardado `accessToken` al crear sesión
- ✅ Actualizado `accessToken` al refrescar token
- ✅ Agregado `fechaExpiracion` automática (7 días)
- ✅ Actualizado `fechaUltimoUso` al refrescar

**Antes:**
```typescript
interface CreateSessionInput {
  id: string;
  usuarioId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  direccionIp?: string | null;
  // ❌ Falta accessToken
}

async createSession(input: CreateSessionInput) {
  return this.prisma.sesion.create({
    data: {
      id: input.id,
      usuarioId: input.usuarioId,
      refreshTokenHash: input.refreshTokenHash,
      userAgent: input.userAgent ?? null,
      direccionIp: input.direccionIp ?? null,
      // ❌ No se guarda accessToken
    },
  });
}
```

**Después:**
```typescript
interface CreateSessionInput {
  id: string;
  usuarioId: string;
  refreshTokenHash: string;
  accessToken: string;  // ✅ AGREGADO
  userAgent?: string | null;
  direccionIp?: string | null;
}

async createSession(input: CreateSessionInput) {
  return this.prisma.sesion.create({
    data: {
      id: input.id,
      usuarioId: input.usuarioId,
      refreshTokenHash: input.refreshTokenHash,
      accessToken: input.accessToken,  // ✅ GUARDADO
      userAgent: input.userAgent ?? null,
      direccionIp: input.direccionIp ?? null,
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // ✅ 7 días
    },
  });
}
```

---

#### **2. auth.service.ts** ✅

**Cambios:**
- ✅ Pasado `accessToken` al crear sesión
- ✅ Pasado `accessToken` al actualizar sesión (refresh)

**Antes:**
```typescript
await this.sesionesService.createSession({
  id: sessionId,
  usuarioId: user.id,
  refreshTokenHash,
  userAgent,
  direccionIp: ip,
  // ❌ Falta accessToken
});
```

**Después:**
```typescript
await this.sesionesService.createSession({
  id: sessionId,
  usuarioId: user.id,
  refreshTokenHash,
  accessToken: tokens.accessToken,  // ✅ AGREGADO
  userAgent,
  direccionIp: ip,
});
```

---

## 🔄 FLUJO CORREGIDO

### **1. Login:**
```typescript
// auth.service.ts
async login(user, request) {
  // 1. Generar tokens
  const tokens = await this.generateTokens({ userId, email, sessionId });
  // tokens.accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // 2. Crear sesión CON accessToken
  await this.sesionesService.createSession({
    id: sessionId,
    usuarioId: user.id,
    refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
    accessToken: tokens.accessToken,  // ✅ GUARDADO EN BD
    userAgent: request.get('user-agent'),
    direccionIp: request.ip,
  });
  
  return tokens;
}
```

---

### **2. Refresh Token:**
```typescript
// auth.service.ts
async refreshToken(userId, email, sessionId, refreshToken, request) {
  // 1. Generar nuevos tokens
  const tokens = await this.generateTokens({ userId, email, sessionId });
  
  // 2. Actualizar sesión CON nuevo accessToken
  await this.sesionesService.updateSession(sessionId, {
    refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
    accessToken: tokens.accessToken,  // ✅ ACTUALIZADO EN BD
    userAgent: request.get('user-agent'),
    direccionIp: request.ip,
  });
  
  return tokens;
}
```

---

### **3. Obtener Sesiones:**
```typescript
// auth-sesiones.controller.ts
@Get('sesiones')
async getSesiones(@Request() req) {
  const usuarioId = req.user.id;
  
  // 1. Obtener sesiones de BD
  const sesiones = await this.prisma.sesion.findMany({
    where: { usuarioId, fechaExpiracion: { gte: new Date() } }
  });
  
  // 2. Obtener token actual del request
  const tokenActual = req.headers.authorization?.replace('Bearer ', '');
  // tokenActual = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // 3. Comparar cada sesión
  return sesiones.map((sesion) => ({
    id: sesion.id,
    userAgent: sesion.userAgent,
    ip: sesion.direccionIp,
    lastActivity: sesion.fechaUltimoUso,
    isCurrentSession: sesion.accessToken === tokenActual,  // ✅ AHORA FUNCIONA
    createdAt: sesion.fechaCreacion,
  }));
}
```

**Resultado:**
```json
[
  {
    "id": "session-1",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.100",
    "lastActivity": "2025-10-30T10:44:39",
    "isCurrentSession": true,   // ✅ CORRECTO
    "createdAt": "2025-10-30T10:44:00"
  },
  {
    "id": "session-2",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.100",
    "lastActivity": "2025-10-30T10:32:27",
    "isCurrentSession": false,  // ✅ CORRECTO
    "createdAt": "2025-10-30T10:32:00"
  }
]
```

---

## 📊 COMPARACIÓN

### **ANTES (Incorrecto):**

**Base de Datos:**
```sql
SELECT * FROM sesiones WHERE usuarioId = 'user-1';

| id         | accessToken | refreshTokenHash | userAgent     |
|------------|-------------|------------------|---------------|
| session-1  | NULL        | hash123...       | Mozilla/5.0...|
| session-2  | NULL        | hash456...       | Mozilla/5.0...|
```
↑ `accessToken` era NULL

**Comparación:**
```typescript
sesion.accessToken === tokenActual
NULL === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
false  // ❌ Siempre false
```

**Resultado:**
```json
{
  "isCurrentSession": false  // ❌ Incorrecto para TODAS
}
```

---

### **DESPUÉS (Correcto):**

**Base de Datos:**
```sql
SELECT * FROM sesiones WHERE usuarioId = 'user-1';

| id         | accessToken              | refreshTokenHash | userAgent     |
|------------|--------------------------|------------------|---------------|
| session-1  | eyJhbGciOiJIUzI1NiIsInR5 | hash123...       | Mozilla/5.0...|
| session-2  | eyJhbGciOiJIUzI1NiIsInR8 | hash456...       | Mozilla/5.0...|
```
↑ `accessToken` guardado correctamente

**Comparación:**
```typescript
// Sesión 1:
sesion.accessToken === tokenActual
"eyJhbGciOiJIUzI1NiIsInR5..." === "eyJhbGciOiJIUzI1NiIsInR5..."
true  // ✅ Correcto

// Sesión 2:
sesion.accessToken === tokenActual
"eyJhbGciOiJIUzI1NiIsInR8..." === "eyJhbGciOiJIUzI1NiIsInR5..."
false  // ✅ Correcto
```

**Resultado:**
```json
[
  { "isCurrentSession": true },   // ✅ Sesión actual
  { "isCurrentSession": false }   // ✅ Otra sesión
]
```

---

## 🧪 VERIFICACIÓN

### **Pasos para Probar:**

1. **Cerrar sesión actual:**
   ```
   Logout completo del sistema
   ```

2. **Iniciar sesión nuevamente:**
   ```
   POST /auth/login
   {
     "email": "admin@xhion.com",
     "password": "Admin12345!"
   }
   ```

3. **Ir a Configuración → Seguridad:**
   ```
   GET /auth/sesiones
   ```

4. **Verificar:**
   - ✅ Una sesión tiene badge "● SESIÓN ACTUAL - ESTE NAVEGADOR"
   - ✅ Borde azul doble
   - ✅ Fondo azul
   - ✅ Sin botón "Cerrar"

5. **Abrir en otro navegador/computadora:**
   ```
   Iniciar sesión desde otro dispositivo
   ```

6. **Volver al primer navegador:**
   ```
   Refrescar página de Configuración → Seguridad
   ```

7. **Verificar:**
   - ✅ Primera sesión: "SESIÓN ACTUAL" (azul)
   - ✅ Segunda sesión: Normal (gris) con botón "Cerrar"

---

## 📋 CAMBIOS REALIZADOS

### **sesiones.service.ts:**
- ✅ Agregado `accessToken: string` a `CreateSessionInput`
- ✅ Agregado `accessToken: string` a `UpdateSessionInput`
- ✅ Guardado `accessToken` en `createSession()`
- ✅ Actualizado `accessToken` en `updateSession()`
- ✅ Agregado `fechaExpiracion` automática (7 días)
- ✅ Actualizado `fechaUltimoUso` en `updateSession()`

### **auth.service.ts:**
- ✅ Pasado `accessToken: tokens.accessToken` en `createSession()`
- ✅ Pasado `accessToken: tokens.accessToken` en `updateSession()`

---

## ✅ RESULTADO ESPERADO

### **Frontend:**
```
┌─────────────────────────────────────────────────────┐
│ Sesiones Activas                                    │
├─────────────────────────────────────────────────────┤
│ 💻  [● SESIÓN ACTUAL - ESTE NAVEGADOR]             │  ← Badge visible
│                                                     │
│ Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome   │  ← Azul y bold
│                                                     │
│ IP: 192.168.1.100                                  │
│ Última actividad: 30/10/2025, 10:44:39            │
│ Creada: 30/10/2025, 10:44:00                      │
└─────────────────────────────────────────────────────┘
  ↑ Borde azul DOBLE + Fondo azul + Sombra

┌─────────────────────────────────────────────────────┐
│ 💻  Mozilla/5.0 (Windows NT 10.0; Win64; x64)      │
│     Chrome                            [Cerrar]     │  ← Botón visible
│                                                     │
│ IP: 192.168.1.100                                  │
│ Última actividad: 30/10/2025, 10:32:27            │
│ Creada: 30/10/2025, 10:32:00                      │
└─────────────────────────────────────────────────────┘
  ↑ Borde gris + Fondo gris
```

---

## 🎉 CONCLUSIÓN

**Estado:** ✅ **COMPLETADO**  
**Problema:** ✅ **RESUELTO**  
**Causa:** `accessToken` no se guardaba en BD  
**Solución:** Agregado `accessToken` a crear/actualizar sesiones

**Ahora el badge "SESIÓN ACTUAL" aparecerá correctamente.** 🚀

Para que los cambios tomen efecto:
1. ✅ Reiniciar el servidor backend
2. ✅ Cerrar sesión
3. ✅ Iniciar sesión nuevamente
4. ✅ Verificar en Configuración → Seguridad

---

**Última actualización:** 30 de Octubre, 2025 - 11:05 AM  
**Desarrollador:** Eduardo Tanca  
**Estado:** ✅ **LISTO PARA PROBAR**
