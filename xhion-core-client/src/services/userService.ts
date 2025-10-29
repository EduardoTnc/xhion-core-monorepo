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
};
