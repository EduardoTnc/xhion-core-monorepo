import api from '../api/axios';

export interface CreateSolicitudDto {
  nombreCompleto: string;
  email: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
  mensaje?: string;
}

export interface ReviewSolicitudDto {
  estado: 'Aprobada' | 'Rechazada';
  comentarioRevision?: string;
  rolId?: string;
  departamentoId?: string;
}

export interface SolicitudAcceso {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
  mensaje?: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Expirada';
  revisadoPorId?: string;
  fechaRevision?: string;
  comentarioRevision?: string;
  invitacionId?: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  ipSolicitud?: string;
  revisadoPor?: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  invitacion?: {
    id: string;
    token: string;
    fecha_expiracion: string;
    fue_utilizada: boolean;
  };
}

export interface SolicitudesStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  expiradas: number;
}

export const solicitudesService = {
  /**
   * Crear una nueva solicitud de acceso (público)
   */
  createSolicitud: async (data: CreateSolicitudDto): Promise<SolicitudAcceso> => {
    const response = await api.post('/solicitudes-acceso', data);
    return response.data;
  },

  /**
   * Obtener todas las solicitudes (requiere autenticación)
   */
  getSolicitudes: async (estado?: string): Promise<SolicitudAcceso[]> => {
    const response = await api.get('/solicitudes-acceso', {
      params: estado ? { estado } : undefined,
    });
    return response.data;
  },

  /**
   * Obtener estadísticas de solicitudes
   */
  getStats: async (): Promise<SolicitudesStats> => {
    const response = await api.get('/solicitudes-acceso/stats');
    return response.data;
  },

  /**
   * Obtener una solicitud por ID
   */
  getSolicitudById: async (id: string): Promise<SolicitudAcceso> => {
    const response = await api.get(`/solicitudes-acceso/${id}`);
    return response.data;
  },

  /**
   * Revisar una solicitud (aprobar o rechazar)
   */
  reviewSolicitud: async (id: string, data: ReviewSolicitudDto): Promise<SolicitudAcceso> => {
    const response = await api.patch(`/solicitudes-acceso/${id}/review`, data);
    return response.data;
  },

  /**
   * Marcar solicitudes expiradas
   */
  markExpired: async (): Promise<{ updated: number }> => {
    const response = await api.post('/solicitudes-acceso/expire');
    return response.data;
  },
};
