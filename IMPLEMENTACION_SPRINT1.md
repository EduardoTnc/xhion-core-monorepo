# Implementación Sprint 1 - XHION Core

## ✅ Completado

### Backend (API)

#### 1. **Corrección de ThrottlerModule**
- ✅ Actualizado `app.module.ts` para usar la sintaxis correcta de `@nestjs/throttler` v2.0.1
- ✅ Configuración: 20 peticiones por 60 segundos (global)
- ✅ Rate limiting específico en `POST /auth/login`: 5 intentos por 60 segundos

#### 2. **Gestión de Sesiones**
- ✅ Modelo `Sesion` en Prisma con campos: `id`, `usuarioId`, `refreshTokenHash`, `userAgent`, `direccionIp`, `creadaEn`, `actualizadaEn`, `revocadaEn`
- ✅ Migración aplicada: `20250926031759_implement_session_management`
- ✅ `SesionesModule`, `SesionesService`, `SesionesController`
- ✅ Endpoints:
  - `GET /api/v1/sesiones` - Listar sesiones activas
  - `DELETE /api/v1/sesiones/:id` - Revocar sesión específica

#### 3. **Autenticación con Rotación de Tokens**
- ✅ `AuthService` actualizado con gestión de sesiones
- ✅ `RefreshTokenStrategy` y `RefreshTokenGuard`
- ✅ Endpoints actualizados:
  - `POST /api/v1/auth/login` - Login con creación de sesión
  - `POST /api/v1/auth/refresh` - Renovar tokens
  - `POST /api/v1/auth/logout` - Cerrar sesión
  - `POST /api/v1/auth/accept-invitation` - Completar registro
  - `GET /api/v1/invitaciones/:token` - Validar token de invitación

#### 4. **Auditoría**
- ✅ `AuditoriaModule`, `AuditoriaService`, `AuditInterceptor`
- ✅ Decorador `@Auditar(accion: string)`
- ✅ Registro automático en `RegistroAuditoria` con: `usuarioId`, `accion`, `detalles` (JSON), `direccionIp`, `timestamp`
- ✅ Endpoints auditados:
  - Login exitoso
  - Aceptar invitación
  - Refresh token
  - Logout
  - Crear invitación
  - Revocar sesión

#### 5. **Correcciones de Tipos**
- ✅ `AuditoriaService` usa `Prisma.InputJsonValue` para el campo `detalles`
- ✅ Conversión de `null` a `undefined` para compatibilidad con Prisma

---

### Frontend (Client)

#### 1. **Sistema de Temas (Dark/Light Mode)**
- ✅ `themeStore.ts` - Store de Zustand con persistencia en localStorage
- ✅ `ThemeSwitcher.tsx` - Componente Switch con iconos de sol/luna
- ✅ `App.tsx` - Aplicación automática de clase `dark` al `<html>`
- ✅ CSS configurado con `@custom-variant dark (&:is(.dark *))`

#### 2. **Servicio de API**
- ✅ `authService.ts` con funciones:
  - `login(credentials)` - Retorna `{ accessToken, refreshToken, user }`
  - `validarTokenInvitacion(token)` - Valida invitación
  - `completarRegistro(payload)` - Acepta invitación y loguea
  - `obtenerSesionesActivas()` - Lista sesiones
  - `revocarSesion(sesionId)` - Revoca sesión
  - `logout()` - Cierra sesión actual

#### 3. **Páginas de Autenticación**

##### LoginPage (`src/pages/LoginPage.tsx`)
- ✅ UI con `Card`, `Input`, `Button` de HeroUI
- ✅ Validación de campos
- ✅ Estados de carga con `Spinner`
- ✅ Manejo de errores con alertas
- ✅ Fondo responsivo con tema dark/light
- ✅ Integración con `authService.login()`

##### AcceptInvitationPage (`src/pages/AcceptInvitationPage.tsx`)
- ✅ Lectura de token desde URL (`?token=...`)
- ✅ Estado de validación con `Spinner` a pantalla completa
- ✅ Estado de error con mensaje y enlace a login
- ✅ Formulario de registro con validación de contraseñas
- ✅ Integración con `authService.validarTokenInvitacion()` y `completarRegistro()`

