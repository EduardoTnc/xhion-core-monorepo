import { create } from 'zustand';
import {
  departmentService,
  type Departamento,
  type DepartamentoDetalle,
  type EstadisticasDepartamento,
  type CreateDepartamentoDto,
  type UpdateDepartamentoDto,
} from '@/services/departmentService';
import { toast } from 'sonner';
import apiClient from '@/api/axios';

interface DepartmentState {
  departamentos: Departamento[];
  departamentoActual: DepartamentoDetalle | null;
  estadisticas: EstadisticasDepartamento | null;
  usuariosDisponibles: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDepartamentos: () => Promise<void>;
  fetchDepartamentoById: (id: string) => Promise<void>;
  fetchEstadisticas: (id: string) => Promise<void>;
  createDepartamento: (data: CreateDepartamentoDto) => Promise<Departamento>;
  updateDepartamento: (id: string, data: UpdateDepartamentoDto) => Promise<void>;
  deleteDepartamento: (id: string) => Promise<void>;
  restoreDepartamento: (id: string) => Promise<void>;
  fetchUsuariosDisponibles: (departamentoId: string) => Promise<void>;
  asignarUsuariosDepartamento: (departamentoId: string, usuarioIds: string[]) => Promise<void>;
  removerUsuarioDepartamento: (departamentoId: string, usuarioId: string) => Promise<void>;
  clearDepartamentoActual: () => void;
  clearError: () => void;
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departamentos: [],
  departamentoActual: null,
  estadisticas: null,
  usuariosDisponibles: [],
  isLoading: false,
  error: null,

  fetchDepartamentos: async () => {
    set({ isLoading: true, error: null });
    try {
      const departamentos = await departmentService.getAll();
      set({ departamentos, isLoading: false });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        set({ isLoading: false });
        return;
      }
      const errorMessage = error.response?.data?.message || 'Error al cargar departamentos';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchDepartamentoById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const departamentoActual = await departmentService.getById(id);
      set({ departamentoActual, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchEstadisticas: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const estadisticas = await departmentService.getEstadisticas(id);
      set({ estadisticas, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar estadísticas';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createDepartamento: async (data: CreateDepartamentoDto) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoDepartamento = await departmentService.create(data);
      set((state) => ({
        departamentos: [...state.departamentos, nuevoDepartamento],
        isLoading: false,
      }));
      toast.success('Departamento creado exitosamente');
      return nuevoDepartamento;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateDepartamento: async (id: string, data: UpdateDepartamentoDto) => {
    set({ isLoading: true, error: null });
    try {
      const departamentoActualizado = await departmentService.update(id, data);
      set((state) => ({
        departamentos: state.departamentos.map((d) =>
          d.id === id ? departamentoActualizado : d
        ),
        departamentoActual:
          state.departamentoActual?.id === id
            ? { ...state.departamentoActual, ...departamentoActualizado }
            : state.departamentoActual,
        isLoading: false,
      }));
      toast.success('Departamento actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteDepartamento: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await departmentService.delete(id);
      set((state) => ({
        departamentos: state.departamentos.filter((d) => d.id !== id),
        departamentoActual: state.departamentoActual?.id === id ? null : state.departamentoActual,
        isLoading: false,
      }));
      toast.success('Departamento eliminado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  restoreDepartamento: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const departamentoRestaurado = await departmentService.restore(id);
      set((state) => ({
        departamentos: [...state.departamentos, departamentoRestaurado],
        isLoading: false,
      }));
      toast.success('Departamento restaurado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al restaurar departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchUsuariosDisponibles: async (departamentoId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implementar endpoint en el backend para obtener usuarios disponibles
      // Por ahora usamos un mock
      const response = await apiClient.get(`/usuarios?disponiblesParaDepartamento=${departamentoId}`);
      set({ usuariosDisponibles: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar usuarios disponibles';
      set({ error: errorMessage, isLoading: false, usuariosDisponibles: [] });
      toast.error(errorMessage);
    }
  },

  asignarUsuariosDepartamento: async (departamentoId: string, usuarioIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implementar endpoint en el backend
      await Promise.all(
        usuarioIds.map(usuarioId =>
          apiClient.post(`/departamentos/${departamentoId}/usuarios/${usuarioId}`)
        )
      );
      // Refrescar departamento actual
      await get().fetchDepartamentoById(departamentoId);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al asignar usuarios';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  removerUsuarioDepartamento: async (departamentoId: string, usuarioId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implementar endpoint en el backend
      await apiClient.delete(`/departamentos/${departamentoId}/usuarios/${usuarioId}`);
      // Refrescar departamento actual
      await get().fetchDepartamentoById(departamentoId);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al remover usuario';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearDepartamentoActual: () => {
    set({ departamentoActual: null, estadisticas: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
