import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Evento } from '@/services/eventosService';
import { EventoDetallesModal } from './EventoDetallesModal';
import { Badge } from '@/components/ui/badge';

interface CalendarioMensualProps {
  fecha: Date;
  eventos: Evento[];
}

export function CalendarioMensual({ fecha, eventos }: CalendarioMensualProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  // Obtener todos los días del mes
  const primerDia = startOfMonth(fecha);
  const ultimoDia = endOfMonth(fecha);
  const diasDelMes = eachDayOfInterval({ start: primerDia, end: ultimoDia });

  // Ajustar para que la semana empiece en Domingo
  const primerDiaSemana = primerDia.getDay();
  const diasAnteriores = Array.from({ length: primerDiaSemana }, () => null);

  // Combinar días anteriores + días del mes
  const todasLasCeldas = [...diasAnteriores, ...diasDelMes];

  // Obtener eventos de un día específico
  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return isSameDay(fechaEvento, dia);
    });
  };

  // Colores por tipo de evento
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

  return (
    <>
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Encabezado de días de la semana */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
            <div
              key={dia}
              className="p-2 text-center text-sm font-semibold text-muted-foreground"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {todasLasCeldas.map((dia, index) => {
            if (!dia) {
              return <div key={`empty-${index}`} className="border-b border-r min-h-[100px] bg-muted/20" />;
            }

            const eventosDia = getEventosDia(dia);
            const esHoy = isToday(dia);
            const esMesActual = isSameMonth(dia, fecha);

            return (
              <div
                key={dia.toISOString()}
                className={cn(
                  'border-b border-r min-h-[100px] p-2 transition-colors hover:bg-accent/50',
                  !esMesActual && 'bg-muted/20 text-muted-foreground'
                )}
              >
                {/* Número del día */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      esHoy && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                    )}
                  >
                    {format(dia, 'd')}
                  </span>
                  {eventosDia.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-5">
                      {eventosDia.length}
                    </Badge>
                  )}
                </div>

                {/* Eventos del día */}
                <div className="space-y-1">
                  {eventosDia.slice(0, 3).map((evento) => (
                    <button
                      key={evento.id}
                      onClick={() => setEventoSeleccionado(evento)}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-xs truncate transition-all hover:scale-105',
                        getColorEvento(evento.tipo),
                        'text-white font-medium shadow-sm'
                      )}
                      title={evento.titulo}
                    >
                      {evento.titulo}
                    </button>
                  ))}
                  {eventosDia.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{eventosDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
