# 📦 Instalación de Dependencias - Calendario Completo

**Fecha:** 7 de Noviembre, 2025  
**Estado:** ✅ Listo para Instalar

---

## 🎯 Dependencias Requeridas

Para que todas las funcionalidades del calendario funcionen correctamente, necesitas instalar las siguientes dependencias:

---

## 🔧 Backend (xhion-core-api)

### 1. WebSocket y Socket.IO

```bash
cd xhion-core-api

# Instalar dependencias de WebSocket
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io

# Verificar instalación
pnpm list @nestjs/websockets
```

**Paquetes instalados:**
- `@nestjs/websockets` - Decoradores y utilidades de NestJS para WebSocket
- `@nestjs/platform-socket.io` - Adaptador de Socket.IO para NestJS
- `socket.io` - Librería de WebSocket bidireccional

---

## 🎨 Frontend (xhion-core-client)

### 1. Drag & Drop

```bash
cd xhion-core-client

# Instalar librería de Drag & Drop
pnpm add @hello-pangea/dnd

# Verificar instalación
pnpm list @hello-pangea/dnd
```

**Paquete instalado:**
- `@hello-pangea/dnd` - Fork mantenido de react-beautiful-dnd

### 2. Socket.IO Client

```bash
# Instalar cliente de Socket.IO
pnpm add socket.io-client

# Verificar instalación
pnpm list socket.io-client
```

**Paquete instalado:**
- `socket.io-client` - Cliente de Socket.IO para React

### 3. Date-fns (Si no está instalado)

```bash
# Instalar date-fns para manejo de fechas
pnpm add date-fns

# Verificar instalación
pnpm list date-fns
```

**Paquete instalado:**
- `date-fns` - Librería moderna de manejo de fechas

---

## 🚀 Instalación Rápida (Todo en uno)

### Backend:
```bash
cd xhion-core-api
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Frontend:
```bash
cd xhion-core-client
pnpm add @hello-pangea/dnd socket.io-client date-fns
```

---

## ✅ Verificación de Instalación

### Backend:

```bash
cd xhion-core-api

# Verificar todas las dependencias
pnpm list | grep -E "websockets|socket.io"

# Debería mostrar:
# @nestjs/platform-socket.io
# @nestjs/websockets
# socket.io
```

### Frontend:

```bash
cd xhion-core-client

# Verificar todas las dependencias
pnpm list | grep -E "dnd|socket.io-client|date-fns"

# Debería mostrar:
# @hello-pangea/dnd
# socket.io-client
# date-fns
```

---

## 🔄 Después de Instalar

### 1. Generar Cliente de Prisma (Backend)

```bash
cd xhion-core-api
pnpm prisma generate
```

### 2. Reiniciar Servidores

**Backend:**
```bash
cd xhion-core-api
pnpm run start:dev
```

**Frontend:**
```bash
cd xhion-core-client
pnpm run dev
```

---

## 📋 Checklist de Instalación

### Backend:
- [ ] `@nestjs/websockets` instalado
- [ ] `@nestjs/platform-socket.io` instalado
- [ ] `socket.io` instalado
- [ ] Prisma client generado
- [ ] Servidor reiniciado

### Frontend:
- [ ] `@hello-pangea/dnd` instalado
- [ ] `socket.io-client` instalado
- [ ] `date-fns` instalado
- [ ] Servidor reiniciado

---

## 🐛 Solución de Problemas

### Error: "Cannot find module '@nestjs/websockets'"

**Solución:**
```bash
cd xhion-core-api
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm install
```

### Error: "Cannot find module 'socket.io-client'"

**Solución:**
```bash
cd xhion-core-client
pnpm add socket.io-client
pnpm install
```

### Error: "Cannot find module '@hello-pangea/dnd'"

**Solución:**
```bash
cd xhion-core-client
pnpm add @hello-pangea/dnd
pnpm install
```

### Error: Prisma Client no actualizado

**Solución:**
```bash
cd xhion-core-api
pnpm prisma generate
pnpm run start:dev
```

---

## 📦 Versiones Recomendadas

```json
{
  "backend": {
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "socket.io": "^4.6.0"
  },
  "frontend": {
    "@hello-pangea/dnd": "^16.5.0",
    "socket.io-client": "^4.6.0",
    "date-fns": "^2.30.0"
  }
}
```

---

## 🎯 Próximos Pasos

Después de instalar todas las dependencias:

1. ✅ Ejecutar migración de Prisma
2. ✅ Registrar WebSocketModule en app.module.ts
3. ✅ Iniciar ambos servidores
4. ✅ Probar funcionalidades del calendario

---

## 📚 Documentación de Dependencias

### @nestjs/websockets
- **Docs:** https://docs.nestjs.com/websockets/gateways
- **GitHub:** https://github.com/nestjs/nest

### socket.io
- **Docs:** https://socket.io/docs/v4/
- **GitHub:** https://github.com/socketio/socket.io

### @hello-pangea/dnd
- **Docs:** https://github.com/hello-pangea/dnd
- **Migración desde react-beautiful-dnd:** Incluida

### socket.io-client
- **Docs:** https://socket.io/docs/v4/client-api/
- **GitHub:** https://github.com/socketio/socket.io-client

### date-fns
- **Docs:** https://date-fns.org/
- **GitHub:** https://github.com/date-fns/date-fns

---

## ✅ Conclusión

Una vez instaladas todas las dependencias, el calendario estará **100% funcional** con:

- ✅ Drag & Drop de eventos
- ✅ WebSocket en tiempo real
- ✅ Notificaciones push
- ✅ 4 vistas de calendario
- ✅ Sistema de notificaciones completo

**¡Listo para probar todas las funcionalidades!** 🎉

---

**Desarrollado con ❤️ y ☕ por Eduardo Tanca**  
*Practicante Pre-Profesional SENATI*  
*Full Stack Developer*

© 2025 Eduardo Tanca - Todos los derechos reservados
