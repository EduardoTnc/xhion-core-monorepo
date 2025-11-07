# 🔧 Solución: Error 401 Unauthorized en Frontend

**Fecha:** 7 de Noviembre, 2025  
**Estado:** ✅ Solución Identificada

---

## 🔍 Análisis de Errores

### Errores Críticos (401 Unauthorized):
```
GET http://localhost:3000/api/v1/dashboard/timeline 401 (Unauthorized)
GET http://localhost:3000/api/v1/dashboard/mi-dia 401 (Unauthorized)
POST http://localhost:3000/api/v1/auth/refresh 401 (Unauthorized)
```

### Errores No Críticos (Advertencias de Performance):
```
[Violation] 'message' handler took 647ms
[Violation] Forced reflow while executing JavaScript took 50ms
[Violation] 'message' handler took 179ms
```

---

## 🎯 Causa Principal

**El usuario NO está autenticado.**

El flujo de autenticación funciona así:
1. Usuario intenta acceder al Dashboard
2. Los widgets (`GanttChartWidget`, `MyDayWidget`) hacen peticiones al backend
3. El backend requiere autenticación (JWT token)
4. No hay token válido → **401 Unauthorized**
5. El interceptor intenta refrescar el token
6. El refresh también falla → **401 Unauthorized**
7. El authStore ejecuta `logout()` automáticamente

---

## ✅ Solución Inmediata

### Opción 1: Iniciar Sesión Manualmente

1. **Abre la aplicación en el navegador:**
   ```
   http://localhost:5173
   ```

2. **Ve a la página de Login:**
   - Si no estás en login, serás redirigido automáticamente
   - O navega manualmente a `/login`

3. **Inicia sesión con las credenciales del administrador:**
   ```
   Email: admin@xhion.com
   Password: Admin12345!
   ```

4. **Verifica que estés autenticado:**
   - Deberías ver el Dashboard
   - Los errores 401 desaparecerán

---

### Opción 2: Crear un Usuario de Prueba

Si no tienes las credenciales del admin, ejecuta el seed:

```bash
cd xhion-core-api
pnpm prisma db seed
```

Esto creará el usuario administrador con las credenciales del `.env`:
```env
SEED_ADMIN_EMAIL="admin@xhion.com"
SEED_ADMIN_PASSWORD="Admin12345!"
```

---

## 🔧 Solución Permanente: Proteger Rutas

Para evitar que usuarios no autenticados accedan al Dashboard, implementa un **ProtectedRoute**:

### 1. Crear componente ProtectedRoute

**Archivo:** `src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, user } = useAuthStore();

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
```

### 2. Actualizar App.tsx

**Antes:**
```typescript
<Route path="/" element={<DashboardPage />} />
<Route path="/proyectos" element={<ProjectsPage />} />
<Route path="/tareas" element={<TasksPage />} />
// ... otras rutas
```

**Después:**
```typescript
<Route path="/" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
<Route path="/proyectos" element={
  <ProtectedRoute>
    <ProjectsPage />
  </ProtectedRoute>
} />
<Route path="/tareas" element={
  <ProtectedRoute>
    <TasksPage />
  </ProtectedRoute>
} />
// ... otras rutas protegidas
```

---

## 🛡️ Verificación de Autenticación en App.tsx

Asegúrate de que `App.tsx` verifique la autenticación al cargar:

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

function App() {
  const { status, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    // Verificar si hay un token válido al cargar la app
    const verifyAuth = async () => {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        clearAuth();
        return;
      }

      try {
        // Verificar que el token sea válido
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        // Token inválido, limpiar autenticación
        clearAuth();
      }
    };

    if (status === 'loading') {
      verifyAuth();
    }
  }, [status, setUser, clearAuth]);

  // ... resto del código
}
```

---

## 📊 Advertencias de Performance (No Críticas)

Las advertencias de performance son **normales en desarrollo** y no afectan la funcionalidad:

### 1. `'message' handler took 647ms`
- **Causa:** React DevTools en modo desarrollo
- **Solución:** Ignorar en desarrollo, desaparecen en producción

### 2. `Forced reflow while executing JavaScript took 50ms`
- **Causa:** Cálculos de layout en componentes complejos (Gantt Chart)
- **Solución:** Optimizar con `useMemo` y `useCallback` si es necesario

---

## 🎯 Pasos a Seguir (Orden Recomendado)

### Paso 1: Verificar Backend
```bash
cd xhion-core-api
pnpm start:dev
```
✅ Debe estar corriendo en `http://localhost:3000`

