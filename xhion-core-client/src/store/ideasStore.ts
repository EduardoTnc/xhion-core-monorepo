import { create } from 'zustand';
import { ideasService } from '../services/ideasService';
import type { Idea, CrearIdeaDto, ActualizarIdeaDto, Estadisticas } from '../services/ideasService';
import { toast } from 'sonner';

interface IdeasState {
  ideas: Idea[];
  ideaActual: Idea | null;
  estadisticas: Estadisticas | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchIdeas: (categoria?: string, estado?: string, busqueda?: string) => Promise<void>;
  fetchIdeaById: (id: string) => Promise<void>;
  crearIdea: (data: CrearIdeaDto) => Promise<Idea>;
  actualizarIdea: (id: string, data: ActualizarIdeaDto) => Promise<void>;
  eliminarIdea: (id: string) => Promise<void>;
  votarIdea: (id: string) => Promise<void>;
  fetchEstadisticas: () => Promise<void>;
  clearIdeaActual: () => void;
}

export const useIdeasStore = create<IdeasState>((set) => ({
  ideas: [],
  ideaActual: null,
  estadisticas: null,
  isLoading: false,
  error: null,

  fetchIdeas: async (categoria?: string, estado?: string, busqueda?: string) => {
    set({ isLoading: true, error: null });
    try {
      const ideas = await ideasService.obtenerTodas(categoria, estado, busqueda);
      set({ ideas, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Error al cargar las ideas');
    }
  },

  fetchIdeaById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const idea = await ideasService.obtenerPorId(id);
      set({ ideaActual: idea, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Error al cargar la idea');
    }
  },

  crearIdea: async (data: CrearIdeaDto) => {
    set({ isLoading: true, error: null });
    try {
      const nuevaIdea = await ideasService.crear(data);
      set((state) => ({
        ideas: [nuevaIdea, ...state.ideas],
        isLoading: false,
      }));
      toast.success('Idea creada correctamente');
      return nuevaIdea;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Error al crear la idea');
      throw error;
    }
  },

  actualizarIdea: async (id: string, data: ActualizarIdeaDto) => {
    set({ isLoading: true, error: null });
    try {
      const ideaActualizada = await ideasService.actualizar(id, data);
      set((state) => ({
        ideas: state.ideas.map((idea) =>
          idea.id === id ? ideaActualizada : idea
        ),
        ideaActual: state.ideaActual?.id === id ? ideaActualizada : state.ideaActual,
        isLoading: false,
      }));
      toast.success('Idea actualizada correctamente');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Error al actualizar la idea');
      throw error;
    }
  },

  eliminarIdea: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await ideasService.eliminar(id);
      set((state) => ({
        ideas: state.ideas.filter((idea) => idea.id !== id),
        ideaActual: state.ideaActual?.id === id ? null : state.ideaActual,
        isLoading: false,
      }));
      toast.success('Idea eliminada correctamente');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Error al eliminar la idea');
      throw error;
    }
  },

  votarIdea: async (id: string) => {
    try {
      const result = await ideasService.votar(id);
      
      // Actualizar el contador de votos localmente
      set((state) => ({
        ideas: state.ideas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                _count: {
                  ...idea._count,
                  votos: result.voted
                    ? idea._count.votos + 1
                    : idea._count.votos - 1,
                },
                hasVoted: result.voted,
              }
            : idea
        ),
        ideaActual: state.ideaActual?.id === id
          ? {
              ...state.ideaActual,
              _count: {
                ...state.ideaActual._count,
                votos: result.voted
                  ? state.ideaActual._count.votos + 1
                  : state.ideaActual._count.votos - 1,
              },
              hasVoted: result.voted,
            }
          : state.ideaActual,
      }));

      toast.success(result.voted ? 'Voto agregado' : 'Voto removido');
    } catch (error: any) {
      toast.error('Error al votar');
      throw error;
    }
  },

  fetchEstadisticas: async () => {
    try {
      const estadisticas = await ideasService.obtenerEstadisticas();
      set({ estadisticas });
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
    }
  },

  clearIdeaActual: () => {
    set({ ideaActual: null });
  },
}));
