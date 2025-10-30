# 🚀 SETUP COMPLETO DEL BACKEND - GUÍA PASO A PASO

**Fecha:** 30 de Octubre, 2025  
**Estado:** ✅ **SCHEMA ACTUALIZADO - LISTOS PARA CONTINUAR**

---

## ✅ PASO 1: SCHEMA ACTUALIZADO

### **Cambios Aplicados:**

#### **1. Modelo Sesion:**
```prisma
model Sesion {
  id               String    @id @default(uuid()) @db.Uuid
  usuarioId        String    @db.Uuid
  refreshTokenHash String    @unique @db.VarChar(255)
  accessToken      String?   @unique @db.VarChar(500) // ✅ NUEVO
  userAgent        String?   @map("user_agent")
  direccionIp      String?   @map("direccion_ip") @db.VarChar(45)
  fechaCreacion    DateTime  @default(now())
  fechaUltimoUso   DateTime  @updatedAt
  fechaExpiracion  DateTime  // ✅ NUEVO

  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@map("sesiones")
  @@index([usuarioId])          // ✅ NUEVO
  @@index([fechaExpiracion])    // ✅ NUEVO
}
```

#### **2. Modelo ConfiguracionUsuario:**
```prisma
model ConfiguracionUsuario {
  id              String   @id @default(uuid()) @db.Uuid
  usuarioId       String   @db.Uuid
  preferencias    Json?    // ✅ NUEVO - Preferencias de UI
  notificaciones  Json?    // ✅ NUEVO - Configuración de notificaciones
  fechaCreacion   DateTime @default(now())
  fechaActualizacion DateTime @updatedAt

  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@unique([usuarioId])
}
```

---

## 📋 PASO 2: EJECUTAR MIGRACIONES

### **Comando:**
```bash
cd xhion-core-api
pnpm prisma generate
pnpm prisma migrate dev --name add-settings-fields
```

### **Qué hace:**
1. ✅ Genera el cliente de Prisma actualizado
2. ✅ Crea una migración con los cambios
3. ✅ Aplica la migración a la base de datos
4. ✅ Actualiza los tipos de TypeScript

---

## 📦 PASO 3: INSTALAR DEPENDENCIAS

### **Comando:**
```bash
cd xhion-core-api
pnpm install @nestjs/platform-express multer @types/multer
```

### **Dependencias:**
- `@nestjs/platform-express` - Soporte para Express y Multer
- `multer` - Middleware para upload de archivos
- `@types/multer` - Tipos de TypeScript para Multer

---

## 📁 PASO 4: CREAR DIRECTORIOS

### **Comando:**
```bash
cd xhion-core-api
mkdir -p uploads/avatars
mkdir -p uploads/cvs
```

### **Estructura:**
```
xhion-core-api/
├── uploads/
│   ├── avatars/     ✅ Para imágenes de perfil
│   └── cvs/         ✅ Para archivos PDF de CV
```

---

## 🔧 PASO 5: REGISTRAR CONTROLADORES

### **5.1. Actualizar `usuarios.module.ts`:**

**Ubicación:** `src/usuarios/usuarios.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { UsuariosConfiguracionController } from './usuarios-configuracion.controller'; // ✅ AGREGAR
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    UsuariosController,
    UsuariosConfiguracionController, // ✅ AGREGAR
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
```

### **5.2. Actualizar `auth.module.ts`:**

**Ubicación:** `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthSesionesController } from './auth-sesiones.controller'; // ✅ AGREGAR
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    AuthController,
    AuthSesionesController, // ✅ AGREGAR
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 🌐 PASO 6: CONFIGURAR ARCHIVOS ESTÁTICOS

### **Actualizar `main.ts`:**

**Ubicación:** `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ AGREGAR
import { join } from 'path'; // ✅ AGREGAR
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // ✅ CAMBIAR TIPO

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ AGREGAR: Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Xhion Core API')
    .setDescription('API del sistema de gestión empresarial')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

## 🔧 PASO 7: AJUSTAR CONTROLADORES

### **7.1. Corregir `usuarios-configuracion.controller.ts`:**

**Línea 99:** Cambiar `accion` por `nombreAccion`:

```typescript
// ❌ ANTES
permisos: usuarioActualizado.rol.permisos.map((rp) => rp.permiso.accion),

// ✅ DESPUÉS
permisos: usuarioActualizado.rol.permisos.map((rp) => rp.permiso.nombreAccion),
```

### **7.2. Corregir `auth-sesiones.controller.ts`:**

**Líneas 76-93:** Ajustar campos de Sesion:

