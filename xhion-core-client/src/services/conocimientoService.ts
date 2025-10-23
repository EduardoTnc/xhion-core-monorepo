import apiClient from '../api/axios';

// ==================== CONTEXTO ORGANIZACIONAL ====================

export interface ContextoOrganizacional {
  id: string;
  mision?: string;
  vision?: string;
  objetivosEstrategicos?: string;
  descripcionGeneral?: string;
  industria?: string;
  tamanoEmpresa?: string;
  valoresEmpresariales?: string;
  fechaActualizacion: string;
  actualizadoPorId: string;
  actualizadoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
}

export interface CreateContextoOrganizacionalDto {
  mision?: string;
  vision?: string;
  objetivosEstrategicos?: string;
  descripcionGeneral?: string;
  industria?: string;
  tamanoEmpresa?: string;
  valoresEmpresariales?: string;
}

// ==================== CONTEXTO DEPARTAMENTO ====================

export interface ContextoDepartamento {
  id: string;
  departamentoId: string;
  funciones?: string;
  responsabilidades?: string;
  procesosClave?: string;
  objetivos?: string;
  kpis?: string;
  fechaActualizacion: string;
  actualizadoPorId: string;
  departamento: {
    id: string;
    nombre: string;
    descripcion?: string;
    color?: string;
  };
  actualizadoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
}

export interface CreateContextoDepartamentoDto {
  departamentoId: string;
  funciones?: string;
  responsabilidades?: string;
  procesosClave?: string;
  objetivos?: string;
  kpis?: string;
}

export interface UpdateContextoDepartamentoDto {
  funciones?: string;
  responsabilidades?: string;
  procesosClave?: string;
  objetivos?: string;
  kpis?: string;
}

// ==================== DOCUMENTO PROYECTO ====================

export enum TipoDocumentoProyecto {
  Resumen = 'Resumen',
  Objetivos = 'Objetivos',
  Especificaciones = 'Especificaciones',
  LeccionesAprendidas = 'LeccionesAprendidas',
  Documentacion = 'Documentacion',
  Notas = 'Notas',
}

export interface DocumentoProyecto {
  id: string;
  proyectoId: string;
  tipo: TipoDocumentoProyecto;
  titulo: string;
  contenido: string;
  archivoId?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPorId: string;
  proyecto: {
    id: string;
    nombre: string;
  };
  archivo?: {
    id: string;
    nombreArchivo: string;
    urlArchivo: string;
    tipoArchivo?: string;
    tamanoBytes?: number;
  };
  creadoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateDocumentoProyectoDto {
  proyectoId: string;
  tipo: TipoDocumentoProyecto;
  titulo: string;
  contenido: string;
  archivoId?: string;
}

export interface UpdateDocumentoProyectoDto {
  tipo?: TipoDocumentoProyecto;
  titulo?: string;
  contenido?: string;
  archivoId?: string;
}

class ConocimientoService {
  // ==================== CONTEXTO ORGANIZACIONAL ====================

  async upsertContextoOrganizacional(
    data: CreateContextoOrganizacionalDto
  ): Promise<ContextoOrganizacional> {
    const response = await apiClient.post('/conocimiento/organizacional', data);
    return response.data;
  }

  async getContextoOrganizacional(): Promise<ContextoOrganizacional> {
    const response = await apiClient.get('/conocimiento/organizacional');
    return response.data;
  }

  // ==================== CONTEXTO DEPARTAMENTO ====================

  async createContextoDepartamento(
    data: CreateContextoDepartamentoDto
  ): Promise<ContextoDepartamento> {
    const response = await apiClient.post('/conocimiento/departamento', data);
    return response.data;
  }

  async getAllContextosDepartamento(): Promise<ContextoDepartamento[]> {
    const response = await apiClient.get('/conocimiento/departamento');
    return response.data;
  }

  async getContextoDepartamento(departamentoId: string): Promise<ContextoDepartamento> {
    const response = await apiClient.get(`/conocimiento/departamento/${departamentoId}`);
    return response.data;
  }

  async updateContextoDepartamento(
    departamentoId: string,
    data: UpdateContextoDepartamentoDto
  ): Promise<ContextoDepartamento> {
    const response = await apiClient.put(`/conocimiento/departamento/${departamentoId}`, data);
    return response.data;
  }

  async deleteContextoDepartamento(departamentoId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/conocimiento/departamento/${departamentoId}`);
    return response.data;
  }

  // ==================== DOCUMENTOS PROYECTO ====================

  async createDocumentoProyecto(data: CreateDocumentoProyectoDto): Promise<DocumentoProyecto> {
    const response = await apiClient.post('/conocimiento/documentos', data);
    return response.data;
  }

  async getDocumentosProyecto(proyectoId: string): Promise<DocumentoProyecto[]> {
    const response = await apiClient.get(`/conocimiento/documentos/proyecto/${proyectoId}`);
    return response.data;
  }

  async getDocumentoProyecto(id: string): Promise<DocumentoProyecto> {
    const response = await apiClient.get(`/conocimiento/documentos/${id}`);
    return response.data;
  }

  async updateDocumentoProyecto(
    id: string,
    data: UpdateDocumentoProyectoDto
  ): Promise<DocumentoProyecto> {
    const response = await apiClient.put(`/conocimiento/documentos/${id}`, data);
    return response.data;
  }

  async deleteDocumentoProyecto(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/conocimiento/documentos/${id}`);
    return response.data;
  }
}

export const conocimientoService = new ConocimientoService();
