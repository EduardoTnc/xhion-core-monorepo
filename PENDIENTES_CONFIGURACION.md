# ⚙️ PENDIENTES DE CONFIGURACIÓN - Checklist Final

**Fecha:** 8 de Noviembre, 2025  
**Estado:** 📋 PENDIENTE DE CONFIGURACIÓN

---

## 🎯 Resumen

Este documento lista **todos los puntos de configuración pendientes** antes de que el sistema esté 100% operativo en producción.

---

## 📧 1. SISTEMA DE EMAILS (CRÍTICO)

### Estado: ❌ NO CONFIGURADO

### Tareas:

#### 1.1 Instalar Dependencias
```bash
cd xhion-core-api
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

#### 1.2 Configurar Variables de Entorno

**Archivo:** `xhion-core-api/.env`

```env
# ========================================
# CONFIGURACIÓN DE EMAIL
# ========================================

# Servidor SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Credenciales (CAMBIAR)
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion

# Remitente
SMTP_FROM=noreply@xhioncore.com

# Configuración de la App
APP_NAME=Xhion Core
APP_URL=http://localhost:5173
SUPPORT_EMAIL=soporte@xhioncore.com
```

#### 1.3 Configurar Gmail (Desarrollo)

1. **Habilitar 2FA:**
   - Ir a: https://myaccount.google.com/security
   - Activar "Verificación en dos pasos"

2. **Generar Contraseña de Aplicación:**
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" → "Otro (nombre personalizado)"
   - Copiar contraseña de 16 caracteres
   - Pegar en `SMTP_PASS`

3. **Verificar:**
   ```bash
   pnpm run start:dev
   # Buscar en logs: "Servidor SMTP listo para enviar emails"
   ```

#### 1.4 Configurar SendGrid (Producción)

1. **Crear cuenta:** https://sendgrid.com/
2. **Generar API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key → Full Access
   - Copiar API Key

3. **Actualizar .env:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxxxxxxxx
   ```

#### 1.5 Probar Envío

```bash
# Crear solicitud de prueba
POST http://localhost:3000/api/v1/solicitudes-acceso
{
  "nombreCompleto": "Test User",
  "email": "tu-email-de-prueba@gmail.com",
  "empresa": "Test Company"
}

# Verificar:
# 1. Email de confirmación en bandeja del solicitante
# 2. Email de notificación en bandeja de administradores
```

---

## 🔐 2. VARIABLES DE ENTORNO PRODUCCIÓN

### Estado: ❌ NO CONFIGURADO

### Tareas:

#### 2.1 Crear `.env.production`

**Archivo:** `xhion-core-api/.env.production`

```env
# ========================================
# PRODUCCIÓN - XHION CORE API
# ========================================

# Base de Datos (CAMBIAR)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# JWT (CAMBIAR - Generar nuevos secrets)
JWT_SECRET=tu-secret-super-seguro-de-produccion-64-caracteres-minimo
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro-de-produccion-64-caracteres

# Email (CAMBIAR)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.tu-api-key-de-sendgrid
SMTP_FROM=noreply@tudominio.com

# App (CAMBIAR)
APP_NAME=Xhion Core
APP_URL=https://tudominio.com
SUPPORT_EMAIL=soporte@tudominio.com

# Throttle
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Otros
NODE_ENV=production
PORT=3000
```

#### 2.2 Generar Secrets Seguros

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.3 Configurar en Servidor

```bash
# Copiar archivo
scp .env.production usuario@servidor:/ruta/xhion-core-api/.env

# O configurar variables en plataforma (Vercel, Railway, etc.)
```

---

## 🌐 3. CONFIGURACIÓN DE DOMINIO

### Estado: ❌ NO CONFIGURADO

### Tareas:

#### 3.1 Backend (API)

**Actualizar en `.env.production`:**
```env
APP_URL=https://api.tudominio.com
```

**Configurar CORS:**
```typescript
// main.ts
app.enableCors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  credentials: true,
});
```

#### 3.2 Frontend (Client)

**Archivo:** `xhion-core-client/.env.production`

```env
VITE_API_URL=https://api.tudominio.com/api/v1
```

