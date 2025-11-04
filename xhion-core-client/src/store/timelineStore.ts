import { create } from 'zustand'
import { timelineService } from '@/services/timelineService'
import type { 
  TimelineData, 
  ProyectoTimeline, 
  MyDayData, 
  TeamLoadData
} from '@/services/timelineService'
import { toast } from 'sonner'

// ============================================
// TIPOS DEL STORE
// ============================================

interface TimelineState {
  // Estados de datos
  timelineData: TimelineData | null
  myDayData: MyDayData | null
  teamLoadData: TeamLoadData | null
  proyectoSeleccionado: ProyectoTimeline | null
  
  // Estados de UI
  vistaZoom: 'semanal' | 'mensual' | 'trimestral'
  filtros: {
    departamentoId?: string
    estado?: string
  }
  
  // Estados de carga
  isLoadingTimeline: boolean
  isLoadingMyDay: boolean
  isLoadingTeam: boolean
  isLoadingProyecto: boolean
  
  // Estados de error
  error: string | null
  
  // Acciones
  fetchTimelineData: (filtros?: { departamentoId?: string; estado?: string }) => Promise<void>
  fetchMyDayData: () => Promise<void>
  fetchTeamLoadData: () => Promise<void>
  fetchProyectoTimeline: (proyectoId: string) => Promise<void>
  actualizarFechasProyecto: (proyectoId: string, fechas: { fechaInicio?: string; fechaFin?: string }) => Promise<void>
  aplicarSugerencia: (sugerenciaId: string) => Promise<void>
  descartarSugerencia: (sugerenciaId: string) => Promise<void>
  marcarAlertaVista: (alertaId: string) => Promise<void>
  resolverAlerta: (alertaId: string, accion: string) => Promise<void>
  setVistaZoom: (zoom: 'semanal' | 'mensual' | 'trimestral') => void
  setFiltros: (filtros: { departamentoId?: string; estado?: string }) => void
  clearProyectoSeleccionado: () => void
  refreshAll: () => Promise<void>
  clearError: () => void
}

// ============================================
// STORE DE TIMELINE
// ============================================

export const useTimelineStore = create<TimelineState>((set, get) => ({
  // Estado inicial
  timelineData: null,
  myDayData: null,
  teamLoadData: null,
  proyectoSeleccionado: null,
  
  vistaZoom: 'mensual',
  filtros: {},
  
  isLoadingTimeline: false,
  isLoadingMyDay: false,
  isLoadingTeam: false,
  isLoadingProyecto: false,
  
  error: null,

  // ============================================
  // ACCIONES
  // ============================================

  /**
   * Obtener datos completos del timeline
   */
  fetchTimelineData: async (filtros) => {
    set({ isLoadingTimeline: true, error: null })
    try {
      const timelineData = await timelineService.getTimelineData(filtros || get().filtros)
      set({ timelineData, isLoadingTimeline: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingTimeline: false })
      toast.error('Error al cargar el timeline')
    }
  },

  /**
   * Obtener datos de "Mi Día"
   */
  fetchMyDayData: async () => {
    set({ isLoadingMyDay: true, error: null })
    try {
      const myDayData = await timelineService.getMyDayData()
      set({ myDayData, isLoadingMyDay: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingMyDay: false })
      toast.error('Error al cargar "Mi Día"')
    }
  },

  /**
   * Obtener datos de carga del equipo
   */
  fetchTeamLoadData: async () => {
    set({ isLoadingTeam: true, error: null })
    try {
      const teamLoadData = await timelineService.getTeamLoadData()
      set({ teamLoadData, isLoadingTeam: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingTeam: false })
      toast.error('Error al cargar datos del equipo')
    }
  },

  /**
   * Obtener proyecto específico del timeline
   */
  fetchProyectoTimeline: async (proyectoId: string) => {
    set({ isLoadingProyecto: true, error: null })
    try {
      const proyectoSeleccionado = await timelineService.getProyectoTimeline(proyectoId)
      set({ proyectoSeleccionado, isLoadingProyecto: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingProyecto: false })
      toast.error('Error al cargar el proyecto')
    }
  },

  /**
   * Actualizar fechas de proyecto (reprogramar)
   */
  actualizarFechasProyecto: async (proyectoId: string, fechas) => {
    try {
      const proyectoActualizado = await timelineService.actualizarFechas(proyectoId, fechas)
      
      // Actualizar en el timeline
      set((state) => {
        if (!state.timelineData) return state
        
        return {
          timelineData: {
            ...state.timelineData,
            proyectos: state.timelineData.proyectos.map((p) =>
              p.id === proyectoId ? proyectoActualizado : p
            )
          }
        }
      })
      
      toast.success('Fechas actualizadas correctamente')
    } catch (error: any) {
      toast.error('Error al actualizar las fechas')
    }
  },

  /**
   * Aplicar sugerencia IA
   */
  aplicarSugerencia: async (sugerenciaId: string) => {
    try {
      const result = await timelineService.aplicarSugerencia(sugerenciaId)
      
      if (result.success) {
        toast.success(result.mensaje)
        
        // Refrescar datos
        await get().refreshAll()
      } else {
        toast.error('No se pudo aplicar la sugerencia')
      }
    } catch (error: any) {
      toast.error('Error al aplicar la sugerencia')
    }
  },

  /**
   * Descartar sugerencia IA
   */
  descartarSugerencia: async (sugerenciaId: string) => {
    try {
      await timelineService.descartarSugerencia(sugerenciaId)
      
      // Remover de las sugerencias globales
      set((state) => {
        if (!state.timelineData) return state
        
        return {
          timelineData: {
            ...state.timelineData,
            sugerenciasGlobales: state.timelineData.sugerenciasGlobales.filter(
              (s) => s.id !== sugerenciaId
            )
          }
        }
      })
      
      toast.success('Sugerencia descartada')
    } catch (error: any) {
      toast.error('Error al descartar la sugerencia')
    }
  },

  /**
   * Marcar alerta como vista
   */
  marcarAlertaVista: async (alertaId: string) => {
    try {
      await timelineService.marcarAlertaVista(alertaId)
    } catch (error: any) {
      console.error('Error al marcar alerta como vista:', error)
    }
  },

  /**
   * Resolver alerta
   */
  resolverAlerta: async (alertaId: string, accion: string) => {
    try {
      await timelineService.resolverAlerta(alertaId, accion)
      toast.success('Alerta resuelta')
      
      // Refrescar timeline
      await get().fetchTimelineData()
    } catch (error: any) {
      toast.error('Error al resolver la alerta')
    }
  },

  /**
   * Cambiar vista de zoom
   */
  setVistaZoom: (zoom) => {
    set({ vistaZoom: zoom })
  },

  /**
   * Actualizar filtros
   */
  setFiltros: (filtros) => {
    set({ filtros })
    get().fetchTimelineData(filtros)
  },

  /**
   * Limpiar proyecto seleccionado
   */
  clearProyectoSeleccionado: () => {
    set({ proyectoSeleccionado: null })
  },

  /**
   * Refrescar todos los datos
   */
  refreshAll: async () => {
    const { fetchTimelineData, fetchMyDayData, fetchTeamLoadData } = get()
    
    await Promise.all([
      fetchTimelineData(),
      fetchMyDayData(),
      fetchTeamLoadData()
    ])
  },

  /**
   * Limpiar error
   */
  clearError: () => set({ error: null })
}))
