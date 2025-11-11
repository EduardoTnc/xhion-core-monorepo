import { create } from 'zustand';
import { toast } from 'sonner';
import {
  presupuestoService,
  type PresupuestoDepartamento,
  type PresupuestoProyecto,
  type MovimientoPresupuestoDepartamento,
  type MovimientoPresupuestoProyecto,
  type CreatePresupuestoDepartamentoDto,
  type UpdatePresupuestoDepartamentoDto,
  type CreateMovimientoDepartamentoDto,
  type CreatePresupuestoProyectoDto,
  type UpdatePresupuestoProyectoDto,
  type CreateMovimientoProyectoDto,
} from '@/services/presupuestoService';

interface PresupuestoState {
  // Estado de presupuestos de departamento
  presupuestosDepartamento: Map<string, PresupuestoDepartamento>;
  movimientosDepartamento: Map<string, MovimientoPresupuestoDepartamento[]>;

  // Estado de presupuestos de proyecto
  presupuestosProyecto: Map<string, PresupuestoProyecto>;
  movimientosProyecto: Map<string, MovimientoPresupuestoProyecto[]>;

  // Estados de carga
  isLoading: boolean;
  error: string | null;

  // ==================== ACCIONES DEPARTAMENTO ====================

  // Crear presupuesto de departamento
  createPresupuestoDepartamento: (data: CreatePresupuestoDepartamentoDto) => Promise<void>;

  // Obtener presupuesto de departamento
  fetchPresupuestoDepartamento: (departamentoId: string) => Promise<void>;

  // Actualizar presupuesto de departamento
  updatePresupuestoDepartamento: (
    departamentoId: string,
    data: UpdatePresupuestoDepartamentoDto
  ) => Promise<void>;

  // Eliminar presupuesto de departamento
  deletePresupuestoDepartamento: (departamentoId: string) => Promise<void>;

  // Crear movimiento de departamento
  createMovimientoDepartamento: (data: CreateMovimientoDepartamentoDto) => Promise<void>;

  // Obtener movimientos de departamento
  fetchMovimientosDepartamento: (presupuestoDepartamentoId: string) => Promise<void>;

  // Eliminar movimiento de departamento
  deleteMovimientoDepartamento: (id: string, presupuestoDepartamentoId: string) => Promise<void>;

  // ==================== ACCIONES PROYECTO ====================

  // Crear presupuesto de proyecto
  createPresupuestoProyecto: (data: CreatePresupuestoProyectoDto) => Promise<void>;

  // Obtener presupuesto de proyecto
  fetchPresupuestoProyecto: (proyectoId: string) => Promise<void>;

  // Actualizar presupuesto de proyecto
  updatePresupuestoProyecto: (
    proyectoId: string,
    data: UpdatePresupuestoProyectoDto
  ) => Promise<void>;

  // Eliminar presupuesto de proyecto
  deletePresupuestoProyecto: (proyectoId: string) => Promise<void>;

  // Crear movimiento de proyecto
  createMovimientoProyecto: (data: CreateMovimientoProyectoDto) => Promise<void>;

  // Obtener movimientos de proyecto
  fetchMovimientosProyecto: (presupuestoProyectoId: string) => Promise<void>;

  // Eliminar movimiento de proyecto
  deleteMovimientoProyecto: (id: string, presupuestoProyectoId: string) => Promise<void>;

  // Limpiar estado
  clearError: () => void;
}

