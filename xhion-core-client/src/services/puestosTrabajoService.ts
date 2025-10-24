import apiClient from "../api/axios"

export interface PuestoTrabajo {
  id: string
  proyectoId?: string
  departamentoId?: string
  nombre: string
  descripcion?: string
  responsabilidades?: string
  nivel: number
  puestoSuperiorId?: string
  fechaCreacion: string
  fechaActualizacion: string
  empleados?: Array<{
    id: string
    nombreCompleto: string
    email: string
  }>
  puestoSuperior?: {
    id: string
    nombre: string
  }
}

export interface CreatePuestoTrabajoDto {
  proyectoId?: string
  departamentoId?: string
  nombre: string
  descripcion?: string
  responsabilidades?: string
  nivel: number
  puestoSuperiorId?: string
}

export interface UpdatePuestoTrabajoDto {
  nombre?: string
  descripcion?: string
  responsabilidades?: string
  nivel?: number
  puestoSuperiorId?: string
}

class PuestosTrabajoService {
  private baseUrl = "/puestos-trabajo"

  async getPuestosByProyecto(proyectoId: string): Promise<PuestoTrabajo[]> {
    const response = await apiClient.get(`${this.baseUrl}/proyecto/${proyectoId}`)
    return response.data
  }

  async getPuestosByDepartamento(departamentoId: string): Promise<PuestoTrabajo[]> {
    const response = await apiClient.get(`${this.baseUrl}/departamento/${departamentoId}`)
    return response.data
  }

  async createPuesto(data: CreatePuestoTrabajoDto): Promise<PuestoTrabajo> {
    const response = await apiClient.post(this.baseUrl, data)
    return response.data
  }

  async updatePuesto(id: string, data: UpdatePuestoTrabajoDto): Promise<PuestoTrabajo> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async deletePuesto(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async asignarEmpleado(puestoId: string, empleadoId: string): Promise<PuestoTrabajo> {
    const response = await apiClient.post(`${this.baseUrl}/${puestoId}/asignar`, { empleadoId })
    return response.data
  }

  async desasignarEmpleado(puestoId: string, empleadoId: string): Promise<PuestoTrabajo> {
    const response = await apiClient.post(`${this.baseUrl}/${puestoId}/desasignar`, { empleadoId })
    return response.data
  }
}

export default new PuestosTrabajoService()
