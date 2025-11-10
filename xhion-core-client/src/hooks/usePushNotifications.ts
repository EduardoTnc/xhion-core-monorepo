import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permiso para notificaciones
  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notificaciones activadas');
        setIsSubscribed(true);
        return true;
      } else if (result === 'denied') {
        toast.error('Notificaciones bloqueadas');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      toast.error('Error al activar notificaciones');
      return false;
    }
  };

  // Mostrar notificación
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.warn('Notificaciones no soportadas');
      return;
    }

    if (permission !== 'granted') {
      console.warn('Permiso de notificaciones no concedido');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/badge.png',
        ...options,
      });

      // Eventos de la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Si hay una URL en los datos, navegar
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      notification.onerror = (error) => {
        console.error('Error en notificación:', error);
      };

      return notification;
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  };

  // Mostrar notificación de evento
  const showEventNotification = (event: {
    titulo: string;
    descripcion?: string;
    tipo: string;
    fechaInicio: string;
  }) => {
    const tipoEmoji = {
      Reunion: '👥',
      Tarea: '✅',
      Proyecto: '📁',
      Personal: '👤',
      Recordatorio: '⏰',
    }[event.tipo] || '📅';

    return showNotification(`${tipoEmoji} ${event.titulo}`, {
      body: event.descripcion || 'Nuevo evento en tu calendario',
      tag: `event-${event.titulo}`,
      requireInteraction: false,
      silent: false,
      data: {
        url: '/calendario',
        tipo: 'evento',
      },
    });
  };

  // Mostrar notificación de tarea
  const showTaskNotification = (task: {
    titulo: string;
    descripcion?: string;
    prioridad?: string;
  }) => {
    const prioridadEmoji = {
      Urgente: '🔴',
      Alta: '🟠',
      Media: '🟡',
      Baja: '🟢',
    }[task.prioridad || 'Media'] || '📋';

    return showNotification(`${prioridadEmoji} ${task.titulo}`, {
      body: task.descripcion || 'Nueva tarea asignada',
      tag: `task-${task.titulo}`,
      requireInteraction: true,
      silent: false,
      data: {
        url: '/tareas',
        tipo: 'tarea',
      },
    });
  };

  // Mostrar notificación genérica
  const showGenericNotification = (notification: {
    titulo: string;
    mensaje: string;
    tipo: string;
  }) => {
    const tipoEmoji = {
      Evento: '📅',
      Tarea: '✅',
      Proyecto: '📁',
      Sistema: '⚙️',
      Recordatorio: '⏰',
    }[notification.tipo] || '🔔';

    return showNotification(`${tipoEmoji} ${notification.titulo}`, {
      body: notification.mensaje,
      tag: `notification-${Date.now()}`,
      requireInteraction: false,
      silent: false,
    });
  };

  // Desactivar notificaciones
  const unsubscribe = () => {
    setIsSubscribed(false);
    toast.info('Notificaciones desactivadas');
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    showNotification,
    showEventNotification,
    showTaskNotification,
    showGenericNotification,
    unsubscribe,
  };
}
