import { create } from 'zustand'
import { 
  dashboardService, 
  type DashboardStats, 
  type TaskToday, 
  type ProjectOverview, 
  type TeamMemberLoad, 
  type RiskAlert, 
  type TimelineEvent,
  type PriorityTask
} from '@/services/dashboardService'
import { toast } from 'sonner'

// ============================================
// TIPOS DEL STORE
// ============================================

interface DashboardState {
  // Estados de datos
  stats: DashboardStats | null
  todayTasks: TaskToday[]
  activeProjects: ProjectOverview[]
  teamLoad: TeamMemberLoad[]
  riskAlerts: RiskAlert[]
  communicationTimeline: TimelineEvent[]
  priorityMatrix: {
    urgenteImportante: PriorityTask[]
    urgenteNoImportante: PriorityTask[]
    noUrgenteImportante: PriorityTask[]
    noUrgenteNoImportante: PriorityTask[]
  } | null

  // Estados de carga
  isLoadingStats: boolean
  isLoadingTasks: boolean
  isLoadingProjects: boolean
  isLoadingTeam: boolean
  isLoadingRisks: boolean
  isLoadingTimeline: boolean
  isLoadingMatrix: boolean

  // Estados de error
  error: string | null

  // Acciones
  fetchStats: () => Promise<void>
  fetchTodayTasks: () => Promise<void>
  fetchActiveProjects: () => Promise<void>
  fetchTeamLoad: () => Promise<void>
  fetchRiskAlerts: () => Promise<void>
  fetchCommunicationTimeline: (limit?: number) => Promise<void>
  fetchPriorityMatrix: () => Promise<void>
  markTimelineEventAsRead: (eventId: string) => Promise<void>
  markAllTimelineEventsAsRead: () => Promise<void>
  refreshAll: () => Promise<void>
  clearError: () => void
}

// ============================================
// STORE DE DASHBOARD
// ============================================

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Estado inicial
  stats: null,
  todayTasks: [],
  activeProjects: [],
  teamLoad: [],
  riskAlerts: [],
  communicationTimeline: [],
  priorityMatrix: null,

  isLoadingStats: false,
  isLoadingTasks: false,
  isLoadingProjects: false,
  isLoadingTeam: false,
  isLoadingRisks: false,
  isLoadingTimeline: false,
  isLoadingMatrix: false,

  error: null,

  // ============================================
  // ACCIONES
  // ============================================

  /**
   * Obtener estadísticas generales
   */
  fetchStats: async () => {
    set({ isLoadingStats: true, error: null })
    try {
      const stats = await dashboardService.getStats()
      set({ stats, isLoadingStats: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingStats: false })
      toast.error('Error al cargar estadísticas')
    }
  },

  /**
   * Obtener tareas del día
   */
  fetchTodayTasks: async () => {
    set({ isLoadingTasks: true, error: null })
    try {
      const todayTasks = await dashboardService.getTodayTasks()
      set({ todayTasks, isLoadingTasks: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingTasks: false })
      toast.error('Error al cargar tareas del día')
    }
  },

  /**
   * Obtener proyectos activos
   */
  fetchActiveProjects: async () => {
    set({ isLoadingProjects: true, error: null })
    try {
      const activeProjects = await dashboardService.getActiveProjects()
      set({ activeProjects, isLoadingProjects: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingProjects: false })
      toast.error('Error al cargar proyectos')
    }
  },

  /**
   * Obtener carga del equipo
   */
  fetchTeamLoad: async () => {
    set({ isLoadingTeam: true, error: null })
    try {
      const teamLoad = await dashboardService.getTeamLoad()
      set({ teamLoad, isLoadingTeam: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingTeam: false })
      toast.error('Error al cargar carga del equipo')
    }
  },

  /**
   * Obtener alertas de riesgos
   */
  fetchRiskAlerts: async () => {
    set({ isLoadingRisks: true, error: null })
    try {
      const riskAlerts = await dashboardService.getRiskAlerts()
      set({ riskAlerts, isLoadingRisks: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingRisks: false })
      toast.error('Error al cargar alertas de riesgos')
    }
  },

  /**
   * Obtener timeline de comunicación
   */
  fetchCommunicationTimeline: async (limit: number = 20) => {
    set({ isLoadingTimeline: true, error: null })
    try {
      const communicationTimeline = await dashboardService.getCommunicationTimeline(limit)
      set({ communicationTimeline, isLoadingTimeline: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingTimeline: false })
      toast.error('Error al cargar timeline')
    }
  },

  /**
   * Obtener matriz de prioridades
   */
  fetchPriorityMatrix: async () => {
    set({ isLoadingMatrix: true, error: null })
    try {
      const priorityMatrix = await dashboardService.getPriorityMatrix()
      set({ priorityMatrix, isLoadingMatrix: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingMatrix: false })
      toast.error('Error al cargar matriz de prioridades')
    }
  },

  /**
   * Marcar evento como leído
   */
  markTimelineEventAsRead: async (eventId: string) => {
    try {
      await dashboardService.markTimelineEventAsRead(eventId)
      
      // Actualizar estado local
      set((state) => ({
        communicationTimeline: state.communicationTimeline.map((event) =>
          event.id === eventId ? { ...event, leido: true } : event
        )
      }))
    } catch (error: any) {
      toast.error('Error al marcar como leído')
    }
  },

  /**
   * Marcar todos los eventos como leídos
   */
  markAllTimelineEventsAsRead: async () => {
    try {
      await dashboardService.markAllTimelineEventsAsRead()
      
      // Actualizar estado local
      set((state) => ({
        communicationTimeline: state.communicationTimeline.map((event) => ({
          ...event,
          leido: true
        }))
      }))
      
      toast.success('Todos los eventos marcados como leídos')
    } catch (error: any) {
      toast.error('Error al marcar eventos como leídos')
    }
  },

  /**
   * Refrescar todos los datos del dashboard
   */
  refreshAll: async () => {
    const { 
      fetchStats, 
      fetchTodayTasks, 
      fetchActiveProjects, 
      fetchTeamLoad, 
      fetchRiskAlerts, 
      fetchCommunicationTimeline,
      fetchPriorityMatrix
    } = get()

    await Promise.all([
      fetchStats(),
      fetchTodayTasks(),
      fetchActiveProjects(),
      fetchTeamLoad(),
      fetchRiskAlerts(),
      fetchCommunicationTimeline(),
      fetchPriorityMatrix()
    ])
  },

  /**
   * Limpiar error
   */
  clearError: () => set({ error: null })
}))
