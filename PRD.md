# **Product Requirement Document (PRD): XHION Core**

-   **Producto:** XHION Core
-   **Versión del Documento:** 2.0 (Actualizada)
-   **Fecha Inicial:** 18 de Septiembre de 2025
-   **Última Actualización:** 6 de Noviembre de 2025
-   **Autor:** Eduardo Tanca (Full Stack Developer)
-   **Estado:** **En Desarrollo Activo (85% Completado)**

## 1. Visión del Producto

**XHION Core** será la plataforma de productividad operativa integral y centralizada para NEGOCIOS ASOCIADOS BIGANDER S.A.C. Actuará como el sistema nervioso digital de la empresa, unificando la gestión de proyectos, la colaboración contextual y la inteligencia de negocio en un único ecosistema. Mediante el uso estratégico de IA, no solo optimizaremos la eficiencia, sino que transformaremos los datos operativos en una ventaja competitiva, impulsando una cultura de innovación, reconocimiento y mejora continua.

## 2. Problema a Resolver

La organización opera actualmente con una gestión descentralizada, resultando en una "niebla operativa" que impacta directamente en la productividad y el crecimiento. Los problemas clave son:

-   **Fragmentación de la Información:** Proyectos y tareas se gestionan a través de hojas de cálculo, correos electrónicos y aplicaciones de mensajería, creando silos de información y dificultando el seguimiento.
-   **Falta de Visibilidad Estratégica:** La gerencia carece de una visión en tiempo real del estado de los proyectos, la carga de trabajo de los equipos y los cuellos de botella, lo que lleva a una toma de decisiones reactiva.
-   **Ineficiencia Operativa:** Se invierte un tiempo considerable en tareas de coordinación manual, reuniones de estado y búsqueda de información, restando tiempo a las actividades que generan valor.
-   **Pérdida de Conocimiento:** Las lecciones aprendidas y las mejoras de procesos no se documentan sistemáticamente, dificultando la estandarización y la innovación.

## 3. Objetivos y Metas (SMART)

1.  **Centralización:** Unificar el 100% de la gestión de proyectos internos en XHION Core en los primeros 3 meses post-lanzamiento.
2.  **Eficiencia:** Reducir el tiempo dedicado a tareas de coordinación y seguimiento manual en un 40% para el final del segundo trimestre de uso.
3.  **Rendimiento:** Aumentar la tasa de finalización de proyectos a tiempo en un 25% en los primeros 6 meses.
4.  **Adopción:** Alcanzar una tasa de usuarios activos semanales (WAU) del 90% dentro del primer mes.
5.  **Innovación:** Generar y registrar al menos 10 propuestas de mejora viables a través de las herramientas de IA en el primer año.

## 4. User Personas

-   **Carlos (Colaborador - Desarrollador):**
    -   **Objetivos:** Saber cuáles son sus tareas prioritarias, tener toda la información contextual para ejecutarlas, colaborar sin fricciones y ver reconocido su esfuerzo.
    -   **Frustraciones:** Ambigüedad en los requisitos, interrupciones constantes para reportar avances, buscar información en múltiples lugares.
-   **Elena (Gerente - Líder de Proyecto):**
    -   **Objetivos:** Tener una visión clara del progreso de sus proyectos, asignar recursos de manera efectiva, identificar riesgos antes de que se conviertan en problemas y reportar a la alta dirección con datos fiables.
    -   **Frustraciones:** No saber el estado real de las cosas, "perseguir" a la gente para obtener actualizaciones, crear reportes manualmente.
-   **Ana (Administrador - RRHH/TI):**
    -   **Objetivos:** Gestionar el ciclo de vida de los usuarios de forma segura, asegurar que cada rol tenga los permisos adecuados y mantener la integridad del sistema.
    -   **Frustraciones:** Procesos de onboarding y offboarding manuales y propensos a errores, falta de un registro de auditoría centralizado.

## 5. Alcance del Proyecto (Versión 2.0 - Actualizada)

### Funcionalidades **COMPLETADAS** 

