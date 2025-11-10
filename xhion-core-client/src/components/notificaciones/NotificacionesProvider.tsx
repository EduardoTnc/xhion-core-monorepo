import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface NotificacionesProviderProps {
  children: React.ReactNode;
}

export function NotificacionesProvider({ children }: NotificacionesProviderProps) {
  const { user } = useAuthStore();
  const { isConnected, isConnecting } = useWebSocket();
  const {
    isSupported,
    permission,
    requestPermission,
  } = usePushNotifications();

  // Solicitar permiso de notificaciones al iniciar sesión
  useEffect(() => {
    if (user && isSupported && permission === 'default') {
      // Esperar 3 segundos antes de solicitar permiso
      const timer = setTimeout(() => {
        toast.info('¿Quieres recibir notificaciones?', {
          description: 'Te mantendremos informado de eventos y tareas importantes',
          action: {
            label: 'Activar',
            onClick: () => requestPermission(),
          },
          duration: 10000,
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission]);

  // Mostrar estado de conexión WebSocket
  useEffect(() => {
    if (isConnecting) {
      toast.loading('Conectando notificaciones en tiempo real...', {
        id: 'websocket-status',
      });
    } else if (isConnected) {
      toast.success('Notificaciones en tiempo real activadas', {
        id: 'websocket-status',
        duration: 2000,
      });
    }
  }, [isConnected, isConnecting]);

  return <>{children}</>;
}

// Componente de indicador de estado (opcional)
export function NotificacionesStatusIndicator() {
  const { isConnected, isConnecting } = useWebSocket();
  const { isSupported, permission, isSubscribed, requestPermission, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Indicador WebSocket */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {isConnecting ? (
          <>
            <WifiOff className="h-3 w-3 animate-pulse" />
            <span className="hidden sm:inline">Conectando...</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="hidden sm:inline">En línea</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span className="hidden sm:inline">Desconectado</span>
          </>
        )}
      </div>

      {/* Botón Push Notifications */}
      {permission === 'granted' && isSubscribed ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={unsubscribe}
          title="Desactivar notificaciones push"
        >
          <Bell className="h-4 w-4 text-green-500" />
        </Button>
      ) : permission === 'denied' ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
          title="Notificaciones bloqueadas"
        >
          <BellOff className="h-4 w-4 text-red-500" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={requestPermission}
          title="Activar notificaciones push"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
