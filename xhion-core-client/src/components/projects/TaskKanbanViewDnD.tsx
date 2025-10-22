import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { type Etapa } from "@/services/projectService";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskKanbanViewDnDProps {
  tareas: Tarea[];
  etapas: Etapa[];
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

export function TaskKanbanViewDnD({ tareas, etapas, onTaskClick, onEditTask, onDeleteTask, proyectoId }: TaskKanbanViewDnDProps) {
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
      <div className="flex-1 overflow-hidden bg-muted/30">
        <div className="h-full p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
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

                {/* Droppable Column */}
                <Droppable droppableId={estado}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-lg transition-colors",
                        snapshot.isDraggingOver && "bg-primary/5 ring-2 ring-primary/20"
                      )}
                    >
                      <ScrollArea className="h-full">
                        <div className="space-y-3 pr-2 min-h-[200px]">
                          {columnTareas.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              Arrastra tareas aquí
                            </div>
                          ) : (
                            columnTareas.map((tarea, index) => {
                              const prioridad = prioridadConfig[tarea.prioridad];
                              const dueDate = formatDate(tarea.fechaVencimiento);

                              return (
                                <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => !snapshot.isDragging && onTaskClick(tarea.id)}
                                      className={cn(
                                        "p-4 cursor-pointer transition-all",
                                        "border-l-4",
                                        prioridad.bg.replace("bg-", "border-l-"),
                                        snapshot.isDragging
                                          ? "shadow-2xl rotate-2 scale-105 ring-2 ring-primary"
                                          : "hover:shadow-md"
                                      )}
                                    >
                                      {/* Drag Handle and Menu */}
                                      <div className="flex items-center justify-between mb-2">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        {(onEditTask || onDeleteTask) && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-3 w-3" />
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
                                        {tarea.etapa && (
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
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