#### Core del Sistema
-   Sistema de invitación con enlace mágico y autenticación segura (JWT con refresh tokens)
-   Gestión completa de perfiles de usuario (avatar, bio, habilidades, enlaces profesionales)
-   CRUD completo para Proyectos y Tareas con etapas personalizables
-   Tablero Kanban interactivo con Drag & Drop (@hello-pangea/dnd)
-   Vista Timeline con zoom (8 niveles) y scroll infinito
-   Comentarios en tareas (adjuntos preparados)
-   Filtros avanzados y búsqueda en tiempo real
-   Exportación de datos (PDF, Excel, CSV)
-   Atajos de teclado (12 shortcuts)
-   PWA con modo offline

#### Gestión Organizacional
-   Módulo de Departamentos completo (CRUD, empleados, puestos, estadísticas)
-   Sistema de Presupuestos (departamentos y proyectos con movimientos)
-   Análisis de presupuestos con 6 tipos de gráficos
-   Comparativas mensuales y proyecciones automáticas
-   Base de Conocimiento (contexto organizacional, contexto por departamento, documentos)

#### Administración y Seguridad
-   Sistema de Roles y Permisos Granulares (RBAC con 47 permisos en 10 módulos)
-   Gestión de usuarios con invitaciones
-   Configuración personalizable por usuario
-   Gestión de sesiones activas
-   Registro de auditoría (backend básico)

#### Dashboard e Ideas
-   Dashboards personalizables con 7 widgets (react-grid-layout)
-   Widget Gantt Chart interactivo con zoom y scroll infinito
-   Sistema de Ideas con votación y conversión a proyectos
-   Panel de configuración completo

#### Componentes de Fecha
-   DatePicker, DateRangePicker, DateTimePicker
-   ChartDateRangePicker para análisis
-   Localización completa en español

### Funcionalidades **EN DESARROLLO** 

#### Inteligencia Artificial
-   Búsqueda semántica con IA (RF-IA01)
-   Generación de proyectos con IA (RF-IA02)
-   Análisis de riesgos con IA (RF-IA03)
-   Sugerencias de calendario con IA (RF-IA05)
-   AI Insights para dashboard (RF-D03)

#### Calendario y Notificaciones
-   Sistema de calendario completo (4 vistas: diaria, semanal, mensual, anual)
-   Gestión de eventos y reuniones
-   Notificaciones en tiempo real (WebSocket)

#### Gamificación y Archivos
-   Sistema de puntos y logros
-   Leaderboard (clasificaciones)
-   Sistema de gestión de archivos (upload, preview, adjuntos)

#### Auditoría Avanzada
-   Registros inmutables con hash (RNF-SE01-SE02)
-   UI de auditoría con filtros avanzados
-   Exportación de registros

### Funcionalidades **EXCLUIDAS** de la v2.0 (Para futuras versiones):

-   Módulo de mensajería interna en tiempo real
-   Aplicación móvil nativa
-   Portal para clientes externos
-   Integraciones con herramientas de terceros (Google Calendar, Slack, etc.)
-   Módulo de seguimiento de tiempo
-   Facturación y contabilidad avanzada

## 6. Requisitos Funcionales Detallados (User Stories)

### ÉPICA 1: Núcleo, Autenticación y Perfiles ✅ COMPLETADA
-   ✅ **Como Admin, quiero** invitar a nuevos usuarios a la plataforma mediante un enlace mágico enviado a su email para asegurar un onboarding controlado.
-   ✅ **Como nuevo usuario, quiero** usar el enlace de invitación para acceder a una página donde pueda establecer mi contraseña y activar mi cuenta.
-   ✅ **Como usuario, quiero** poder iniciar sesión con mi email y contraseña de forma segura.
-   ✅ **Como usuario, quiero** que mi sesión persista entre recargas del navegador pero que expire después de un tiempo razonable por seguridad.
-   ✅ **Como usuario, quiero** poder cerrar mi sesión.
-   ✅ **Como usuario, quiero** poder ver y editar la información de mi perfil (nombre, biografía, avatar, contactos, enlaces profesionales).
-   ✅ **Como usuario, quiero** poder añadir y gestionar mis habilidades en mi perfil.
-   ✅ **Como usuario, quiero** gestionar mis sesiones activas y cerrar sesión en todos los dispositivos.

