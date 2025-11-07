import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Evento } from '@/services/eventosService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';

interface EventoDetallesModalProps {
  evento: Evento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventoDetallesModal({ evento, open, onOpenChange }: EventoDetallesModalProps) {
  if (!evento) return null;

  const getColorEvento = (tipo: string) => {
    switch (tipo) {
      case 'Reunion':
        return 'bg-blue-500';
      case 'Tarea':
        return 'bg-green-500';
      case 'Proyecto':
        return 'bg-purple-500';
      case 'Personal':
        return 'bg-orange-500';
      case 'Recordatorio':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getColorEvento(evento.tipo)}`} />
            {evento.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo y Estado */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {evento.tipo}
            </Badge>
            <Badge variant="secondary">{evento.estado.replace('_', ' ')}</Badge>
          </div>

          {/* Descripción */}
          {evento.descripcion && (
            <div>
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(parseISO(evento.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
            {!evento.todoElDia && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(parseISO(evento.fechaInicio), 'HH:mm')} -{' '}
                  {format(parseISO(evento.fechaFin), 'HH:mm')}
                </span>
              </div>
            )}
          </div>

          {/* Ubicación */}
          {evento.ubicacion && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{evento.ubicacion}</span>
            </div>
          )}

          {/* Creador */}
          <div>
            <h4 className="font-semibold mb-2">Organizador</h4>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={evento.creador.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(evento.creador.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{evento.creador.nombreCompleto}</p>
                <p className="text-xs text-muted-foreground">{evento.creador.email}</p>
              </div>
            </div>
          </div>

          {/* Participantes */}
          {evento.participantes && evento.participantes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participantes ({evento.participantes.length})
              </h4>
              <div className="space-y-2">
                {evento.participantes.map((participante) => (
                  <div key={participante.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participante.usuario.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(participante.usuario.nombreCompleto)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{participante.usuario.nombreCompleto}</p>
                    </div>
                    {participante.confirmado && (
                      <Badge variant="outline" className="text-xs">
                        Confirmado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proyecto/Tarea relacionada */}
          {evento.proyecto && (
            <div>
              <h4 className="font-semibold mb-2">Proyecto</h4>
              <p className="text-sm">{evento.proyecto.nombre}</p>
            </div>
          )}

          {evento.tarea && (
            <div>
              <h4 className="font-semibold mb-2">Tarea</h4>
              <p className="text-sm">{evento.tarea.titulo}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