#### 3.3 DNS Records

**Configurar en tu proveedor de dominio:**

```
A     @              → IP_SERVIDOR_FRONTEND
A     api            → IP_SERVIDOR_BACKEND
CNAME www            → tudominio.com
```

---

## 📦 4. DEPENDENCIAS FALTANTES

### Estado: ❌ NO INSTALADO

### Tareas:

#### 4.1 Backend

```bash
cd xhion-core-api

# Email
pnpm add nodemailer
pnpm add -D @types/nodemailer

# Verificar otras dependencias
pnpm install
```

#### 4.2 Frontend

```bash
cd xhion-core-client

# Verificar dependencias
pnpm install
```

---

## 🗄️ 5. BASE DE DATOS PRODUCCIÓN

### Estado: ❌ NO CONFIGURADO

### Tareas:

#### 5.1 Crear Base de Datos

**Opciones:**
- Neon (Recomendado): https://neon.tech/
- Supabase: https://supabase.com/
- Railway: https://railway.app/
- AWS RDS
- DigitalOcean

#### 5.2 Ejecutar Migraciones

```bash
cd xhion-core-api

# Configurar DATABASE_URL en .env.production
DATABASE_URL="postgresql://..."

# Ejecutar migraciones
pnpm prisma migrate deploy

# Generar cliente
pnpm prisma generate
```

#### 5.3 Ejecutar Seeds

```bash
# Seed de permisos
pnpm prisma db seed

# Verificar
pnpm prisma studio
```

---

## 🔒 6. SEGURIDAD

### Estado: ⚠️ REVISAR

### Tareas:

#### 6.1 Secrets en Producción

- [ ] JWT_SECRET único y seguro (64+ caracteres)
- [ ] JWT_REFRESH_SECRET único y seguro (64+ caracteres)
- [ ] DATABASE_URL no expuesta
- [ ] SMTP_PASS no expuesta
- [ ] Archivo `.env` en `.gitignore`

#### 6.2 HTTPS

- [ ] Certificado SSL configurado
- [ ] Redirect HTTP → HTTPS
- [ ] HSTS headers configurados

#### 6.3 Rate Limiting

**Verificar en `app.module.ts`:**
```typescript
ThrottlerModule.forRoot({
  ttl: 60,      // 60 segundos
  limit: 100,   // 100 requests (ajustar según necesidad)
})
```

#### 6.4 CORS

**Verificar en `main.ts`:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 📧 7. EMAIL TEMPLATES PERSONALIZACIÓN

### Estado: ⚠️ OPCIONAL

### Tareas:

#### 7.1 Agregar Logo

**En `email.service.ts`, método `getTemplate*()`:**

```html
<div class="header">
  <img src="https://tudominio.com/logo.png" alt="Logo" style="height: 50px; margin-bottom: 20px;">
  <h1>Título</h1>
</div>
```

#### 7.2 Personalizar Colores

**Buscar y reemplazar gradientes:**
```css
/* Morado actual */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Tu color corporativo */
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

#### 7.3 Actualizar Textos

- [ ] Nombre de la empresa
- [ ] Email de soporte
- [ ] Mensajes personalizados
- [ ] Footer con información legal

---

## 🚀 8. DEPLOYMENT

### Estado: ❌ NO DESPLEGADO

### Tareas:

#### 8.1 Backend

**Opción A: Railway**
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd xhion-core-api
railway up
```

**Opción B: Vercel**
```bash
# Instalar CLI
npm i -g vercel

# Deploy
cd xhion-core-api
vercel
```

#### 8.2 Frontend

**Opción A: Vercel**
```bash
cd xhion-core-client
vercel
```

**Opción B: Netlify**
```bash
# Instalar CLI
npm i -g netlify-cli

# Deploy
cd xhion-core-client
netlify deploy --prod
```

---

## 📊 9. MONITOREO Y LOGS

### Estado: ❌ NO CONFIGURADO

### Tareas:

#### 9.1 Logging

**Configurar Winston o similar:**
```bash
pnpm add winston
```

#### 9.2 Error Tracking

**Opciones:**
- Sentry: https://sentry.io/
- LogRocket: https://logrocket.com/
- Rollbar: https://rollbar.com/