### ÉPICA 2: Gestión de Proyectos y Tareas ✅ COMPLETADA
-   ✅ **Como Gerente, quiero** crear un proyecto definiendo su nombre, descripción, responsable, departamento y fechas.
-   ✅ **Como Gerente, quiero** poder editar la información del proyecto en cualquier momento.
-   ✅ **Como Gerente, quiero** archivar proyectos completados sin eliminarlos permanentemente.
-   ✅ **Como Gerente, quiero** duplicar proyectos existentes para reutilizar estructuras.
-   ✅ **Como Gerente, quiero** exportar datos del proyecto en múltiples formatos (PDF, Excel, CSV).
-   ✅ **Como Gerente, quiero** gestionar miembros del proyecto y sus roles.
-   ✅ **Como Gerente, quiero** crear y gestionar etapas personalizables del proyecto.
-   ✅ **Como usuario, quiero** ver una lista de todos los proyectos a los que tengo acceso.
-   ✅ **Como miembro de un proyecto, quiero** ver todas las tareas en un tablero Kanban con columnas personalizables.
-   ✅ **Como miembro de un proyecto, quiero** poder crear una nueva tarea con título, descripción, responsable, prioridad y fecha de vencimiento.
-   ✅ **Como miembro de un proyecto, quiero** poder mover tareas entre columnas mediante arrastrar y soltar para actualizar su estado.
-   ✅ **Como usuario, quiero** poder hacer clic en una tarea para abrir una vista detallada.
-   ✅ **Como usuario, quiero** poder añadir comentarios a una tarea.
-   ✅ **Como usuario, quiero** ver las tareas en una vista Timeline con zoom y scroll infinito.
-   ✅ **Como usuario, quiero** filtrar tareas por estado, prioridad, responsable y fechas.
-   ✅ **Como usuario, quiero** buscar tareas en tiempo real.
-   ✅ **Como usuario, quiero** usar atajos de teclado para acciones rápidas.

### ÉPICA 3: Departamentos y Presupuestos ✅ COMPLETADA
-   ✅ **Como Admin, quiero** crear y gestionar departamentos de la organización.
-   ✅ **Como Admin, quiero** asignar empleados y puestos de trabajo a departamentos.
-   ✅ **Como Admin, quiero** ver estadísticas de cada departamento (proyectos, empleados, presupuesto).
-   ✅ **Como Gerente, quiero** crear y gestionar presupuestos por departamento y proyecto.
-   ✅ **Como Gerente, quiero** registrar movimientos de presupuesto (ingresos y egresos).
-   ✅ **Como Gerente, quiero** ver análisis de presupuestos con gráficos interactivos.
-   ✅ **Como Gerente, quiero** comparar presupuestos entre períodos.
-   ✅ **Como Gerente, quiero** recibir alertas de sobregasto automáticas.
-   ✅ **Como usuario, quiero** ver proyecciones de gastos futuros.

### ÉPICA 4: Base de Conocimiento ✅ COMPLETADA
-   ✅ **Como Admin, quiero** crear y gestionar el contexto organizacional de la empresa.
-   ✅ **Como Gerente, quiero** crear contexto específico para mi departamento.
-   ✅ **Como usuario, quiero** acceder a documentos de proyecto y departamento.
-   ✅ **Como usuario, quiero** buscar en la base de conocimiento.
-   ✅ **Como usuario, quiero** ver el historial de versiones del conocimiento.

### ÉPICA 5: Roles y Permisos ✅ COMPLETADA
-   ✅ **Como Admin, quiero** crear y gestionar roles personalizados.
-   ✅ **Como Admin, quiero** asignar permisos granulares a cada rol (47 permisos en 10 módulos).
-   ✅ **Como Admin, quiero** asignar roles a usuarios.
-   ✅ **Como Admin, quiero** ver qué usuarios tienen qué permisos.
-   ✅ **Como sistema, quiero** validar permisos en cada acción del usuario.

