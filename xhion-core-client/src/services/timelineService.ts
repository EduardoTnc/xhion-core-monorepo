import apiClient from '../api/axios'

// ============================================
// TIPOS Y INTERFACES - CRONOGRAMA VIVO
// ============================================

export interface Hito {
  id: string
  nombre: string
  fecha: string
  completado: boolean
  tipo: 'inicio' | 'intermedio' | 'fin'
  descripcion?: string
}

export interface Alerta {
  id: string
  tipo: 'retraso' | 'presupuesto' | 'calidad' | 'equipo' | 'dependencia'
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  mensaje: string
  fechaDeteccion: string
  accionSugerida?: string
}

export interface Riesgo {
  id: string
  tipo: string
  probabilidad: number // 0-100
  impacto: 'bajo' | 'medio' | 'alto' | 'critico'
  descripcion: string
  mitigacion?: string
}

export interface SugerenciaIA {
  id: string
  tipo: 'alerta' | 'oportunidad' | 'optimizacion' | 'prediccion'
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  titulo: string
  descripcion: string
  entidad: {
    tipo: 'proyecto' | 'tarea' | 'equipo' | 'reunion'
    id: string
    nombre: string
  }
  accionSugerida: string
  impacto: string
  acciones: Array<{
    tipo: 'aplicar' | 'ver' | 'descartar'
    label: string
  }>
}

export interface ProyectoTimeline {
  id: string
  nombre: string
  descripcion: string
  
  // Temporal
  fechaInicio: string
  fechaFin: string
  fechaFinProyectada?: string // Predicción IA
  
  // Progreso
  progreso: number // 0-100
  salud: 'saludable' | 'atencion' | 'critico'
  estado: 'Activo' | 'En Pausa' | 'Completado' | 'Archivado'
  
  // Hitos
  hitos: Hito[]
  
  // Alertas y Riesgos
  alertas: Alerta[]
  riesgos: Riesgo[]
  
  // Recursos
  presupuesto: {
    total: number
    gastado: number
    porcentaje: number
    alertaPresupuesto: boolean
  }
  
  equipo: Array<{
    id: string
    nombre: string
    avatar: string
    rol: string
  }>
  
  // Dependencias
  dependencias: Array<{
    proyectoId: string
    proyectoNombre: string
    tipo: 'bloqueante' | 'relacionado'
  }>
  
  // IA
  sugerenciasIA: SugerenciaIA[]
  
  // Estadísticas
  tareas: {
    total: number
    completadas: number
    enProgreso: number
    bloqueadas: number
  }
  
  // Metadata
  departamento: {
    id: string
    nombre: string
  }
  responsable: {
    id: string
    nombre: string
    avatar: string
  }
}

export interface TimelineData {
  proyectos: ProyectoTimeline[]
  resumen: {
    activos: number
    promedioProgreso: number
    enRiesgo: number
    completadosMes: number
    completadosSemana: number
  }
  sugerenciasGlobales: SugerenciaIA[]
  rangoFechas: {
    inicio: string
    fin: string
  }
}

export interface MyDayData {
  estadisticas: {
    completadas: number
    enProgreso: number
    pendientes: number
    total: number
  }
  proximaTarea: {
    id: string
    titulo: string
    descripcion: string
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente'
    tiempoEstimado: number // en horas
    proyecto: {
      id: string
      nombre: string
      color: string
    }
    fechaVencimiento?: string
  } | null
  tareas: Array<{
    id: string
    titulo: string
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente'
    estado: string
    proyecto: {
      id: string
      nombre: string
      color: string
    }
  }>
}

export interface TeamLoadData {
  estadisticas: {
    disponibles: number
    cargaNormal: number
    sobrecargados: number
    total: number
  }
  alertas: Array<{
    tipo: 'sobrecarga' | 'disponibilidad' | 'distribucion'
    mensaje: string
    miembros: Array<{
      id: string
      nombre: string
      avatar: string
    }>
    accionSugerida: string
  }>
  miembros: Array<{
    id: string
    nombre: string
    avatar: string
    departamento: string
    carga: {
      horasAsignadas: number
      horasCapacidad: number
      porcentaje: number
      estado: 'disponible' | 'normal' | 'sobrecargado'
    }
    tareas: {
      total: number
      enProgreso: number
    }
  }>
}

// ============================================
// SERVICIO DE TIMELINE
// ============================================

class TimelineService {
  private baseUrl = '/dashboard/timeline'

  /**
   * Obtener datos completos del timeline
   */
  async getTimelineData(filtros?: {
    departamentoId?: string
    estado?: string
    fechaInicio?: string
    fechaFin?: string
  }): Promise<TimelineData> {
    const response = await apiClient.get(`${this.baseUrl}`, {
      params: filtros
    })
    return response.data
  }

  /**
   * Obtener proyecto específico del timeline
   */
  async getProyectoTimeline(proyectoId: string): Promise<ProyectoTimeline> {
    const response = await apiClient.get(`${this.baseUrl}/proyecto/${proyectoId}`)
    return response.data
  }

  /**
   * Actualizar fecha de proyecto (reprogramar)
   */
  async actualizarFechas(proyectoId: string, data: {
    fechaInicio?: string
    fechaFin?: string
  }): Promise<ProyectoTimeline> {
    const response = await apiClient.patch(`${this.baseUrl}/proyecto/${proyectoId}/fechas`, data)
    return response.data
  }

  /**
   * Obtener sugerencias IA globales
   */
  async getSugerenciasGlobales(): Promise<SugerenciaIA[]> {
    const response = await apiClient.get(`${this.baseUrl}/sugerencias`)
    return response.data
  }

  /**
   * Aplicar sugerencia IA
   */
  async aplicarSugerencia(sugerenciaId: string): Promise<{
    success: boolean
    mensaje: string
  }> {
    const response = await apiClient.post(`${this.baseUrl}/sugerencias/${sugerenciaId}/aplicar`)
    return response.data
  }

  /**
   * Descartar sugerencia IA
   */
  async descartarSugerencia(sugerenciaId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/sugerencias/${sugerenciaId}/descartar`)
  }

  /**
   * Obtener datos de "Mi Día"
   */
  async getMyDayData(): Promise<MyDayData> {
    const response = await apiClient.get('/dashboard/mi-dia')
    return response.data
  }

  /**
   * Obtener datos de carga del equipo
   */
  async getTeamLoadData(): Promise<TeamLoadData> {
    const response = await apiClient.get('/dashboard/equipo')
    return response.data
  }

  /**
   * Marcar alerta como vista
   */
  async marcarAlertaVista(alertaId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/alertas/${alertaId}/vista`)
  }

  /**
   * Resolver alerta
   */
  async resolverAlerta(alertaId: string, accion: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/alertas/${alertaId}/resolver`, { accion })
  }

  /**
   * Obtener dependencias de un proyecto
   */
  async getDependencias(proyectoId: string): Promise<{
    bloqueantes: ProyectoTimeline[]
    relacionados: ProyectoTimeline[]
  }> {
    const response = await apiClient.get(`${this.baseUrl}/proyecto/${proyectoId}/dependencias`)
    return response.data
  }

  /**
   * Exportar timeline como imagen
   */
  async exportarTimeline(formato: 'png' | 'pdf'): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/exportar`, {
      params: { formato },
      responseType: 'blob'
    })
    return response.data
  }
}

export const timelineService = new TimelineService()
