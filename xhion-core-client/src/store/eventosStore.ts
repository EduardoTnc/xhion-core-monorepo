import { create } from 'zustand';
import { eventosService, type Evento, type CreateEventoDto, type UpdateEventoDto, type FiltrarEventosDto } from '@/services/eventosService';
import { toast } from 'sonner';

interface EventosState {
  // Estado
  eventos: Evento[];
  eventoSeleccionado: Evento | null;
  loading: boolean;
  error: string | null;

  // Filtros
  filtros: FiltrarEventosDto;

  // Acciones CRUD
  fetchEventos: (filtros?: FiltrarEventosDto) => Promise<void>;
  fetchEventoById: (id: string) => Promise<void>;
  createEvento: (data: CreateEventoDto) => Promise<Evento | null>;
  updateEvento: (id: string, data: UpdateEventoDto) => Promise<Evento | null>;
  deleteEvento: (id: string) => Promise<void>;

  // Participantes
  addParticipante: (eventoId: string, usuarioId: string) => Promise<void>;
  removeParticipante: (eventoId: string, usuarioId: string) => Promise<void>;
  confirmarAsistencia: (eventoId: string) => Promise<void>;

  // Drag & Drop
  moverEvento: (eventoId: string, fechaInicio: string, fechaFin: string) => Promise<void>;

  // Queries especiales
  fetchEventosByUsuario: (usuarioId: string, fechaDesde?: string, fechaHasta?: string) => Promise<void>;
  fetchEventosByProyecto: (proyectoId: string) => Promise<void>;
  fetchEventosProximos: (dias?: number) => Promise<void>;

  // Utilidades
  setFiltros: (filtros: Partial<FiltrarEventosDto>) => void;
  clearFiltros: () => void;
  setEventoSeleccionado: (evento: Evento | null) => void;
  clearError: () => void;
}

export const useEventosStore = create<EventosState>((set, get) => ({
  // Estado inicial
  eventos: [],
  eventoSeleccionado: null,
  loading: false,
  error: null,
  filtros: {},

  // Obtener todos los eventos con filtros
  fetchEventos: async (filtros?: FiltrarEventosDto) => {
    set({ loading: true, error: null });
    try {
      const filtrosActuales = filtros || get().filtros;
      const response = await eventosService.getEventos(filtrosActuales);
      set({ eventos: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar eventos';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Obtener un evento por ID
  fetchEventoById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.getEventoById(id);
      set({ eventoSeleccionado: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar evento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Crear un nuevo evento
  createEvento: async (data: CreateEventoDto) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.createEvento(data);
      const nuevoEvento = response.data;

      // Agregar a la lista
      set((state) => ({
        eventos: [...state.eventos, nuevoEvento],
        loading: false,
      }));

      toast.success('Evento creado exitosamente');
      return nuevoEvento;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear evento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      return null;
    }
  },

  // Actualizar un evento
  updateEvento: async (id: string, data: UpdateEventoDto) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.updateEvento(id, data);
      const eventoActualizado = response.data;

      // Actualizar en la lista
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? eventoActualizado : e)),
        eventoSeleccionado: state.eventoSeleccionado?.id === id ? eventoActualizado : state.eventoSeleccionado,
        loading: false,
      }));

      toast.success('Evento actualizado exitosamente');
      return eventoActualizado;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar evento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      return null;
    }
  },

  // Eliminar un evento
  deleteEvento: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await eventosService.deleteEvento(id);

      // Remover de la lista
      set((state) => ({
        eventos: state.eventos.filter((e) => e.id !== id),
        eventoSeleccionado: state.eventoSeleccionado?.id === id ? null : state.eventoSeleccionado,
        loading: false,
      }));

      toast.success('Evento eliminado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar evento';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Agregar participante
  addParticipante: async (eventoId: string, usuarioId: string) => {
    try {
      await eventosService.addParticipante(eventoId, usuarioId);

      // Recargar el evento
      await get().fetchEventoById(eventoId);

      toast.success('Participante agregado exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al agregar participante';
      toast.error(errorMsg);
    }
  },

  // Remover participante
  removeParticipante: async (eventoId: string, usuarioId: string) => {
    try {
      await eventosService.removeParticipante(eventoId, usuarioId);

      // Recargar el evento
      await get().fetchEventoById(eventoId);

      toast.success('Participante removido exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al remover participante';
      toast.error(errorMsg);
    }
  },

  // Confirmar asistencia
  confirmarAsistencia: async (eventoId: string) => {
    try {
      await eventosService.confirmarAsistencia(eventoId);

      // Recargar el evento
      await get().fetchEventoById(eventoId);

      toast.success('Asistencia confirmada');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al confirmar asistencia';
      toast.error(errorMsg);
    }
  },

  // Mover evento (Drag & Drop)
  moverEvento: async (eventoId: string, fechaInicio: string, fechaFin: string) => {
    try {
      const response = await eventosService.moverEvento(eventoId, fechaInicio, fechaFin);
      const eventoActualizado = response.data;

      // Actualizar en la lista (optimistic update)
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === eventoId ? eventoActualizado : e)),
      }));

      toast.success('Evento movido exitosamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al mover evento';
      toast.error(errorMsg);

      // Recargar eventos en caso de error
      await get().fetchEventos();
    }
  },

  // Obtener eventos de un usuario
  fetchEventosByUsuario: async (usuarioId: string, fechaDesde?: string, fechaHasta?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.getEventosByUsuario(usuarioId, fechaDesde, fechaHasta);
      set({ eventos: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar eventos del usuario';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Obtener eventos de un proyecto
  fetchEventosByProyecto: async (proyectoId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.getEventosByProyecto(proyectoId);
      set({ eventos: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar eventos del proyecto';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Obtener próximos eventos
  fetchEventosProximos: async (dias: number = 7) => {
    set({ loading: true, error: null });
    try {
      const response = await eventosService.getEventosProximos(dias);
      set({ eventos: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar próximos eventos';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  // Establecer filtros
  setFiltros: (filtros: Partial<FiltrarEventosDto>) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros },
    }));
  },

  // Limpiar filtros
  clearFiltros: () => {
    set({ filtros: {} });
  },

  // Establecer evento seleccionado
  setEventoSeleccionado: (evento: Evento | null) => {
    set({ eventoSeleccionado: evento });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));