##### SessionsPage (`src/pages/SessionsPage.tsx`)
- ✅ Tabla de sesiones activas con `Table` de HeroUI
- ✅ Columnas: Dispositivo, IP, Último Uso, Acciones
- ✅ Parsing de `userAgent` para mostrar navegador/OS
- ✅ Estado de carga con `Skeleton`
- ✅ Modal de confirmación para revocar sesión
- ✅ Toast de notificación tras revocar
- ✅ Recarga automática de lista tras revocación

#### 4. **Layout Principal**

##### Sidebar (`src/components/layout/Sidebar.tsx`)
- ✅ Navegación con `NavLink` de React Router
- ✅ Items: Dashboard, Proyectos, Tareas, Equipo
- ✅ **Escritorio (≥lg)**: Sidebar fijo siempre visible
- ✅ **Móvil (<lg)**: `Drawer` deslizable desde la izquierda
- ✅ Estilos activos en enlaces
- ✅ Logo y footer

##### MainLayout (`src/components/layout/MainLayout.tsx`)
- ✅ `Navbar` con:
  - Botón de menú móvil (solo visible en `<lg`)
  - `ThemeSwitcher`
  - `Avatar` con `Dropdown` de usuario
  - Menú: Mi Perfil, Mis Sesiones, Cerrar Sesión
- ✅ Integración con `Sidebar`
- ✅ `Outlet` de React Router para rutas anidadas
- ✅ Padding responsive (`lg:pl-64` para no solapar sidebar)
- ✅ Función `handleLogout()` con limpieza de estado

#### 5. **Stores de Zustand**

##### authStore.ts
- ✅ Actualizado con:
  - `setToken(token)` - Setea solo el token
  - `setUser(user)` - Setea solo el usuario
  - `login(token, user)` - Setea ambos
  - `clearAuth()` - Limpia todo
  - Tipo `AuthUser` en lugar de `Usuario`

##### themeStore.ts
- ✅ `theme: 'dark' | 'light'`
- ✅ `toggleTheme()` - Alterna tema
- ✅ `setTheme(theme)` - Setea tema específico
- ✅ Persistencia en localStorage

#### 6. **Tipos TypeScript**
- ✅ `LoginDTO` - `{ email, password }`
- ✅ `CompletarRegistroDTO` - `{ token, password }`
- ✅ `Sesion` - Interfaz completa de sesión
- ✅ `Invitacion` - Agregado campo `nombre_completo`
- ✅ `AuthUser` - Usuario simplificado para autenticación

#### 7. **Configuración**
- ✅ `.env` y `.env.example` con `VITE_API_BASE_URL`
- ✅ `App.tsx` con rutas configuradas:
  - `/login` - LoginPage
  - `/aceptar-invitacion` - AcceptInvitationPage
  - Rutas protegidas bajo `ProtectedRoute` + `MainLayout`:
    - `/` - DashboardPage
    - `/proyectos/:id` - ProjectPage
    - `/perfil/sesiones` - SessionsPage

---

## 🚀 Cómo Ejecutar

### Backend

```bash
cd xhion-core-api

# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm exec prisma generate

# Ejecutar migraciones (si es necesario)
pnpm exec prisma migrate deploy

# Iniciar servidor de desarrollo
pnpm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

```bash
cd xhion-core-client

# Instalar dependencias
pnpm install

# Copiar archivo de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
pnpm run dev
```

El cliente estará disponible en `http://localhost:5173`

---

## 🧪 Flujo de Prueba Manual

### 1. Crear Invitación (Desde Backend)
```bash
# Usando un cliente REST (ej. Thunder Client, Postman)
POST http://localhost:3000/api/v1/invitaciones
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "nombre_completo": "Juan Pérez",
  "rol_id": "<ID_ROL_EXISTENTE>",
  "invitado_por_id": "<ID_USUARIO_EXISTENTE>"
}
```

Revisa la consola del backend para ver el token generado.

### 2. Aceptar Invitación
1. Visita: `http://localhost:5173/aceptar-invitacion?token=<TOKEN>`
2. Deberías ver: "¡Bienvenido a XHION Core! Hola, Juan Pérez"
3. Crea una contraseña (mínimo 8 caracteres)
4. Confirma la contraseña
5. Click en "Completar Registro"
6. Serás redirigido al Dashboard

