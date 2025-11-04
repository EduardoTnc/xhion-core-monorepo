import  apiClient  from '../api/axios'

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface DashboardStats {
  tareasHoy: {
    total: number
    completadas: number
    pendientes: number
    enProgreso: number
  }
  proyectos: {
    activos: number
    enRiesgo: number
    completados: number
    promedioAvance: number
  }
  equipo: {
    totalMiembros: number
    sobrecargados: number
    disponibles: number
    eficienciaPromedio: number
  }
  comunicacion: {
    actualizacionesHoy: number
    comentariosSinLeer: number
    mencionesActivas: number
  }
}

export interface TaskToday {
  id: string
  titulo: string
  descripcion: string
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente'
  estado: string
  proyecto: {
    id: string
    nombre: string
    color: string
  }
  fechaVencimiento: string
  asignadoA: {
    id: string
    nombreCompleto: string
    avatarUrl: string
  }
}

export interface ProjectOverview {
  id: string
  nombre: string
  descripcion: string
  estado: string
  progreso: number
  fechaInicio: string
  fechaFin: string
  riesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
  presupuesto: {
    total: number
    gastado: number
    porcentaje: number
  }
  equipo: {
    total: number
    activos: number
  }
  tareas: {
    total: number
    completadas: number
    pendientes: number
  }
}

export interface TeamMemberLoad {
  id: string
  nombreCompleto: string
  email: string
  avatarUrl: string
  departamento: string
  puesto: string
  carga: {
    horasAsignadas: number
    horasCapacidad: number
    porcentaje: number
    estado: 'disponible' | 'normal' | 'sobrecargado'
  }
  tareas: {
    total: number
    enProgreso: number
    pendientes: number
  }
  proyectos: string[]
}

export interface RiskAlert {
  id: string
  tipo: 'proyecto' | 'tarea' | 'presupuesto' | 'equipo' | 'cronograma'
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  titulo: string
  descripcion: string
  entidad: {
    id: string
    nombre: string
    tipo: string
  }
  fechaDeteccion: string
  sugerenciaIA?: string
  acciones: Array<{
    id: string
    titulo: string
    tipo: string
  }>
}

export interface TimelineEvent {
  id: string
  tipo: 'comentario' | 'actualizacion' | 'tarea' | 'proyecto' | 'riesgo'
  titulo: string
  descripcion: string
  usuario: {
    id: string
    nombreCompleto: string
    avatarUrl: string
  }
  entidad: {
    id: string
    nombre: string
    tipo: string
  }
  fecha: string
  leido: boolean
}

export interface PriorityTask {
  id: string
  titulo: string
  descripcion: string
  urgente: boolean
  importante: boolean
  cuadrante: 'urgente-importante' | 'urgente-no-importante' | 'no-urgente-importante' | 'no-urgente-no-importante'
  proyecto: {
    id: string
    nombre: string
  }
  asignadoA: {
    id: string
    nombreCompleto: string
  }
  fechaVencimiento?: string
  estimacionHoras?: number
}

// ============================================
// SERVICIO DE DASHBOARD
// ============================================

class DashboardService {
  private baseUrl = '/dashboard'

  /**
   * Obtener estadísticas generales del dashboard
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data
  }

  /**
   * Obtener tareas del día actual
   */
  async getTodayTasks(): Promise<TaskToday[]> {
    const response = await apiClient.get(`${this.baseUrl}/tareas-hoy`)
    return response.data
  }

  /**
   * Obtener resumen de proyectos activos
   */
  async getActiveProjects(): Promise<ProjectOverview[]> {
    const response = await apiClient.get(`${this.baseUrl}/proyectos-activos`)
    return response.data
  }

  /**
   * Obtener mapa de carga del equipo
   */
  async getTeamLoad(): Promise<TeamMemberLoad[]> {
    const response = await apiClient.get(`${this.baseUrl}/carga-equipo`)
    return response.data
  }

  /**
   * Obtener alertas de riesgos
   */
  async getRiskAlerts(): Promise<RiskAlert[]> {
    const response = await apiClient.get(`${this.baseUrl}/alertas-riesgos`)
    return response.data
  }

  /**
   * Obtener timeline de comunicación
   */
  async getCommunicationTimeline(limit: number = 20): Promise<TimelineEvent[]> {
    const response = await apiClient.get(`${this.baseUrl}/timeline-comunicacion`, {
      params: { limit }
    })
    return response.data
  }

  /**
   * Obtener matriz de prioridades
   */
  async getPriorityMatrix(): Promise<{
    urgenteImportante: PriorityTask[]
    urgenteNoImportante: PriorityTask[]
    noUrgenteImportante: PriorityTask[]
    noUrgenteNoImportante: PriorityTask[]
  }> {
    const response = await apiClient.get(`${this.baseUrl}/matriz-prioridades`)
    return response.data
  }

  /**
   * Marcar evento de timeline como leído
   */
  async markTimelineEventAsRead(eventId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/timeline/${eventId}/leer`)
  }

  /**
   * Marcar todos los eventos como leídos
   */
  async markAllTimelineEventsAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/timeline/leer-todos`)
  }

  /**
   * Obtener recomendaciones de IA para redistribución de carga
   */
  async getLoadRecommendations(): Promise<{
    recomendaciones: Array<{
      tipo: 'reasignar' | 'posponer' | 'delegar'
      tarea: TaskToday
      desde: TeamMemberLoad
      hacia?: TeamMemberLoad
      razon: string
      impacto: string
    }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/recomendaciones-carga`)
    return response.data
  }

  /**
   * Obtener análisis de reuniones evitables
   */
  async getMeetingsAnalysis(): Promise<{
    reunionesHoy: number
    reunionesEvitables: number
    tiempoAhorrado: number
    sugerencias: Array<{
      reunion: string
      razon: string
      alternativa: string
    }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/analisis-reuniones`)
    return response.data
  }
}

export const dashboardService = new DashboardService()
