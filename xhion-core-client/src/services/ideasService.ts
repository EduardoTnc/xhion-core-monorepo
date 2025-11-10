import apiClient from '../api/axios';

export interface Idea {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'Feature' | 'Improvement' | 'Innovation' | 'Recommendation';
  estado: 'Evaluating' | 'Approved' | 'InDevelopment' | 'Implemented' | 'Rejected';
  autorId: string;
  aiScore?: number;
  aiInsight?: string;
  tags: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
  autor: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  _count: {
    votos: number;
    comentarios: number;
  };
  hasVoted?: boolean;
}

export interface CrearIdeaDto {
  titulo: string;
  descripcion: string;
  categoria: 'Feature' | 'Improvement' | 'Innovation' | 'Recommendation';
  aiScore?: number;
  aiInsight?: string;
  tags?: string[];
}

export interface ActualizarIdeaDto {
  titulo?: string;
  descripcion?: string;
  categoria?: 'Feature' | 'Improvement' | 'Innovation' | 'Recommendation';
  estado?: 'Evaluating' | 'Approved' | 'InDevelopment' | 'Implemented' | 'Rejected';
  aiScore?: number;
  aiInsight?: string;
  tags?: string[];
}

export interface Comentario {
  id: string;
  ideaId: string;
  usuarioId: string;
  contenido: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string;
  };
}

export interface Estadisticas {
  total: number;
  porEstado: Record<string, number>;
  porCategoria: Record<string, number>;
}

class IdeasService {
  // ========== CRUD DE IDEAS ==========

  async crear(data: CrearIdeaDto): Promise<Idea> {
    const response = await apiClient.post('/ideas', data);
    return response.data;
  }

  async obtenerTodas(
    categoria?: string,
    estado?: string,
    busqueda?: string
  ): Promise<Idea[]> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (estado) params.append('estado', estado);
    if (busqueda) params.append('busqueda', busqueda);

    const response = await apiClient.get(`/ideas?${params.toString()}`);
    return response.data;
  }

  async obtenerPorId(id: string): Promise<Idea> {
    const response = await apiClient.get(`/ideas/${id}`);
    return response.data;
  }

  async actualizar(id: string, data: ActualizarIdeaDto): Promise<Idea> {
    const response = await apiClient.patch(`/ideas/${id}`, data);
    return response.data;
  }

  async eliminar(id: string): Promise<void> {
    await apiClient.delete(`/ideas/${id}`);
  }

  // ========== VOTOS ==========

  async votar(id: string): Promise<{ message: string; voted: boolean }> {
    const response = await apiClient.post(`/ideas/${id}/votar`);
    return response.data;
  }

  async obtenerVotantes(id: string): Promise<any[]> {
    const response = await apiClient.get(`/ideas/${id}/votantes`);
    return response.data;
  }

  // ========== COMENTARIOS ==========

  async crearComentario(id: string, contenido: string): Promise<Comentario> {
    const response = await apiClient.post(`/ideas/${id}/comentarios`, { contenido });
    return response.data;
  }

  async obtenerComentarios(id: string): Promise<Comentario[]> {
    const response = await apiClient.get(`/ideas/${id}/comentarios`);
    return response.data;
  }

  async eliminarComentario(comentarioId: string): Promise<void> {
    await apiClient.delete(`/ideas/comentarios/${comentarioId}`);
  }

  // ========== ESTADÍSTICAS ==========

  async obtenerEstadisticas(): Promise<Estadisticas> {
    const response = await apiClient.get('/ideas/estadisticas');
    return response.data;
  }
}

export const ideasService = new IdeasService();
