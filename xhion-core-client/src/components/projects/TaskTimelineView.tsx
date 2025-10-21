import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskTimelineViewProps {
  tareas: Tarea[];
  etapas: Etapa[];
}

const prioridadColors = {
  Baja: "bg-gray-400",
  Media: "bg-blue-500",
  Alta: "bg-orange-500",
  Urgente: "bg-red-500",
};

export function TaskTimelineView({ tareas, etapas }: TaskTimelineViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate timeline range
  const allDates = [
    ...tareas.map((t) => t.fechaVencimiento).filter(Boolean),
    ...etapas.flatMap((e) => [e.fechaInicio, e.fechaFin]).filter(Boolean),
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
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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

    const dueDate = new Date(tarea.fechaVencimiento);
    const daysSinceStart = Math.ceil((dueDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      left: `${(daysSinceStart / totalDays) * 100}%`,
      width: "2px",
    };
  };

  // Group tasks by etapa
  const groupedTareas = etapas.map((etapa) => ({
    etapa,
    tareas: tareas.filter((t) => t.etapaId === etapa.id),
  }));

  // Add tasks without etapa
  const tareasWithoutEtapa = tareas.filter((t) => !t.etapaId);
  if (tareasWithoutEtapa.length > 0) {
    groupedTareas.push({
      etapa: { id: "none", nombre: "Sin etapa" } as any,
      tareas: tareasWithoutEtapa,
    });
  }

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full flex flex-col">
        {/* Timeline Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="flex">
            <div className="w-80 border-r p-4 font-semibold">Tareas</div>
            <div className="flex-1 overflow-x-auto">
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
                    <div key={tarea.id} className="flex border-b hover:bg-muted/50">
                      <div className="w-80 border-r p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-1 h-8 rounded-full",
                              prioridadColors[tarea.prioridad]
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
                                className={cn("text-xs", prioridadColors[tarea.prioridad])}
                              >
                                {tarea.prioridad}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative p-3">
                        {position && (
                          <div
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 h-2 rounded-full",
                              prioridadColors[tarea.prioridad]
                            )}
                            style={position}
                          />
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
  );
}