export const usePresupuestoStore = create<PresupuestoState>((set, get) => ({
  presupuestosDepartamento: new Map(),
  movimientosDepartamento: new Map(),
  presupuestosProyecto: new Map(),
  movimientosProyecto: new Map(),
  isLoading: false,
  error: null,

  // ==================== ACCIONES DEPARTAMENTO ====================

  createPresupuestoDepartamento: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.createPresupuestoDepartamento(data);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(data.departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, isLoading: false });
      toast.success('Presupuesto creado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  fetchPresupuestoDepartamento: async (departamentoId) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.getPresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener presupuesto';
      set({ error: errorMsg, isLoading: false });
      if (error.response?.status !== 404) {
        toast.error(errorMsg);
      }
      throw error;
    }
  },

  updatePresupuestoDepartamento: async (departamentoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.updatePresupuestoDepartamento(
        departamentoId,
        data
      );
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      set({ presupuestosDepartamento: presupuestos, isLoading: false });
      toast.success('Presupuesto actualizado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  deletePresupuestoDepartamento: async (departamentoId) => {
    set({ isLoading: true, error: null });
    try {
      await presupuestoService.deletePresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.delete(departamentoId);
      set({ presupuestosDepartamento: presupuestos, isLoading: false });
      toast.success('Presupuesto eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  createMovimientoDepartamento: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const movimiento = await presupuestoService.createMovimientoDepartamento(data);
      
      // Buscar el departamentoId del presupuesto en el Map
      let departamentoId = '';
      for (const [deptId, presupuesto] of get().presupuestosDepartamento.entries()) {
        if (presupuesto.id === data.presupuestoDepartamentoId) {
          departamentoId = deptId;
          break;
        }
      }
      
      // Si no se encuentra en el Map, obtener el presupuesto directamente
      if (!departamentoId) {
        // Obtener movimientos primero para refrescar
        const movimientos = await presupuestoService.getMovimientosDepartamento(
          data.presupuestoDepartamentoId
        );
        const movimientosMap = new Map(get().movimientosDepartamento);
        movimientosMap.set(data.presupuestoDepartamentoId, movimientos);
        
        set({
          movimientosDepartamento: movimientosMap,
          isLoading: false,
        });
        toast.success('Movimiento registrado exitosamente');
        return;
      }
      
      // Refrescar presupuesto y movimientos
      const presupuesto = await presupuestoService.getPresupuestoDepartamento(departamentoId);
      const presupuestos = new Map(get().presupuestosDepartamento);
      presupuestos.set(departamentoId, presupuesto);
      
      const movimientos = await presupuestoService.getMovimientosDepartamento(
        data.presupuestoDepartamentoId
      );
      const movimientosMap = new Map(get().movimientosDepartamento);
      movimientosMap.set(data.presupuestoDepartamentoId, movimientos);
      
      set({
        presupuestosDepartamento: presupuestos,
        movimientosDepartamento: movimientosMap,
        isLoading: false,
      });
      toast.success('Movimiento registrado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al registrar movimiento';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  fetchMovimientosDepartamento: async (presupuestoDepartamentoId) => {
    set({ isLoading: true, error: null });
    try {
      const movimientos = await presupuestoService.getMovimientosDepartamento(
        presupuestoDepartamentoId
      );
      const movimientosMap = new Map(get().movimientosDepartamento);
      movimientosMap.set(presupuestoDepartamentoId, movimientos);
      set({ movimientosDepartamento: movimientosMap, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener movimientos';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  deleteMovimientoDepartamento: async (id, presupuestoDepartamentoId) => {
    set({ isLoading: true, error: null });
    try {
      await presupuestoService.deleteMovimientoDepartamento(id);
      // Refrescar movimientos
      await get().fetchMovimientosDepartamento(presupuestoDepartamentoId);
      set({ isLoading: false });
      toast.success('Movimiento eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar movimiento';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // ==================== ACCIONES PROYECTO ====================

  createPresupuestoProyecto: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.createPresupuestoProyecto(data);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(data.proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, isLoading: false });
      toast.success('Presupuesto creado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  fetchPresupuestoProyecto: async (proyectoId) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.getPresupuestoProyecto(proyectoId);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener presupuesto';
      set({ error: errorMsg, isLoading: false });
      if (error.response?.status !== 404) {
        toast.error(errorMsg);
      }
      throw error;
    }
  },

  updatePresupuestoProyecto: async (proyectoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const presupuesto = await presupuestoService.updatePresupuestoProyecto(proyectoId, data);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(proyectoId, presupuesto);
      set({ presupuestosProyecto: presupuestos, isLoading: false });
      toast.success('Presupuesto actualizado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  deletePresupuestoProyecto: async (proyectoId) => {
    set({ isLoading: true, error: null });
    try {
      await presupuestoService.deletePresupuestoProyecto(proyectoId);
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.delete(proyectoId);
      set({ presupuestosProyecto: presupuestos, isLoading: false });
      toast.success('Presupuesto eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar presupuesto';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  createMovimientoProyecto: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await presupuestoService.createMovimientoProyecto(data);
      // Refrescar presupuesto y movimientos
      const presupuesto = await presupuestoService.getPresupuestoProyecto(
        get().presupuestosProyecto.get(data.presupuestoProyectoId)?.proyectoId || ''
      );
      const presupuestos = new Map(get().presupuestosProyecto);
      presupuestos.set(presupuesto.proyectoId, presupuesto);
      
      const movimientos = await presupuestoService.getMovimientosProyecto(
        data.presupuestoProyectoId
      );
      const movimientosMap = new Map(get().movimientosProyecto);
      movimientosMap.set(data.presupuestoProyectoId, movimientos);
      
      set({
        presupuestosProyecto: presupuestos,
        movimientosProyecto: movimientosMap,
        isLoading: false,
      });
      toast.success('Movimiento registrado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al registrar movimiento';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  fetchMovimientosProyecto: async (presupuestoProyectoId) => {
    set({ isLoading: true, error: null });
    try {
      const movimientos = await presupuestoService.getMovimientosProyecto(presupuestoProyectoId);
      const movimientosMap = new Map(get().movimientosProyecto);
      movimientosMap.set(presupuestoProyectoId, movimientos);
      set({ movimientosProyecto: movimientosMap, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al obtener movimientos';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  deleteMovimientoProyecto: async (id, presupuestoProyectoId) => {
    set({ isLoading: true, error: null });
    try {
      await presupuestoService.deleteMovimientoProyecto(id);
      // Refrescar movimientos
      await get().fetchMovimientosProyecto(presupuestoProyectoId);
      set({ isLoading: false });
      toast.success('Movimiento eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar movimiento';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