### 3. Login
1. Visita: `http://localhost:5173/login`
2. Ingresa email y contraseña
3. Click en "Ingresar"
4. Serás redirigido al Dashboard

### 4. Gestionar Sesiones
1. Inicia sesión desde múltiples navegadores/dispositivos
2. Navega a: "Avatar → Mis Sesiones" o `/perfil/sesiones`
3. Verás una tabla con todas tus sesiones activas
4. Click en el icono de papelera para revocar una sesión
5. Confirma en el modal
6. Verás un toast de éxito

### 5. Cambiar Tema
1. Click en el Switch de tema en el Navbar
2. La UI cambiará entre modo oscuro y claro
3. La preferencia se guardará en localStorage

### 6. Logout
1. Click en el Avatar en el Navbar
2. Click en "Cerrar Sesión"
3. Serás redirigido a `/login`

### 7. Verificar Auditoría
En la base de datos, revisa la tabla `registro_auditoria`:
```sql
SELECT * FROM registro_auditoria ORDER BY timestamp DESC LIMIT 10;
```

Deberías ver registros de:
- `INICIO_SESION_EXITOSO`
- `ACEPTAR_INVITACION`
- `REVOCAR_SESION`
- Etc.

### 8. Verificar Rate Limiting
Intenta hacer login 6 veces en menos de 60 segundos con credenciales incorrectas. La sexta petición debería retornar `429 Too Many Requests`.

---

## 📋 Checklist de Funcionalidades

### Backend
- [x] Modelo de Sesión en Prisma
- [x] Migración aplicada
- [x] Gestión de sesiones (crear, listar, revocar)
- [x] Rotación de refresh tokens
- [x] Auditoría con interceptor global
- [x] Rate limiting global (20/min)
- [x] Rate limiting específico en login (5/min)
- [x] Endpoint para validar invitaciones

### Frontend
- [x] Tema dark/light con persistencia
- [x] ThemeSwitcher funcional
- [x] LoginPage con validación y estados
- [x] AcceptInvitationPage con validación de token
- [x] SessionsPage con tabla, modal y toast
- [x] Sidebar responsivo (drawer en móvil)
- [x] MainLayout con navbar y usuario
- [x] authService completo
- [x] authStore actualizado
- [x] Tipos TypeScript completos
- [x] Rutas configuradas
- [x] Variables de entorno

---

## 🎨 Tecnologías Utilizadas

### Backend
- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT (access + refresh tokens)
- bcryptjs
- @nestjs/throttler

### Frontend
- React 19
- TypeScript
- React Router 7
- Zustand (estado global)
- HeroUI (componentes)
- Tailwind CSS 4
- Vite 7
- Axios

---

## 📝 Notas Importantes

1. **Refresh Tokens**: Los refresh tokens se guardan hasheados en la base de datos y se rotan en cada renovación.

2. **Sesiones**: Cada login crea una nueva sesión. El usuario puede ver y revocar sesiones individualmente.

3. **Auditoría**: Todas las acciones importantes se registran automáticamente con el interceptor global.

4. **Rate Limiting**: Configurado a nivel global y específico por endpoint.

5. **Modo Oscuro**: Es el tema por defecto. Se puede cambiar con el switch en el navbar.

6. **Responsividad**: Toda la UI es completamente responsiva con breakpoints de Tailwind:
   - `sm`: 640px
   - `md`: 768px
   - `lg`: 1024px
   - `xl`: 1280px

7. **Invitaciones**: El endpoint de validación está en `/api/v1/invitaciones/:token` y retorna la información de la invitación si es válida.

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Frontend
pnpm install

# Backend
pnpm install
pnpm exec prisma generate
```

### Error: "Cannot connect to database"
Verifica que PostgreSQL esté corriendo y que el `.env` del backend tenga la `DATABASE_URL` correcta.

### Error de CORS
Verifica que el backend tenga CORS habilitado en `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Tema no se aplica
Verifica que `index.css` tenga:
```css
@custom-variant dark (&:is(.dark *));
```

---

## ✨ Próximos Pasos (Sprint 2+)

- [ ] Implementar DashboardPage con widgets
- [ ] Módulo de Proyectos completo
- [ ] Módulo de Tareas con Kanban
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] Búsqueda global
- [ ] Módulo de Equipo
- [ ] Gestión de archivos
- [ ] Analytics y reportes
