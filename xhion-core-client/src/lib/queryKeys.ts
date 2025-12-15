/**
 * Query Keys centralizados para TanStack Query V5
 * 
 * Estructura: [entidad, scope?, id?, subRecurso?]
 * 
 * Convenciones:
 * - `all`: Key raíz para invalidar todo de una entidad
 * - `lists()`: Todas las listas de la entidad
 * - `list(filters)`: Lista específica con filtros
 * - `details()`: Todos los detalles
 * - `detail(id)`: Detalle específico por ID
 */
export const queryKeys = {
    // ============ USUARIOS ============
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.users.lists(), filters] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
        profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
        tasks: (id: string, filters?: Record<string, any>) =>
            [...queryKeys.users.detail(id), 'tasks', filters] as const,
        projects: (id: string, filters?: Record<string, any>) =>
            [...queryKeys.users.detail(id), 'projects', filters] as const,
        // User Settings
        sessions: ['users', 'settings', 'sessions'] as const,
        professionalProfile: ['users', 'settings', 'professional-profile'] as const,
        contacts: ['users', 'settings', 'contacts'] as const,
        professionalLinks: ['users', 'settings', 'professional-links'] as const,
    },

    // ============ PROYECTOS ============
    projects: {
        all: ['projects'] as const,
        lists: () => [...queryKeys.projects.all, 'list'] as const,
        list: (filters?: { estado?: string; departamentoId?: string; search?: string }) =>
            [...queryKeys.projects.lists(), filters] as const,
        details: () => [...queryKeys.projects.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.projects.details(), id] as const,
        members: (projectId: string) =>
            [...queryKeys.projects.detail(projectId), 'members'] as const,
        stages: (projectId: string) =>
            [...queryKeys.projects.detail(projectId), 'stages'] as const,
    },

    // ============ TAREAS ============
    tasks: {
        all: ['tasks'] as const,
        lists: () => [...queryKeys.tasks.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.tasks.lists(), filters] as const,
        details: () => [...queryKeys.tasks.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
        comments: (taskId: string) =>
            [...queryKeys.tasks.detail(taskId), 'comments'] as const,
        attachments: (taskId: string) =>
            [...queryKeys.tasks.detail(taskId), 'attachments'] as const,
        activity: (taskId: string) =>
            [...queryKeys.tasks.detail(taskId), 'activity'] as const,
        myTasks: (filters?: Record<string, any>) =>
            [...queryKeys.tasks.all, 'my', filters] as const,
    },

    // ============ ROLES ============
    roles: {
        all: ['roles'] as const,
        list: () => [...queryKeys.roles.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.roles.all, 'detail', id] as const,
        permissions: (id: string) =>
            [...queryKeys.roles.detail(id), 'permissions'] as const,
    },

    // ============ DEPARTAMENTOS ============
    departments: {
        all: ['departments'] as const,
        list: () => [...queryKeys.departments.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.departments.all, 'detail', id] as const,
        members: (id: string) =>
            [...queryKeys.departments.detail(id), 'members'] as const,
    },

    // ============ PUESTOS DE TRABAJO ============
    jobPositions: {
        all: ['job-positions'] as const,
        list: () => [...queryKeys.jobPositions.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.jobPositions.all, 'detail', id] as const,
    },

    // ============ DASHBOARD ============
    dashboard: {
        all: ['dashboard'] as const,
        stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
        todayTasks: () => [...queryKeys.dashboard.all, 'today-tasks'] as const,
        activeProjects: () => [...queryKeys.dashboard.all, 'active-projects'] as const,
        teamLoad: () => [...queryKeys.dashboard.all, 'team-load'] as const,
        riskAlerts: () => [...queryKeys.dashboard.all, 'risk-alerts'] as const,
        timeline: (limit?: number) => [...queryKeys.dashboard.all, 'timeline', limit] as const,
        priorityMatrix: () => [...queryKeys.dashboard.all, 'priority-matrix'] as const,
    },


    // ============ CALENDARIO ============

    calendar: {
        all: ['calendar'] as const,
        events: (filters?: { start?: string; end?: string }) =>
            [...queryKeys.calendar.all, 'events', filters] as const,
    },

    // ============ IDEAS ============
    ideas: {
        all: ['ideas'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.ideas.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.ideas.all, 'detail', id] as const,
    },

    // ============ NOTIFICACIONES ============
    notifications: {
        all: ['notifications'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.notifications.all, 'list', filters] as const,
        unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
    },

    // ============ EVENTOS ============
    events: {
        all: ['events'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.events.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.events.all, 'detail', id] as const,
    },

    // ============ CONFIGURACIÓN DEL SISTEMA ============
    systemSettings: {
        all: ['system-settings'] as const,
        current: () => [...queryKeys.systemSettings.all, 'current'] as const,
    },

    // ============ AUDITORÍA ============
    audit: {
        all: ['audit'] as const,
        logs: (filters?: Record<string, any>) =>
            [...queryKeys.audit.all, 'logs', filters] as const,
    },

    // ============ TIMELINE ============
    timeline: {
        all: ['timeline'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.timeline.all, 'list', filters] as const,
    },

    // ============ CONOCIMIENTO ============
    knowledge: {
        all: ['knowledge'] as const,
        // Contexto organizacional
        organizationalContext: () => [...queryKeys.knowledge.all, 'org-context'] as const,
        // Contextos de departamento
        departmentContexts: () => [...queryKeys.knowledge.all, 'dept-contexts'] as const,
        departmentContext: (departamentoId: string) =>
            [...queryKeys.knowledge.departmentContexts(), departamentoId] as const,
        // Documentos de proyecto
        projectDocuments: (proyectoId: string) =>
            [...queryKeys.knowledge.all, 'project-docs', proyectoId] as const,
        // Documentos de departamento
        departmentDocuments: (departamentoId: string) =>
            [...queryKeys.knowledge.all, 'dept-docs', departamentoId] as const,
    },
} as const;

// Tipos para autocompletado
export type QueryKeys = typeof queryKeys;
