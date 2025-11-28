## Requisitos Funcionales (RF)

Estos requisitos especifican las funcionalidades y acciones que los usuarios deben poder realizar dentro de la plataforma.

### RF-G: Módulo General y de Interfaz Principal
* **RF-G01: Autenticación de Usuario:** El sistema debe permitir a los usuarios iniciar sesión a través de una pantalla de Login.
* **RF-G02: Gestión de Tema (UI):** El usuario debe poder cambiar la interfaz de la plataforma entre un modo claro y un modo oscuro. El sistema debe recordar la preferencia del usuario para futuras sesiones.
* **RF-G03: Navegación Principal:** El usuario debe poder navegar a todas las secciones principales de la plataforma (Dashboard, Proyectos, Tareas, etc.) a través de una barra lateral (Sidebar) persistente.
* **RF-G04: Visualización de Notificaciones:** El usuario debe poder hacer clic en un icono en el Header para ver un listado de notificaciones relevantes (ej. nuevas tareas asignadas, menciones).
* **RF-G05: Visualización de Estado del Sistema:** El Header debe mostrar indicadores visuales en tiempo real sobre el estado de la sincronización de datos y la actividad de la IA (Gemini API).
* **RF-G06: Acceso al Perfil de Usuario:** El usuario debe poder acceder a su perfil y a la opción de cerrar sesión haciendo clic en su avatar en el Header.

### RF-IA: Módulo de Inteligencia Artificial (Gemini API)
* **RF-IA01: Búsqueda Global con IA: (MODIFICADO)** El sistema debe proporcionar un buscador global que permita al usuario realizar consultas en lenguaje natural.
    * La IA debe ser capaz de interpretar consultas para buscar tareas, proyectos, usuarios y **documentación en la base de conocimiento (ver RF-KB)**.
    * La IA debe poder generar respuestas narrativas a preguntas complejas (ej. "¿Cuál es el proyecto con mayor riesgo de retraso?") **utilizando el contexto de la base de conocimiento para mayor precisión**.
    * La IA debe poder interpretar comandos para sugerir acciones (ej. ante "crear una tarea para revisar el diseño mañana para Ana", sugerir la creación de dicha tarea con los campos pre-rellenados).
    * El buscador debe ser accesible mediante el atajo de teclado `⌘K` (en macOS) y `Ctrl+K` (en Windows/Linux).
* **RF-IA02: Creación Asistida de Proyectos: (MODIFICADO)** En el flujo de creación de proyectos, el usuario debe poder describir el proyecto en lenguaje natural, y la IA debe generar una estructura sugerida de hitos, etapas y tareas iniciales, **basándose en la descripción y en proyectos similares documentados en la base de conocimiento**.
* **RF-IA03: Análisis Predictivo de Riesgos: (MODIFICADO)** La IA debe analizar continuamente los datos de los proyectos (fechas de entrega, carga de trabajo, dependencias) para identificar y señalar riesgos potenciales, retrasos o bloqueos, **contrastando el progreso actual con los objetivos del proyecto y las funciones departamentales definidas en la base de conocimiento**. Estos indicadores deben ser visibles en el Dashboard y en la vista de Proyectos.
* **RF-IA04: Gestión de Ideas con IA: (MODIFICADO)** El sistema debe tener una sección "Ideas" donde los usuarios puedan registrar conceptos. La IA debe ser capaz de analizar estas ideas para generar propuestas estratégicas, agruparlas por temática o sugerir su conversión a proyectos, **alineándolas con la descripción y objetivos de la empresa registrados en la base de conocimiento**.

### RF-P: Módulo de Proyectos
* **RF-P01: Creación de Proyectos:** El usuario debe poder crear un nuevo proyecto a través de un botón dedicado en la barra lateral.
* **RF-P02: Listado y Búsqueda de Proyectos:** El sistema debe mostrar una lista de todos los proyectos accesibles, con una función de búsqueda para filtrarlos por nombre.
* **RF-P03: Gestión de Miembros del Proyecto:** El administrador debe poder invitar, asignar y revocar el acceso de usuarios a un proyecto específico.
* **RF-P04: Visualización de Timeline de Etapas:** Dentro de un proyecto, el sistema debe mostrar una línea de tiempo horizontal que represente las etapas del mismo, diferenciando visualmente las etapas completadas, la actual y las futuras.
* **RF-P05: Gestión de Etapas:** El administrador debe poder editar la descripción y otros detalles de la etapa actual del proyecto.
* **RF-P06: Múltiples Vistas de Tareas:** El sistema debe permitir al usuario cambiar la visualización de las tareas de un proyecto entre cuatro modos: **Kanban**, **Lista**, **Tabla** y **Timeline**.
* **RF-P07:** *(Eliminado)*

