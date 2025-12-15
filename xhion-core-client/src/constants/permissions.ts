/**
 * Catálogo completo de permisos del sistema XHION Core
 * Sincronizado con el backend para garantizar consistencia
 */

export interface PermisoDefinicion {
  nombreAccion: string;
  descripcion: string;
  modulo: string;
  categoria?: string;
}

export interface ModuloPermisos {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  permisos: PermisoDefinicion[];
}

/**
 * Catálogo organizado por módulos para la UI
 */
export const MODULOS_PERMISOS: ModuloPermisos[] = [
  // ========================================
  // MÓDULO: PROYECTOS
  // ========================================
  {
    id: 'proyectos',
    nombre: 'Proyectos',
    descripcion: 'Gestión completa de proyectos y etapas',
    icon: 'FolderKanban',
    permisos: [
      {
        nombreAccion: 'proyectos.crear',
        descripcion: 'Crear nuevos proyectos',
        modulo: 'Proyectos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'proyectos.ver',
        descripcion: 'Ver proyectos donde es responsable o miembro',
        modulo: 'Proyectos',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'proyectos.ver_todos',
        descripcion: 'Ver TODOS los proyectos sin restricciones',
        modulo: 'Proyectos',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'proyectos.editar',
        descripcion: 'Editar información de proyectos',
        modulo: 'Proyectos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'proyectos.eliminar',
        descripcion: 'Eliminar proyectos del sistema',
        modulo: 'Proyectos',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'proyectos.archivar',
        descripcion: 'Archivar proyectos completados',
        modulo: 'Proyectos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'proyectos.gestionar_miembros',
        descripcion: 'Agregar y remover miembros del proyecto',
        modulo: 'Proyectos',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'proyectos.gestionar_etapas',
        descripcion: 'Crear y reordenar etapas del proyecto',
        modulo: 'Proyectos',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'proyectos.asignar_responsable',
        descripcion: 'Asignar cualquier usuario como responsable de proyectos',
        modulo: 'Proyectos',
        categoria: 'Gestión',
      },
    ],
  },

  // ========================================
  // MÓDULO: TAREAS
  // ========================================
  {
    id: 'tareas',
    nombre: 'Tareas',
    descripcion: 'Gestión de tareas y asignaciones',
    icon: 'CheckSquare',
    permisos: [
      {
        nombreAccion: 'tareas.crear',
        descripcion: 'Crear nuevas tareas en proyectos',
        modulo: 'Tareas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'tareas.ver',
        descripcion: 'Ver tareas asignadas o del proyecto',
        modulo: 'Tareas',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'tareas.ver_todas',
        descripcion: 'Ver TODAS las tareas sin restricciones',
        modulo: 'Tareas',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'tareas.editar',
        descripcion: 'Editar información de tareas',
        modulo: 'Tareas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'tareas.eliminar',
        descripcion: 'Eliminar tareas del sistema',
        modulo: 'Tareas',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'tareas.asignar',
        descripcion: 'Asignar tareas a usuarios',
        modulo: 'Tareas',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'tareas.cambiar_estado',
        descripcion: 'Cambiar estado de tareas',
        modulo: 'Tareas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'tareas.comentar',
        descripcion: 'Agregar comentarios a tareas',
        modulo: 'Tareas',
        categoria: 'Escritura',
      },
    ],
  },

  // ========================================
  // MÓDULO: DEPARTAMENTOS
  // ========================================
  {
    id: 'departamentos',
    nombre: 'Departamentos',
    descripcion: 'Gestión de departamentos y puestos',
    icon: 'Building2',
    permisos: [
      {
        nombreAccion: 'departamentos.crear',
        descripcion: 'Crear nuevos departamentos',
        modulo: 'Departamentos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'departamentos.ver',
        descripcion: 'Ver departamentos y su información',
        modulo: 'Departamentos',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'departamentos.editar',
        descripcion: 'Editar información de departamentos',
        modulo: 'Departamentos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'departamentos.eliminar',
        descripcion: 'Eliminar departamentos',
        modulo: 'Departamentos',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'departamentos.gestionar_empleados',
        descripcion: 'Asignar y remover empleados',
        modulo: 'Departamentos',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'departamentos.gestionar_puestos',
        descripcion: 'Crear y editar puestos de trabajo',
        modulo: 'Departamentos',
        categoria: 'Gestión',
      },
    ],
  },

  // ========================================
  // MÓDULO: PRESUPUESTOS
  // ========================================
  {
    id: 'presupuestos',
    nombre: 'Presupuestos',
    descripcion: 'Gestión financiera y presupuestaria',
    icon: 'DollarSign',
    permisos: [
      {
        nombreAccion: 'presupuestos.crear',
        descripcion: 'Crear nuevos presupuestos',
        modulo: 'Presupuestos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'presupuestos.ver',
        descripcion: 'Ver presupuestos y movimientos',
        modulo: 'Presupuestos',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'presupuestos.editar',
        descripcion: 'Editar presupuestos existentes',
        modulo: 'Presupuestos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'presupuestos.eliminar',
        descripcion: 'Eliminar presupuestos',
        modulo: 'Presupuestos',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'presupuestos.aprobar',
        descripcion: 'Aprobar gastos y movimientos',
        modulo: 'Presupuestos',
        categoria: 'Aprobación',
      },
      {
        nombreAccion: 'presupuestos.registrar_movimientos',
        descripcion: 'Registrar gastos y transferencias',
        modulo: 'Presupuestos',
        categoria: 'Escritura',
      },
    ],
  },

  // ========================================
  // MÓDULO: CONOCIMIENTO
  // ========================================
  {
    id: 'conocimiento',
    nombre: 'Base de Conocimiento',
    descripcion: 'Gestión de documentación y conocimiento',
    icon: 'BookOpen',
    permisos: [
      {
        nombreAccion: 'conocimiento.crear',
        descripcion: 'Crear documentos',
        modulo: 'Conocimiento',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'conocimiento.ver',
        descripcion: 'Ver documentos',
        modulo: 'Conocimiento',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'conocimiento.editar',
        descripcion: 'Editar documentos',
        modulo: 'Conocimiento',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'conocimiento.eliminar',
        descripcion: 'Eliminar documentos',
        modulo: 'Conocimiento',
        categoria: 'Eliminación',
      },
    ],
  },

  // ========================================
  // MÓDULO: USUARIOS
  // ========================================
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion: 'Gestión de usuarios del sistema',
    icon: 'Users',
    permisos: [
      {
        nombreAccion: 'usuarios.crear',
        descripcion: 'Crear nuevos usuarios',
        modulo: 'Usuarios',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'usuarios.ver',
        descripcion: 'Ver usuarios y su información',
        modulo: 'Usuarios',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'usuarios.editar',
        descripcion: 'Editar información de usuarios',
        modulo: 'Usuarios',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'usuarios.eliminar',
        descripcion: 'Eliminar usuarios',
        modulo: 'Usuarios',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'usuarios.gestionar_roles',
        descripcion: 'Asignar y cambiar roles',
        modulo: 'Usuarios',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'usuarios.invitar',
        descripcion: 'Enviar invitaciones',
        modulo: 'Usuarios',
        categoria: 'Escritura',
      },
    ],
  },

  // ========================================
  // MÓDULO: ROLES Y PERMISOS
  // ========================================
  {
    id: 'roles',
    nombre: 'Roles y Permisos',
    descripcion: 'Configuración de seguridad y accesos',
    icon: 'Shield',
    permisos: [
      {
        nombreAccion: 'roles.crear',
        descripcion: 'Crear nuevos roles',
        modulo: 'Roles',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'roles.ver',
        descripcion: 'Ver roles y permisos',
        modulo: 'Roles',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'roles.editar',
        descripcion: 'Editar información de roles',
        modulo: 'Roles',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'roles.eliminar',
        descripcion: 'Eliminar roles',
        modulo: 'Roles',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'roles.asignar_permisos',
        descripcion: 'Asignar permisos a roles',
        modulo: 'Roles',
        categoria: 'Gestión',
      },
    ],
  },

  // ========================================
  // MÓDULO: AUDITORÍA
  // ========================================
  {
    id: 'auditoria',
    nombre: 'Auditoría',
    descripcion: 'Registro de actividades del sistema',
    icon: 'FileText',
    permisos: [
      {
        nombreAccion: 'auditoria.ver',
        descripcion: 'Ver registros de auditoría',
        modulo: 'Auditoría',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'auditoria.exportar',
        descripcion: 'Exportar registros',
        modulo: 'Auditoría',
        categoria: 'Exportación',
      },
    ],
  },

  // ========================================
  // MÓDULO: SISTEMA
  // ========================================
  {
    id: 'sistema',
    nombre: 'Sistema',
    descripcion: 'Configuración y administración del sistema',
    icon: 'Settings',
    permisos: [
      {
        nombreAccion: 'sistema.configurar',
        descripcion: 'Configurar parámetros del sistema',
        modulo: 'Sistema',
        categoria: 'Configuración',
      },
      {
        nombreAccion: 'sistema.ver_estadisticas',
        descripcion: 'Ver estadísticas y métricas',
        modulo: 'Sistema',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'sistema.gestionar_catalogos',
        descripcion: 'Gestionar catálogos de configuración',
        modulo: 'Sistema',
        categoria: 'Gestión',
      },
    ],
  },

  // ========================================
  // MÓDULO: INVITACIONES
  // ========================================
  {
    id: 'invitaciones',
    nombre: 'Invitaciones',
    descripcion: 'Gestión de invitaciones de usuarios',
    icon: 'Mail',
    permisos: [
      {
        nombreAccion: 'invitaciones.crear',
        descripcion: 'Crear invitaciones',
        modulo: 'Invitaciones',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'invitaciones.ver',
        descripcion: 'Ver invitaciones',
        modulo: 'Invitaciones',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'invitaciones.cancelar',
        descripcion: 'Cancelar invitaciones pendientes',
        modulo: 'Invitaciones',
        categoria: 'Escritura',
      },
    ],
  },

  // ========================================
  // MÓDULO: IDEAS Y RECOMENDACIONES
  // ========================================
  {
    id: 'ideas',
    nombre: 'Ideas y Recomendaciones',
    descripcion: 'Gestión de ideas y recomendaciones de empleados',
    icon: 'Lightbulb',
    permisos: [
      {
        nombreAccion: 'ideas.crear',
        descripcion: 'Crear nuevas ideas y recomendaciones',
        modulo: 'Ideas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'ideas.ver',
        descripcion: 'Ver ideas y recomendaciones',
        modulo: 'Ideas',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'ideas.editar',
        descripcion: 'Editar ideas propias',
        modulo: 'Ideas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'ideas.eliminar',
        descripcion: 'Eliminar ideas propias',
        modulo: 'Ideas',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'ideas.votar',
        descripcion: 'Votar por ideas de otros usuarios',
        modulo: 'Ideas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'ideas.comentar',
        descripcion: 'Agregar comentarios a ideas',
        modulo: 'Ideas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'ideas.moderar',
        descripcion: 'Moderar, aprobar o rechazar ideas',
        modulo: 'Ideas',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'ideas.cambiar_estado',
        descripcion: 'Cambiar estado de ideas',
        modulo: 'Ideas',
        categoria: 'Gestión',
      },
    ],
  },

  // ========================================
  // MÓDULO: RECURSOS E INVENTARIO
  // ========================================
  {
    id: 'recursos',
    nombre: 'Recursos e Inventario',
    descripcion: 'Gestión de recursos materiales y equipamiento',
    icon: 'Package',
    permisos: [
      {
        nombreAccion: 'recursos:crear',
        descripcion: 'Crear nuevos recursos en el inventario',
        modulo: 'Recursos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'recursos:ver',
        descripcion: 'Ver recursos y reportes de inventario',
        modulo: 'Recursos',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'recursos:editar',
        descripcion: 'Actualizar información de recursos',
        modulo: 'Recursos',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'recursos:eliminar',
        descripcion: 'Eliminar recursos del inventario',
        modulo: 'Recursos',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'recursos:asignar',
        descripcion: 'Asignar recursos a departamentos o proyectos',
        modulo: 'Recursos',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'recursos:registrar_movimiento',
        descripcion: 'Registrar entradas, salidas y movimientos de inventario',
        modulo: 'Recursos',
        categoria: 'Escritura',
      },
    ],
  },

  // ========================================
  // MÓDULO: FINANZAS
  // ========================================
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    descripcion: 'Gestión financiera avanzada de proyectos',
    icon: 'TrendingUp',
    permisos: [
      {
        nombreAccion: 'finanzas:ver',
        descripcion: 'Ver ingresos, gastos y reportes financieros',
        modulo: 'Finanzas',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'finanzas:registrar_ingreso',
        descripcion: 'Registrar ingresos en proyectos',
        modulo: 'Finanzas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'finanzas:registrar_gasto',
        descripcion: 'Registrar gastos en proyectos',
        modulo: 'Finanzas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'finanzas:eliminar',
        descripcion: 'Eliminar registros de ingresos y gastos',
        modulo: 'Finanzas',
        categoria: 'Eliminación',
      },
      {
        nombreAccion: 'finanzas:analizar',
        descripcion: 'Analizar rentabilidad y generar reportes avanzados',
        modulo: 'Finanzas',
        categoria: 'Análisis',
      },
      {
        nombreAccion: 'finanzas:crear_presupuesto',
        descripcion: 'Crear presupuestos para departamentos y proyectos',
        modulo: 'Finanzas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'finanzas:editar_presupuesto',
        descripcion: 'Editar presupuestos existentes',
        modulo: 'Finanzas',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'finanzas:aprobar_presupuesto',
        descripcion: 'Aprobar y cerrar presupuestos',
        modulo: 'Finanzas',
        categoria: 'Aprobación',
      },
    ],
  },

  // ========================================
  // MÓDULO: INTELIGENCIA ARTIFICIAL
  // ========================================
  {
    id: 'ia',
    nombre: 'Inteligencia Artificial',
    descripcion: 'Funcionalidades de IA y búsqueda contextual',
    icon: 'Sparkles',
    permisos: [
      {
        nombreAccion: 'ai.search',
        descripcion: 'Realizar búsquedas contextuales con IA en lenguaje natural',
        modulo: 'IA',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'ai.projects.assist',
        descripcion: 'Usar el asistente de IA para generar propuestas de proyectos',
        modulo: 'IA',
        categoria: 'Escritura',
      },
      {
        nombreAccion: 'ai.ideas.analyze',
        descripcion: 'Analizar ideas con IA y obtener insights estratégicos',
        modulo: 'IA',
        categoria: 'Análisis',
      },
      {
        nombreAccion: 'ai.reindex',
        descripcion: 'Reindexar embeddings de la base de conocimiento',
        modulo: 'IA',
        categoria: 'Gestión',
      },
      {
        nombreAccion: 'ai.logs',
        descripcion: 'Ver historial de consultas de IA',
        modulo: 'IA',
        categoria: 'Lectura',
      },
      {
        nombreAccion: 'ai.status',
        descripcion: 'Ver estado y métricas del módulo de IA',
        modulo: 'IA',
        categoria: 'Lectura',
      },
    ],
  },
];

/**
 * Obtener todos los permisos como array plano
 */
export const TODOS_LOS_PERMISOS: PermisoDefinicion[] = MODULOS_PERMISOS.flatMap(
  (modulo) => modulo.permisos,
);

/**
 * Obtener permisos por módulo
 */
export const getPermisosPorModulo = (moduloId: string): PermisoDefinicion[] => {
  const modulo = MODULOS_PERMISOS.find((m) => m.id === moduloId);
  return modulo?.permisos || [];
};

/**
 * Obtener permisos por categoría
 */
export const getPermisosPorCategoria = (categoria: string): PermisoDefinicion[] => {
  return TODOS_LOS_PERMISOS.filter((p) => p.categoria === categoria);
};

/**
 * Categorías de permisos
 */
export const CATEGORIAS_PERMISOS = [
  'Lectura',
  'Escritura',
  'Eliminación',
  'Gestión',
  'Aprobación',
  'Exportación',
  'Configuración',
  'Análisis',
] as const;

/**
 * Total de permisos en el sistema
 */
export const TOTAL_PERMISOS = TODOS_LOS_PERMISOS.length;
