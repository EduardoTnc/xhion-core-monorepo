import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, ZoomIn, ZoomOut } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TaskTimelineViewProps {
  tareas: Tarea[];
  etapas: Etapa[];
  onTaskClick?: (taskId: string) => void;
  stagesEnabled?: boolean;
}

const prioridadColors = {
  Baja: { bg: "bg-gray-400", text: "text-gray-700", border: "border-gray-400" },
  Media: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-500" },
  Alta: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-500" },
  Urgente: { bg: "bg-red-500", text: "text-red-700", border: "border-red-500" },
};

const estadoProgress = {
  Por_Hacer: 0,
  En_Progreso: 50,
  Hecho: 100,
  Bloqueado: 25,
};

export function TaskTimelineView({ tareas, etapas, onTaskClick, stagesEnabled = true }: TaskTimelineViewProps) {
  const [zoom, setZoom] = useState(1);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate timeline range
  const stageDates = stagesEnabled ? etapas.flatMap((e) => [e.fechaInicio, e.fechaFin]).filter(Boolean) : [];
  const allDates = [
    ...tareas.map((t) => t.fechaVencimiento).filter(Boolean),
    ...stageDates,
  ].map((d) => new Date(d!));

  if (allDates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No hay fechas definidas en las tareas</p>
          <p className="text-sm text-muted-foreground">
            Agrega fechas de vencimiento para ver el timeline
          </p>
        </div>
      </div>
    );
  }

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Add padding
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  // Generate months for header
  const months: { name: string; days: number; offset: number }[] = [];
  let currentDate = new Date(minDate);
  let dayOffset = 0;

  while (currentDate <= maxDate) {
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = monthEnd.getDate();
    const visibleDays = Math.min(
      daysInMonth,
      Math.ceil((maxDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    months.push({
      name: currentDate.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      days: visibleDays,
      offset: dayOffset,
    });

    dayOffset += visibleDays;
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  const getTaskPosition = (tarea: Tarea) => {
    if (!tarea.fechaVencimiento) return null;

    // Calcular fecha de inicio (si no existe, usar 3 días antes del vencimiento)
    const dueDate = new Date(tarea.fechaVencimiento);
    const startDate = tarea.fechaCreacion ? new Date(tarea.fechaCreacion) : new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    const daysSinceStart = Math.ceil((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilDue = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(daysUntilDue, 1);

    return {
      left: `${(daysSinceStart / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
      startDate,
      dueDate,
      duration,
    };
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.5));

  const groupedTareas = stagesEnabled
    ? (() => {
        const grouped = etapas.map((etapa) => ({
          etapa,
          tareas: tareas.filter((t) => t.etapaId === etapa.id),
        }));

        const tareasWithoutEtapa = tareas.filter((t) => !t.etapaId);
        if (tareasWithoutEtapa.length > 0) {
          grouped.push({
            etapa: { id: "none", nombre: "Sin etapa" } as Etapa,
            tareas: tareasWithoutEtapa,
          });
        }

        return grouped;
      })()
    : [
        {
          etapa: { id: "general", nombre: "Tareas del proyecto" } as Etapa,
          tareas,
        },
      ];

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-hidden bg-background">
        <div className="h-full flex flex-col">
          {!stagesEnabled && (
            <div className="border-b bg-amber-50/70 dark:bg-amber-950/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
              Vista general del cronograma sin agrupación por etapas. Activa las etapas para segmentar el timeline.
            </div>
          )}
          {/* Toolbar */}
          <div className="border-b bg-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Diagrama de Gantt</span>
              <Badge variant="secondary" className="ml-2">
                {tareas.length} tareas
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Header */}
          <div className="border-b bg-card sticky top-0 z-10">
            <div className="flex">
              <div className="w-80 border-r p-4 font-semibold">Tareas</div>
              <div className="flex-1 overflow-x-auto" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
              <div className="flex border-b">
                {months.map((month, idx) => (
                  <div
                    key={idx}
                    className="border-r px-4 py-2 text-center font-medium text-sm"
                    style={{ width: `${(month.days / totalDays) * 100}%` }}
                  >
                    {month.name}
                  </div>
                ))}
              </div>
              <div className="flex h-8 text-xs text-muted-foreground">
                {Array.from({ length: totalDays }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border-r flex items-center justify-center"
                    style={{ width: `${(1 / totalDays) * 100}%` }}
                  >
                    {(idx + 1) % 7 === 0 ? idx + 1 : ""}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Body */}
        <ScrollArea className="flex-1">
          <div className="min-h-full">
            {groupedTareas.map(({ etapa, tareas: etapaTareas }) => (
              <div key={etapa.id}>
                {/* Etapa Header */}
                <div className="flex border-b bg-muted/30">
                  <div className="w-80 border-r p-3">
                    <div className="font-semibold text-sm">{etapa.nombre}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {etapaTareas.length} tareas
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    {/* Today marker */}
                    {(() => {
                      const today = new Date();
                      const daysSinceStart = Math.ceil(
                        (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      if (daysSinceStart >= 0 && daysSinceStart <= totalDays) {
                        return (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                            style={{ left: `${(daysSinceStart / totalDays) * 100}%` }}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Tasks */}
                {etapaTareas.map((tarea) => {
                  const position = getTaskPosition(tarea);

                  return (
                    <div 
                      key={tarea.id} 
                      className="flex border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onTaskClick?.(tarea.id)}
                    >
                      <div className="w-80 border-r p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-1 h-8 rounded-full",
                              prioridadColors[tarea.prioridad].bg
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{tarea.titulo}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {tarea.asignado && (
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={tarea.asignado.avatarUrl} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(tarea.asignado.nombreCompleto)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <Badge
                                variant="outline"
                                className={cn("text-xs", prioridadColors[tarea.prioridad].text)}
                              >
                                {tarea.prioridad}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative p-3" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
                        {position && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 rounded-lg shadow-md transition-all hover:shadow-lg",
                                  "border-2 cursor-pointer",
                                  prioridadColors[tarea.prioridad].border
                                )}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  minWidth: '40px',
                                }}
                              >
                                <div className="h-8 flex items-center justify-between px-2 bg-card/90 backdrop-blur-sm">
                                  <span className="text-xs font-medium truncate">
                                    {tarea.titulo}
                                  </span>
                                  {tarea.estado === 'Hecho' && (
                                    <span className="text-xs">✓</span>
                                  )}
                                </div>
                                <Progress 
                                  value={estadoProgress[tarea.estado]} 
                                  className="h-1 rounded-none rounded-b-md"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">{tarea.titulo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {position.startDate.toLocaleDateString('es-ES')} - {position.dueDate.toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-xs">
                                  Duración: {position.duration} días
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {tarea.estado.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {tarea.prioridad}
                                  </Badge>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
    </TooltipProvider>
  );
}
