import apiClient from '../api/axios';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: 'Por_Hacer' | 'En_Progreso' | 'Hecho' | 'Bloqueado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  fechaVencimiento?: string;
  proyectoId: string;
  etapaId?: string;
  asignadoId?: string;
  creadorId: string;
  resumenIa?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCompletado?: string;
  proyecto: {
    id: string;
    nombre: string;
    responsableId?: string;
  };
  etapa?: {
    id: string;
    nombre: string;
    orden: number;
    estado?: string;
  };
  asignado?: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
    puestoTrabajo?: {
      id: string;
      titulo: string;
    };
  };
  creador: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  comentarios?: Comentario[];
  _count?: {
    comentarios: number;
  };
}

export interface Comentario {
  id: string;
  contenido: string;
  usuarioId: string;
  tareaId: string;
  fechaCreacion: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateTareaDto {
  titulo: string;
  descripcion?: string;
  proyectoId: string;
  etapaId?: string;
  asignadoId?: string;
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  fechaVencimiento?: string;
}

export interface UpdateTareaDto {
  titulo?: string;
  descripcion?: string;
  proyectoId?: string;
  etapaId?: string;
  asignadoId?: string;
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  fechaVencimiento?: string;
  estado?: 'Por_Hacer' | 'En_Progreso' | 'Hecho' | 'Bloqueado';
}

export interface MoveTareaDto {
  etapaId?: string;
  estado: 'Por_Hacer' | 'En_Progreso' | 'Hecho' | 'Bloqueado';
}

export interface CreateComentarioDto {
  contenido: string;
}

export interface TaskFilters {
  proyectoId?: string;
  etapaId?: string;
  asignadoId?: string;
  estado?: string;
  prioridad?: string;
}

/**
 * Servicio de tareas que encapsula todas las llamadas a la API
 */
export const taskService = {
  /**
   * Obtener todas las tareas con filtros opcionales
   */
  async getAll(filters?: TaskFilters): Promise<Tarea[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.proyectoId) params.append('proyectoId', filters.proyectoId);
      if (filters?.etapaId) params.append('etapaId', filters.etapaId);
      if (filters?.asignadoId) params.append('asignadoId', filters.asignadoId);
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.prioridad) params.append('prioridad', filters.prioridad);

      const response = await apiClient.get<Tarea[]>(`/api/v1/tareas?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener tareas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtener tareas asignadas al usuario actual
   */
  async getMisTareas(): Promise<Tarea[]> {
    try {
      const response = await apiClient.get<Tarea[]>('/api/v1/tareas/mis-tareas');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener mis tareas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtener una tarea por ID
   */
  async getById(id: string): Promise<Tarea> {
    try {
      const response = await apiClient.get<Tarea>(`/api/v1/tareas/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener tarea';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crear una nueva tarea
   */
  async create(data: CreateTareaDto): Promise<Tarea> {
    try {
      const response = await apiClient.post<Tarea>('/api/v1/tareas', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear tarea';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar una tarea
   */
  async update(id: string, data: UpdateTareaDto): Promise<Tarea> {
    try {
      const response = await apiClient.patch<Tarea>(`/api/v1/tareas/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar tarea';
      throw new Error(errorMessage);
    }
  },

  /**
   * Mover tarea entre etapas o cambiar estado
   */
  async move(id: string, data: MoveTareaDto): Promise<Tarea> {
    try {
      const response = await apiClient.patch<Tarea>(`/api/v1/tareas/${id}/move`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al mover tarea';
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar una tarea
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/api/v1/tareas/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar tarea';
      throw new Error(errorMessage);
    }
  },

  // ==================== GESTIÓN DE COMENTARIOS ====================

  /**
   * Obtener comentarios de una tarea
   */
  async getComentarios(tareaId: string): Promise<Comentario[]> {
    try {
      const response = await apiClient.get<Comentario[]>(`/api/v1/tareas/${tareaId}/comentarios`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener comentarios';
      throw new Error(errorMessage);
    }
  },

  /**
   * Agregar un comentario a una tarea
   */
  async addComentario(tareaId: string, data: CreateComentarioDto): Promise<Comentario> {
    try {
      const response = await apiClient.post<Comentario>(`/api/v1/tareas/${tareaId}/comentarios`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al agregar comentario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar un comentario
   */
  async deleteComentario(tareaId: string, comentarioId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/api/v1/tareas/${tareaId}/comentarios/${comentarioId}`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar comentario';
      throw new Error(errorMessage);
    }
  },
};
