import { create } from 'zustand';
import { projectService, type Proyecto, type Etapa, type ProyectoMiembro } from '../services/projectService';

interface ProjectState {
  // Estado
  proyectos: Proyecto[];
  proyectoActual: Proyecto | null;
  etapas: Etapa[];
  miembros: ProyectoMiembro[];
  isLoading: boolean;
  error: string | null;

  // Acciones - Proyectos
  fetchProyectos: (filters?: { estado?: string; departamentoId?: string }) => Promise<void>;
  fetchProyectoById: (id: string) => Promise<void>;
  createProyecto: (data: any) => Promise<Proyecto>;
  updateProyecto: (id: string, data: any) => Promise<Proyecto>;
  deleteProyecto: (id: string) => Promise<void>;
  duplicateProyecto: (id: string) => Promise<Proyecto>;
  setProyectoActual: (proyecto: Proyecto | null) => void;

  // Acciones - Miembros
  fetchMiembros: (proyectoId: string) => Promise<void>;
  addMiembro: (proyectoId: string, data: any) => Promise<void>;
  removeMiembro: (proyectoId: string, usuarioId: string) => Promise<void>;

  // Acciones - Etapas
  fetchEtapas: (proyectoId: string) => Promise<void>;
  createEtapa: (proyectoId: string, data: any) => Promise<void>;
  updateEtapa: (proyectoId: string, etapaId: string, data: any) => Promise<void>;
  deleteEtapa: (proyectoId: string, etapaId: string) => Promise<void>;
  reorderEtapas: (proyectoId: string, etapas: Array<{ id: string; orden: number }>) => Promise<void>;

  // Utilidades
  clearError: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Estado inicial
  proyectos: [],
  proyectoActual: null,
  etapas: [],
  miembros: [],
  isLoading: false,
  error: null,

  // ==================== PROYECTOS ====================

  fetchProyectos: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const proyectos = await projectService.getAll(filters);
      set({ proyectos, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchProyectoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const proyecto = await projectService.getById(id);
      set({ proyectoActual: proyecto, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createProyecto: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const proyecto = await projectService.create(data);
      set((state) => ({
        proyectos: [...state.proyectos, proyecto],
        isLoading: false,
      }));
      return proyecto;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProyecto: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const proyecto = await projectService.update(id, data);
      set((state) => ({
        proyectos: state.proyectos.map((p) => (p.id === id ? proyecto : p)),
        proyectoActual: state.proyectoActual?.id === id ? proyecto : state.proyectoActual,
        isLoading: false,
      }));
      return proyecto;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteProyecto: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.delete(id);
      set((state) => ({
        proyectos: state.proyectos.filter((p) => p.id !== id),
        proyectoActual: state.proyectoActual?.id === id ? null : state.proyectoActual,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  duplicateProyecto: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Obtener el proyecto original
      const proyectoOriginal = await projectService.getById(id);
      
      // Crear copia con nombre modificado
      const proyectoDuplicado = await projectService.create({
        nombre: `${proyectoOriginal.nombre} (Copia)`,
        descripcion: proyectoOriginal.descripcion || undefined,
        responsableId: proyectoOriginal.responsableId,
        departamentoId: proyectoOriginal.departamentoId || undefined,
        fechaInicio: proyectoOriginal.fechaInicio,
        fechaFin: proyectoOriginal.fechaFin,
      });

      set((state) => ({
        proyectos: [...state.proyectos, proyectoDuplicado],
        isLoading: false,
      }));

      return proyectoDuplicado;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setProyectoActual: (proyecto) => {
    set({ proyectoActual: proyecto });
  },

  // ==================== MIEMBROS ====================

  fetchMiembros: async (proyectoId) => {
    set({ isLoading: true, error: null });
    try {
      const miembros = await projectService.getMiembros(proyectoId);
      set({ miembros, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addMiembro: async (proyectoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const miembro = await projectService.addMiembro(proyectoId, data);
      set((state) => ({
        miembros: [...state.miembros, miembro],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeMiembro: async (proyectoId, usuarioId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.removeMiembro(proyectoId, usuarioId);
      set((state) => ({
        miembros: state.miembros.filter((m) => m.usuarioId !== usuarioId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ==================== ETAPAS ====================

  fetchEtapas: async (proyectoId) => {
    set({ isLoading: true, error: null });
    try {
      const etapas = await projectService.getEtapas(proyectoId);
      set({ etapas, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createEtapa: async (proyectoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const etapa = await projectService.createEtapa(proyectoId, data);
      set((state) => ({
        etapas: [...state.etapas, etapa].sort((a, b) => a.orden - b.orden),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateEtapa: async (proyectoId, etapaId, data) => {
    set({ isLoading: true, error: null });
    try {
      const etapa = await projectService.updateEtapa(proyectoId, etapaId, data);
      set((state) => ({
        etapas: state.etapas.map((e) => (e.id === etapaId ? etapa : e)).sort((a, b) => a.orden - b.orden),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteEtapa: async (proyectoId, etapaId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteEtapa(proyectoId, etapaId);
      set((state) => ({
        etapas: state.etapas.filter((e) => e.id !== etapaId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reorderEtapas: async (proyectoId, etapas) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.reorderEtapas(proyectoId, { etapas });
      // Actualizar orden local
      set((state) => ({
        etapas: state.etapas.map((e) => {
          const newOrder = etapas.find((et) => et.id === e.id);
          return newOrder ? { ...e, orden: newOrder.orden } : e;
        }).sort((a, b) => a.orden - b.orden),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  clearError: () => set({ error: null }),

  reset: () => set({
    proyectos: [],
    proyectoActual: null,
    etapas: [],
    miembros: [],
    isLoading: false,
    error: null,
  }),
}));