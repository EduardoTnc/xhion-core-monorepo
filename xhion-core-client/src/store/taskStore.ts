import { create } from 'zustand';
import {
  taskService,
  type Tarea,
  type Comentario,
  type TaskFilters,
  type TareaAdjunto,
  type TareaActividad,
  type ResponderActividadPayload,
} from '../services/taskService';

interface TaskState {
  // Estado
  tareas: Tarea[];
  tareaActual: Tarea | null;
  comentarios: Comentario[];
  adjuntos: Record<string, TareaAdjunto[]>;
  actividad: Record<string, TareaActividad[]>;
  misTareas: Tarea[];
  isLoading: boolean;
  error: string | null;

  // Acciones - Tareas
  fetchTareas: (filters?: TaskFilters) => Promise<void>;
  fetchMisTareas: () => Promise<void>;
  fetchTareaById: (id: string) => Promise<void>;
  createTarea: (data: any) => Promise<Tarea>;
  updateTarea: (id: string, data: any) => Promise<Tarea>;
  moveTarea: (id: string, data: any) => Promise<Tarea>;
  deleteTarea: (id: string) => Promise<void>;
  setTareaActual: (tarea: Tarea | null) => void;

  // Acciones - Comentarios
  fetchComentarios: (tareaId: string) => Promise<void>;
  addComentario: (tareaId: string, contenido: string) => Promise<void>;
  deleteComentario: (tareaId: string, comentarioId: string) => Promise<void>;

  // Acciones - Adjuntos
  fetchAdjuntos: (tareaId: string) => Promise<TareaAdjunto[]>;
  uploadAdjunto: (tareaId: string, file: File, descripcion?: string) => Promise<TareaAdjunto>;
  deleteAdjunto: (tareaId: string, archivoId: string) => Promise<void>;

  // Acciones - Actividad
  fetchActividad: (tareaId: string) => Promise<TareaActividad[]>;
  responderActividad: (
    tareaId: string,
    actividadId: string,
    payload: ResponderActividadPayload,
  ) => Promise<TareaActividad>;

  // Utilidades
  clearError: () => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Estado inicial
  tareas: [],
  tareaActual: null,
  comentarios: [],
  adjuntos: {},
  actividad: {},
  misTareas: [],
  isLoading: false,
  error: null,

  // ==================== TAREAS ====================

  fetchTareas: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const tareas = await taskService.getAll(filters);
      set({ tareas, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ==================== ADJUNTOS ====================

  fetchAdjuntos: async (tareaId) => {
    try {
      const adjuntos = await taskService.getAdjuntos(tareaId);
      set((state) => ({
        adjuntos: {
          ...state.adjuntos,
          [tareaId]: adjuntos,
        },
      }));
      return adjuntos;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  uploadAdjunto: async (tareaId, file, descripcion) => {
    try {
      const adjunto = await taskService.uploadAdjunto(tareaId, { file, descripcion });
      set((state) => ({
        adjuntos: {
          ...state.adjuntos,
          [tareaId]: [adjunto, ...(state.adjuntos[tareaId] || [])],
        },
      }));
      return adjunto;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteAdjunto: async (tareaId, archivoId) => {
    try {
      await taskService.deleteAdjunto(tareaId, archivoId);
      set((state) => ({
        adjuntos: {
          ...state.adjuntos,
          [tareaId]: (state.adjuntos[tareaId] || []).filter((adj) => adj.archivoId !== archivoId),
        },
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // ==================== ACTIVIDAD ====================

  fetchActividad: async (tareaId) => {
    try {
      const actividad = await taskService.getActividad(tareaId);
      set((state) => ({
        actividad: {
          ...state.actividad,
          [tareaId]: actividad,
        },
      }));
      return actividad;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  responderActividad: async (tareaId, actividadId, payload) => {
    try {
      const respuesta = await taskService.responderActividad(tareaId, actividadId, payload);
      set((state) => ({
        actividad: {
          ...state.actividad,
          [tareaId]: (state.actividad[tareaId] || []).map((item) =>
            item.id === actividadId ? { ...item, respuestas: [...(item.respuestas || []), respuesta] } : item,
          ),
        },
      }));
      return respuesta;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchMisTareas: async () => {
    set({ isLoading: true, error: null });
    try {
      const misTareas = await taskService.getMisTareas();
      set({ misTareas, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchTareaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const tarea = await taskService.getById(id);
      set({ tareaActual: tarea, comentarios: tarea.comentarios || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createTarea: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const tarea = await taskService.create(data);
      set((state) => ({
        tareas: [...state.tareas, tarea],
        isLoading: false,
      }));
      return tarea;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTarea: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const tarea = await taskService.update(id, data);
      set((state) => ({
        tareas: state.tareas.map((t) => (t.id === id ? tarea : t)),
        tareaActual: state.tareaActual?.id === id ? tarea : state.tareaActual,
        isLoading: false,
      }));
      return tarea;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  moveTarea: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const tarea = await taskService.move(id, data);
      set((state) => ({
        tareas: state.tareas.map((t) => (t.id === id ? tarea : t)),
        tareaActual: state.tareaActual?.id === id ? tarea : state.tareaActual,
        isLoading: false,
      }));
      return tarea;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTarea: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.delete(id);
      set((state) => ({
        tareas: state.tareas.filter((t) => t.id !== id),
        tareaActual: state.tareaActual?.id === id ? null : state.tareaActual,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setTareaActual: (tarea) => {
    set({ tareaActual: tarea, comentarios: tarea?.comentarios || [] });
  },

  // ==================== COMENTARIOS ====================

  fetchComentarios: async (tareaId) => {
    set({ isLoading: true, error: null });
    try {
      const comentarios = await taskService.getComentarios(tareaId);
      set({ comentarios, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addComentario: async (tareaId, contenido) => {
    set({ isLoading: true, error: null });
    try {
      const comentario = await taskService.addComentario(tareaId, { contenido });
      set((state) => ({
        comentarios: [...state.comentarios, comentario],
        tareaActual: state.tareaActual
          ? {
              ...state.tareaActual,
              comentarios: [...(state.tareaActual.comentarios || []), comentario],
              _count: {
                ...state.tareaActual._count,
                comentarios: (state.tareaActual._count?.comentarios || 0) + 1,
              },
            }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteComentario: async (tareaId, comentarioId) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteComentario(tareaId, comentarioId);
      set((state) => ({
        comentarios: state.comentarios.filter((c) => c.id !== comentarioId),
        tareaActual: state.tareaActual
          ? {
              ...state.tareaActual,
              comentarios: state.tareaActual.comentarios?.filter((c) => c.id !== comentarioId),
              _count: {
                ...state.tareaActual._count,
                comentarios: Math.max((state.tareaActual._count?.comentarios || 1) - 1, 0),
              },
            }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      tareas: [],
      tareaActual: null,
      comentarios: [],
      adjuntos: {},
      actividad: {},
      misTareas: [],
      isLoading: false,
      error: null,
    }),
}));