### ÉPICA 6: Ideas y Recomendaciones ✅ COMPLETADA
-   ✅ **Como usuario, quiero** proponer ideas de mejora para la organización.
-   ✅ **Como usuario, quiero** votar ideas de otros usuarios (upvote/downvote).
-   ✅ **Como usuario, quiero** comentar en ideas.
-   ✅ **Como Gerente, quiero** cambiar el estado de las ideas (Propuesta, En Revisión, Aprobada, Rechazada, Implementada).
-   ✅ **Como Gerente, quiero** convertir una idea aprobada en un proyecto.
-   ✅ **Como usuario, quiero** ver las ideas más votadas y populares.

### ÉPICA 7: Dashboards Personalizables ✅ COMPLETADA
-   ✅ **Como usuario, quiero** tener un dashboard personalizable como mi página de inicio.
-   ✅ **Como usuario, quiero** añadir, eliminar, mover y redimensionar widgets en mi dashboard.
-   ✅ **Como usuario, quiero** guardar y cargar mi configuración de dashboard.
-   ✅ **Como usuario, quiero** ver un widget de "Tareas de Hoy" con acciones rápidas.
-   ✅ **Como usuario, quiero** ver un widget de resumen de proyectos.
-   ✅ **Como usuario, quiero** ver un widget Gantt Chart interactivo.
-   ✅ **Como usuario, quiero** ver widgets de estadísticas y resumen de presupuestos.
-   ✅ **Como Gerente, quiero** tener acceso a widgets de supervisión según mi rol.

### ÉPICA 8: Inteligencia Artificial ⏳ PENDIENTE
-   ⏳ **Como usuario, quiero** buscar información usando lenguaje natural con IA.
-   ⏳ **Como Gerente, quiero** que la IA me asista durante la creación del proyecto, generando una estructura de tareas inicial.
-   ⏳ **Como Gerente, quiero** que la IA analice riesgos en mis proyectos automáticamente.
-   ⏳ **Como usuario, quiero** recibir sugerencias de IA para optimizar mi calendario.
-   ⏳ **Como Gerente, quiero** ver insights generados por IA en mi dashboard.
-   ⏳ **Como Gerente, quiero** guardar estructuras exitosas como plantillas de IA.

### ÉPICA 9: Calendario y Notificaciones ⏳ PENDIENTE
-   ⏳ **Como usuario, quiero** ver un calendario unificado con eventos, tareas y reuniones.
-   ⏳ **Como usuario, quiero** crear eventos y reuniones vinculados a proyectos.
-   ⏳ **Como usuario, quiero** ver el calendario en 4 vistas (diaria, semanal, mensual, anual).
-   ⏳ **Como usuario, quiero** reprogramar eventos mediante drag & drop.
-   ⏳ **Como usuario, quiero** recibir notificaciones en tiempo real.
-   ⏳ **Como usuario, quiero** ver un panel de notificaciones con categorización.
-   ⏳ **Como usuario, quiero** marcar notificaciones como leídas y tomar acciones rápidas.

### ÉPICA 10: Gamificación ⏳ PENDIENTE
-   ⏳ **Como usuario, quiero** ganar puntos por acciones clave (completar tareas, completar perfil, etc.).
-   ⏳ **Como usuario, quiero** ver mi total de puntos y un historial de cómo los he ganado.
-   ⏳ **Como usuario, quiero** desbloquear logros (insignias) al alcanzar hitos importantes.
-   ⏳ **Como usuario, quiero** ver una página de clasificación (leaderboard) para comparar mi posición.
-   ⏳ **Como usuario, quiero** recibir notificaciones cuando desbloqueo un logro.

