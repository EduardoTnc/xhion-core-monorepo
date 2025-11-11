import apiClient from '../api/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface RegistrarIngresoDto {
  fuente: 'Ventas' | 'Servicios' | 'Publicidad' | 'Suscripciones' | 'Licencias' | 'Otro';
  monto: number;
  descripcion?: string;
  fechaIngreso: string;
  comprobante?: string;
}

export interface RegistrarGastoDto {
  categoria: 'Personal' | 'Software' | 'Hardware' | 'Materiales' | 'Servicios' | 'Marketing' | 'Infraestructura' | 'Otro';
  concepto: string;
  monto: number;
  fechaGasto: string;
  comprobante?: string;
  recursoId?: string;
}

export interface CreatePresupuestoDepartamentoDto {
  montoTotal: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
  estado?: 'Activo' | 'Agotado' | 'Cerrado' | 'Suspendido';
}

export interface CreatePresupuestoProyectoDto {
  montoTotal: number;
  descripcion?: string;
  estado?: 'Activo' | 'Agotado' | 'Cerrado' | 'Suspendido';
}

export interface RegistrarMovimientoPresupuestoDto {
  tipo: 'Asignacion' | 'Gasto' | 'Ajuste' | 'Transferencia';
  monto: number;
  descripcion: string;
  categoria?: string;
  comprobante?: string;
}

export interface FiltrosFinanzasDto {
  fechaInicio?: string;
  fechaFin?: string;
  fuente?: string;
  categoria?: string;
}

// ============================================
// SERVICIO DE FINANZAS
// ============================================

class FinanzasService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // ============================================
  // INGRESOS
  // ============================================

  async registrarIngreso(proyectoId: string, data: RegistrarIngresoDto) {
    const response = await apiClient.post(
      `/finanzas/proyectos/${proyectoId}/ingresos`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerIngresos(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/ingresos`,
      {
        ...this.getAuthHeaders(),
        params: filtros,
      }
    );
    return response.data;
  }

  async eliminarIngreso(ingresoId: string) {
    const response = await apiClient.delete(
      `/finanzas/ingresos/${ingresoId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ============================================
  // GASTOS
  // ============================================

  async registrarGasto(proyectoId: string, data: RegistrarGastoDto) {
    const response = await apiClient.post(
      `/finanzas/proyectos/${proyectoId}/gastos`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerGastos(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/gastos`,
      {
        ...this.getAuthHeaders(),
        params: filtros,
      }
    );
    return response.data;
  }

  async eliminarGasto(gastoId: string) {
    const response = await apiClient.delete(
      `/finanzas/gastos/${gastoId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ============================================
  // ANÁLISIS DE RENTABILIDAD
  // ============================================

  async analizarRentabilidad(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/rentabilidad`,
      {
        ...this.getAuthHeaders(),
        params: filtros,
      }
    );
    return response.data;
  }

  async compararRentabilidad(proyectosIds: string[]) {
    const response = await apiClient.post(
      `/finanzas/comparar-rentabilidad`,
      { proyectosIds },
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ============================================
  // REPORTES
  // ============================================

  async obtenerReporteGeneral(filtros?: FiltrosFinanzasDto) {
    const response = await apiClient.get(
      `/finanzas/reportes/general`,
      {
        ...this.getAuthHeaders(),
        params: filtros,
      }
    );
    return response.data;
  }

  async obtenerTopProyectos(limite: number = 10, ordenarPor: 'ingresos' | 'utilidad' | 'roi' = 'utilidad') {
    const response = await apiClient.get(
      `/finanzas/reportes/top-proyectos`,
      {
        ...this.getAuthHeaders(),
        params: { limite, ordenarPor },
      }
    );
    return response.data;
  }

  // ============================================
  // PRESUPUESTOS DE DEPARTAMENTO
  // ============================================

  async crearPresupuestoDepartamento(departamentoId: string, data: CreatePresupuestoDepartamentoDto) {
    const response = await apiClient.post(
      `/finanzas/departamentos/${departamentoId}/presupuesto`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerPresupuestoDepartamento(departamentoId: string) {
    const response = await apiClient.get(
      `/finanzas/departamentos/${departamentoId}/presupuesto`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async actualizarPresupuestoDepartamento(departamentoId: string, data: Partial<CreatePresupuestoDepartamentoDto>) {
    const response = await apiClient.patch(
      `/finanzas/departamentos/${departamentoId}/presupuesto`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async registrarMovimientoPresupuestoDepartamento(departamentoId: string, data: RegistrarMovimientoPresupuestoDto) {
    const response = await apiClient.post(
      `/finanzas/departamentos/${departamentoId}/presupuesto/movimientos`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerMovimientosPresupuestoDepartamento(departamentoId: string) {
    const response = await apiClient.get(
      `/finanzas/departamentos/${departamentoId}/presupuesto/movimientos`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async eliminarMovimientoPresupuestoDepartamento(movimientoId: string) {
    const response = await apiClient.delete(
      `/finanzas/departamentos/presupuesto/movimientos/${movimientoId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async eliminarPresupuestoDepartamento(departamentoId: string) {
    const response = await apiClient.delete(
      `/finanzas/departamentos/${departamentoId}/presupuesto`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ============================================
  // PRESUPUESTOS DE PROYECTO
  // ============================================

  async crearPresupuestoProyecto(proyectoId: string, data: CreatePresupuestoProyectoDto) {
    const response = await apiClient.post(
      `/finanzas/proyectos/${proyectoId}/presupuesto`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerPresupuestoProyecto(proyectoId: string) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/presupuesto`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async actualizarPresupuestoProyecto(proyectoId: string, data: Partial<CreatePresupuestoProyectoDto>) {
    const response = await apiClient.patch(
      `/finanzas/proyectos/${proyectoId}/presupuesto`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async registrarMovimientoPresupuestoProyecto(proyectoId: string, data: RegistrarMovimientoPresupuestoDto) {
    const response = await apiClient.post(
      `/finanzas/proyectos/${proyectoId}/presupuesto/movimientos`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async obtenerMovimientosPresupuestoProyecto(proyectoId: string) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/presupuesto/movimientos`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async eliminarMovimientoPresupuestoProyecto(movimientoId: string) {
    const response = await apiClient.delete(
      `/finanzas/proyectos/presupuesto/movimientos/${movimientoId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async eliminarPresupuestoProyecto(proyectoId: string) {
    const response = await apiClient.delete(
      `/finanzas/proyectos/${proyectoId}/presupuesto`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ============================================
  // ANÁLISIS PRESUPUESTO VS REAL
  // ============================================

  async analizarPresupuestoVsRealProyecto(proyectoId: string) {
    const response = await apiClient.get(
      `/finanzas/proyectos/${proyectoId}/presupuesto-vs-real`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async analizarPresupuestoVsRealDepartamento(departamentoId: string) {
    const response = await apiClient.get(
      `/finanzas/departamentos/${departamentoId}/presupuesto-vs-real`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export default new FinanzasService();
