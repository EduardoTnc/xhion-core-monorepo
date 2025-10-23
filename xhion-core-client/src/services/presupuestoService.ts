import apiClient from '../api/axios';

// ==================== TIPOS ====================

export enum TipoMovimientoPresupuesto {
  Asignacion = 'Asignacion',
  Gasto = 'Gasto',
  Ajuste = 'Ajuste',
  Transferencia = 'Transferencia',
}

export enum EstadoPresupuesto {
  Activo = 'Activo',
  Agotado = 'Agotado',
  Cerrado = 'Cerrado',
  Suspendido = 'Suspendido',
}

export interface PresupuestoDepartamento {
  id: string;
  departamentoId: string;
  montoTotal: number;
  montoGastado: number;
  montoDisponible: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPresupuesto;
  descripcion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  departamento: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  creadoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
  movimientos?: MovimientoPresupuestoDepartamento[];
}

export interface MovimientoPresupuestoDepartamento {
  id: string;
  presupuestoDepartamentoId: string;
  tipo: TipoMovimientoPresupuesto;
  monto: number;
  descripcion: string;
  categoria?: string;
  comprobante?: string;
  archivoId?: string;
  fechaMovimiento: string;
  registradoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
  archivo?: {
    id: string;
    nombreArchivo: string;
    urlArchivo: string;
  };
}

export interface PresupuestoProyecto {
  id: string;
  proyectoId: string;
  montoTotal: number;
  montoGastado: number;
  montoDisponible: number;
  estado: EstadoPresupuesto;
  descripcion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  proyecto: {
    id: string;
    nombre: string;
    descripcion?: string;
    estado: string;
  };
  creadoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
  movimientos?: MovimientoPresupuestoProyecto[];
}

export interface MovimientoPresupuestoProyecto {
  id: string;
  presupuestoProyectoId: string;
  tipo: TipoMovimientoPresupuesto;
  monto: number;
  descripcion: string;
  categoria?: string;
  comprobante?: string;
  archivoId?: string;
  fechaMovimiento: string;
  registradoPor: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
  archivo?: {
    id: string;
    nombreArchivo: string;
    urlArchivo: string;
  };
}

export interface CreatePresupuestoDepartamentoDto {
  departamentoId: string;
  montoTotal: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: EstadoPresupuesto;
  descripcion?: string;
}

export interface UpdatePresupuestoDepartamentoDto {
  montoTotal?: number;
  periodo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoPresupuesto;
  descripcion?: string;
}

export interface CreateMovimientoDepartamentoDto {
  presupuestoDepartamentoId: string;
  tipo: TipoMovimientoPresupuesto;
  monto: number;
  descripcion: string;
  categoria?: string;
  comprobante?: string;
  archivoId?: string;
  fechaMovimiento?: string;
}

export interface CreatePresupuestoProyectoDto {
  proyectoId: string;
  montoTotal: number;
  estado?: EstadoPresupuesto;
  descripcion?: string;
}

export interface UpdatePresupuestoProyectoDto {
  montoTotal?: number;
  estado?: EstadoPresupuesto;
  descripcion?: string;
}

export interface CreateMovimientoProyectoDto {
  presupuestoProyectoId: string;
  tipo: TipoMovimientoPresupuesto;
  monto: number;
  descripcion: string;
  categoria?: string;
  comprobante?: string;
  archivoId?: string;
  fechaMovimiento?: string;
}

// ==================== PRESUPUESTOS DE DEPARTAMENTO ====================

export const presupuestoService = {
  // Crear presupuesto de departamento
  async createPresupuestoDepartamento(
    data: CreatePresupuestoDepartamentoDto
  ): Promise<PresupuestoDepartamento> {
    const response = await apiClient.post(`/presupuestos/departamento`, data);
    return response.data;
  },

  // Obtener presupuesto de departamento
  async getPresupuestoDepartamento(departamentoId: string): Promise<PresupuestoDepartamento> {
    const response = await apiClient.get(
      `/presupuestos/departamento/${departamentoId}`
    );
    return response.data;
  },

  // Actualizar presupuesto de departamento
  async updatePresupuestoDepartamento(
    departamentoId: string,
    data: UpdatePresupuestoDepartamentoDto
  ): Promise<PresupuestoDepartamento> {
    const response = await apiClient.put(
      `/presupuestos/departamento/${departamentoId}`,
      data
    );
    return response.data;
  },

  // Eliminar presupuesto de departamento
  async deletePresupuestoDepartamento(departamentoId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/presupuestos/departamento/${departamentoId}`
    );
    return response.data;
  },

  // Crear movimiento de departamento
  async createMovimientoDepartamento(
    data: CreateMovimientoDepartamentoDto
  ): Promise<MovimientoPresupuestoDepartamento> {
    const response = await apiClient.post(
      `/presupuestos/departamento/movimiento`,
      data
    );
    return response.data;
  },

  // Obtener movimientos de departamento
  async getMovimientosDepartamento(
    presupuestoDepartamentoId: string
  ): Promise<MovimientoPresupuestoDepartamento[]> {
    const response = await apiClient.get(
      `/presupuestos/departamento/movimientos/${presupuestoDepartamentoId}`
    );
    return response.data;
  },

  // Eliminar movimiento de departamento
  async deleteMovimientoDepartamento(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/presupuestos/departamento/movimiento/${id}`
    );
    return response.data;
  },

  // ==================== PRESUPUESTOS DE PROYECTO ====================

  // Crear presupuesto de proyecto
  async createPresupuestoProyecto(
    data: CreatePresupuestoProyectoDto
  ): Promise<PresupuestoProyecto> {
    const response = await apiClient.post(`/presupuestos/proyecto`, data);
    return response.data;
  },

  // Obtener presupuesto de proyecto
  async getPresupuestoProyecto(proyectoId: string): Promise<PresupuestoProyecto> {
    const response = await apiClient.get(`/presupuestos/proyecto/${proyectoId}`);
    return response.data;
  },

  // Actualizar presupuesto de proyecto
  async updatePresupuestoProyecto(
    proyectoId: string,
    data: UpdatePresupuestoProyectoDto
  ): Promise<PresupuestoProyecto> {
    const response = await apiClient.put(
      `/presupuestos/proyecto/${proyectoId}`,
      data
    );
    return response.data;
  },

  // Eliminar presupuesto de proyecto
  async deletePresupuestoProyecto(proyectoId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/presupuestos/proyecto/${proyectoId}`);
    return response.data;
  },

  // Crear movimiento de proyecto
  async createMovimientoProyecto(
    data: CreateMovimientoProyectoDto
  ): Promise<MovimientoPresupuestoProyecto> {
    const response = await apiClient.post(
      `/presupuestos/proyecto/movimiento`,
      data
    );
    return response.data;
  },

  // Obtener movimientos de proyecto
  async getMovimientosProyecto(
    presupuestoProyectoId: string
  ): Promise<MovimientoPresupuestoProyecto[]> {
    const response = await apiClient.get(
      `/presupuestos/proyecto/movimientos/${presupuestoProyectoId}`
    );
    return response.data;
  },

  // Eliminar movimiento de proyecto
  async deleteMovimientoProyecto(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/presupuestos/proyecto/movimiento/${id}`
    );
    return response.data;
  },
};