```typescript
// ❌ ANTES
fechaExpiracion: {
  gt: new Date(),
},

// ✅ DESPUÉS
fechaExpiracion: {
  gte: new Date(),
},

// Y cambiar:
// ❌ ANTES
ip: sesion.ip || 'IP desconocida',
lastActivity: sesion.fechaActualizacion || sesion.fechaCreacion,
isCurrentSession: sesion.token === tokenActual,

// ✅ DESPUÉS
ip: sesion.direccionIp || 'IP desconocida',
lastActivity: sesion.fechaUltimoUso,
isCurrentSession: sesion.accessToken === tokenActual,
```

---

## ✅ PASO 8: VERIFICAR INSTALACIÓN

### **Comando:**
```bash
cd xhion-core-api
pnpm run start:dev
```

### **Verificar:**
1. ✅ La aplicación inicia sin errores
2. ✅ Swagger está disponible en `http://localhost:3000/api/docs`
3. ✅ Los nuevos endpoints aparecen en Swagger
4. ✅ Los directorios de upload existen

---

## 🧪 PASO 9: PROBAR ENDPOINTS

### **9.1. Obtener Token JWT:**
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@xhion.com",
  "password": "tu-password"
}
```

### **9.2. Probar Actualizar Perfil:**
```bash
PATCH http://localhost:3000/usuarios/perfil
Authorization: Bearer {tu-token}
Content-Type: application/json

{
  "nombreCompleto": "Juan Pérez García",
  "biografia": "Desarrollador Full Stack",
  "fechaNacimiento": "1990-05-15T00:00:00.000Z",
  "fechaIngreso": "2020-01-10T00:00:00.000Z"
}
```

### **9.3. Probar Subir Avatar:**
```bash
POST http://localhost:3000/usuarios/avatar
Authorization: Bearer {tu-token}
Content-Type: multipart/form-data

avatar: [seleccionar archivo JPG/PNG/GIF]
```

### **9.4. Probar Preferencias:**
```bash
GET http://localhost:3000/usuarios/preferencias
Authorization: Bearer {tu-token}

PATCH http://localhost:3000/usuarios/preferencias
Authorization: Bearer {tu-token}
Content-Type: application/json

{
  "theme": "dark",
  "language": "es",
  "timezone": "America/Mexico_City"
}
```

### **9.5. Probar Sesiones:**
```bash
GET http://localhost:3000/auth/sesiones
Authorization: Bearer {tu-token}
```

---

## 📊 CHECKLIST COMPLETO

### **Schema y Base de Datos:**
- [x] Modelo Sesion actualizado
- [x] Modelo ConfiguracionUsuario actualizado
- [ ] Ejecutar `prisma generate`
- [ ] Ejecutar `prisma migrate dev`

### **Dependencias:**
- [ ] Instalar @nestjs/platform-express
- [ ] Instalar multer
- [ ] Instalar @types/multer

### **Directorios:**
- [ ] Crear uploads/avatars
- [ ] Crear uploads/cvs

### **Código:**
- [ ] Registrar UsuariosConfiguracionController
- [ ] Registrar AuthSesionesController
- [ ] Configurar archivos estáticos en main.ts
- [ ] Corregir línea 99 en usuarios-configuracion.controller.ts
- [ ] Ajustar campos de Sesion en auth-sesiones.controller.ts

### **Testing:**
- [ ] Verificar que la app inicia
- [ ] Probar endpoint de perfil
- [ ] Probar upload de avatar
- [ ] Probar preferencias
- [ ] Probar notificaciones
- [ ] Probar sesiones
- [ ] Probar cambio de contraseña
- [ ] Probar exportar datos
- [ ] Probar eliminar cuenta

---

## 🎯 RESULTADO ESPERADO

Después de completar todos los pasos:

✅ **13 endpoints funcionando:**
- 3 de perfil (actualizar, avatar, CV)
- 2 de preferencias (get, update)
- 2 de notificaciones (get, update)
- 4 de seguridad (cambiar contraseña, sesiones)
- 2 de privacidad (exportar, eliminar)

✅ **Funcionalidades:**
- Upload de archivos con validación
- Gestión de sesiones activas
- Preferencias y notificaciones en JSON
- Exportación de datos
- Eliminación lógica de cuenta

✅ **Integración con Frontend:**
- Todos los servicios del frontend funcionarán
- Panel de configuración 100% operativo

---

## 🚀 COMANDOS RÁPIDOS

```bash
# 1. Generar cliente y migrar
cd xhion-core-api
pnpm prisma generate
pnpm prisma migrate dev --name add-settings-fields

# 2. Instalar dependencias
pnpm install @nestjs/platform-express multer @types/multer

# 3. Crear directorios
mkdir -p uploads/avatars uploads/cvs

# 4. Iniciar servidor
pnpm run start:dev
```

---

**Estado:** ✅ **SCHEMA LISTO - CONTINUAR CON PASOS 2-9**  
**Tiempo estimado:** 30 minutos  
**Dificultad:** Media

---

**Última actualización:** 30 de Octubre, 2025  
**Autor:** Eduardo Tanca
