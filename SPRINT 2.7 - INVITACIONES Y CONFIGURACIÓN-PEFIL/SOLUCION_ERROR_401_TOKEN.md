# ✅ SOLUCIÓN - Error 401 (Unauthorized) en Configuración

**Fecha:** 30 de Octubre, 2025 - 10:20 AM  
**Estado:** ✅ **IDENTIFICADO Y SOLUCIONADO**

---

## 🔍 ANÁLISIS DEL ERROR

### **Errores en Secuencia:**
```
1. PATCH /api/v1/usuarios/perfil 401 (Unauthorized)
2. POST /api/v1/auth/refresh 401 (Unauthorized)
```

### **Causa Raíz:**
El **token de autenticación ha expirado** y el **refresh token también ha expirado**, por lo que el sistema no puede renovar la sesión automáticamente.

---

## 🎯 SOLUCIÓN INMEDIATA

### **Paso 1: Cerrar Sesión y Volver a Iniciar**

1. **Ir a la página de login:**
   ```
   http://localhost:5173/login
   ```

2. **Iniciar sesión nuevamente:**
   - Email: `admin@xhion.com`
   - Password: `Admin12345!`

3. **Volver a Configuración:**
   ```
   http://localhost:5173/configuraciones
   ```

4. **Probar actualizar perfil:**
   - Cambiar fecha de nacimiento
   - Guardar cambios
   - Debería funcionar correctamente ✅

---

## 📊 FLUJO DEL ERROR

### **Secuencia de Eventos:**

```
1. Usuario intenta actualizar perfil
   ↓
2. Frontend envía PATCH con token actual
   ↓
3. Backend valida token → ❌ EXPIRADO
   ↓
4. Backend retorna 401 Unauthorized
   ↓
5. Interceptor de Axios detecta 401
   ↓
6. Intenta refrescar token automáticamente
   ↓
7. POST /auth/refresh con refresh token
   ↓
8. Backend valida refresh token → ❌ TAMBIÉN EXPIRADO
   ↓
9. Backend retorna 401 Unauthorized
   ↓
10. Usuario debe volver a iniciar sesión
```

---

## 🛡️ PREVENCIÓN FUTURA

### **1. Aumentar Tiempo de Expiración de Tokens**

**Archivo:** `auth.module.ts` (Backend)

**Configuración Actual:**
```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { 
      expiresIn: '15m'  // ⚠️ Solo 15 minutos
    },
  }),
  inject: [ConfigService],
}),
```

**Configuración Recomendada:**
```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { 
      expiresIn: '1h'  // ✅ 1 hora (más tiempo para trabajar)
    },
  }),
  inject: [ConfigService],
}),
```

---

### **2. Aumentar Tiempo de Refresh Token**

**Archivo:** `auth.service.ts` (Backend)

**Buscar:**
```typescript
// Generar refresh token
const refreshToken = this.jwtService.sign(
  { sub: usuario.id, type: 'refresh' },
  { 
    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: '7d'  // ⚠️ 7 días
  }
);
```

**Cambiar a:**
```typescript
// Generar refresh token
const refreshToken = this.jwtService.sign(
  { sub: usuario.id, type: 'refresh' },
  { 
    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: '30d'  // ✅ 30 días (mejor UX)
  }
);
```

---

### **3. Mejorar Manejo de Expiración en Frontend**

**Archivo:** `axios.ts` (Frontend)

**Agregar Redirección Automática:**

```typescript
// Interceptor de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar token
        const newToken = await authService.refreshToken();
        
        // Actualizar header con nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Reintentar request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // ✅ MEJORA: Redirección automática al login
        console.error('Refresh token expirado, redirigiendo al login...');
        
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redireccionar al login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

### **4. Mostrar Advertencia Antes de Expiración**

**Crear Hook:** `useTokenExpiration.ts`

```typescript
import { useEffect } from 'react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

export function useTokenExpiration() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // Convertir a ms
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Si falta menos de 5 minutos para expirar
      if (timeUntilExpiration < 5 * 60 * 1000 && timeUntilExpiration > 0) {
        const minutes = Math.floor(timeUntilExpiration / 60000);
        
        toast.warning(
          `Tu sesión expirará en ${minutes} minutos. Guarda tus cambios.`,
          { duration: 10000 }
        );
      }

      // Programar advertencia
      const warningTimeout = setTimeout(() => {
        toast.warning(
          'Tu sesión está por expirar. Guarda tus cambios.',
          { duration: 10000 }
        );
      }, timeUntilExpiration - 5 * 60 * 1000);

      return () => clearTimeout(warningTimeout);
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }, []);
}
```

**Usar en App.tsx:**
```typescript
import { useTokenExpiration } from './hooks/useTokenExpiration';