### ÉPICA 11: Auditoría y Archivos ⏳ PENDIENTE
-   ⏳ **Como Admin, quiero** ver un registro de auditoría completo de todas las acciones importantes.
-   ⏳ **Como Admin, quiero** filtrar registros de auditoría por fecha, usuario, acción y entidad.
-   ⏳ **Como Admin, quiero** exportar registros de auditoría en CSV/PDF.
-   ⏳ **Como Admin, quiero** verificar la integridad de los registros mediante hash.
-   ⏳ **Como usuario, quiero** adjuntar archivos a tareas y comentarios.
-   ⏳ **Como usuario, quiero** previsualizar imágenes y PDFs adjuntos.
-   ⏳ **Como usuario, quiero** ver el progreso de carga de archivos.

## 7. Requisitos No Funcionales

-   **Rendimiento:**
    -   Tiempo de carga inicial (LCP) de la aplicación: < 2.5 segundos.
    -   Tiempo de respuesta de la API para operaciones CRUD: < 200ms (P95).
    -   Las interacciones de la UI (ej. arrastrar y soltar) deben sentirse instantáneas (< 100ms).
-   **Seguridad:**
    -   Toda la comunicación debe ser sobre HTTPS.
    -   Las contraseñas deben ser hasheadas usando `bcrypt` (cost factor >= 10).
    -   Los JWT deben ser de corta duración (ej. 15 min) con un refresh token de larga duración (ej. 7 días).
    -   La API debe implementar protección contra CSRF, XSS y inyecciones SQL (mitigado por el uso de Prisma).
    -   Los DTOs en el backend (Nest.js) deben realizar validación y sanitización de todas las entradas del cliente.
-   **Escalabilidad:**
    -   La arquitectura serverless en AWS debe escalar horizontalmente de forma automática para manejar picos de tráfico sin intervención manual.
-   **Usabilidad y Accesibilidad:**
    -   La interfaz debe ser totalmente responsiva, funcionando de manera óptima en dispositivos de escritorio y móviles.
    -   Se deben seguir las mejores prácticas de accesibilidad (WCAG 2.1 Nivel AA), como el contraste de color adecuado y la navegación por teclado.
-   **Mantenibilidad:**
    -   El código debe seguir las guías de estilo de ESLint y Prettier.
    -   La arquitectura debe ser modular tanto en el frontend como en el backend para facilitar la adición de nuevas funcionalidades.

## 8. Stack Técnico y Arquitectura (Implementado)

-   **Metodología:** Desarrollo Ágil con Sprints Incrementales (7 sprints completados).
-   **Arquitectura General:** Monorepo con Frontend desacoplado (SPA) y Backend (API REST).

### Frontend Implementado:
-   **Framework:** React 19.2.0 con Vite 6.0.1 y TypeScript 5.6.3
-   **Gestión de Estado:** Zustand 5.0.1 (11 stores implementados)
-   **Peticiones HTTP:** Axios 1.7.7
-   **Estilos:** Tailwind CSS 3.4.15
-   **Biblioteca de Componentes:** shadcn/ui + Radix UI
-   **Enrutamiento:** React Router DOM 6.28.0
-   **Drag & Drop:** @hello-pangea/dnd 16.6.1
-   **Formularios:** React Hook Form 7.53.2 + Zod 3.23.8
-   **Fechas:** date-fns 4.1.0 + react-day-picker 9.8.0
-   **Gráficos:** recharts 2.14.1
-   **Iconos:** Lucide React 0.454.0
-   **Animaciones:** Framer Motion 11.11.17
-   **Exportación:** jspdf 2.5.2, xlsx 0.18.5
-   **Grid Layout:** react-grid-layout 1.5.0

### Backend Implementado:
-   **Framework:** NestJS 11.1.6 con TypeScript 5.7.2
-   **ORM:** Prisma 6.16.3
-   **Autenticación:** Passport.js (JWT con refresh tokens, bcryptjs)
-   **Validación:** class-validator 0.14.1, class-transformer 0.5.1
-   **Documentación:** Swagger (swagger-ui-express)
-   **Seguridad:** Helmet, Throttler (rate limiting)
-   **Módulos Implementados:** 11/15 (ProyectosModule, TareasModule, DepartamentosModule, PresupuestosModule, ConocimientoModule, RolesModule, UsuariosModule, InvitacionesModule, IdeasModule, DashboardModule, AuthModule)
-   **Endpoints:** ~90 endpoints REST