### Paso 2: Verificar Frontend
```bash
cd xhion-core-client
pnpm dev
```
✅ Debe estar corriendo en `http://localhost:5173`

### Paso 3: Iniciar Sesión
1. Abre `http://localhost:5173`
2. Ve a `/login`
3. Ingresa credenciales:
   - Email: `admin@xhion.com`
   - Password: `Admin12345!`
4. Click en "Iniciar Sesión"

### Paso 4: Verificar Dashboard
- Deberías ver el Dashboard sin errores 401
- Los widgets cargarán datos correctamente

---

## 🔍 Debugging: Verificar Token en DevTools

### 1. Abrir DevTools (F12)

### 2. Ir a Application → Local Storage → http://localhost:5173

### 3. Buscar la clave `auth-storage`

**Debe contener:**
```json
{
  "state": {
    "status": "authenticated",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@xhion.com",
      "nombreCompleto": "Administrador",
      "rol": { "nombre": "Administrador" }
    }
  }
}
```

**Si está vacío o `status: "unauthenticated"`:**
- El usuario no está autenticado
- Necesitas iniciar sesión

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "Cannot read property 'token' of null"
**Causa:** authStore no está inicializado  
**Solución:** Verificar que `persist` esté configurado correctamente

### Error 2: "Network Error"
**Causa:** Backend no está corriendo  
**Solución:** Ejecutar `pnpm start:dev` en `xhion-core-api`

### Error 3: "CORS Error"
**Causa:** Frontend y backend en diferentes puertos  
**Solución:** Verificar `FRONTEND_ORIGIN` en `.env` del backend:
```env
FRONTEND_ORIGIN=http://localhost:5173
```

### Error 4: Refresh Token falla constantemente
**Causa:** Refresh token expirado o inválido  
**Solución:** Cerrar sesión y volver a iniciar sesión

---

## 📝 Checklist de Verificación

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Base de datos conectada (Neon)
- [ ] Usuario admin creado (seed ejecutado)
- [ ] CORS configurado correctamente
- [ ] Usuario autenticado (token en localStorage)
- [ ] No hay errores 401 en consola
- [ ] Dashboard carga correctamente

---

## 🎓 Explicación del Flujo de Autenticación

### 1. Login
```
Usuario → authService.login() → Backend /auth/login
Backend → Genera JWT tokens → Devuelve { accessToken, refreshToken, user }
Frontend → authStore.login() → Guarda en localStorage
```

### 2. Peticiones Autenticadas
```
Widget → timelineService.getTimelineData() → apiClient.get()
Interceptor → Agrega header: Authorization: Bearer <token>
Backend → Valida token → Devuelve datos
```

### 3. Token Expirado
```
Backend → Devuelve 401 Unauthorized
Interceptor → Detecta 401 → authService.refreshToken()
Backend → Valida refreshToken → Devuelve nuevo accessToken
Interceptor → Actualiza token → Reintenta petición original
```

### 4. Refresh Token Expirado
```
Backend → Devuelve 401 en /auth/refresh
Interceptor → authStore.logout() → Limpia localStorage
Frontend → Redirige a /login
```

---

## ✅ Conclusión

**Problema:** Usuario no autenticado intentando acceder a rutas protegidas  
**Solución:** Iniciar sesión con credenciales válidas  
**Prevención:** Implementar `ProtectedRoute` para todas las rutas privadas

**Estado:** ✅ Solución identificada y documentada  
**Acción requerida:** Iniciar sesión en la aplicación

---

**Desarrollado con ❤️ y ☕ por Eduardo Tanca**  
*Practicante Pre-Profesional SENATI*  
*Full Stack Developer*

© 2025 Eduardo Tanca - Todos los derechos reservados
