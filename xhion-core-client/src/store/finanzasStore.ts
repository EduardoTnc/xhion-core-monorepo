import { create } from 'zustand';
import { toast } from 'sonner';
import finanzasService from '../services/finanzasService';
import type {
  RegistrarIngresoDto,
  RegistrarGastoDto,
  CreatePresupuestoDepartamentoDto,
  CreatePresupuestoProyectoDto,
  RegistrarMovimientoPresupuestoDto,
  FiltrosFinanzasDto,
} from '../services/finanzasService';

interface FinanzasState {
  // Estado - Ingresos y Gastos
  ingresos: any[];
  gastos: any[];
  
  // Estado - Presupuestos (usando Map para múltiples entidades)
  presupuestosDepartamento: Map<string, any>;
  presupuestosProyecto: Map<string, any>;
  movimientosDepartamento: Map<string, any[]>;
  movimientosProyecto: Map<string, any[]>;
  
  // Estado - Análisis
  rentabilidad: any | null;
  reporteGeneral: any | null;
  topProyectos: any[];
  presupuestoVsReal: any | null;
  
  // Estado de carga
  loading: boolean;
  error: string | null;

  // Acciones - Ingresos
  registrarIngreso: (proyectoId: string, data: RegistrarIngresoDto) => Promise<void>;
  obtenerIngresos: (proyectoId: string, filtros?: FiltrosFinanzasDto) => Promise<void>;
  eliminarIngreso: (ingresoId: string) => Promise<void>;

  // Acciones - Gastos
  registrarGasto: (proyectoId: string, data: RegistrarGastoDto) => Promise<void>;
  obtenerGastos: (proyectoId: string, filtros?: FiltrosFinanzasDto) => Promise<void>;
  eliminarGasto: (gastoId: string) => Promise<void>;

  // Acciones - Análisis
  analizarRentabilidad: (proyectoId: string, filtros?: FiltrosFinanzasDto) => Promise<void>;
  compararRentabilidad: (proyectosIds: string[]) => Promise<any>;
  obtenerReporteGeneral: (filtros?: FiltrosFinanzasDto) => Promise<void>;
  obtenerTopProyectos: (limite?: number, ordenarPor?: 'ingresos' | 'utilidad' | 'roi') => Promise<void>;

  // Acciones - Presupuestos Departamento
  crearPresupuestoDepartamento: (departamentoId: string, data: CreatePresupuestoDepartamentoDto) => Promise<void>;
  obtenerPresupuestoDepartamento: (departamentoId: string) => Promise<void>;
  actualizarPresupuestoDepartamento: (departamentoId: string, data: Partial<CreatePresupuestoDepartamentoDto>) => Promise<void>;
  eliminarPresupuestoDepartamento: (departamentoId: string) => Promise<void>;
  registrarMovimientoPresupuestoDepartamento: (departamentoId: string, data: RegistrarMovimientoPresupuestoDto) => Promise<void>;
  obtenerMovimientosPresupuestoDepartamento: (departamentoId: string) => Promise<void>;
  eliminarMovimientoPresupuestoDepartamento: (movimientoId: string, departamentoId: string) => Promise<void>;

  // Acciones - Presupuestos Proyecto
  crearPresupuestoProyecto: (proyectoId: string, data: CreatePresupuestoProyectoDto) => Promise<void>;
  obtenerPresupuestoProyecto: (proyectoId: string) => Promise<void>;
  actualizarPresupuestoProyecto: (proyectoId: string, data: Partial<CreatePresupuestoProyectoDto>) => Promise<void>;
  eliminarPresupuestoProyecto: (proyectoId: string) => Promise<void>;
  registrarMovimientoPresupuestoProyecto: (proyectoId: string, data: RegistrarMovimientoPresupuestoDto) => Promise<void>;
  obtenerMovimientosPresupuestoProyecto: (proyectoId: string) => Promise<void>;
  eliminarMovimientoPresupuestoProyecto: (movimientoId: string, proyectoId: string) => Promise<void>;

  // Acciones - Análisis Presupuesto vs Real
  analizarPresupuestoVsRealProyecto: (proyectoId: string) => Promise<void>;
  analizarPresupuestoVsRealDepartamento: (departamentoId: string) => Promise<void>;

  // Utilidades
  clearError: () => void;
  reset: () => void;
}

