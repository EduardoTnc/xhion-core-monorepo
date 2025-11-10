import { useEffect, useState } from 'react';
import { useNotificacionesStore } from '@/store/notificacionesStore';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Trash2, X, Calendar, ListTodo, Folder, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function NotificacionesPanel() {
  const [open, setOpen] = useState(false);
  const {
    notificaciones,
    noLeidas,
    loading,
    fetchNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    deleteNotificacion,
    eliminarLeidas,
    fetchContadorNoLeidas,
  } = useNotificacionesStore();

  // Cargar notificaciones al abrir el panel
  useEffect(() => {
    if (open) {
      fetchNotificaciones();
    }
  }, [open]);

  // Actualizar contador cada 30 segundos
  useEffect(() => {
    fetchContadorNoLeidas();
    const interval = setInterval(fetchContadorNoLeidas, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'Evento':
        return <Calendar className="h-4 w-4" />;
      case 'Tarea':
        return <ListTodo className="h-4 w-4" />;
      case 'Proyecto':
        return <Folder className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'Evento':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Tarea':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'Proyecto':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {noLeidas > 99 ? '99+' : noLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notificaciones</h3>
            {noLeidas > 0 && (
              <Badge variant="secondary">{noLeidas} nuevas</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notificaciones.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => marcarTodasComoLeidas()}
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => eliminarLeidas()}
                  title="Eliminar leídas"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors',
                    !notificacion.leida && 'bg-primary/5'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icono */}
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                        getColorTipo(notificacion.tipo)
                      )}
                    >
                      {getIconoTipo(notificacion.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {notificacion.titulo}
                        </h4>
                        {!notificacion.leida && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notificacion.mensaje}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(notificacion.fechaCreacion), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          {!notificacion.leida && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => marcarComoLeida(notificacion.id)}
                              title="Marcar como leída"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteNotificacion(notificacion.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                // Aquí podrías navegar a una página de notificaciones completa
              }}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
