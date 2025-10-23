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
};
