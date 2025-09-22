# **Product Requirement Document (PRD): XHION Core**

-   **Producto:** XHION Core
-   **Versión del Documento:** 1.0
-   **Fecha:** 18 de Setiembre de 2025
-   **Autor:** Ingeniero de Software Senior (en colaboración con el Propietario del Producto)
-   **Estado:** **Aprobado para Desarrollo**

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

## 5. Alcance del Proyecto (Versión 1.0)

### Funcionalidades **INCLUIDAS** en la v1.0 (MVP y expansiones iniciales):

-   Sistema de invitación y autenticación segura (JWT).
-   Gestión completa de perfiles de usuario.
-   CRUD completo para Proyectos y Tareas.
-   Tablero Kanban interactivo (Drag & Drop).
-   Comentarios y adjuntos en tareas.
-   Módulo de Gamificación (Puntos, Logros, Clasificaciones).
-   Dashboards personalizables con widgets basados en roles.
-   Funcionalidades de IA: Creación de proyectos desde plantillas.
-   Panel de configuración de la plataforma por usuario.
-   Registro de auditoría básico.

### Funcionalidades **EXCLUIDAS** de la v1.0 (Para futuras versiones):

-   Módulo de mensajería interna en tiempo real.
-   Funcionalidades avanzadas de IA (resumen de tareas, consulta en lenguaje natural).
-   Aplicación móvil nativa.
-   Portal para clientes externos.
-   Módulo financiero (presupuestos, seguimiento de tiempo).
-   Integraciones con herramientas de terceros (Google Calendar, etc.).

## 6. Requisitos Funcionales Detallados (User Stories para Kanban)

### ÉPICA 1: Núcleo, Autenticación y Perfiles
-   **Como Admin, quiero** invitar a nuevos usuarios a la plataforma mediante un enlace mágico enviado a su email para asegurar un onboarding controlado.
-   **Como nuevo usuario, quiero** usar el enlace de invitación para acceder a una página donde pueda establecer mi contraseña y activar mi cuenta.
-   **Como usuario, quiero** poder iniciar sesión con mi email y contraseña de forma segura.
-   **Como usuario, quiero** que mi sesión persista entre recargas del navegador pero que expire después de un tiempo razonable por seguridad.
-   **Como usuario, quiero** poder cerrar mi sesión.
-   **Como usuario, quiero** poder ver y editar la información de mi perfil (nombre, biografía, avatar, contactos, enlaces profesionales).
-   **Como usuario, quiero** poder añadir y gestionar mis habilidades en mi perfil.

### ÉPICA 2: Gestión de Proyectos y Tareas
-   **Como Gerente, quiero** crear un proyecto definiendo su nombre, descripción, responsable y departamento.
-   **Como Gerente, quiero** que la IA me asista durante la creación del proyecto, generando una estructura de tareas inicial basada en mi descripción y en plantillas.
-   **Como Gerente, quiero** poder guardar una estructura de proyecto exitosa como una nueva plantilla de IA para reutilizarla.
-   **Como usuario, quiero** ver una lista de todos los proyectos a los que tengo acceso.
-   **Como miembro de un proyecto, quiero** ver todas las tareas en un tablero Kanban con columnas (`Por Hacer`, `En Progreso`, `Hecho`).
-   **Como miembro de un proyecto, quiero** poder crear una nueva tarea, asignarle un título, descripción, responsable y fecha de vencimiento.
-   **Como miembro de un proyecto, quiero** poder mover tareas entre columnas mediante arrastrar y soltar para actualizar su estado.
-   **Como usuario, quiero** poder hacer clic en una tarea para abrir una vista detallada.
-   **Como usuario, quiero** poder añadir comentarios y adjuntar archivos a una tarea.

### ÉPICA 3: Gamificación
-   **Como usuario, quiero** ganar puntos por acciones clave (ej. completar una tarea a tiempo, completar mi perfil).
-   **Como usuario, quiero** ver mi total de puntos en mi perfil y un historial de cómo los he ganado.
-   **Como usuario, quiero** desbloquear logros (insignias) al alcanzar hitos importantes (ej. "Primer Proyecto Completado", "Colaborador Activo").
-   **Como usuario, quiero** ver una página de clasificación (leaderboard) para ver mi posición en comparación con otros, de forma semanal y mensual.

### ÉPICA 4: Dashboards y Analítica
-   **Como usuario, quiero** tener un dashboard personalizable como mi página de inicio.
-   **Como usuario, quiero** que mi dashboard inicial se genere a partir de una plantilla predefinida según mi rol.
-   **Como usuario, quiero** poder añadir, eliminar, mover y redimensionar widgets en mi dashboard.
-   **Como usuario, quiero** tener acceso a un catálogo de widgets, donde solo veo los que están permitidos para mi rol.
-   **Como Gerente, quiero** tener acceso a widgets de supervisión (ej. "Carga de Trabajo del Equipo", "Proyectos en Riesgo").

### ÉPICA 5: Administración y Configuración
-   **Como usuario, quiero** acceder a una página de configuración para personalizar mi experiencia (ej. activar/desactivar notificaciones).
-   **Como Admin, quiero** poder definir qué configuraciones están disponibles en el catálogo y qué rol mínimo se necesita para ajustarlas.
-   **Como Admin, quiero** ver un registro de auditoría de las acciones más importantes que ocurren en el sistema.

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

## 8. Stack Técnico y Arquitectura

-   **Metodología:** Desarrollo Incremental con Kanban.
-   **Arquitectura General:** Monorepo con Frontend desacoplado (SPA) y Backend (API REST).
-   **Frontend:**
    -   **Framework:** React 19+ con Vite y TypeScript.
    -   **Gestión de Estado:** Zustand.
    -   **Peticiones HTTP:** Axios.
    -   **Estilos:** Tailwind CSS v4+.
    -   **Biblioteca de Componentes:** HeroUI.
    -   **Enrutamiento:** React Router DOM.
-   **Backend:**
    -   **Framework:** Nest.js con TypeScript.
    -   **ORM:** Prisma.
    -   **Autenticación:** Passport.js (JWT, bcrypt).
-   **Base de Datos:**
    -   **Motor:** PostgreSQL.
-   **Infraestructura (AWS Serverless):**
    -   **Frontend:** Desplegado en AWS S3, distribuido por AWS CloudFront.
    -   **Backend:** Desplegado en AWS Lambda, expuesto por AWS API Gateway.
    -   **Base de Datos:** Alojada en AWS RDS Serverless (Aurora PostgreSQL).

## 9. Métricas de Éxito
-   **Adopción:** Usuarios Activos Semanales (WAU).
-   **Retención:** Tasa de Retención de Usuarios (Mes a Mes).
-   **Engagement:** Número de tareas creadas/completadas por usuario/semana.
-   **Rendimiento del Proyecto:** Tasa de Finalización a Tiempo (On-Time Completion Rate).
-   **Satisfacción del Usuario:** Net Promoter Score (NPS) medido trimestralmente.