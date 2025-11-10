import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { type Evento } from '@/services/eventosService';
import { EventoDetallesModal } from './EventoDetallesModal';
import { Badge } from '@/components/ui/badge';
import { useEventosStore } from '@/store/eventosStore';
import { toast } from 'sonner';

interface CalendarioMensualDnDProps {
  fecha: Date;
  eventos: Evento[];
}

export function CalendarioMensualDnD({ fecha, eventos }: CalendarioMensualDnDProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const { moverEvento } = useEventosStore();

  // Obtener todos los días del mes
  const primerDia = startOfMonth(fecha);
  const ultimoDia = endOfMonth(fecha);
  const diasDelMes = eachDayOfInterval({ start: primerDia, end: ultimoDia });

  // Ajustar para que la semana empiece en Domingo
  const primerDiaSemana = primerDia.getDay();
  const diasAnteriores = Array.from({ length: primerDiaSemana }, () => null);
  const todasLasCeldas = [...diasAnteriores, ...diasDelMes];

  // Obtener eventos de un día específico
  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => {
      const fechaEvento = parseISO(evento.fechaInicio);
      return isSameDay(fechaEvento, dia);
    });
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

  // Manejar el drop de eventos
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Si no hay destino o es el mismo lugar, no hacer nada
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    // Encontrar el evento
    const evento = eventos.find((e) => e.id === draggableId);
    if (!evento) return;

    // Calcular la nueva fecha
    const sourceDay = parseInt(source.droppableId.split('-')[1]);
    const destinationDay = parseInt(destination.droppableId.split('-')[1]);
    const daysDiff = destinationDay - sourceDay;

    const fechaInicio = parseISO(evento.fechaInicio);
    const fechaFin = parseISO(evento.fechaFin);
    
    const nuevaFechaInicio = addDays(fechaInicio, daysDiff);
    const nuevaFechaFin = addDays(fechaFin, daysDiff);

    // Mover el evento
    try {
      await moverEvento(
        evento.id,
        nuevaFechaInicio.toISOString(),
        nuevaFechaFin.toISOString()
      );
      toast.success('Evento movido exitosamente');
    } catch (error) {
      toast.error('Error al mover el evento');
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="bg-background rounded-lg border">
          {/* Header con días de la semana */}
          <div className="grid grid-cols-7 border-b">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
              <div
                key={dia}
                className="p-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7">
            {todasLasCeldas.map((dia, index) => {
              if (!dia) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[120px] border-r border-b last:border-r-0 bg-muted/20"
                  />
                );
              }

              const eventosDia = getEventosDia(dia);
              const droppableId = `day-${index}`;

              return (
                <Droppable key={dia.toISOString()} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'min-h-[120px] border-r border-b last:border-r-0 p-2 transition-colors',
                        !isSameMonth(dia, fecha) && 'bg-muted/20 text-muted-foreground',
                        isToday(dia) && 'bg-primary/5 ring-2 ring-primary ring-inset',
                        snapshot.isDraggingOver && 'bg-primary/10'
                      )}
                    >
                      {/* Número del día */}
                      <div
                        className={cn(
                          'text-sm font-semibold mb-1',
                          isToday(dia) && 'text-primary'
                        )}
                      >
                        {format(dia, 'd')}
                      </div>

                      {/* Eventos */}
                      <div className="space-y-1">
                        {eventosDia.slice(0, 3).map((evento, eventIndex) => (
                          <Draggable
                            key={evento.id}
                            draggableId={evento.id}
                            index={eventIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'text-xs p-1 rounded border-l-2 cursor-move transition-all',
                                  'text-white truncate',
                                  getColorEvento(evento.tipo),
                                  snapshot.isDragging && 'shadow-lg scale-105 rotate-2'
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEventoSeleccionado(evento);
                                }}
                              >
                                {evento.titulo}
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {eventosDia.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 cursor-pointer"
                            onClick={() => {
                              // Aquí podrías abrir un modal con todos los eventos del día
                              toast.info(`${eventosDia.length - 3} eventos más`);
                            }}
                          >
                            +{eventosDia.length - 3} más
                          </Badge>
                        )}
                      </div>

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Modal de Detalles */}
      <EventoDetallesModal
        evento={eventoSeleccionado}
        open={!!eventoSeleccionado}
        onOpenChange={(open: boolean) => !open && setEventoSeleccionado(null)}
      />
    </>
  );
}
