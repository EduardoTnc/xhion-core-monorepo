import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificacionesStore } from '@/store/notificacionesStore';
import { useEventosStore } from '@/store/eventosStore';
import { useTaskStore } from '@/store/taskStore';
import { useSocketStore } from '@/store/socketStore';
import { toast } from 'sonner';

export function useWebSocket() {
  const { token, user } = useAuthStore();
  const { socket, isConnected, isConnecting, connect, disconnect } = useSocketStore();

  const { addNotificacion, fetchContadorNoLeidas } = useNotificacionesStore();
  const { fetchEventos } = useEventosStore();
  const { onTaskCreated, onTaskUpdated, onTaskDeleted } = useTaskStore.getState();

  // Gestión de conexión
  useEffect(() => {
    if (token && user) {
      connect(token);
    } else {
      disconnect();
    }
  }, [token, user, connect, disconnect]);

  // Gestión de eventos (Solo suscripciones)
  useEffect(() => {
    if (!socket) return;

    // Event listeners handlers
    const handleConnect = () => {
      socket.emit('subscribe:events');
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
      toast.success('Conexión restablecida');
      fetchContadorNoLeidas();
      fetchEventos();
    };

    const handleNotification = (notification: any) => {
      console.log('🔔 Nueva notificación:', notification);
      addNotificacion(notification);
      toast.info(notification.titulo, {
        description: notification.mensaje,
        duration: 5000,
      });
      fetchContadorNoLeidas();
    };

    const handleEventCreated = (event: any) => {
      fetchEventos();
      toast.info('Nuevo evento creado', { description: event.titulo });
    };

    const handleEventUpdated = (event: any) => {
      fetchEventos();
      toast.info('Evento actualizado', { description: event.titulo });
    };

    const handleEventDeleted = () => {
      fetchEventos();
      toast.info('Evento eliminado');
    };

    const handleTaskCreated = (task: any) => {
      onTaskCreated(task);
      toast.success('Nueva tarea creada', { description: task.titulo });
    };

    const handleTaskUpdated = (task: any) => {
      onTaskUpdated(task);
    };

    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      onTaskDeleted(taskId);
      toast.info('Tarea eliminada');
    };

    // Attach listeners
    socket.on('connect', handleConnect);
    socket.on('reconnect', handleReconnect);
    socket.on('notification', handleNotification);
    socket.on('event:created', handleEventCreated);
    socket.on('event:updated', handleEventUpdated);
    socket.on('event:deleted', handleEventDeleted);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    // Cleanup listeners (NOT disconnect)
    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect', handleReconnect);
      socket.off('notification', handleNotification);
      socket.off('event:created', handleEventCreated);
      socket.off('event:updated', handleEventUpdated);
      socket.off('event:deleted', handleEventDeleted);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, addNotificacion, fetchContadorNoLeidas, fetchEventos]);

  const sendPing = () => {
    if (socket?.connected) {
      socket.emit('ping');
    }
  };

  return {
    socket,
    isConnected,
    isConnecting,
    sendPing,
  };
}

