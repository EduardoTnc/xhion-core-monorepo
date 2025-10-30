import apiClient from '@/api/axios';
import type { UserPreferences, NotificationSettings } from '../store/settingsStore';

export interface UpdateProfileDto {
  nombre?: string;
  apellido?: string;
  biografia?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserSession {
  id: string;
  userAgent: string;
  ip: string;
  lastActivity: string;
  isCurrentSession: boolean;
}

class SettingsService {
  // ========== PERFIL ==========
  // Perfil
  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.patch('/usuarios/perfil', data)
    return response.data
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiClient.post('/usuarios/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  async uploadCv(file: File): Promise<{ cvUrl: string }> {
    const formData = new FormData()
    formData.append('cv', file)
    
    const response = await apiClient.post('/usuarios/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.patch('/auth/cambiar-contrasena', data);
  }

  // ========== PREFERENCIAS ==========
  
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get('/usuarios/preferencias');
    return response.data;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.patch('/usuarios/preferencias', preferences);
    return response.data;
  }

  // ========== NOTIFICACIONES ==========
  
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get('/usuarios/notificaciones');
    return response.data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.patch('/usuarios/notificaciones', settings);
    return response.data;
  }

  // ========== SEGURIDAD ==========
  
  async getSessions(): Promise<UserSession[]> {
    const response = await apiClient.get('/auth/sesiones');
    return response.data;
  }

  async terminateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sesiones/${sessionId}`);
  }

  async terminateAllSessions(): Promise<void> {
    await apiClient.delete('/auth/sesiones/todas');
  }

  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await apiClient.post('/auth/2fa/habilitar');
    return response.data;
  }

  async verify2FA(code: string): Promise<void> {
    await apiClient.post('/auth/2fa/verificar', { code });
  }

  async disable2FA(): Promise<void> {
    await apiClient.post('/auth/2fa/deshabilitar');
  }

  // ========== DATOS Y PRIVACIDAD ==========
  
  async downloadUserData(): Promise<Blob> {
    const response = await apiClient.get('/usuarios/exportar-datos', {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/usuarios/cuenta', {
      data: { password },
    });
  }
}

export const settingsService = new SettingsService();
