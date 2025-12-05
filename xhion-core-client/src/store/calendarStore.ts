import { create } from 'zustand'
import { eventosService, type Evento, type CreateEventoDto, type UpdateEventoDto, type TipoEvento, type EstadoEvento } from '@/services/eventosService'
import { taskService, type Tarea } from '@/services/taskService'
import { projectService, type Proyecto } from '@/services/projectService'
import { toast } from 'sonner'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns'

export type CalendarViewMode = 'day' | 'week' | 'month' | 'year'

export interface CalendarFilters {
    proyectoId?: string
    tipo?: TipoEvento
    estado?: EstadoEvento
}

// Calendar item that can be an event, task, or project
export interface CalendarItem {
    id: string
    type: 'event' | 'task' | 'project'
    title: string
    description?: string
    startDate: string
    endDate: string
    color?: string
    allDay: boolean
    // Original data
    evento?: Evento
    tarea?: Tarea
    proyecto?: Proyecto
}

interface CalendarState {
    // View state
    viewMode: CalendarViewMode
    currentDate: Date

    // Data
    eventos: Evento[]
    tareas: Tarea[]
    proyectos: Proyecto[]
    calendarItems: CalendarItem[] // Combined items for display
    isLoading: boolean
    error: string | null

    // Filters
    filters: CalendarFilters
    showTasks: boolean
    showProjects: boolean

    // Selected event for detail view
    selectedEvento: Evento | null

    // Modal state
    isEventModalOpen: boolean
    eventModalMode: 'create' | 'edit'
    eventToEdit: Evento | null

    // Actions
    setViewMode: (mode: CalendarViewMode) => void
    setCurrentDate: (date: Date) => void
    goToToday: () => void
    goToPrevious: () => void
    goToNext: () => void

    // Data fetching
    fetchEventos: () => Promise<void>
    fetchTareas: () => Promise<void>
    fetchProyectos: () => Promise<void>
    fetchAllData: () => Promise<void>
    refreshEventos: () => Promise<void>

    // CRUD operations
    createEvento: (data: CreateEventoDto) => Promise<void>
    updateEvento: (id: string, data: UpdateEventoDto) => Promise<void>
    deleteEvento: (id: string) => Promise<void>
    moverEvento: (id: string, fechaInicio: string, fechaFin: string) => Promise<void>

    // Filters
    setFilters: (filters: CalendarFilters) => void
    clearFilters: () => void
    setShowTasks: (show: boolean) => void
    setShowProjects: (show: boolean) => void

    // Modal management
    openCreateEventModal: (initialDate?: Date) => void
    openEditEventModal: (evento: Evento) => void
    closeEventModal: () => void

    // Event selection
    selectEvento: (evento: Evento | null) => void

    // Helper to combine all items
    combineCalendarItems: () => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
    // Initial state
    viewMode: 'month',
    currentDate: new Date(),
    eventos: [],
    tareas: [],
    proyectos: [],
    calendarItems: [],
    isLoading: false,
    error: null,
    filters: {},
    showTasks: true,
    showProjects: true,
    selectedEvento: null,
    isEventModalOpen: false,
    eventModalMode: 'create',
    eventToEdit: null,

    // View actions
    setViewMode: (mode) => set({ viewMode: mode }),

    setCurrentDate: (date) => set({ currentDate: date }),

    goToToday: () => {
        set({ currentDate: new Date() })
        get().fetchAllData()
    },

    goToPrevious: () => {
        const { currentDate, viewMode } = get()
        let newDate: Date

        switch (viewMode) {
            case 'day':
                newDate = addDays(currentDate, -1)
                break
            case 'week':
                newDate = addDays(currentDate, -7)
                break
            case 'month':
                newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                break
            case 'year':
                newDate = new Date(currentDate.getFullYear() - 1, 0, 1)
                break
        }

        set({ currentDate: newDate })
        get().fetchAllData()
    },

    goToNext: () => {
        const { currentDate, viewMode } = get()
        let newDate: Date

        switch (viewMode) {
            case 'day':
                newDate = addDays(currentDate, 1)
                break
            case 'week':
                newDate = addDays(currentDate, 7)
                break
            case 'month':
                newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                break
            case 'year':
                newDate = new Date(currentDate.getFullYear() + 1, 0, 1)
                break
        }

        set({ currentDate: newDate })
        get().fetchAllData()
    },

    // Combine all calendar items
    combineCalendarItems: () => {
        const { eventos, tareas, proyectos, showTasks, showProjects } = get()
        const items: CalendarItem[] = []

        // Add events
        eventos.forEach(evento => {
            items.push({
                id: `event-${evento.id}`,
                type: 'event',
                title: evento.titulo,
                description: evento.descripcion,
                startDate: evento.fechaInicio,
                endDate: evento.fechaFin,
                color: evento.color,
                allDay: evento.todoElDia,
                evento
            })
        })

        // Add tasks (if enabled)
        if (showTasks) {
            tareas.forEach(tarea => {
                if (tarea.fechaVencimiento) {
                    items.push({
                        id: `task-${tarea.id}`,
                        type: 'task',
                        title: `📋 ${tarea.titulo}`,
                        description: tarea.descripcion,
                        startDate: tarea.fechaVencimiento,
                        endDate: tarea.fechaVencimiento,
                        color: tarea.prioridad === 'Urgente' ? '#ef4444' :
                            tarea.prioridad === 'Alta' ? '#f97316' :
                                tarea.prioridad === 'Media' ? '#f59e0b' : '#10b981',
                        allDay: true,
                        tarea
                    })
                }
            })
        }

        // Add projects (if enabled)
        if (showProjects) {
            proyectos.forEach(proyecto => {
                if (proyecto.fechaFin) {
                    items.push({
                        id: `project-${proyecto.id}`,
                        type: 'project',
                        title: `🎯 ${proyecto.nombre}`,
                        description: proyecto.descripcion || undefined,
                        startDate: proyecto.fechaInicio || proyecto.fechaFin,
                        endDate: proyecto.fechaFin,
                        color: '#8b5cf6',
                        allDay: true,
                        proyecto
                    })
                }
            })
        }

        set({ calendarItems: items })
    },

