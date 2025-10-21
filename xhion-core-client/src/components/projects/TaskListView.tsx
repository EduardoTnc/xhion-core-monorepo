import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Calendar, Flag, Circle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
}

const prioridadConfig = {
  Baja: { color: "text-gray-500", icon: Flag },
  Media: { color: "text-blue-500", icon: Flag },
  Alta: { color: "text-orange-500", icon: Flag },
  Urgente: { color: "text-red-500", icon: Flag },
};

const estadoConfig = {
  Por_Hacer: { icon: Circle, color: "text-slate-500" },
  En_Progreso: { icon: Clock, color: "text-blue-500" },
  Hecho: { icon: CheckCircle2, color: "text-green-500" },
  Bloqueado: { icon: XCircle, color: "text-red-500" },
};

export function TaskListView({ tareas, onTaskClick }: TaskListViewProps) {
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
      text: date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
      isOverdue,
    };
  };

  // Group by etapa
  const groupedTareas = tareas.reduce((acc, tarea) => {
    const key = tarea.etapa?.nombre || "Sin etapa";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tarea);
    return acc;
  }, {} as Record<string, Tarea[]>);

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {Object.entries(groupedTareas).map(([etapaName, etapaTareas]) => (
            <div key={etapaName}>
              {/* Group Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {etapaName}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {etapaTareas.length} tareas
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {etapaTareas.map((tarea) => {
                  const EstadoIcon = estadoConfig[tarea.estado].icon;
                  const PrioridadIcon = prioridadConfig[tarea.prioridad].icon;
                  const dueDate = formatDate(tarea.fechaVencimiento);

                  return (
                    <div
                      key={tarea.id}
                      onClick={() => onTaskClick(tarea.id)}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-lg border bg-card",
                        "hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                      )}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={tarea.estado === "Hecho"}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                      />

                      {/* Status Icon */}
                      <EstadoIcon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          estadoConfig[tarea.estado].color
                        )}
                      />

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h4 className="font-medium text-sm flex-1">{tarea.titulo}</h4>
                          <PrioridadIcon
                            className={cn("h-4 w-4 flex-shrink-0", prioridadConfig[tarea.prioridad].color)}
                          />
                        </div>
                        {tarea.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {tarea.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                        {/* Comments */}
                        {tarea._count && tarea._count.comentarios > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{tarea._count.comentarios}</span>
                          </div>
                        )}

                        {/* Due Date */}
                        {dueDate && (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded",
                              dueDate.isOverdue
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-muted"
                            )}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>{dueDate.text}</span>
                          </div>
                        )}

                        {/* Assignee */}
                        {tarea.asignado ? (
                          <Avatar className="h-7 w-7 border-2 border-background">
                            <AvatarImage src={tarea.asignado.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {getInitials(tarea.asignado.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">?</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {tareas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay tareas en este proyecto
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
