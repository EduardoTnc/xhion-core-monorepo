import { useState } from 'react';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type Evento } from '@/services/eventosService';
import { EventoDetallesModal } from './EventoDetallesModal';
import { Badge } from '@/components/ui/badge';

interface CalendarioAnualProps {
  fecha: Date;
  eventos: Evento[];
}

export function CalendarioAnual({ fecha, eventos }: CalendarioAnualProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<Date | null>(null);

  // Obtener todos los meses del año
  const inicioAno = startOfYear(fecha);
  const finAno = endOfYear(fecha);
  const mesesDelAno = eachMonthOfInterval({ start: inicioAno, end: finAno });

  // Obtener eventos de un día específico
  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return isSameDay(fechaEvento, dia);
    });
  };

  // Obtener eventos de un mes específico
  const getEventosMes = (mes: Date) => {
    return eventos.filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return isSameMonth(fechaEvento, mes);
    });
  };

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

  // Renderizar mini calendario de un mes
  const renderMiniMes = (mes: Date) => {
    const primerDia = startOfMonth(mes);
    const ultimoDia = endOfMonth(mes);
    const diasDelMes = eachDayOfInterval({ start: primerDia, end: ultimoDia });
    
    // Ajustar para que la semana empiece en Domingo
    const primerDiaSemana = primerDia.getDay();
    const diasAnteriores = Array.from({ length: primerDiaSemana }, () => null);
    const todasLasCeldas = [...diasAnteriores, ...diasDelMes];

    const eventosMes = getEventosMes(mes);

    return (
      <div
        className="border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setMesSeleccionado(mes)}
      >
        {/* Header del mes */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">
            {format(mes, 'MMMM', { locale: es })}
          </h3>
          {eventosMes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {eventosMes.length}
            </Badge>
          )}
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-1">
          {todasLasCeldas.map((dia, index) => {
            if (!dia) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const eventosDia = getEventosDia(dia);
            const tieneEventos = eventosDia.length > 0;

            return (
              <div
                key={dia.toISOString()}
                className={cn(
                  'aspect-square flex items-center justify-center rounded text-[10px] relative',
                  'hover:bg-muted transition-colors',
                  !isSameMonth(dia, mes) && 'text-muted-foreground',
                  isToday(dia) && 'bg-primary text-primary-foreground font-bold',
                  tieneEventos && !isToday(dia) && 'font-semibold'
                )}
              >
                {format(dia, 'd')}
                {tieneEventos && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {eventosDia.slice(0, 3).map((evento, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1 h-1 rounded-full',
                          getColorEvento(evento.tipo)
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modal con detalles del mes seleccionado
  const renderDetallesMes = () => {
    if (!mesSeleccionado) return null;

    const eventosMes = getEventosMes(mesSeleccionado);

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {format(mesSeleccionado, "MMMM 'de' yyyy", { locale: es })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {eventosMes.length} {eventosMes.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>
            <button
              onClick={() => setMesSeleccionado(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Lista de eventos */}
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            {eventosMes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay eventos en este mes
              </div>
            ) : (
              <div className="space-y-2">
                {eventosMes
                  .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
                  .map((evento) => (
                    <div
                      key={evento.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md',
                        getColorEvento(evento.tipo)
                      )}
                      onClick={() => {
                        setEventoSeleccionado(evento);
                        setMesSeleccionado(null);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {format(parseISO(evento.fechaInicio), "d 'de' MMMM", { locale: es })}
                            </span>
                            {!evento.todoElDia && (
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(evento.fechaInicio), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          {evento.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {evento.descripcion}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{evento.tipo}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full overflow-y-auto p-4">
        {/* Header del año */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">{format(fecha, 'yyyy')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'} en total
          </p>
        </div>

        {/* Grid de meses (3 columnas en desktop, 2 en tablet, 1 en mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mesesDelAno.map((mes) => (
            <div key={mes.toISOString()}>
              {renderMiniMes(mes)}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalles del mes */}
      {renderDetallesMes()}

      {/* Modal de detalles del evento */}
      <EventoDetallesModal
        evento={eventoSeleccionado}
        open={!!eventoSeleccionado}
        onOpenChange={(open: boolean) => !open && setEventoSeleccionado(null)}
      />
    </>
  );
}