    // Data fetching
    fetchEventos: async () => {
        const { currentDate, viewMode, filters } = get()

        try {
            // Calculate date range based on view mode
            let fechaDesde: Date
            let fechaHasta: Date

            switch (viewMode) {
                case 'day':
                    fechaDesde = new Date(currentDate)
                    fechaDesde.setHours(0, 0, 0, 0)
                    fechaHasta = new Date(currentDate)
                    fechaHasta.setHours(23, 59, 59, 999)
                    break
                case 'week':
                    fechaDesde = startOfWeek(currentDate, { weekStartsOn: 0 })
                    fechaHasta = endOfWeek(currentDate, { weekStartsOn: 0 })
                    break
                case 'month':
                    fechaDesde = startOfMonth(currentDate)
                    fechaHasta = endOfMonth(currentDate)
                    // Extend to show full weeks
                    fechaDesde = startOfWeek(fechaDesde, { weekStartsOn: 0 })
                    fechaHasta = endOfWeek(fechaHasta, { weekStartsOn: 0 })
                    break
                case 'year':
                    fechaDesde = new Date(currentDate.getFullYear(), 0, 1)
                    fechaHasta = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59)
                    break
            }

            const response = await eventosService.getEventos({
                ...filters,
                fechaDesde: format(fechaDesde, 'yyyy-MM-dd'),
                fechaHasta: format(fechaHasta, 'yyyy-MM-dd'),
            })

            set({ eventos: response.data })
            get().combineCalendarItems()
        } catch (error: any) {
            console.error('Error fetching eventos:', error)
            set({ error: error?.response?.data?.message || 'Error al cargar eventos' })
        }
    },

    fetchTareas: async () => {
        try {
            const response = await taskService.getMisTareas()
            set({ tareas: response })
            get().combineCalendarItems()
        } catch (error: any) {
            console.error('Error fetching tareas:', error)
        }
    },

    fetchProyectos: async () => {
        try {
            const response = await projectService.getAll({ estado: 'Activo' })
            set({ proyectos: response })
            get().combineCalendarItems()
        } catch (error: any) {
            console.error('Error fetching proyectos:', error)
        }
    },

    fetchAllData: async () => {
        set({ isLoading: true, error: null })

        try {
            await Promise.all([
                get().fetchEventos(),
                get().fetchTareas(),
                get().fetchProyectos()
            ])
        } catch (error: any) {
            console.error('Error fetching calendar data:', error)
            // Don't show toast to avoid spamming user
        } finally {
            set({ isLoading: false })
        }
    },

    refreshEventos: async () => {
        await get().fetchAllData()
    },

    // CRUD operations
    createEvento: async (data) => {
        try {
            await eventosService.createEvento(data)
            toast.success('Evento creado exitosamente')
            get().closeEventModal()
            await get().fetchAllData()
        } catch (error: any) {
            console.error('Error creating evento:', error)
            toast.error(error?.response?.data?.message || 'Error al crear evento')
            throw error
        }
    },

    updateEvento: async (id, data) => {
        try {
            await eventosService.updateEvento(id, data)
            toast.success('Evento actualizado exitosamente')
            get().closeEventModal()
            await get().fetchAllData()
        } catch (error: any) {
            console.error('Error updating evento:', error)
            toast.error(error?.response?.data?.message || 'Error al actualizar evento')
            throw error
        }
    },

    deleteEvento: async (id) => {
        try {
            await eventosService.deleteEvento(id)
            toast.success('Evento eliminado exitosamente')
            get().selectEvento(null)
            await get().fetchAllData()
        } catch (error: any) {
            console.error('Error deleting evento:', error)
            toast.error(error?.response?.data?.message || 'Error al eliminar evento')
            throw error
        }
    },

    moverEvento: async (id, fechaInicio, fechaFin) => {
        try {
            await eventosService.moverEvento(id, fechaInicio, fechaFin)
            toast.success('Evento movido exitosamente')
            await get().fetchAllData()
        } catch (error: any) {
            console.error('Error moving evento:', error)
            toast.error(error?.response?.data?.message || 'Error al mover evento')
            // Revert the optimistic update
            await get().fetchAllData()
            throw error
        }
    },

    // Filters
    setFilters: (filters) => {
        set({ filters })
        get().fetchAllData()
    },

    clearFilters: () => {
        set({ filters: {} })
        get().fetchAllData()
    },

    setShowTasks: (show) => {
        set({ showTasks: show })
        get().combineCalendarItems()
    },

    setShowProjects: (show) => {
        set({ showProjects: show })
        get().combineCalendarItems()
    },

    // Modal management
    openCreateEventModal: (initialDate) => {
        set({
            isEventModalOpen: true,
            eventModalMode: 'create',
            eventToEdit: null,
            currentDate: initialDate || get().currentDate
        })
    },

    openEditEventModal: (evento) => {
        set({
            isEventModalOpen: true,
            eventModalMode: 'edit',
            eventToEdit: evento
        })
    },

    closeEventModal: () => {
        set({
            isEventModalOpen: false,
            eventToEdit: null
        })
    },

    // Event selection
    selectEvento: (evento) => set({ selectedEvento: evento }),
}))