### Base de Datos:
-   **Motor:** PostgreSQL
-   **Schema:** Prisma con 25+ modelos
-   **Características:** Relaciones complejas, soft delete, enums, índices

### Infraestructura:
-   **Desarrollo:** Local (PostgreSQL, Node.js)
-   **Producción (Planificada):** AWS Serverless o similar
-   **Versionamiento:** Git + GitHub
-   **Documentación:** Swagger UI en /api/docs

## 9. Progreso del Desarrollo

### Estado Actual: 85% Completado

**Sprints Completados (7/9):**
1. ✅ Sprint 1: Core Funcional (Proyectos + Tareas) - 100%
2. ✅ Sprint 2: Conocimiento + Departamentos + Presupuestos - 100%
3. ✅ Sprint 2.5: Roles y Permisos (RBAC) - 100%
4. ✅ Sprint 2.6: Usuarios e Invitación - 100%
5. ✅ Sprint 2.7: Configuración + Perfil + Sesiones - 100%
6. ✅ Sprint 2.8: Ideas y Recomendaciones - 100%
7. ✅ Sprint 2.9: Dashboard Personalizable - 100%
8. ⏳ Sprint 3: IA + Calendario + Notificaciones - 0%
9. ⏳ Sprint 4: Gamificación + Auditoría + Polish - 0%

**Módulos Backend:** 11/15 completados (~90 endpoints)
**Componentes Frontend:** ~50 componentes
**Stores Zustand:** 11 stores
**Líneas de Código:** ~50,000+ líneas

### Documentación Completa:
- ✅ README.md (completo y profesional)
- ✅ BACKEND.md (manual de arquitectura backend)
- ✅ FRONTEND.md (manual de arquitectura frontend)
- ✅ PLAN_DESARROLLO_10_SEMANAS.md (plan actualizado)
- ✅ PRD.md (este documento)
- ✅ LICENSE (licencia propietaria)
- ✅ DERECHOS_DE_AUTOR.md (documentación legal)
- ✅ ANALISIS_TECNICO_COMPLETO.md
- ✅ Swagger UI en /api/docs

## 10. Métricas de Éxito (Objetivos)

### Métricas Técnicas:
-   **Coverage:** >70% (tests unitarios)
-   **LCP:** <2.5s (Largest Contentful Paint)
-   **API Response:** <200ms (P95)
-   **Uptime:** >99.5%
-   **Error Rate:** <1%
-   **Lighthouse Score:** >90

### Métricas de Negocio:
-   **Adopción:** 90% WAU (Weekly Active Users) en mes 1
-   **Retención:** >80% mes a mes
-   **Engagement:** >10 tareas/usuario/semana
-   **NPS:** >50 (Net Promoter Score)
-   **Tiempo de Coordinación:** -40% (reducción)
-   **Proyectos a Tiempo:** +25% (incremento)

---

## 11. Información del Proyecto

**Desarrollado por:** Eduardo Tanca  
**Rol:** Full Stack Developer (Practicante Pre-Profesional SENATI)  
**Email:** eduardotanca@gmail.com  
**LinkedIn:** [linkedin.com/in/eduardo-tanca-6a433121b/](https://www.linkedin.com/in/eduardo-tanca-6a433121b/)

**Centro de Prácticas:**  
NEGOCIOS ASOCIADOS BIGANDER S.A.C.  
RUC: 20610361707  
Miraflores, Arequipa - Perú

**Propiedad Intelectual:**  
El código fuente es propiedad intelectual de Eduardo Tanca, desarrollado durante prácticas pre-profesionales bajo convenio SENATI. Ver LICENSE y DERECHOS_DE_AUTOR.md para más información.

**Repositorio:** GitHub (privado temporal)  
**Versión Actual:** 2.0  
**Última Actualización:** 6 de Noviembre, 2025