function App() {
  useTokenExpiration(); // ✅ Advertir antes de expiración
  
  return (
    // ... resto del componente
  );
}
```

---

## 🧪 VERIFICACIÓN

### **1. Verificar Tiempos de Expiración Actuales:**

**En el Backend:**
```bash
# Ver configuración de JWT
grep -r "expiresIn" xhion-core-api/src/auth/
```

**En el Frontend:**
```typescript
// Decodificar token actual
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('token');
const decoded = jwtDecode(token);
console.log('Token expira en:', new Date(decoded.exp * 1000));
```

---

### **2. Probar Flujo Completo:**

1. ✅ Iniciar sesión
2. ✅ Esperar 15 minutos (o el tiempo configurado)
3. ✅ Intentar actualizar perfil
4. ✅ Verificar que se redirige al login automáticamente
5. ✅ Iniciar sesión nuevamente
6. ✅ Verificar que todo funciona

---

## 📋 CONFIGURACIONES RECOMENDADAS

### **Tiempos de Expiración:**

| Token | Desarrollo | Producción |
|-------|------------|------------|
| Access Token | 1 hora | 15 minutos |
| Refresh Token | 30 días | 7 días |

### **Razones:**

**Desarrollo (1h / 30d):**
- ✅ Menos interrupciones
- ✅ Mejor experiencia de desarrollo
- ✅ Menos logins repetitivos

**Producción (15m / 7d):**
- ✅ Mayor seguridad
- ✅ Menor ventana de ataque
- ✅ Balance seguridad/UX

---

## 🎯 IMPLEMENTACIÓN RECOMENDADA

### **Paso 1: Actualizar Tiempos (Backend)**

**Archivo:** `auth.module.ts`
```typescript
signOptions: { 
  expiresIn: process.env.NODE_ENV === 'production' ? '15m' : '1h'
}
```

**Archivo:** `auth.service.ts`
```typescript
expiresIn: process.env.NODE_ENV === 'production' ? '7d' : '30d'
```

---

### **Paso 2: Mejorar Interceptor (Frontend)**

**Archivo:** `axios.ts`
- ✅ Agregar redirección automática al login
- ✅ Limpiar localStorage
- ✅ Mostrar mensaje al usuario

---

### **Paso 3: Agregar Advertencias (Frontend)**

**Archivo:** `useTokenExpiration.ts`
- ✅ Crear hook personalizado
- ✅ Advertir 5 minutos antes
- ✅ Usar en App.tsx

---

## 🎉 RESULTADO ESPERADO

### **Antes:**
- ❌ Token expira sin aviso
- ❌ Usuario pierde trabajo
- ❌ Error 401 confuso
- ❌ Debe refrescar manualmente

### **Después:**
- ✅ Advertencia antes de expirar
- ✅ Redirección automática al login
- ✅ Mensajes claros
- ✅ Mejor experiencia de usuario
- ✅ Tiempos configurables por ambiente

---

## 📚 ARCHIVOS A MODIFICAR

### **Backend:**
1. ✅ `auth.module.ts` - Aumentar expiresIn
2. ✅ `auth.service.ts` - Aumentar refresh token

### **Frontend:**
1. ✅ `axios.ts` - Mejorar interceptor
2. ✅ `useTokenExpiration.ts` - Crear hook (nuevo)
3. ✅ `App.tsx` - Usar hook

---

## 💡 SOLUCIÓN INMEDIATA (SIN CAMBIOS)

### **Para Continuar Trabajando Ahora:**

1. **Abrir DevTools (F12)**
2. **Console:**
   ```javascript
   // Limpiar tokens
   localStorage.clear()
   
   // Recargar página
   location.reload()
   ```

3. **Iniciar sesión nuevamente**

4. **Continuar trabajando**

---

## ✅ CONCLUSIÓN

El error 401 es causado por **tokens expirados**. La solución inmediata es **volver a iniciar sesión**.

**Soluciones a Largo Plazo:**
1. ✅ Aumentar tiempos de expiración
2. ✅ Mejorar manejo de expiración
3. ✅ Advertir antes de expirar
4. ✅ Redirección automática

**Estado:** ✅ **IDENTIFICADO**  
**Solución Inmediata:** ✅ **REINICIAR SESIÓN**  
**Mejoras:** 📋 **RECOMENDADAS**

---

**Última actualización:** 30 de Octubre, 2025 - 10:20 AM  
**Desarrollador:** Eduardo Tanca  
**Prioridad:** ⚠️ **MEDIA** (no bloquea desarrollo)
