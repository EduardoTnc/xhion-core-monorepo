import apiClient from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { LoginDTO, CompletarRegistroDTO, AuthUser, Invitacion, Sesion } from '../types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

interface AcceptInvitationResponse extends LoginResponse {
  userId: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Servicio de autenticación que encapsula todas las llamadas a la API de auth
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;

      // Obtener información del usuario después del login
      const userResponse = await apiClient.get<AuthUser>('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return {
        accessToken,
        refreshToken,
        user: userResponse.data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  },

  /**
   * Refresca el access token usando el refresh token actual
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const { refreshToken: currentRefreshToken } = useAuthStore.getState();

      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Enviar el refresh token en el cuerpo de la petición
      const response = await apiClient.post<RefreshTokenResponse>('/api/v1/auth/refresh', {
        refreshToken: currentRefreshToken
      });

      return {
        accessToken: response.data.accessToken,
      };
    } catch (error: any) {
      // Si el refresh falla, significa que el refresh token también expiró
      // El interceptor manejará esto limpiando la sesión
      const errorMessage = error.response?.data?.message || 'Sesión expirada';
      throw new Error(errorMessage);
    }
  },

  /**
   * Valida un token de invitación
   */
  async validarTokenInvitacion(token: string): Promise<Invitacion> {
    try {
      const response = await apiClient.get<Invitacion>(`/api/v1/invitaciones/${token}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token de invitación inválido o expirado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Completa el registro de un usuario invitado
   */
  async completarRegistro(payload: CompletarRegistroDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    try {
      const response = await apiClient.post<AcceptInvitationResponse>('/api/v1/auth/accept-invitation', payload);
      const { accessToken, refreshToken } = response.data;

      // Obtener información del usuario después del registro
      const userResponse = await apiClient.get<AuthUser>('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return {
        accessToken,
        refreshToken,
        user: userResponse.data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al completar el registro';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene las sesiones activas del usuario
   */
  async obtenerSesionesActivas(): Promise<Sesion[]> {
    try {
      const response = await apiClient.get<Sesion[]>('/api/v1/sesiones');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener las sesiones';
      throw new Error(errorMessage);
    }
  },

  /**
   * Revoca una sesión específica
   */
  async revocarSesion(sesionId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/sesiones/${sesionId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al revocar la sesión';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error: any) {
      // Aunque falle la petición, permitimos cerrar sesión localmente
      console.error('Error al cerrar sesión:', error);
    }
  },
};
