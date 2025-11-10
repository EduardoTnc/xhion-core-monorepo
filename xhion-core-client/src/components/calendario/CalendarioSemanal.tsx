import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type Evento } from '@/services/eventosService';
import { EventoDetallesModal } from './EventoDetallesModal';
import { Badge } from '@/components/ui/badge';

interface CalendarioSemanalProps {
  fecha: Date;
  eventos: Evento[];
}

export function CalendarioSemanal({ fecha, eventos }: CalendarioSemanalProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  // Obtener días de la semana (Domingo a Sábado)
  const inicioSemana = startOfWeek(fecha, { weekStartsOn: 0 });
  const finSemana = endOfWeek(fecha, { weekStartsOn: 0 });
  const diasSemana = eachDayOfInterval({ start: inicioSemana, end: finSemana });

  // Horas del día (6 AM a 10 PM)
  const horas = Array.from({ length: 17 }, (_, i) => i + 6);

  // Obtener eventos de un día específico
  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return isSameDay(fechaEvento, dia);
    });
  };

  // Obtener eventos de una hora específica
  const getEventosHora = (dia: Date, hora: number) => {
    return getEventosDia(dia).filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return fechaEvento.getHours() === hora;
    });
  };

  const getColorEvento = (tipo: string) => {
    switch (tipo) {
      case 'Reunion':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Tarea':
        return 'bg-green-500 hover:bg-green-600';
      case 'Proyecto':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'Personal':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'Recordatorio':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Header con días de la semana */}
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-center text-sm font-semibold border-r">Hora</div>
          {diasSemana.map((dia) => (
            <div
              key={dia.toISOString()}
              className={cn(
                'p-2 text-center border-r last:border-r-0',
                isToday(dia) && 'bg-primary/10'
              )}
            >
              <div className="text-xs text-muted-foreground">
                {format(dia, 'EEE', { locale: es })}
              </div>
              <div className={cn(
                'text-lg font-semibold',
                isToday(dia) && 'text-primary'
              )}>
                {format(dia, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Grid de horas */}
        <div className="overflow-y-auto max-h-[600px]">
          {horas.map((hora) => (
            <div key={hora} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
              {/* Columna de hora */}
              <div className="p-2 text-center text-sm text-muted-foreground border-r bg-muted/30">
                {hora.toString().padStart(2, '0')}:00
              </div>

              {/* Columnas de días */}
              {diasSemana.map((dia) => {
                const eventosHora = getEventosHora(dia, hora);
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={cn(
                      'p-1 border-r last:border-r-0 relative',
                      isToday(dia) && 'bg-primary/5'
                    )}
                  >
                    {eventosHora.length > 0 && (
                      <div className="space-y-1">
                        {eventosHora.slice(0, 2).map((evento) => (
                          <button
                            key={evento.id}
                            onClick={() => setEventoSeleccionado(evento)}
                            className={cn(
                              'w-full text-left p-1 rounded text-xs text-white transition-colors',
                              getColorEvento(evento.tipo)
                            )}
                          >
                            <div className="font-medium truncate">{evento.titulo}</div>
                            <div className="text-[10px] opacity-90">
                              {format(parseISO(evento.fechaInicio), 'HH:mm')}
                            </div>
                          </button>
                        ))}
                        {eventosHora.length > 2 && (
                          <Badge variant="secondary" className="text-[10px] w-full">
                            +{eventosHora.length - 2} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
