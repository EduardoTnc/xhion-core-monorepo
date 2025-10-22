import apiClient from '../api/axios';

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Completado' | 'En_Pausa' | 'Archivado';
  responsableId: string;
  departamentoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  responsable: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  departamento?: {
    id: string;
    nombre: string;
  };
  miembros?: ProyectoMiembro[];
  etapas?: Etapa[];
  _count?: {
    tareas: number;
    miembros: number;
    etapas: number;
  };
}

export interface ProyectoMiembro {
  proyectoId: string;
  usuarioId: string;
  rol: 'Responsable' | 'Miembro' | 'Observador';
  fechaUnion: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
    rolId?: string;
    puestoTrabajo?: {
      id: string;
      titulo: string;
    };
  };
}

export interface Etapa {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  proyectoId: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: 'Pendiente' | 'En_Progreso' | 'Completada';
  fechaCreacion: string;
  fechaActualizacion: string;
  _count?: {
    tareas: number;
  };
}

export interface CreateProyectoDto {
  nombre: string;
  descripcion?: string;
  responsableId: string;
  departamentoId?: string;
}

export interface UpdateProyectoDto {
  nombre?: string;
  descripcion?: string;
  responsableId?: string;
  departamentoId?: string;
  estado?: 'Activo' | 'Completado' | 'En_Pausa' | 'Archivado';
}

export interface AddMiembroDto {
  usuarioId: string;
  rol?: 'Responsable' | 'Miembro' | 'Observador';
}

export interface CreateEtapaDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface UpdateEtapaDto {
  nombre?: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'Pendiente' | 'En_Progreso' | 'Completada';
}

export interface ReorderEtapasDto {
  etapas: Array<{
    id: string;
    orden: number;
  }>;
}

/**
 * Servicio de proyectos que encapsula todas las llamadas a la API
 */
export const projectService = {
  /**
   * Obtener todos los proyectos del usuario
   */
  async getAll(filters?: { estado?: string; departamentoId?: string }): Promise<Proyecto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.departamentoId) params.append('departamentoId', filters.departamentoId);

      const response = await apiClient.get<Proyecto[]>(`/api/v1/proyectos?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener proyectos';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtener un proyecto por ID
   */
  async getById(id: string): Promise<Proyecto> {
    try {
      const response = await apiClient.get<Proyecto>(`/api/v1/proyectos/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener proyecto';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crear un nuevo proyecto
   */
  async create(data: CreateProyectoDto): Promise<Proyecto> {
    try {
      const response = await apiClient.post<Proyecto>('/api/v1/proyectos', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear proyecto';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar un proyecto
   */
  async update(id: string, data: UpdateProyectoDto): Promise<Proyecto> {
    try {
      const response = await apiClient.patch<Proyecto>(`/api/v1/proyectos/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar proyecto';
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar un proyecto
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/api/v1/proyectos/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar proyecto';
      throw new Error(errorMessage);
    }
  },

  // ==================== GESTIÓN DE MIEMBROS ====================

  /**
   * Obtener miembros de un proyecto
   */
  async getMiembros(proyectoId: string): Promise<ProyectoMiembro[]> {
    try {
      const response = await apiClient.get<ProyectoMiembro[]>(`/api/v1/proyectos/${proyectoId}/miembros`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener miembros';
      throw new Error(errorMessage);
    }
  },

  /**
   * Agregar un miembro al proyecto
   */
  async addMiembro(proyectoId: string, data: AddMiembroDto): Promise<ProyectoMiembro> {
    try {
      const response = await apiClient.post<ProyectoMiembro>(`/api/v1/proyectos/${proyectoId}/miembros`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al agregar miembro';
      throw new Error(errorMessage);
    }
  },

  /**
   * Remover un miembro del proyecto
   */
  async removeMiembro(proyectoId: string, usuarioId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/api/v1/proyectos/${proyectoId}/miembros/${usuarioId}`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al remover miembro';
      throw new Error(errorMessage);
    }
  },

  // ==================== GESTIÓN DE ETAPAS ====================

  /**
   * Obtener etapas de un proyecto
   */
  async getEtapas(proyectoId: string): Promise<Etapa[]> {
    try {
      const response = await apiClient.get<Etapa[]>(`/api/v1/proyectos/${proyectoId}/etapas`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener etapas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crear una etapa en el proyecto
   */
  async createEtapa(proyectoId: string, data: CreateEtapaDto): Promise<Etapa> {
    try {
      const response = await apiClient.post<Etapa>(`/api/v1/proyectos/${proyectoId}/etapas`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear etapa';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar una etapa
   */
  async updateEtapa(proyectoId: string, etapaId: string, data: UpdateEtapaDto): Promise<Etapa> {
    try {
      const response = await apiClient.patch<Etapa>(
        `/api/v1/proyectos/${proyectoId}/etapas/${etapaId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar etapa';
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar una etapa
   */
  async deleteEtapa(proyectoId: string, etapaId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/api/v1/proyectos/${proyectoId}/etapas/${etapaId}`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar etapa';
      throw new Error(errorMessage);
    }
  },

  /**
   * Reordenar etapas
   */
  async reorderEtapas(proyectoId: string, data: ReorderEtapasDto): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>(
        `/api/v1/proyectos/${proyectoId}/etapas/reorder`,
        data
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al reordenar etapas';
      throw new Error(errorMessage);
    }
  },
};
