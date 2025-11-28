import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificacionesStore } from '@/store/notificacionesStore';
import { useEventosStore } from '@/store/eventosStore';
import { useTaskStore } from '@/store/taskStore';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { token, user } = useAuthStore();
  const { addNotificacion, fetchContadorNoLeidas } = useNotificacionesStore();
  const { fetchEventos } = useEventosStore();

  useEffect(() => {
    // Solo conectar si hay token y usuario
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Si ya hay una conexión, no crear otra
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);

    // Crear conexión WebSocket
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Event: Conectado
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      setIsConnecting(false);

      // Suscribirse a eventos
      socket.emit('subscribe:events');
    });

    // Event: Desconectado
    socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket desconectado:', reason);
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Event: Error de conexión
    socket.on('connect_error', (error: Error) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
      setIsConnecting(false);

      // Si el error es de autenticación, no reintentar
      if (error.message.includes('token') || error.message.includes('auth')) {
        socket.disconnect();
      }
    });

    // Event: Reconectando
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reintentando conexión (${attemptNumber})...`);
      setIsConnecting(true);
    });

    // Event: Reconectado
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Conexión restablecida');

      // Recargar datos
      fetchContadorNoLeidas();
      fetchEventos();
    });

    // Event: Nueva notificación
    socket.on('notification', (notification: any) => {
      console.log('🔔 Nueva notificación:', notification);

      // Agregar al store
      addNotificacion(notification);

      // Mostrar toast
      toast.info(notification.titulo, {
        description: notification.mensaje,
        duration: 5000,
      });

      // Actualizar contador
      fetchContadorNoLeidas();
    });

    // Event: Evento creado
    socket.on('event:created', (event: any) => {
      console.log('📅 Nuevo evento:', event);

      // Recargar eventos
      fetchEventos();

      toast.info('Nuevo evento creado', {
        description: event.titulo,
      });
    });

    // Event: Evento actualizado
    socket.on('event:updated', (event: any) => {
      console.log('📝 Evento actualizado:', event);

      // Recargar eventos
      fetchEventos();

      toast.info('Evento actualizado', {
        description: event.titulo,
      });
    });

    // Event: Evento eliminado
    socket.on('event:deleted', ({ eventId }: { eventId: string }) => {
      console.log('🗑️ Evento eliminado:', eventId);

      // Recargar eventos
      fetchEventos();

      toast.info('Evento eliminado');
    });

    // ==================== TAREAS ====================
    const { onTaskCreated, onTaskUpdated, onTaskDeleted } = useTaskStore.getState();

    socket.on('task:created', (task: any) => {
      console.log('✅ Tarea creada:', task);
      onTaskCreated(task);
      toast.success('Nueva tarea creada', { description: task.titulo });
    });

    socket.on('task:updated', (task: any) => {
      console.log('📝 Tarea actualizada:', task);
      onTaskUpdated(task);
      // Optional: toast.info('Tarea actualizada', { description: task.titulo });
    });

    socket.on('task:deleted', ({ taskId }: { taskId: string }) => {
      console.log('🗑️ Tarea eliminada:', taskId);
      onTaskDeleted(taskId);
      toast.info('Tarea eliminada');
    });

    // Cleanup al desmontar
    return () => {
      if (socket) {
        socket.emit('unsubscribe:events');
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token, user?.id]); // Solo reconectar si cambia el token o usuario

  // Función para enviar ping
  const sendPing = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping');
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    sendPing,
  };
}
