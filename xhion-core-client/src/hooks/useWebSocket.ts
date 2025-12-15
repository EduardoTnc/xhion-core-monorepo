import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

/**
 * Hook para gestionar la conexión WebSocket y manejar eventos en tiempo real.
 * 
 * Utiliza TanStack Query para invalidar caches cuando llegan eventos del servidor,
 * manteniendo los datos sincronizados automáticamente.
 */
export function useWebSocket() {
  const { token, user } = useAuthStore();
  const { socket, isConnected, isConnecting, connect, disconnect } = useSocketStore();
  const queryClient = useQueryClient();

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
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    };

    const handleNotification = (notification: any) => {
      console.log('🔔 Nueva notificación:', notification);
      // Invalidate notifications cache to show new notification
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.info(notification.titulo, {
        description: notification.mensaje,
        duration: 5000,
      });
    };

    const handleEventCreated = (event: any) => {
      // Invalidate events and calendar cache
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      toast.info('Nuevo evento creado', { description: event.titulo });
    };

    const handleEventUpdated = (event: any) => {
      // Invalidate events and calendar cache
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      toast.info('Evento actualizado', { description: event.titulo });
    };

    const handleEventDeleted = () => {
      // Invalidate events and calendar cache
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      toast.info('Evento eliminado');
    };

    const handleTaskCreated = (task: any) => {
      // Invalidate TanStack Query cache for tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Nueva tarea creada', { description: task.titulo });
    };

    const handleTaskUpdated = (task: any) => {
      // Invalidate TanStack Query cache for tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) });
    };

    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      // Invalidate TanStack Query cache for tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(taskId) });
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
  }, [socket, queryClient]);

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
