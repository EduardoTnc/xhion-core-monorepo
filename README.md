<div align="center">

# 🚀 XHION Core

### Plataforma de Productividad Operativa Impulsada por IA

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-e0234e)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-0c344b)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff)](https://vitejs.dev/)

**Centraliza la gestión de proyectos, optimiza la toma de decisiones con análisis predictivo y fomenta la innovación empresarial.**

[Demo en Vivo](#demo-visual) • [Documentación](#-documentación-de-arquitectura-y-funcionamiento) • [Instalación](#-instalación-getting-started) • [Contribuir](#-contribución)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Demo Visual](#-demo-visual)
- [Características Principales](#-características-principales)
- [Tech Stack](#-tech-stack)
- [Instalación](#-instalación-getting-started)
- [Uso](#-uso)
- [Documentación de Arquitectura](#-documentación-de-arquitectura-y-funcionamiento)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 📖 Descripción

**XHION Core** es una plataforma integral de productividad operativa diseñada para transformar la gestión de proyectos empresariales. Actúa como el sistema nervioso digital de tu organización, unificando la gestión de proyectos, la colaboración contextual y la inteligencia de negocio en un único ecosistema.

### 🎯 Problema que Resuelve

Las organizaciones modernas enfrentan:
- **Fragmentación de información** en múltiples herramientas (hojas de cálculo, emails, mensajería)
- **Falta de visibilidad estratégica** sobre el estado real de los proyectos
- **Ineficiencia operativa** por coordinación manual y reuniones de estado
- **Pérdida de conocimiento** al no documentar lecciones aprendidas

### 💡 Nuestra Solución

XHION Core centraliza toda la gestión operativa en una plataforma moderna que:
- ✅ Unifica proyectos, tareas y equipos en un solo lugar
- ✅ Proporciona visibilidad en tiempo real con dashboards personalizables
- ✅ Automatiza flujos de trabajo con IA
- ✅ Gamifica la productividad para motivar a los equipos
- ✅ Genera insights accionables con analítica avanzada

---

## 🎬 Demo Visual

<div align="center">

### Dashboard Principal
![Dashboard](./docs/screenshots/dashboard.png)
*Vista general del dashboard con widgets personalizables y métricas en tiempo real*

### Gestión de Proyectos
![Proyectos](./docs/screenshots/proyectos.png)
*Panel de proyectos con filtros avanzados, timeline Gantt y estadísticas*

### Tablero Kanban
![Kanban](./docs/screenshots/kanban.png)
*Tablero Kanban interactivo con drag & drop y filtros inteligentes*

### Analítica de Presupuestos
![Presupuestos](./docs/screenshots/presupuestos.png)
*Gráficos interactivos de gastos, proyecciones y comparativas*

</div>

> **Nota:** Para ver la demo en vivo, contacta al equipo de desarrollo.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Sistema de invitaciones por email con tokens únicos
- Autenticación JWT con refresh tokens
- Gestión de sesiones con expiración automática
- Control de acceso basado en roles (RBAC) con 47 permisos granulares
- Auditoría completa de acciones con registro de IP y user agent
- Rate limiting y protección contra ataques

### 📊 Gestión de Proyectos
- CRUD completo de proyectos con soft delete
- Sistema de etapas personalizables con reordenamiento
- Gestión de miembros con roles (Responsable, Miembro, Observador)
- Timeline Gantt interactivo con zoom y navegación infinita
- Documentos de proyecto (6 tipos: Resumen, Objetivos, Especificaciones, etc.)
- Organigrama jerárquico de puestos de trabajo
- Duplicación y exportación de proyectos

### ✅ Gestión de Tareas
- Tablero Kanban con drag & drop (@hello-pangea/dnd)
- 4 estados: Por Hacer, En Progreso, Hecho, Bloqueado
- 4 niveles de prioridad: Baja, Media, Alta, Urgente
- Sistema de comentarios en tiempo real
- Asignación de responsables y fechas de vencimiento
- Filtros avanzados (7 tipos: búsqueda, estado, prioridad, asignado, etapa, fechas)
- Exportación a PDF, Excel y CSV
- Vista de lista, calendario y timeline

### 🏢 Gestión de Departamentos
- Estructura organizacional con jefes de departamento
- Contexto departamental con 5 secciones
- Gestión de empleados y puestos de trabajo
- Presupuestos con tracking de gastos
- Documentación centralizada

### 💰 Presupuestos y Finanzas
- Presupuestos por departamento y proyecto
- Registro de movimientos (ingresos/egresos)
- 6 tipos de gráficos interactivos (Recharts)
- Proyecciones automáticas de gastos
- Alertas de sobregasto
- Comparativas mensuales
- Análisis por categoría

### 👥 Gestión de Usuarios
- Perfiles completos con avatar, biografía y CV
- Contactos y enlaces profesionales
- Sistema de habilidades con niveles (Básico, Intermedio, Avanzado, Experto)
- Supervisión jerárquica
- Configuraciones personalizadas por usuario

### 🎮 Gamificación
- Sistema de puntos por acciones clave
- Logros desbloqueables (insignias)
- Clasificación (leaderboard) semanal y mensual
- Historial de puntos ganados

### 📈 Dashboards y Analítica
- Dashboards personalizables con drag & drop
- Widgets basados en roles
- Métricas en tiempo real
- Gráficos interactivos con date range pickers
- Estados vacíos elegantes
- Exportación de datos

### 🧠 Inteligencia Artificial (Gemini)
- Integración nativa con Google Gemini AI
- Asistente virtual para consultas sobre proyectos y tareas
- Generación automática de resúmenes y reportes
- Análisis de sentimientos en comentarios y feedback
- Sugerencias inteligentes para optimización de recursos

### 📚 Gestión de Conocimiento
- Base de conocimiento centralizada (Wiki)
- Organización por categorías y etiquetas
- Búsqueda semántica potenciada por IA
- Versionado de documentos y artículos
- Permisos de lectura/escritura granulares

### 💡 Gestión de Ideas e Innovación
- Buzón de ideas y sugerencias
- Flujo de aprobación y evaluación de ideas
- Votación y comentarios colaborativos
- Conversión de ideas aprobadas en proyectos
- Gamificación por aportes innovadores

### 🔐 Solicitudes de Acceso
- Flujo automatizado para solicitud de accesos
- Aprobación/Rechazo por administradores
- Notificaciones automáticas de estado
- Historial de solicitudes y auditoría
- Integración con sistema de roles

### 📅 Gestión de Eventos y Calendario
- Calendario interactivo mensual, semanal y diario
- Creación de eventos y reuniones
- Invitaciones a usuarios y departamentos
- Sincronización con tareas y fechas límite
- Recordatorios y notificaciones

### 🎨 Experiencia de Usuario
- Diseño moderno con shadcn/ui + Radix UI
- Dark mode completo
- Responsive (móvil, tablet, desktop)
- 12+ atajos de teclado
- Drag to scroll en timeline
- Tooltips informativos
- Notificaciones con Sonner
- Animaciones fluidas con Framer Motion

### 🔧 Características Técnicas
- PWA con Service Worker
- Modo offline con caché inteligente
- Optimistic updates en estado global
- Code splitting por rutas
- Lazy loading de componentes
- Virtualización de listas largas

---

## 🛠️ Tech Stack

### **Frontend**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.0 | Framework UI |
| **TypeScript** | 5.9.3 | Tipado estático |
| **Vite** | 7.1.9 | Build tool |
| **React Router** | 7.9.3 | Enrutamiento |
| **Zustand** | 5.0.8 | Estado global |
| **React Hook Form** | 7.60.0 | Formularios |
| **Zod** | 3.25.76 | Validación de esquemas |
| **Tailwind CSS** | 4.1.14 | Estilos |
| **Radix UI** | Latest | Componentes primitivos |
| **shadcn/ui** | Latest | Sistema de diseño |
| **Recharts** | Latest | Gráficos |
| **date-fns** | 4.1.0 | Manejo de fechas |
| **Axios** | 1.12.2 | Cliente HTTP |
| **@hello-pangea/dnd** | 18.0.1 | Drag & Drop |
| **Lucide React** | 0.454.0 | Iconos |
| **Framer Motion** | 12.23.22 | Animaciones |

### **Backend**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.1.6 | Framework backend |
| **TypeScript** | 5.9.3 | Tipado estático |
| **Prisma** | 7.0.0 | ORM |
| **PostgreSQL** | Latest | Base de datos |
| **Google Gemini** | 0.24.1 | Inteligencia Artificial |
| **Passport** | 0.7.0 | Autenticación |
| **JWT** | 11.0.0 | Tokens |
| **bcryptjs** | 3.0.2 | Hash de passwords |
| **class-validator** | 0.14.2 | Validación de DTOs |
| **class-transformer** | 0.5.1 | Transformación de datos |
| **Swagger** | 11.2.1 | Documentación API |
| **Helmet** | 8.1.0 | Seguridad HTTP |
| **Throttler** | 6.4.0 | Rate limiting |

### **DevOps y Herramientas**
- **pnpm** - Gestor de paquetes
- **ESLint** - Linter
- **Prettier** - Formateador de código
- **Jest** - Testing
- **Git** - Control de versiones

---

## 🚀 Instalación (Getting Started)

### **Requisitos Previos**

Asegúrate de tener instalado:
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** >= 14.0
- **Git**

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/xhion-core-monorepo.git
cd xhion-core-monorepo
```

### **2. Instalar Dependencias**

```bash
# Instalar dependencias del backend
cd xhion-core-api
pnpm install

# Instalar dependencias del frontend
cd ../xhion-core-client
pnpm install
```

### **3. Configurar Variables de Entorno**

#### **Backend (.env)**

Crea un archivo `.env` en `xhion-core-api/`:

```env
# Base de Datos
DATABASE_URL=\"postgresql://usuario:password@localhost:5432/xhion_core?schema=public\"

# JWT
JWT_SECRET=\"tu-secret-key-super-segura-aqui\"
JWT_EXPIRES_IN=\"15m\"
JWT_REFRESH_SECRET=\"tu-refresh-secret-key-aqui\"
JWT_REFRESH_EXPIRES_IN=\"7d\"

# Servidor
PORT=3000
NODE_ENV=\"development\"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=60

# CORS
CORS_ORIGIN=\"http://localhost:5173\"
```

#### **Frontend (.env)**

Crea un archivo `.env` en `xhion-core-client/`:

```env
VITE_API_URL=\"http://localhost:3000\"
```

### **4. Configurar la Base de Datos**

```bash
cd xhion-core-api

# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Sembrar datos iniciales (admin, roles, permisos)
pnpm db:seed
```

**Credenciales por defecto:**
- **Email:** `admin@xhion.com`
- **Password:** `Admin123!`

### **5. Iniciar el Proyecto**

#### **Terminal 1 - Backend**
```bash
cd xhion-core-api
pnpm start:dev
```
El backend estará disponible en `http://localhost:3000`

#### **Terminal 2 - Frontend**
```bash
cd xhion-core-client
pnpm dev
```
El frontend estará disponible en `http://localhost:5173`

### **6. Acceder a la Aplicación**

Abre tu navegador y ve a:
- **Frontend:** http://localhost:5173
- **API Docs (Swagger):** http://localhost:3000/api

---

## 💻 Uso

### **Comandos de Desarrollo**

#### **Backend**
```bash
# Modo desarrollo con hot-reload
pnpm start:dev

# Modo producción
pnpm build
pnpm start:prod

# Tests
pnpm test
pnpm test:watch
pnpm test:cov

# Linting
pnpm lint

# Base de datos
pnpm prisma studio          # Abrir Prisma Studio
pnpm prisma migrate dev     # Crear migración
pnpm db:seed                # Sembrar datos
```

#### **Frontend**
```bash
# Modo desarrollo
pnpm dev

# Build de producción
pnpm build
pnpm preview

# Linting
pnpm lint

# Type checking
pnpm tsc
```

### **Estructura de Carpetas**

```
xhion-core-monorepo/
├── xhion-core-api/           # Backend NestJS
│   ├── prisma/               # Schema y migraciones
│   ├── src/
│   │   ├── auth/             # Autenticación
│   │   ├── usuarios/         # Gestión de usuarios
│   │   ├── proyectos/        # Gestión de proyectos
│   │   ├── tareas/           # Gestión de tareas
│   │   ├── departamentos/    # Departamentos
│   │   ├── presupuestos/     # Presupuestos
│   │   ├── roles/            # Roles y permisos
│   │   ├── auditoria/        # Auditoría
│   │   ├── ai/               # Inteligencia Artificial (Gemini)
│   │   ├── conocimiento/     # Base de conocimiento
│   │   ├── ideas/            # Gestión de ideas
│   │   ├── solicitudes-acceso/ # Solicitudes de acceso
│   │   ├── eventos/          # Gestión de eventos
│   │   ├── recursos/         # Gestión de recursos
│   │   └── ...
│   └── package.json
│
├── xhion-core-client/        # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes UI
│   │   ├── pages/            # Páginas
│   │   ├── store/            # Estado global (Zustand)
│   │   ├── services/         # Servicios API
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # Tipos TypeScript
│   │   └── lib/              # Utilidades
│   └── package.json
│
├── docs/                     # Documentación
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   └── screenshots/
│
├── README.md
├── PRD.md
└── LICENSE
```

---

## 📖 Documentación de Arquitectura y Funcionamiento

Para mantener este README conciso, hemos creado manuales separados que explican en detalle la arquitectura interna, las decisiones de diseño y el flujo de trabajo de los componentes clave del proyecto.

Estos documentos son ideales si buscas entender **cómo funciona el software por dentro** o si planeas realizar contribuciones significativas.

### 📚 Manuales Disponibles

#### **Manual del Backend**
[📘 Ver la Documentación del Backend](./docs/BACKEND.md)

**Qué encontrarás:**
- Arquitectura de la API REST
- Diseño de la base de datos (Prisma Schema)
- Lógica de negocio principal
- Sistema de autenticación y autorización (JWT + RBAC)
- Guards, Interceptors y Decorators
- Estructura de carpetas y convenciones
- Flujos técnicos detallados (10 flujos principales)

#### **Manual del Frontend**
[📗 Ver la Documentación del Frontend](./docs/FRONTEND.md)

**Qué encontrarás:**
- Arquitectura de componentes React
- Manejo del estado global con Zustand
- Flujo de datos y comunicación con la API
- Sistema de diseño (shadcn/ui + Radix UI)
- Routing y navegación
- Formularios y validación
- Optimizaciones de performance
- Patrones y mejores prácticas

#### **Análisis Técnico Completo**
[📙 Ver Análisis Técnico Completo](./ANALISIS_TECNICO_COMPLETO.md)

**Qué encontrarás:**
- Visión general de la arquitectura
- Stack tecnológico detallado
- 10 flujos críticos explicados paso a paso
- Diagramas de secuencia y componentes
- Métricas de performance
- Decisiones técnicas y trade-offs

---

## 🔒 Sobre el Proyecto

**XHION Core** es un proyecto de software desarrollado por **Eduardo Tanca** durante su periodo de prácticas pre-profesionales en NEGOCIOS ASOCIADOS BIGANDER S.A.C., bajo convenio con SENATI.

### **Contexto de Desarrollo**

Este proyecto fue desarrollado como parte de las actividades formativas de prácticas pre-profesionales, sin existir relación laboral ni contrato de trabajo. De acuerdo con la legislación peruana sobre propiedad intelectual y los términos del convenio SENATI, **los derechos de autor del código fuente pertenecen al desarrollador**.

⚠️ **Nota Importante:** 
- Este repositorio es de carácter **privado y temporal**
- El código fuente está protegido por derechos de autor
- No está disponible para uso, modificación o distribución sin autorización expresa del autor
- La empresa NEGOCIOS ASOCIADOS BIGANDER S.A.C. puede tener derechos de uso sobre la aplicación desarrollada según acuerdos específicos

### **Reportar Problemas o Consultas**

Para bugs, sugerencias o consultas sobre licenciamiento, contacta directamente al autor:

- 📧 **Email:** eduardotanca@gmail.com
- 🔗 **LinkedIn:** [linkedin.com/in/eduardotanca](https://linkedin.com/in/eduardotanca)

Por favor incluye:
- Descripción clara del problema o consulta
- Pasos para reproducir (si aplica)
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del entorno (OS, navegador, versión)

---

## 📄 Licencia

**Copyright © 2025 Eduardo Tanca - Todos los derechos reservados.**

```
LICENCIA DE SOFTWARE PROPIETARIO

Copyright (c) 2025 Eduardo Tanca
Email: eduardotanca@gmail.com

TODOS LOS DERECHOS RESERVADOS.

PROPIEDAD INTELECTUAL:

Este software y su documentación asociada (el "Software") son propiedad 
intelectual exclusiva de Eduardo Tanca, desarrollado durante su periodo 
de prácticas pre-profesionales en NEGOCIOS ASOCIADOS BIGANDER S.A.C. bajo 
convenio con SENATI, sin existir relación laboral.

El Software está protegido por las leyes de derechos de autor de la 
República del Perú (Decreto Legislativo N° 822 - Ley sobre el Derecho 
de Autor) y tratados internacionales de propiedad intelectual.

RESTRICCIONES DE USO:

1. PROHIBICIÓN DE COPIA Y DISTRIBUCIÓN
   Queda estrictamente PROHIBIDO copiar, modificar, fusionar, publicar, 
   distribuir, sublicenciar y/o vender copias del Software sin 
   autorización expresa y por escrito del autor.

2. PROHIBICIÓN DE USO NO AUTORIZADO
   Queda estrictamente PROHIBIDO el uso del Software sin autorización 
   expresa y por escrito de Eduardo Tanca. El acceso temporal a este 
   repositorio no constituye autorización de uso.

3. PROHIBICIÓN DE INGENIERÍA INVERSA
   Queda estrictamente PROHIBIDA la ingeniería inversa, descompilación, 
   desensamblado o cualquier intento de derivar el código fuente del 
   Software cuando esté en forma compilada o ejecutable.

4. PROHIBICIÓN DE TRABAJOS DERIVADOS
   Queda estrictamente PROHIBIDA la creación de trabajos derivados 
   basados en el Software sin autorización expresa y por escrito.

5. CONFIDENCIALIDAD
   El Software contiene información confidencial y conocimientos técnicos 
   del autor. Cualquier persona que tenga acceso al Software debe mantener 
   su confidencialidad.

DERECHOS DE USO EMPRESARIAL:

NEGOCIOS ASOCIADOS BIGANDER S.A.C. puede tener derechos de uso específicos 
sobre la aplicación desarrollada, según acuerdos particulares establecidos 
durante el periodo de prácticas. Estos derechos no incluyen la propiedad 
del código fuente ni la capacidad de sublicenciar o distribuir el Software.

AUSENCIA DE GARANTÍAS:

El Software se proporciona "TAL CUAL", sin garantías de ningún tipo, 
expresas o implícitas, incluyendo pero no limitándose a garantías de 
comerciabilidad, idoneidad para un propósito particular y no infracción.

LIMITACIÓN DE RESPONSABILIDAD:

En ningún caso el autor será responsable de ningún reclamo, daño u otra 
responsabilidad, ya sea en una acción de contrato, agravio o de otro 
tipo, que surja de, o en conexión con el Software o el uso u otros 
tratos en el Software.

JURISDICCIÓN:

Esta licencia se regirá e interpretará de acuerdo con las leyes de la 
República del Perú. Cualquier disputa relacionada con esta licencia 
estará sujeta a la jurisdicción de los tribunales de Arequipa, Perú.

SOLICITUD DE LICENCIA:

Para solicitar una licencia de uso comercial, permisos especiales, 
transferencia de derechos o información adicional, contactar a:

Eduardo Tanca
Full Stack Developer
Email: eduardotanca@gmail.com
LinkedIn: linkedin.com/in/eduardotanca
```

---

## 📞 Contacto

### **Autor y Desarrollador**

**Eduardo Tanca**  
🎓 Practicante Pre-Profesional SENATI  
💼 Full Stack Developer  
📧 Email: eduardotanca@gmail.com  
🔗 LinkedIn: [linkedin.com/in/eduardotanca](https://www.linkedin.com/in/eduardo-tanca-6a433121b/)

### **Centro de Prácticas**

**NEGOCIOS ASOCIADOS BIGANDER S.A.C.**  
🏢 RUC: 20610361707  
📍 Domicilio Fiscal: Cal. Capitán Elías Aguirre Nro. 304 Int. A2  
   Miraflores, Arequipa - Perú  
🏛️ Tipo de Sociedad: Sociedad Anónima Cerrada

*Proyecto desarrollado durante prácticas pre-profesionales bajo convenio SENATI*

---

## 🙏 Agradecimientos

### **Instituciones**

- **SENATI** por la formación técnica profesional y el programa de prácticas
- **NEGOCIOS ASOCIADOS BIGANDER S.A.C.** por la oportunidad de desarrollar este proyecto durante las prácticas

### **Tecnologías y Comunidad**

Agradecimientos a las tecnologías open source que hicieron posible este proyecto:

- **NestJS** por el framework backend robusto y escalable
- **React** por la librería frontend moderna y eficiente
- **Prisma** por el ORM type-safe excepcional
- **shadcn/ui** por el sistema de componentes elegante
- **TypeScript** por la seguridad de tipos y mejor DX
- **PostgreSQL** por la base de datos confiable
- **Comunidad Open Source** por las herramientas, librerías y documentación

---

<div align="center">

**Desarrollado con ❤️ y ☕ por Eduardo Tanca**

*Proyecto de Prácticas Pre-Profesionales SENATI*

*Powered by NestJS, React, TypeScript y tecnologías modernas*

---

© 2025 Eduardo Tanca - Todos los derechos reservados

*El código fuente es propiedad intelectual del autor*

[⬆ Volver arriba](#-xhion-core)

</div>
