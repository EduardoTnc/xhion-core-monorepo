import apiClient from '@/api/axios';
import type { UserPreferences, NotificationSettings } from '../store/settingsStore';

export interface UpdateProfileDto {
  nombreCompleto?: string;
  biografia?: string;
  avatarUrl?: string;
  fechaNacimiento?: string;
  fechaIngreso?: string;
  // Personal Information
  direccionResidencia?: string;
  ciudadResidencia?: string;
  paisResidencia?: string;
  genero?: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero_No_Decir';
  estadoCivil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Union_Libre' | 'Prefiero_No_Decir';
  nacionalidad?: string;
  // Professional Extensions
  tituloAcademico?: string;
  institucionEducativa?: string;
  certificaciones?: string[];
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

// Contact types
export type TipoContacto = 'telefono_principal' | 'telefono_secundario' | 'email_personal';

export interface ContactInfo {
  id: string;
  usuarioId: string;
  tipo: TipoContacto;
  valor: string;
  esPrivado: boolean;
}

export interface CreateContactoDto {
  tipo: TipoContacto;
  valor: string;
  esPrivado?: boolean;
}

export interface UpdateContactoDto {
  valor?: string;
  esPrivado?: boolean;
}

// Professional link types
export type TipoEnlaceProfesional = 'linkedin' | 'portafolio_personal' | 'blog_tecnico';

export interface EnlaceProfesional {
  id: string;
  usuarioId: string;
  tipo: TipoEnlaceProfesional;
  url: string;
}

export interface CreateEnlaceProfesionalDto {
  tipo: TipoEnlaceProfesional;
  url: string;
}

export interface UpdateEnlaceProfesionalDto {
  url?: string;
}

// Professional profile types (matches ProfessionalProfileSection.tsx)
export interface DailyAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface ProfessionalProfileData {
  yearsExperience: string | null;
  professionalLevel: string | null;
  specializations: string[];
  workModality: string | null;
  currentCapacity: string | null;
  weeklySchedule: Record<string, DailyAvailability>;
  leadershipExperience: string | null;
  languages: Record<string, string>;
  // Academic/Professional Extension Fields
  tituloAcademico?: string | null;
  institucionEducativa?: string | null;
  certificaciones?: string[];
}

/**
 * Phone validation helper (ITU-T E.164 compliant)
 * Supports international format: +[country code] [number]
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const digitsOnly = phone.replace(/[^\d]/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
  const phoneRegex = /^\+?[1-9]\d{0,3}[\s.\-]?\(?\d{1,4}\)?[\s.\-]?\d{1,5}[\s.\-]?\d{1,5}[\s.\-]?\d{0,5}$/;
  return phoneRegex.test(phone);
}

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Format phone number for display
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  // If already has formatting, return as-is
  if (phone.includes(' ') || phone.includes('-')) return phone;
  // Simple formatting: add spaces every 3 digits after country code
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length <= 10) {
    return `${hasPlus ? '+' : ''}${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`.trim();
  }
  // For longer numbers (international), format with country code
  return `${hasPlus ? '+' : ''}${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
}

class SettingsService {
  // ========== PERFIL ==========
  async updateProfile(data: UpdateProfileDto): Promise<any> {
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

  // ========== CONTACTOS CRUD ==========

  async getContactos(): Promise<ContactInfo[]> {
    const response = await apiClient.get('/usuarios/contactos');
    return response.data;
  }

  async addContacto(data: CreateContactoDto): Promise<ContactInfo> {
    const response = await apiClient.post('/usuarios/contactos', data);
    return response.data;
  }

  async updateContacto(id: string, data: UpdateContactoDto): Promise<ContactInfo> {
    const response = await apiClient.patch(`/usuarios/contactos/${id}`, data);
    return response.data;
  }

  async deleteContacto(id: string): Promise<void> {
    await apiClient.delete(`/usuarios/contactos/${id}`);
  }

  // ========== ENLACES PROFESIONALES CRUD ==========

  async getEnlacesProfesionales(): Promise<EnlaceProfesional[]> {
    const response = await apiClient.get('/usuarios/enlaces-profesionales');
    return response.data;
  }

  async addEnlaceProfesional(data: CreateEnlaceProfesionalDto): Promise<EnlaceProfesional> {
    const response = await apiClient.post('/usuarios/enlaces-profesionales', data);
    return response.data;
  }

  async updateEnlaceProfesional(id: string, data: UpdateEnlaceProfesionalDto): Promise<EnlaceProfesional> {
    const response = await apiClient.patch(`/usuarios/enlaces-profesionales/${id}`, data);
    return response.data;
  }

  async deleteEnlaceProfesional(id: string): Promise<void> {
    await apiClient.delete(`/usuarios/enlaces-profesionales/${id}`);
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

  // ========== PERFIL PROFESIONAL ==========

  async getProfessionalProfile(): Promise<ProfessionalProfileData> {
    const response = await apiClient.get('/usuarios/perfil-profesional');
    return response.data;
  }

  async updateProfessionalProfile(data: Partial<ProfessionalProfileData>): Promise<ProfessionalProfileData> {
    const response = await apiClient.patch('/usuarios/perfil-profesional', data);
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
