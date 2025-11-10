import apiClient from '../api/axios';

// Tipos
export type TipoNotificacion = 'Evento' | 'Tarea' | 'Proyecto' | 'Sistema' | 'Recordatorio';
export type EstadoNotificacion = 'Pendiente' | 'Enviada' | 'Leida' | 'Fallida';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaLectura?: string;
  proyectoId?: string;
  tareaId?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  proyecto?: {
    id: string;
    nombre: string;
  };
  tarea?: {
    id: string;
    titulo: string;
  };
}

export interface CreateNotificacionDto {
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida?: boolean;
  proyectoId?: string;
  tareaId?: string;
}

// Servicio
export const notificacionesService = {
  // CRUD Básico
  getMisNotificaciones: (soloNoLeidas?: boolean) => {
    return apiClient.get<Notificacion[]>('/notificaciones/mis-notificaciones', {
      params: { soloNoLeidas },
    });
  },

  getNotificacionesByUsuario: (usuarioId: string, soloNoLeidas?: boolean) => {
    return apiClient.get<{ data: Notificacion[]; total: number }>(`/notificaciones/usuario/${usuarioId}`, {
      params: { soloNoLeidas },
    });
  },

  getNotificacionById: (id: string) => {
    return apiClient.get<Notificacion>(`/notificaciones/${id}`);
  },

  createNotificacion: (data: CreateNotificacionDto) => {
    return apiClient.post<Notificacion>('/notificaciones', data);
  },

  // Marcar como leída
  marcarComoLeida: (id: string) => {
    return apiClient.patch(`/notificaciones/${id}/marcar-leida`);
  },

  marcarTodasComoLeidas: () => {
    return apiClient.patch<{ data: { count: number } }>('/notificaciones/marcar-todas-leidas');
  },

  // Eliminar
  deleteNotificacion: (id: string) => {
    return apiClient.delete(`/notificaciones/${id}`);
  },

  eliminarLeidas: () => {
    return apiClient.delete('/notificaciones/eliminar-leidas');
  },

  // Contador
  contarNoLeidas: () => {
    return apiClient.get<number>('/notificaciones/no-leidas/count');
  },
};
