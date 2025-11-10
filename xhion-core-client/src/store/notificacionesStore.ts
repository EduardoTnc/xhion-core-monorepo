import { create } from 'zustand';
import { notificacionesService, type Notificacion } from '@/services/notificacionesService';
import { toast } from 'sonner';

interface NotificacionesState {
  notificaciones: Notificacion[];
  noLeidas: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotificaciones: (soloNoLeidas?: boolean) => Promise<void>;
  marcarComoLeida: (id: string) => Promise<void>;
  marcarTodasComoLeidas: () => Promise<void>;
  deleteNotificacion: (id: string) => Promise<void>;
  eliminarLeidas: () => Promise<void>;
  fetchContadorNoLeidas: () => Promise<void>;
  addNotificacion: (notificacion: Notificacion) => void;
}

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  notificaciones: [],
  noLeidas: 0,
  loading: false,
  error: null,

  fetchNotificaciones: async (soloNoLeidas = false) => {
    set({ loading: true, error: null });
    try {
      const response = await notificacionesService.getMisNotificaciones(soloNoLeidas);
      set({ notificaciones: response.data, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cargar notificaciones';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
    }
  },

  marcarComoLeida: async (id: string) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      
      // Actualizar estado local
      set((state) => ({
        notificaciones: state.notificaciones.map((n) =>
          n.id === id ? { ...n, leida: true, fechaLectura: new Date().toISOString() } : n
        ),
        noLeidas: Math.max(0, state.noLeidas - 1),
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al marcar notificación como leída';
      toast.error(errorMsg);
    }
  },

  marcarTodasComoLeidas: async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      
      // Actualizar estado local
      set((state) => ({
        notificaciones: state.notificaciones.map((n) => ({
          ...n,
          leida: true,
          fechaLectura: new Date().toISOString(),
        })),
        noLeidas: 0,
      }));
      
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al marcar todas como leídas';
      toast.error(errorMsg);
    }
  },

  deleteNotificacion: async (id: string) => {
    try {
      await notificacionesService.deleteNotificacion(id);
      
      // Actualizar estado local
      set((state) => {
        const notificacion = state.notificaciones.find((n) => n.id === id);
        const noLeidasDecrement = notificacion && !notificacion.leida ? 1 : 0;
        
        return {
          notificaciones: state.notificaciones.filter((n) => n.id !== id),
          noLeidas: Math.max(0, state.noLeidas - noLeidasDecrement),
        };
      });
      
      toast.success('Notificación eliminada');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar notificación';
      toast.error(errorMsg);
    }
  },

  eliminarLeidas: async () => {
    try {
      await notificacionesService.eliminarLeidas();
      
      // Actualizar estado local
      set((state) => ({
        notificaciones: state.notificaciones.filter((n) => !n.leida),
      }));
      
      toast.success('Notificaciones leídas eliminadas');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar notificaciones leídas';
      toast.error(errorMsg);
    }
  },

  fetchContadorNoLeidas: async () => {
    try {
      const response = await notificacionesService.contarNoLeidas();
      set({ noLeidas: response.data });
    } catch (error: any) {
      console.error('Error al obtener contador de no leídas:', error);
    }
  },

  addNotificacion: (notificacion: Notificacion) => {
    set((state) => ({
      notificaciones: [notificacion, ...state.notificaciones],
      noLeidas: !notificacion.leida ? state.noLeidas + 1 : state.noLeidas,
    }));
  },
}));