### RF-D: Módulo de Dashboard
* **RF-D01:** *(Eliminado)*
* **RF-D02: Widget "Tareas de Hoy": (Renumerado a RF-D01)** El dashboard debe mostrar una lista de las tareas asignadas al usuario con fecha de vencimiento para el día actual. El usuario debe poder realizar acciones rápidas (ej. marcar como completada) desde este widget.
* **RF-D03:** *(Eliminado)*
* **RF-D04:** *(Eliminado)*
* **RF-D05:** *(Eliminado)*
* **RF-D06:** *(Eliminado)*
* **RF-D07: Widget de Calendario de Proyectos: (Renumerado a RF-D02)** El dashboard debe incluir una vista de calendario grande y funcional, permitiendo cambiar entre vistas diaria, semanal, mensual y anual.
* **RF-D08: Widget de IA Insights: (Renumerado a RF-D03)** El dashboard debe presentar una sección con un resumen narrativo generado por la IA sobre el estado general de los proyectos, destacando riesgos, bloqueos y predicciones.

### RF-C: Módulo de Calendario
* **RF-C01: Navegación por Vistas de Calendario:** El usuario debe poder cambiar la vista del calendario entre diaria, semanal, mensual y anual mediante un grupo de botones.
* **RF-C02: Visualización Unificada de Eventos:** El calendario debe mostrar eventos de proyectos, tareas con fecha de vencimiento y reuniones, utilizando un código de colores para diferenciar cada categoría.
* **RF-C03: Filtrado de Calendario:** El usuario debe poder filtrar los eventos mostrados en el calendario por usuario, proyecto y/o tipo de evento.
* **RF-C04: Reprogramación por Arrastrar y Soltar (Drag & Drop):** El usuario debe poder cambiar la fecha y hora de los eventos arrastrándolos y soltándolos en una nueva ubicación del calendario.

### RF-S: Módulo de Seguridad y Auditoría
* **RF-S01: Visualización de Registros:** El sistema debe mostrar una tabla con todos los registros de eventos inmutables, incluyendo columnas para Fecha, Usuario, Evento, Módulo y Detalle.
* **RF-S02: Filtrado Avanzado de Registros:** El usuario debe poder filtrar los registros de auditoría por rango de fechas, por usuario específico y por tipo de evento (creación, edición, eliminación, login, etc.) mediante selecciones múltiples.
* **RF-S03: Búsqueda en Registros:** El sistema debe proporcionar una función de búsqueda para encontrar un evento específico dentro del log de auditoría.
* **RF-S04: Exportación de Registros:** El usuario debe tener la capacidad de exportar la vista actual de los registros de auditoría a un archivo en formato CSV.
* **RF-S05: Visualización de Detalles del Evento:** Al seleccionar un registro, el sistema debe mostrar un panel con información detallada del evento, como la dirección IP, la entidad afectada, su ID, el resultado de la acción y el timestamp exacto.

### RF-DEP: Módulo de Departamentos
* **RF-DEP01: Gestión de Departamentos:** El administrador debe poder crear, ver, editar y eliminar departamentos dentro de la organización (ej. Marketing, Ventas, Diseño).
* **RF-DEP02: Asignación de Recursos a Departamentos:** El administrador debe poder asignar proyectos, tareas y usuarios a departamentos específicos.
* **RF-DEP03: Vista de Gestión por Departamento:** El sistema debe ofrecer una vista que permita visualizar y gestionar el conjunto de proyectos, tareas y usuarios filtrados por un departamento, proporcionando una perspectiva de alto nivel de la actividad de cada área.

