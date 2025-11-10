import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type Evento } from '@/services/eventosService';
import { EventoDetallesModal } from './EventoDetallesModal';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CalendarioDiarioProps {
  fecha: Date;
  eventos: Evento[];
}

export function CalendarioDiario({ fecha, eventos }: CalendarioDiarioProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  // Horas del día (0-23)
  const horas = Array.from({ length: 24 }, (_, i) => i);

  // Filtrar eventos del día seleccionado
  const eventosDia = eventos.filter((evento) => {
    const fechaEvento = parseISO(evento.fechaInicio);
    return isSameDay(fechaEvento, fecha);
  });

  // Separar eventos de todo el día
  const eventosTodoElDia = eventosDia.filter((e) => e.todoElDia);
  const eventosConHora = eventosDia.filter((e) => !e.todoElDia);

  // Obtener eventos de una hora específica
  const getEventosHora = (hora: number) => {
    return eventosConHora.filter((evento) => {
      const fechaInicio = parseISO(evento.fechaInicio);
      const fechaFin = parseISO(evento.fechaFin);
      const horaInicio = fechaInicio.getHours();
      const horaFin = fechaFin.getHours();
      return hora >= horaInicio && hora < horaFin;
    });
  };

  // Calcular altura del evento en píxeles (cada hora = 80px)
  const calcularAlturaEvento = (evento: Evento) => {
    const fechaInicio = parseISO(evento.fechaInicio);
    const fechaFin = parseISO(evento.fechaFin);
    const duracionMinutos = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60);
    return Math.max((duracionMinutos / 60) * 80, 40); // Mínimo 40px
  };

  // Calcular posición top del evento
  const calcularTopEvento = (evento: Evento) => {
    const fechaInicio = parseISO(evento.fechaInicio);
    const minutos = fechaInicio.getMinutes();
    return (minutos / 60) * 80; // Offset dentro de la hora
  };

  const getColorEvento = (tipo: string) => {
    switch (tipo) {
      case 'Reunion':
        return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
      case 'Tarea':
        return 'bg-green-500 hover:bg-green-600 border-green-600';
      case 'Proyecto':
        return 'bg-purple-500 hover:bg-purple-600 border-purple-600';
      case 'Personal':
        return 'bg-orange-500 hover:bg-orange-600 border-orange-600';
      case 'Recordatorio':
        return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
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
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header del día */}
        <div className="border-b p-4 bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {format(fecha, "EEEE, d 'de' MMMM", { locale: es })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {eventosDia.length} {eventosDia.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {format(fecha, 'yyyy')}
            </Badge>
          </div>

          {/* Eventos de todo el día */}
          {eventosTodoElDia.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Todo el día
              </p>
              <div className="space-y-2">
                {eventosTodoElDia.map((evento) => (
                  <div
                    key={evento.id}
                    className={cn(
                      'p-3 rounded-lg border-l-4 cursor-pointer transition-all',
                      'hover:shadow-md',
                      getColorEvento(evento.tipo)
                    )}
                    onClick={() => setEventoSeleccionado(evento)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{evento.titulo}</h4>
                        {evento.descripcion && (
                          <p className="text-xs text-white/80 mt-1 line-clamp-1">
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {evento.tipo}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid de horas */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[80px_1fr]">
            {/* Columna de horas */}
            <div className="border-r">
              {horas.map((hora) => (
                <div
                  key={hora}
                  className="h-[80px] border-b p-2 text-sm text-muted-foreground text-right font-medium"
                >
                  {format(new Date().setHours(hora, 0, 0, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Columna de eventos */}
            <div className="relative">
              {horas.map((hora) => {
                const eventosHora = getEventosHora(hora);

                return (
                  <div
                    key={hora}
                    className="h-[80px] border-b relative hover:bg-muted/30 transition-colors"
                  >
                    {/* Renderizar eventos en esta hora */}
                    {eventosHora.map((evento, index) => {
                      // Solo renderizar en la primera hora del evento
                      const fechaInicio = parseISO(evento.fechaInicio);
                      if (fechaInicio.getHours() !== hora) {
                        return null;
                      }

                      const altura = calcularAlturaEvento(evento);
                      const top = calcularTopEvento(evento);

                      return (
                        <div
                          key={evento.id}
                          className={cn(
                            'absolute left-2 right-2 rounded-lg border-l-4 cursor-pointer transition-all',
                            'text-white p-3 overflow-hidden shadow-md hover:shadow-lg',
                            getColorEvento(evento.tipo)
                          )}
                          style={{
                            height: `${altura}px`,
                            top: `${top}px`,
                            zIndex: 10 + index,
                          }}
                          onClick={() => setEventoSeleccionado(evento)}
                        >
                          <div className="flex flex-col h-full">
                            {/* Header del evento */}
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm flex-1 line-clamp-2">
                                {evento.titulo}
                              </h4>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {evento.tipo}
                              </Badge>
                            </div>

                            {/* Hora */}
                            <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(evento.fechaInicio), 'HH:mm')} -{' '}
                              {format(parseISO(evento.fechaFin), 'HH:mm')}
                            </div>

                            {/* Ubicación */}
                            {evento.ubicacion && (
                              <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{evento.ubicacion}</span>
                              </div>
                            )}

                            {/* Descripción */}
                            {evento.descripcion && altura > 100 && (
                              <p className="text-xs opacity-80 line-clamp-2 mb-2">
                                {evento.descripcion}
                              </p>
                            )}

                            {/* Participantes */}
                            {evento.participantes && evento.participantes.length > 0 && altura > 120 && (
                              <div className="mt-auto">
                                <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                                  <Users className="h-3 w-3" />
                                  <span>{evento.participantes.length} participantes</span>
                                </div>
                                <div className="flex -space-x-2">
                                  {evento.participantes.slice(0, 5).map((participante) => (
                                    <Avatar key={participante.id} className="h-6 w-6 border-2 border-white">
                                      <AvatarImage src={participante.usuario.avatarUrl} />
                                      <AvatarFallback className="text-[8px]">
                                        {getInitials(participante.usuario.nombreCompleto)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {evento.participantes.length > 5 && (
                                    <div className="h-6 w-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-[8px] font-semibold">
                                      +{evento.participantes.length - 5}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <EventoDetallesModal
        evento={eventoSeleccionado}
        open={!!eventoSeleccionado}
        onOpenChange={(open: boolean) => !open && setEventoSeleccionado(null)}
      />
    </>
  );
}
