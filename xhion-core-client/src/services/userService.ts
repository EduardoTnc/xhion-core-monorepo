import apiClient from '../api/axios';
import type { Usuario } from '../types';

/**
 * Servicio para gestionar usuarios
 */
export const userService = {
  /**
   * Obtiene todos los usuarios del sistema con sus roles
   */
  async obtenerTodosLosUsuarios(): Promise<Usuario[]> {
    try {
      const response = await apiClient.get<Usuario[]>('/usuarios');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener los usuarios';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene un usuario específico por ID
   */
  async obtenerUsuarioPorId(id: string): Promise<Usuario> {
    try {
      const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener el usuario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cambia el rol de un usuario
   */
  async changeRole(userId: string, newRoleId: string): Promise<any> {
    try {
      const response = await apiClient.patch(`/usuarios/${userId}/cambiar-rol`, {
        rolId: newRoleId,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar el rol del usuario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cambia el estado de un usuario (ACTIVO/INACTIVO)
   */
  async updateStatus(userId: string, status: 'ACTIVO' | 'INACTIVO'): Promise<any> {
    try {
      const response = await apiClient.patch(`/usuarios/${userId}/estado`, {
        estado: status,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del usuario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un usuario del sistema (eliminación lógica)
   */
  async deleteUser(userId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/usuarios/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el perfil completo de un usuario (proyectos, tareas, perfil profesional)
   */
  async obtenerPerfilCompleto(userId: string): Promise<UserFullProfile> {
    try {
      const response = await apiClient.get<UserFullProfile>(`/usuarios/${userId}/perfil-completo`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener el perfil completo';
      throw new Error(errorMessage);
    }
  },
};

// --- Types ---

export interface UserFullProfile {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string | null;
  biografia?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaNacimiento?: string | null;
  fechaIngreso?: string | null;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
  archivoCvId?: string | null;
  puntajePerfilCompleto?: number;
  telefono?: string | null;

  rol: {
    id: string;
    nombre: string;
    descripcion?: string | null;
    color?: string | null;
    totalPermisos: number;
  };

  puestoTrabajo?: {
    id: string;
    titulo: string;
    descripcion?: string | null;
    departamento?: {
      id: string;
      nombre: string;
    };
  } | null;

  supervisor?: {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string | null;
  } | null;

  proyectos: {
    responsable: Array<{
      id: string;
      nombre: string;
      estado: string;
      fechaCreacion: string;
    }>;
    miembro: Array<{
      id: string;
      nombre: string;
      estado: string;
    }>;
    totalResponsable: number;
    totalMiembro: number;
  };

  tareas: {
    asignadas: Array<{
      id: string;
      titulo: string;
      estado: string;
      prioridad: string;
      fechaVencimiento?: string | null;
      proyecto?: {
        id: string;
        nombre: string;
      };
    }>;
    totalAsignadas: number;
    pendientes: number;
    enProgreso: number;
    completadas: number;
  };

  perfilProfesional?: {
    yearsExperience?: string;
    professionalLevel?: string;
    specializations?: string[];
    workMode?: string;
    hourlyRate?: string;
    linkedin?: string;
    portfolio?: string;
    currentCapacity?: string;
    hasLeadershipExperience?: boolean;
    languages?: string[];
  } | null;
}

// Paginated response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskHistoryItem {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  prioridad: string;
  fechaVencimiento?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  proyecto?: {
    id: string;
    nombre: string;
    estado: string;
  };
  asignado?: {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string | null;
  };
}

export interface ProjectItem {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fechaCreacion: string;
  responsable?: {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string | null;
  };
  departamento?: {
    id: string;
    nombre: string;
  };
  rolEnProyecto: 'Responsable' | 'Miembro';
}

export const obtenerTareasHistorial = async (
  usuarioId: string,
  page: number = 1,
  limit: number = 10,
  estado?: string
): Promise<PaginatedResponse<TaskHistoryItem>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(estado && { estado }),
  });

  const response = await apiClient.get(`/usuarios/${usuarioId}/tareas-historial?${params}`);
  return response.data;
};

export const obtenerProyectosUsuario = async (
  usuarioId: string,
  page: number = 1,
  limit: number = 10,
  rol: 'responsable' | 'miembro' | 'todos' = 'todos'
): Promise<PaginatedResponse<ProjectItem>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    rol,
  });

  const response = await apiClient.get(`/usuarios/${usuarioId}/proyectos?${params}`);
  return response.data;
};
