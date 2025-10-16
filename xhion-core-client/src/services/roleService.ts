import apiClient from '../api/axios';
import type { RolConConteo, RolCompleto, UsuarioEnRol, PaginatedResponse, Permiso } from '../types';

/**
 * Servicio para la gestión de roles y permisos
 */
export const roleService = {
  /**
   * Obtiene todos los roles con el conteo de usuarios
   */
  async obtenerRoles(): Promise<RolConConteo[]> {
    try {
      const response = await apiClient.get<RolConConteo[]>('/api/v1/roles');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener los roles';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene todos los roles con sus permisos completos (Eager Loading)
   * Optimizado para carga inicial - una sola petición
   */
  async obtenerRolesConDetalles(): Promise<RolCompleto[]> {
    try {
      const response = await apiClient.get<RolCompleto[]>('/api/v1/roles/with-details');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener los roles';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene un rol específico con todos sus permisos
   */
  async obtenerRolPorId(id: string): Promise<RolCompleto> {
    try {
      const response = await apiClient.get<RolCompleto>(`/api/v1/roles/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener el rol';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene los usuarios que tienen asignado un rol específico
   */
  async obtenerUsuariosPorRol(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<UsuarioEnRol>> {
    try {
      const response = await apiClient.get<PaginatedResponse<UsuarioEnRol>>(
        `/api/v1/roles/${id}/usuarios`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener los usuarios del rol';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza los permisos de un rol
   */
  async actualizarPermisos(id: string, permisosIds: string[]): Promise<RolCompleto> {
    try {
      const response = await apiClient.patch<RolCompleto>(
        `/api/v1/roles/${id}/permisos`,
        { permisosIds }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar los permisos';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  async obtenerTodosLosPermisos(): Promise<Permiso[]> {
    try {
      const response = await apiClient.get<Permiso[]>('/api/v1/roles/permisos/all');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener los permisos';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea un nuevo rol
   */
  async crearRol(data: { nombre: string; descripcion?: string; color?: string }): Promise<RolConConteo> {
    try {
      const response = await apiClient.post<RolConConteo>('/api/v1/roles', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el rol';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un rol existente
   */
  async actualizarRol(
    id: string,
    data: { nombre?: string; descripcion?: string; color?: string }
  ): Promise<RolCompleto> {
    try {
      const response = await apiClient.patch<RolCompleto>(`/api/v1/roles/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el rol';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un rol
   */
  async eliminarRol(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/roles/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el rol';
      throw new Error(errorMessage);
    }
  },
};
