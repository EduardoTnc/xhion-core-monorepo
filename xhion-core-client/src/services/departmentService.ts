import apiClient from '../api/axios';

export interface Departamento {
  id: string;
  nombre: string;
  descripcion?: string;
  objetivos?: string;
  icono?: string;
  color?: string;
  jefeId?: string;
  fechaCreacion: string;
  fechaEliminacion?: string;
  jefe?: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
    puestoTrabajo?: {
      titulo: string;
    };
  };
  contextoDepartamento?: {
    id: string;
    funciones?: string;
    objetivos?: string;
  };
  _count?: {
    puestosTrabajo: number;
    proyectos: number;
    invitaciones: number;
  };
}

export interface DepartamentoDetalle extends Departamento {
  puestosTrabajo: Array<{
    id: string;
    titulo: string;
    descripcion?: string;
    _count: {
      usuarios: number;
    };
  }>;
  proyectos: Array<{
    id: string;
    nombre: string;
    estado: string;
    fechaCreacion: string;
    fechaInicio?: string;
    fechaFin?: string;
    responsable: {
      id: string;
      nombreCompleto: string;
      avatarUrl?: string;
    };
    _count: {
      tareas: number;
      miembros: number;
      etapas: number;
    };
  }>;
  usuarios?: Array<{
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
    puestoTrabajo?: {
      id: string;
      titulo: string;
    };
  }>;
}

export interface EstadisticasDepartamento {
  departamento: {
    id: string;
    nombre: string;
    descripcion?: string;
    color?: string;
  };
  estadisticas: {
    totalEmpleados: number;
    totalPuestos: number;
    proyectos: {
      activos: number;
      completados: number;
      total: number;
    };
    tareas: {
      abiertas: number;
      completadas: number;
      total: number;
    };
  };
  jefe?: {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string;
  };
  contexto?: {
    id: string;
    funciones?: string;
    responsabilidades?: string;
    procesosClave?: string;
    objetivos?: string;
    kpis?: string;
  };
}

export interface CreateDepartamentoDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  jefeId?: string;
}

export interface UpdateDepartamentoDto {
  nombre?: string;
  descripcion?: string;
  color?: string;
  jefeId?: string;
}

class DepartmentService {
  async getAll(): Promise<Departamento[]> {
    const response = await apiClient.get('/departamentos');
    return response.data;
  }

  async getById(id: string): Promise<DepartamentoDetalle> {
    const response = await apiClient.get(`/departamentos/${id}`);
    return response.data;
  }

  async getEstadisticas(id: string): Promise<EstadisticasDepartamento> {
    const response = await apiClient.get(`/departamentos/${id}/estadisticas`);
    return response.data;
  }

  async create(data: CreateDepartamentoDto): Promise<Departamento> {
    const response = await apiClient.post('/departamentos', data);
    return response.data;
  }

  async update(id: string, data: UpdateDepartamentoDto): Promise<Departamento> {
    const response = await apiClient.put(`/departamentos/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/departamentos/${id}`);
  }

  async restore(id: string): Promise<Departamento> {
    const response = await apiClient.post(`/departamentos/${id}/restore`);
    return response.data;
  }
}

export const departmentService = new DepartmentService();
