import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageSquare, Flag, Calendar, MoreVertical } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskKanbanViewProps {
  tareas: Tarea[];
  etapas: Etapa[];
  onTaskClick: (taskId: string) => void;
  stagesEnabled?: boolean;
}

const prioridadConfig = {
  Baja: { color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  Media: { color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900" },
  Alta: { color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900" },
  Urgente: { color: "text-red-500", bg: "bg-red-100 dark:bg-red-900" },
};

const estadoConfig = {
  Por_Hacer: { label: "Por Hacer", color: "bg-slate-500" },
  En_Progreso: { label: "En Progreso", color: "bg-blue-500" },
  Hecho: { label: "Hecho", color: "bg-green-500" },
  Bloqueado: { label: "Bloqueado", color: "bg-red-500" },
};

export function TaskKanbanView({ tareas, etapas, onTaskClick, stagesEnabled = true }: TaskKanbanViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const isOverdue = date < today;
    
    return {
      text: date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      isOverdue,
    };
  };

  // Group tasks by estado
  const columns = Object.entries(estadoConfig).map(([estado, config]) => ({
    estado,
    config,
    tareas: tareas.filter((t) => t.estado === estado),
  }));

  const showEmptyStagesHint = stagesEnabled && etapas.length === 0;

  return (
    <div className="flex-1 overflow-hidden bg-muted/30">
      <div className="h-full p-6">
        <div className="space-y-4">
          {showEmptyStagesHint && (
            <div className="rounded-lg border border-dashed border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Define al menos una etapa en el proyecto para visualizar columnas personalizadas por fase.
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4 h-full mt-4">
          {columns.map(({ estado, config, tareas: columnTareas }) => (
            <div key={estado} className="flex flex-col min-w-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", config.color)} />
                  <h3 className="font-semibold text-sm">{config.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnTareas.length}
                  </Badge>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-2">
                  {columnTareas.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No hay tareas
                    </div>
                  ) : (
                    columnTareas.map((tarea) => {
                      const prioridad = prioridadConfig[tarea.prioridad];
                      const dueDate = formatDate(tarea.fechaVencimiento);

                      return (
                        <Card
                          key={tarea.id}
                          onClick={() => onTaskClick(tarea.id)}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:shadow-md",
                            "border-l-4",
                            prioridad.bg.replace("bg-", "border-l-")
                          )}
                        >
                          {/* Task Title */}
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">
                            {tarea.titulo}
                          </h4>

                          {/* Task Description */}
                          {tarea.descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {tarea.descripcion}
                            </p>
                          )}

                          {/* Priority Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={cn("text-xs", prioridad.bg)}>
                              <Flag className={cn("h-3 w-3 mr-1", prioridad.color)} />
                              {tarea.prioridad}
                            </Badge>
                            {stagesEnabled && tarea.etapa && (
                              <Badge variant="secondary" className="text-xs">
                                {tarea.etapa.nombre}
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            {/* Meta Info */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {tarea._count && tarea._count.comentarios > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{tarea._count.comentarios}</span>
                                </div>
                              )}
                              {dueDate && (
                                <div
                                  className={cn(
                                    "flex items-center gap-1",
                                    dueDate.isOverdue && "text-red-500"
                                  )}
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span>{dueDate.text}</span>
                                </div>
                              )}
                            </div>

                            {/* Assignee Avatar */}
                            {tarea.asignado && (
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={tarea.asignado.avatarUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(tarea.asignado.nombreCompleto)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
