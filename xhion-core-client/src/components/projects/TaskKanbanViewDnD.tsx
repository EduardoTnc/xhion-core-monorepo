import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Flag, Calendar, MoreVertical, GripVertical, Edit, Trash2 } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskKanbanViewDnDProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  proyectoId: string;
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

export function TaskKanbanViewDnD({ tareas, onTaskClick, onEditTask, onDeleteTask, proyectoId }: TaskKanbanViewDnDProps) {
  const { updateTarea, fetchTareas } = useTaskStore();

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

  const summaryCards: { label: string; value: number; accent: string }[] = [
    {
      label: "Total",
      value: tareas.length,
      accent: "bg-primary",
    },
    {
      label: estadoConfig.En_Progreso.label,
      value: columns.find((col) => col.estado === "En_Progreso")?.tareas.length ?? 0,
      accent: "bg-blue-500",
    },
    {
      label: estadoConfig.Hecho.label,
      value: columns.find((col) => col.estado === "Hecho")?.tareas.length ?? 0,
      accent: "bg-green-500",
    },
    {
      label: estadoConfig.Bloqueado.label,
      value: columns.find((col) => col.estado === "Bloqueado")?.tareas.length ?? 0,
      accent: "bg-red-500",
    },
  ];

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination or same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const newEstado = destination.droppableId as Tarea["estado"];

    try {
      // Find the task
      const task = tareas.find((t) => t.id === taskId);
      if (!task) return;

      // Update task estado
      await updateTarea(taskId, {
        estado: newEstado,
      });

      toast.success("Tarea movida exitosamente");

      // Refresh tasks
      await fetchTareas({ proyectoId });
    } catch (error: any) {
      toast.error(error.message || "Error al mover la tarea");
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex w-full flex-col gap-4">
        {/* Summary cards - más sutiles */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-semibold">{card.value}</span>
                <span className={cn("h-2.5 w-2.5 rounded-full", card.accent)} />
              </div>
            </div>
          ))}
        </div>

        {/* Kanban board - sin contenedor separado */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {columns.map(({ estado, config, tareas: columnTareas }) => (
                <div
                  key={estado}
                  className="flex min-h-[420px] flex-col rounded-2xl border border-border/60 bg-background/80 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
                      <h3 className="text-sm font-semibold">{config.label}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {columnTareas.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={estado}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "mt-3 flex-1 rounded-2xl border border-dashed border-transparent bg-transparent transition",
                          snapshot.isDraggingOver && "border-primary/40 bg-primary/5"
                        )}
                      >
                        <div className="flex flex-col gap-2">
                          {columnTareas.length === 0 ? (
                            <div className="py-10 text-center text-xs text-muted-foreground">
                              Arrastra tareas aquí
                            </div>
                          ) : (
                            columnTareas.map((tarea, index) => (
                              <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => !snapshot.isDragging && onTaskClick(tarea.id)}
                                    className={cn(
                                      "border border-border/60 bg-background/90 p-3 text-sm shadow-sm transition-all",
                                      "hover:-translate-y-0.5 hover:shadow-lg",
                                      snapshot.isDragging && "rotate-1 scale-105 shadow-2xl",
                                      prioridadConfig[tarea.prioridad].bg.replace("bg-", "border-l-")
                                    )}
                                  >
                                    <div className="mb-2 flex items-center justify-between" {...provided.dragHandleProps}>
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                      {(onEditTask || onDeleteTask) && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                              <MoreVertical className="h-3.5 w-3.5" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            {onEditTask && (
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onEditTask(tarea.id);
                                                }}
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                              </DropdownMenuItem>
                                            )}
                                            {onDeleteTask && (
                                              <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onDeleteTask(tarea.id);
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Eliminar
                                              </DropdownMenuItem>
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>

                                    <h4 className="mb-2 line-clamp-2 font-semibold leading-snug">{tarea.titulo}</h4>
                                    {tarea.descripcion && (
                                      <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                                        {tarea.descripcion}
                                      </p>
                                    )}

                                    <div className="mb-3 flex items-center gap-1.5">
                                      <Badge variant="outline" className={cn("text-[10px]", prioridadConfig[tarea.prioridad].bg)}>
                                        <Flag className={cn("mr-1 h-2.5 w-2.5", prioridadConfig[tarea.prioridad].color)} />
                                        {tarea.prioridad}
                                      </Badge>
                                      {tarea.etapa && (
                                        <Badge variant="secondary" className="text-[10px]">
                                          {tarea.etapa.nombre}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        {tarea._count && tarea._count.comentarios > 0 && (
                                          <span className="inline-flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {tarea._count.comentarios}
                                          </span>
                                        )}
                                        {(() => {
                                          const due = formatDate(tarea.fechaVencimiento);
                                          if (!due) return null;
                                          return (
                                            <span
                                              className={cn(
                                                "inline-flex items-center gap-1",
                                                due.isOverdue && "text-red-500"
                                              )}
                                            >
                                              <Calendar className="h-3 w-3" />
                                              {due.text}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      {tarea.asignado && (
                                        <Avatar className="h-6 w-6 border border-background">
                                          <AvatarImage src={tarea.asignado.avatarUrl} />
                                          <AvatarFallback className="text-[10px]">
                                            {getInitials(tarea.asignado.nombreCompleto)}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                    </div>
                                  </Card>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
      </div>
    </DragDropContext>
  );
}