#### 9.3 Analytics

- [ ] Google Analytics configurado
- [ ] Mixpanel/Amplitude (opcional)
- [ ] Hotjar (opcional)

---

## 🧪 10. TESTING

### Estado: ⚠️ PENDIENTE

### Tareas:

#### 10.1 Tests Unitarios

```bash
cd xhion-core-api
pnpm test
```

#### 10.2 Tests E2E

```bash
cd xhion-core-api
pnpm test:e2e
```

#### 10.3 Tests Frontend

```bash
cd xhion-core-client
pnpm test
```

---

## 📋 CHECKLIST FINAL

### Configuración Crítica (Obligatorio):

- [ ] **1. Nodemailer instalado**
- [ ] **2. Variables de entorno configuradas (.env)**
- [ ] **3. SMTP configurado y probado**
- [ ] **4. Emails de prueba enviados exitosamente**
- [ ] **5. DATABASE_URL de producción configurada**
- [ ] **6. Migraciones ejecutadas en producción**
- [ ] **7. Seeds ejecutados en producción**
- [ ] **8. JWT secrets generados y configurados**
- [ ] **9. CORS configurado correctamente**
- [ ] **10. HTTPS configurado**

### Configuración Importante (Recomendado):

- [ ] **11. SendGrid configurado para producción**
- [ ] **12. Dominio configurado**
- [ ] **13. DNS records configurados**
- [ ] **14. Email templates personalizados**
- [ ] **15. Logo agregado a emails**
- [ ] **16. Rate limiting ajustado**
- [ ] **17. Logging configurado**
- [ ] **18. Error tracking configurado**
- [ ] **19. Backend desplegado**
- [ ] **20. Frontend desplegado**

### Configuración Opcional (Nice to Have):

- [ ] **21. Analytics configurado**
- [ ] **22. Tests ejecutados**
- [ ] **23. Documentación actualizada**
- [ ] **24. README.md completado**
- [ ] **25. Monitoreo de uptime configurado**

---

## 🎯 ORDEN RECOMENDADO DE CONFIGURACIÓN

### Fase 1: Desarrollo Local (Ahora)
1. ✅ Instalar nodemailer
2. ✅ Configurar Gmail para desarrollo
3. ✅ Probar envío de emails
4. ✅ Verificar flujo completo

### Fase 2: Pre-Producción (Antes de Deploy)
1. ⏳ Generar secrets de producción
2. ⏳ Configurar SendGrid
3. ⏳ Crear base de datos de producción
4. ⏳ Ejecutar migraciones
5. ⏳ Personalizar email templates

### Fase 3: Producción (Deploy)
1. ⏳ Configurar dominio
2. ⏳ Configurar DNS
3. ⏳ Desplegar backend
4. ⏳ Desplegar frontend
5. ⏳ Configurar HTTPS
6. ⏳ Probar en producción

### Fase 4: Post-Deploy (Después)
1. ⏳ Configurar monitoreo
2. ⏳ Configurar analytics
3. ⏳ Ejecutar tests
4. ⏳ Documentar

---

## 📞 CONTACTO Y SOPORTE

### Si algo falla:

1. **Revisar logs:**
   ```bash
   pnpm run start:dev
   # Buscar errores en consola
   ```

2. **Verificar variables:**
   ```bash
   cat .env | grep SMTP
   ```

3. **Probar SMTP manualmente:**
   ```bash
   node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:'tu-email',pass:'tu-pass'}}).verify((err,success)=>console.log(err||'OK'))"
   ```

---

## 🎉 CUANDO TODO ESTÉ CONFIGURADO

### Verificación Final:

```bash
# Backend
curl https://api.tudominio.com/health

# Frontend
curl https://tudominio.com

# Email
# Crear solicitud y verificar que lleguen todos los emails
```

### Celebrar 🎊

¡El sistema estará 100% operativo y listo para producción!

---

**Última actualización:** 8 de Noviembre, 2025  
**Responsable:** Eduardo Tanca  
**Estado:** 📋 Pendiente de configuración

---

© 2025 Eduardo Tanca - Todos los derechos reservados