### RF-KB: Módulo de Base de Conocimiento (NUEVO)
* **RF-KB01: Gestión de Contexto Organizacional:** El administrador debe poder registrar, editar y mantener una descripción general de la empresa (misión, visión, objetivos estratégicos) que sirva como contexto principal para la IA.
* **RF-KB02: Gestión de Contexto de Departamentos:** El administrador (o un rol designado) debe poder documentar las funciones, responsabilidades, procesos clave y miembros de cada departamento para contextualizar las asignaciones y análisis de la IA.
* **RF-KB03: Gestión de Contexto de Proyectos:** El sistema debe permitir adjuntar o crear documentación específica para cada proyecto (resumen del proyecto, objetivos, especificaciones técnicas, lecciones aprendidas de proyectos anteriores) para ser utilizada por la IA en análisis de riesgos y creación asistida.

### RF-ADM: Módulo de Administración (Roles y Permisos)
* **RF-ADM01: Gestión de Roles:** El administrador debe poder crear, editar y eliminar roles de usuario.
* **RF-ADM02: Gestión de Permisos:** El administrador debe poder definir y asignar permisos granulares a cada rol (ej. permiso para crear proyectos, eliminar tareas, ver auditoría, editar base de conocimiento, etc.).
* **RF-ADM03: Asignación de Roles a Usuarios:** El administrador debe poder asignar uno o más roles a cada usuario del sistema.

---

## Requisitos No Funcionales (RNF)

Estos requisitos definen las cualidades del sistema y las restricciones bajo las cuales debe operar.

### RNF-US: Usabilidad y Experiencia de Usuario (UX)
* **RNF-US01: Identidad Visual:** El diseño debe ser minimalista, moderno, limpio y funcional. La paleta de colores debe ser neutra con un acento azul/violeta distintivo.
* **RNF-US02: Tipografía:** La plataforma debe utilizar exclusivamente las fuentes **Inter** o **Manrope** para garantizar una alta legibilidad y una estética moderna.
* **RNF-US03:** *(Eliminado)*
* **RNF-US04: Microinteracciones: (Renumerado a RNF-US03)** El sistema debe emplear microinteracciones sutiles y discretas (ej. en hovers, clics, transiciones de estado) para proporcionar retroalimentación al usuario sin ser una distracción.
* **RNF-US05: Curva de Aprendizaje Mínima: (Renumerado a RNF-US04)** El diseño y la interacción deben estar enfocados en la adopción instantánea y la fricción cero, requiriendo un mínimo o ningún entrenamiento para el usuario.
* **RNF-US06: Indicadores de Estado Claros: (Renumerado a RNF-US05)** Los estados de los elementos interactivos (como `hover` o `activo` en botones y menús) deben ser visualmente claros e inequívocos.

### RNF-PE: Rendimiento
* **RNF-PE01: Tiempos de Transición:** Todas las transiciones de la interfaz y animaciones deben completarse en menos de **150 milisegundos** para sentirse fluidas e instantáneas.
* **RNF-PE02: Actualización en Tiempo Real:** Módulos como la Auditoría y los indicadores de estado del sistema deben actualizarse en tiempo real sin necesidad de que el usuario recargue la página.

### RNF-CO: Compatibilidad y Responsividad
* **RNF-CO01: Diseño Adaptativo (Responsive):** La totalidad de la plataforma, incluyendo todas las pantallas y módulos, debe ser completamente funcional y visualmente coherente en dispositivos de escritorio, tablets y móviles. El layout modular debe reorganizarse fluidamente según el tamaño de la pantalla.

### RNF-SE: Seguridad
* **RNF-SE01: Inmutabilidad de Registros:** Los registros en el módulo de Auditoría deben ser inmutables. Una vez escritos, no pueden ser alterados ni eliminados.
* **RNF-SE02: Indicador de Integridad:** La interfaz de Auditoría debe mostrar un indicador visual (basado en hash de registro o similar) que garantice al usuario la integridad y la no manipulación de los datos del log.
* **RNF-SE03: Control de Acceso Basado en Roles (RBAC):** El acceso a todas las funcionalidades y datos del sistema debe estar estrictamente controlado por los roles y permisos definidos en el módulo de administración. El rol "Administrador" debe tener, por defecto, acceso total.

### RNF-AR: Arquitectura y Mantenibilidad
* **RNF-AR01: Componentes Reutilizables:** La interfaz debe construirse utilizando un sistema de componentes de UI reutilizables para garantizar consistencia visual y facilitar el mantenimiento y la escalabilidad futura.
* **RNF-AR02: Estilo de Header:** El componente Header debe tener un diseño limpio y transparente, con un efecto de elevación sutil. Opcionalmente, se puede implementar un efecto de desenfoque de fondo (glass blur) para un acabado más premium.