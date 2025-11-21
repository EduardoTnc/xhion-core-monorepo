# ⚙️ Checklist de Configuración Pendiente

**Última actualización:** 21 Nov 2025  
**Objetivo:** dejar Xhion Core listo para QA / Producción con foco en correo, IA y despliegue.

---

## 1. Correo transaccional (CRÍTICO) — ❌

- `xhion-core-api`: confirmar instalación de `nodemailer` y `@types/nodemailer` (ya presentes en package.json, solo falta `pnpm install`).
- `.env` local: definir `SMTP_*`, `APP_*`, `SUPPORT_EMAIL`. Para desarrollo usar Gmail con 2FA + App Password; para producción usar SendGrid (`SMTP_USER=apikey`).
- Verificar que `MailService` levante conexión ejecutando `pnpm run start:dev` y enviando una solicitud de acceso de prueba.

## 2. Variables de entorno y secretos — ❌

- Crear `.env.production` para API y client. Mínimo: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SMTP_*`, `APP_URL`, `THROTTLE_*`, `NODE_ENV`, `PORT`.
- Añadir claves IA: `GEMINI_API_KEY`, `AI_CACHE_TTL_MS` (opcional), `AI_BREAKER_THRESHOLD`, `AI_BREAKER_COOLDOWN_MS`. Sin esto la búsqueda y la asistencia de proyectos no funcionan.
- Frontend: `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_URL` y credenciales si aplica.
- Generar secretos con `node -e "require('crypto').randomBytes(64).toString('hex')"` y cargarlos en el servidor/servicio donde se despliegue.

## 3. Runtime & dependencias — ⚠️

- Node 20.19+ obligatorio (Vite 7 falla con 20.17). Actualizar entorno local/CI antes de `pnpm run dev`.
- Ejecutar `pnpm install` en `xhion-core-api` y `xhion-core-client` para asegurar lockfiles alineados.
- Revisar que Prisma CLI (`pnpm prisma`) y seeds tengan permisos/variables (`DATABASE_URL`).

## 4. Dominio, DNS y CORS — ❌

- DNS mínimos: `A @` (frontend), `A api` (backend), `CNAME www` → raíz.
- `.env.production` API: `APP_URL=https://api.tudominio.com` y `FRONTEND_URL=https://tudominio.com`.
- `main.ts`: `app.enableCors({ origin: [FRONTEND_URL, 'https://www…'], credentials: true })`.
- Client `.env.production`: `VITE_API_URL=https://api.tudominio.com/api/v1`.

## 5. Base de datos & Prisma — ❌

- Crear instancia Postgres (Neon / Supabase / Railway / RDS) y apuntar `DATABASE_URL`.
- Ejecutar `pnpm prisma migrate deploy` y luego `pnpm prisma generate` en el servidor.
- Correr seed obligatoria: `pnpm prisma db seed` (permisos IA incluidos). Validar con `pnpm prisma studio` o query simple.

## 6. Seguridad y observabilidad — ⚠️

- Secrets: asegurar que `.env` esté en `.gitignore`, rotar `JWT_*` y no exponer `DATABASE_URL`/`SMTP_PASS`.
- HTTPS: cert emitido + redirect HTTP→HTTPS + HSTS.
- Throttling: confirmar `ThrottlerModule` en `app.module.ts` (ttl=60, limit=100 por defecto) y ajustar si habrá IA pública.
- Logs/telemetría AI: revisar que `ai_query_log` retenga datos sensibles y activar retención/alertas según políticas internas.

## 7. IA y servicios conectados — ⚠️

- Confirmar `GEMINI_API_KEY` válido y cuota disponible (asociado al proyecto de Google Cloud). Añadir `GOOGLE_PROJECT_ID` si se centraliza facturación.
- Probar `/ai/search`, `/ai/search/feedback`, `/ai/projects/assist` con Postman para validar permisos y registro de feedback.
- Revisar `ai-embedding-sync` jobs: requieren credenciales de base y cron si se usará reindexado automático.

## 8. Personalización de emails — Opcional

- Actualizar plantillas HTML en `email.service.ts`: logo, colores corporativos, textos legales y contacto.
- Subir assets a CDN estable (`https://static.tudominio.com/logo.png`).

## 9. Deployment — ❌

- Backend: preparar proyecto en Railway / Render / EC2. Pasos mínimos: `pnpm install`, `pnpm build`, `pnpm prisma migrate deploy`, `pnpm start:prod` con PM2/Supervisor.
- Frontend: build con `pnpm run build` y subir a Vercel / Netlify / S3+CloudFront usando `VITE_*` de producción.
- Post-deploy: smoke test (login, AI search, envío de correo, creación de proyecto asistido).

---

### Estado global

> Priorizar: (1) SMTP + variables críticas, (2) Base de datos + migraciones, (3) claves Gemini + pruebas IA, (4) despliegue coordinado frontend/backend.

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

**Última actualización:** 21 de Noviembre, 2025  
**Responsable:** Eduardo Tanca  

---

© 2025 Eduardo Tanca - Todos los derechos reservados
