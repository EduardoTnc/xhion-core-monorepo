import api from '@/api/axios';

// Tipos
export type TipoEvento = 'Reunion' | 'Tarea' | 'Proyecto' | 'Personal' | 'Recordatorio';

export const TipoEvento = {
  Reunion: 'Reunion' as TipoEvento,
  Tarea: 'Tarea' as TipoEvento,
  Proyecto: 'Proyecto' as TipoEvento,
  Personal: 'Personal' as TipoEvento,
  Recordatorio: 'Recordatorio' as TipoEvento,
};

export type EstadoEvento = 'Pendiente' | 'En_Curso' | 'Completado' | 'Cancelado';

export const EstadoEvento = {
  Pendiente: 'Pendiente' as EstadoEvento,
  En_Curso: 'En_Curso' as EstadoEvento,
  Completado: 'Completado' as EstadoEvento,
  Cancelado: 'Cancelado' as EstadoEvento,
};

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  estado: EstadoEvento;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  ubicacion?: string;
  color?: string;
  proyectoId?: string;
  tareaId?: string;
  creadorId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  eliminado: boolean;
  creador: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  proyecto?: {
    id: string;
    nombre: string;
    estado: string;
  };
  tarea?: {
    id: string;
    titulo: string;
    estado: string;
  };
  participantes: EventoParticipante[];
}

export interface EventoParticipante {
  id: string;
  eventoId: string;
  usuarioId: string;
  confirmado: boolean;
  fechaRespuesta?: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateEventoDto {
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  estado?: EstadoEvento;
  fechaInicio: string;
  fechaFin: string;
  todoElDia?: boolean;
  ubicacion?: string;
  color?: string;
  proyectoId?: string;
  tareaId?: string;
  participantesIds?: string[];
}

export interface UpdateEventoDto extends Partial<CreateEventoDto> {}

export interface FiltrarEventosDto {
  usuarioId?: string;
  proyectoId?: string;
  tipo?: TipoEvento;
  estado?: EstadoEvento;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Servicio
export const eventosService = {
  // CRUD Básico
  getEventos: (filtros?: FiltrarEventosDto) => {
    return api.get<Evento[]>('/eventos', { params: filtros });
  },

  getEventoById: (id: string) => {
    return api.get<Evento>(`/eventos/${id}`);
  },

  createEvento: (data: CreateEventoDto) => {
    return api.post<Evento>('/eventos', data);
  },

  updateEvento: (id: string, data: UpdateEventoDto) => {
    return api.patch<Evento>(`/eventos/${id}`, data);
  },

  deleteEvento: (id: string) => {
    return api.delete(`/eventos/${id}`);
  },

  // Participantes
  addParticipante: (eventoId: string, usuarioId: string) => {
    return api.post(`/eventos/${eventoId}/participantes`, { usuarioId });
  },

  removeParticipante: (eventoId: string, usuarioId: string) => {
    return api.delete(`/eventos/${eventoId}/participantes/${usuarioId}`);
  },

  confirmarAsistencia: (eventoId: string) => {
    return api.post(`/eventos/${eventoId}/confirmar`);
  },

  // Queries Especiales
  getEventosByUsuario: (usuarioId: string, fechaDesde?: string, fechaHasta?: string) => {
    return api.get<Evento[]>(`/eventos/usuario/${usuarioId}`, {
      params: { fechaDesde, fechaHasta },
    });
  },

  getEventosByProyecto: (proyectoId: string) => {
    return api.get<Evento[]>(`/eventos/proyecto/${proyectoId}`);
  },

  getEventosProximos: (dias: number = 7) => {
    return api.get<Evento[]>('/eventos/proximos', { params: { dias } });
  },

  // Drag & Drop
  moverEvento: (eventoId: string, fechaInicio: string, fechaFin: string) => {
    return api.patch<Evento>(`/eventos/${eventoId}/mover`, { fechaInicio, fechaFin });
  },
};