export const useFinanzasStore = create<FinanzasState>((set, get) => ({
  // Estado inicial
  ingresos: [],
  gastos: [],
  presupuestosDepartamento: new Map(),
  presupuestosProyecto: new Map(),
  movimientosDepartamento: new Map(),
  movimientosProyecto: new Map(),
  rentabilidad: null,
  reporteGeneral: null,
  topProyectos: [],
  presupuestoVsReal: null,
  loading: false,
  error: null,

  // Implementación - Ingresos
  registrarIngreso: async (proyectoId: string, data: RegistrarIngresoDto) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.registrarIngreso(proyectoId, data);
      // Recargar ingresos
      const ingresos = await finanzasService.obtenerIngresos(proyectoId);
      set({ ingresos, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al registrar ingreso', loading: false });
      throw error;
    }
  },

  obtenerIngresos: async (proyectoId: string, filtros?: FiltrosFinanzasDto) => {
    set({ loading: true, error: null });
    try {
      const ingresos = await finanzasService.obtenerIngresos(proyectoId, filtros);
      set({ ingresos, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al obtener ingresos', loading: false });
      throw error;
    }
  },

  eliminarIngreso: async (ingresoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarIngreso(ingresoId);
      set((state) => ({
        ingresos: state.ingresos.filter((i) => i.id !== ingresoId),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar ingreso', loading: false });
      throw error;
    }
  },

  // Implementación - Gastos
  registrarGasto: async (proyectoId: string, data: RegistrarGastoDto) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.registrarGasto(proyectoId, data);
      // Recargar gastos
      const gastos = await finanzasService.obtenerGastos(proyectoId);
      set({ gastos, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al registrar gasto', loading: false });
      throw error;
    }
  },

  obtenerGastos: async (proyectoId: string, filtros?: FiltrosFinanzasDto) => {
    set({ loading: true, error: null });
    try {
      const gastos = await finanzasService.obtenerGastos(proyectoId, filtros);
      set({ gastos, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al obtener gastos', loading: false });
      throw error;
    }
  },

  eliminarGasto: async (gastoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarGasto(gastoId);
      set((state) => ({
        gastos: state.gastos.filter((g) => g.id !== gastoId),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar gasto', loading: false });
      throw error;
    }
  },

  // Implementación - Análisis
  analizarRentabilidad: async (proyectoId: string, filtros?: FiltrosFinanzasDto) => {
    set({ loading: true, error: null });
    try {
      const rentabilidad = await finanzasService.analizarRentabilidad(proyectoId, filtros);
      set({ rentabilidad, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al analizar rentabilidad', loading: false });
      throw error;
    }
  },

  compararRentabilidad: async (proyectosIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const comparacion = await finanzasService.compararRentabilidad(proyectosIds);
      set({ loading: false });
      return comparacion;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al comparar rentabilidad', loading: false });
      throw error;
    }
  },

  obtenerReporteGeneral: async (filtros?: FiltrosFinanzasDto) => {
    set({ loading: true, error: null });
    try {
      const reporteGeneral = await finanzasService.obtenerReporteGeneral(filtros);
      set({ reporteGeneral, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al obtener reporte general', loading: false });
      throw error;
    }
  },

  obtenerTopProyectos: async (limite = 10, ordenarPor: 'ingresos' | 'utilidad' | 'roi' = 'utilidad') => {
    set({ loading: true, error: null });
    try {
      const topProyectos = await finanzasService.obtenerTopProyectos(limite, ordenarPor);
      set({ topProyectos, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al obtener top proyectos', loading: false });
      throw error;
    }
  },

  // Implementación - Presupuestos Departamento
  crearPresupuestoDepartamento: async (departamentoId: string, data: CreatePresupuestoDepartamentoDto) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.crearPresupuestoDepartamento(departamentoId, data);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, loading: false });
      toast.success('Presupuesto creado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  obtenerPresupuestoDepartamento: async (departamentoId: string) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.obtenerPresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener presupuesto';
      set({ error: errorMsg, loading: false });
      if (error.response?.status !== 404) {
        toast.error(errorMsg);
      }
      throw error;
    }
  },

  actualizarPresupuestoDepartamento: async (departamentoId: string, data: Partial<CreatePresupuestoDepartamentoDto>) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.actualizarPresupuestoDepartamento(departamentoId, data);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, loading: false });
      toast.success('Presupuesto actualizado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  eliminarPresupuestoDepartamento: async (departamentoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarPresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.delete(departamentoId);
      set({ presupuestosDepartamento: presupuestos, loading: false });
      toast.success('Presupuesto eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  registrarMovimientoPresupuestoDepartamento: async (departamentoId: string, data: RegistrarMovimientoPresupuestoDto) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.registrarMovimientoPresupuestoDepartamento(departamentoId, data);
      // Recargar presupuesto y movimientos
      const presupuesto = await finanzasService.obtenerPresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      
      const movimientos = await finanzasService.obtenerMovimientosPresupuestoDepartamento(departamentoId);
      const movimientosMap = new Map(get().movimientosDepartamento);
      movimientosMap.set(departamentoId, movimientos);
      
      set({ presupuestosDepartamento: presupuestos, movimientosDepartamento: movimientosMap, loading: false });
      toast.success('Movimiento registrado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al registrar movimiento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  obtenerMovimientosPresupuestoDepartamento: async (departamentoId: string) => {
    set({ loading: true, error: null });
    try {
      const movimientos = await finanzasService.obtenerMovimientosPresupuestoDepartamento(departamentoId);
      const movimientosMap = new Map(get().movimientosDepartamento);
      movimientosMap.set(departamentoId, movimientos);
      set({ movimientosDepartamento: movimientosMap, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener movimientos';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  eliminarMovimientoPresupuestoDepartamento: async (movimientoId: string, departamentoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarMovimientoPresupuestoDepartamento(movimientoId);
      // Recargar movimientos
      await get().obtenerMovimientosPresupuestoDepartamento(departamentoId);
      set({ loading: false });
      toast.success('Movimiento eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar movimiento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Implementación - Presupuestos Proyecto
  crearPresupuestoProyecto: async (proyectoId: string, data: CreatePresupuestoProyectoDto) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.crearPresupuestoProyecto(proyectoId, data);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, loading: false });
      toast.success('Presupuesto creado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  obtenerPresupuestoProyecto: async (proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.obtenerPresupuestoProyecto(proyectoId);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener presupuesto';
      set({ error: errorMsg, loading: false });
      if (error.response?.status !== 404) {
        toast.error(errorMsg);
      }
      throw error;
    }
  },

  actualizarPresupuestoProyecto: async (proyectoId: string, data: Partial<CreatePresupuestoProyectoDto>) => {
    set({ loading: true, error: null });
    try {
      const presupuesto = await finanzasService.actualizarPresupuestoProyecto(proyectoId, data);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, loading: false });
      toast.success('Presupuesto actualizado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  eliminarPresupuestoProyecto: async (proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarPresupuestoProyecto(proyectoId);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.delete(proyectoId);
      set({ presupuestosProyecto: presupuestos, loading: false });
      toast.success('Presupuesto eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar presupuesto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  registrarMovimientoPresupuestoProyecto: async (proyectoId: string, data: RegistrarMovimientoPresupuestoDto) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.registrarMovimientoPresupuestoProyecto(proyectoId, data);
      // Recargar presupuesto y movimientos
      const presupuesto = await finanzasService.obtenerPresupuestoProyecto(proyectoId);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      
      const movimientos = await finanzasService.obtenerMovimientosPresupuestoProyecto(proyectoId);
      const movimientosMap = new Map(get().movimientosProyecto);
      movimientosMap.set(proyectoId, movimientos);
      
      set({ presupuestosProyecto: presupuestos, movimientosProyecto: movimientosMap, loading: false });
      toast.success('Movimiento registrado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al registrar movimiento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  obtenerMovimientosPresupuestoProyecto: async (proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      const movimientos = await finanzasService.obtenerMovimientosPresupuestoProyecto(proyectoId);
      const movimientosMap = new Map(get().movimientosProyecto);
      movimientosMap.set(proyectoId, movimientos);
      set({ movimientosProyecto: movimientosMap, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener movimientos';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  eliminarMovimientoPresupuestoProyecto: async (movimientoId: string, proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      await finanzasService.eliminarMovimientoPresupuestoProyecto(movimientoId);
      // Recargar movimientos
      await get().obtenerMovimientosPresupuestoProyecto(proyectoId);
      set({ loading: false });
      toast.success('Movimiento eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar movimiento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Implementación - Análisis Presupuesto vs Real
  analizarPresupuestoVsRealProyecto: async (proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      const analisis = await finanzasService.analizarPresupuestoVsRealProyecto(proyectoId);
      set({ presupuestoVsReal: analisis, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al analizar presupuesto vs real', loading: false });
      throw error;
    }
  },

  analizarPresupuestoVsRealDepartamento: async (departamentoId: string) => {
    set({ loading: true, error: null });
    try {
      const analisis = await finanzasService.analizarPresupuestoVsRealDepartamento(departamentoId);
      set({ presupuestoVsReal: analisis, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al analizar presupuesto vs real', loading: false });
      throw error;
    }
  },

  // Utilidades
  clearError: () => set({ error: null }),
  reset: () => set({
    ingresos: [],
    gastos: [],
    presupuestosDepartamento: new Map(),
    presupuestosProyecto: new Map(),
    movimientosDepartamento: new Map(),
    movimientosProyecto: new Map(),
    rentabilidad: null,
    reporteGeneral: null,
    topProyectos: [],
    presupuestoVsReal: null,
    loading: false,
    error: null,
  }),
}));
