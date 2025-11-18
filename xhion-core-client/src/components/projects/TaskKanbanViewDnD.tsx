import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
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
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  proyectoId: string;
  etapas: Etapa[];
  stageColorMap?: Record<string, string>;
  stagesEnabled?: boolean;
}

const prioridadConfig = {
  Baja: {
    color: "text-slate-500",
    badge: "border-slate-300/70 text-slate-700 dark:text-slate-200",
    accent: "border-l-4 border-l-slate-400/80",
  },
  Media: {
    color: "text-blue-500",
    badge: "border-blue-300/70 text-blue-600 dark:text-blue-200",
    accent: "border-l-4 border-l-blue-400/80",
  },
  Alta: {
    color: "text-orange-500",
    badge: "border-orange-300/70 text-orange-600 dark:text-orange-200",
    accent: "border-l-4 border-l-orange-400/80",
  },
  Urgente: {
    color: "text-red-500",
    badge: "border-red-300/70 text-red-600 dark:text-red-200",
    accent: "border-l-4 border-l-red-500/80",
  },
};

const estadoConfig = {
  Por_Hacer: { label: "Por Hacer", color: "bg-slate-500" },
  En_Progreso: { label: "En Progreso", color: "bg-blue-500" },
  Hecho: { label: "Hecho", color: "bg-green-500" },
  Bloqueado: { label: "Bloqueado", color: "bg-red-500" },
} as const;

type EstadoColumnKey = keyof typeof estadoConfig;

const isHexColor = (value?: string | null) => {
  if (!value || typeof value !== "string") return false;
  return /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value.trim());
};

const hexToRgba = (hex: string, alpha = 0.12) => {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (sanitized.length === 4) {
    const [r, g, b] = sanitized.split("");
    sanitized = `${r}${r}${g}${g}${b}${b}`;
  } else if (sanitized.length === 8) {
    sanitized = sanitized.slice(0, 6);
  }

  const parsed = parseInt(sanitized, 16);
  if (Number.isNaN(parsed)) return `rgba(42, 43, 48, ${alpha})`;

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatStageOrder = (orden?: number) =>
  typeof orden === "number" ? orden.toString().padStart(2, "0") : "—";

const buildColumnsFromTasks = (taskList: Tarea[]): Record<EstadoColumnKey, Tarea[]> => {
  const base: Record<EstadoColumnKey, Tarea[]> = {
    Por_Hacer: [],
    En_Progreso: [],
    Hecho: [],
    Bloqueado: [],
  };

  taskList.forEach((task) => {
    base[task.estado as EstadoColumnKey].push(task);
  });

  return base;
};

const areColumnsEqual = (
  a: Record<EstadoColumnKey, Tarea[]>,
  b: Record<EstadoColumnKey, Tarea[]>
): boolean => {
  const states: EstadoColumnKey[] = ["Por_Hacer", "En_Progreso", "Hecho", "Bloqueado"];
  return states.every((state) => {
    const columnA = a[state];
    const columnB = b[state];
    if (columnA.length !== columnB.length) return false;
    for (let i = 0; i < columnA.length; i += 1) {
      if (columnA[i].id !== columnB[i].id || columnA[i].estado !== columnB[i].estado) {
        return false;
      }
    }
    return true;
  });
};

export function TaskKanbanViewDnD({
  tareas,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  proyectoId,
  etapas,
  stageColorMap,
  stagesEnabled = true,
}: TaskKanbanViewDnDProps) {
  const { updateTarea, fetchTareas } = useTaskStore();
  const [columnsState, setColumnsState] = useState<Record<EstadoColumnKey, Tarea[]>>(() => buildColumnsFromTasks(tareas));
  const [allowExternalSync, setAllowExternalSync] = useState(true);

  useEffect(() => {
    if (!allowExternalSync) return;
    setColumnsState((prev) => {
      const next = buildColumnsFromTasks(tareas);
      return areColumnsEqual(prev, next) ? prev : next;
    });
  }, [tareas, allowExternalSync]);

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

  const columns = Object.entries(estadoConfig).map(([estado, config]) => ({
    estado: estado as EstadoColumnKey,
    config,
    tareas: columnsState[estado as EstadoColumnKey] || [],
  }));

  const stageMetaMap = useMemo(() => {
    return etapas.reduce<Record<string, Etapa>>((acc, etapa) => {
      acc[etapa.id] = etapa;
      return acc;
    }, {});
  }, [etapas]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination or same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const sourceColumnKey = source.droppableId as EstadoColumnKey;
    const destinationColumnKey = destination.droppableId as EstadoColumnKey;

    const taskBeingMoved = columnsState[sourceColumnKey]?.[source.index];
    if (!taskBeingMoved) return;

    const previousState = columnsState;

    const nextState: Record<EstadoColumnKey, Tarea[]> = {
      Por_Hacer: [...columnsState.Por_Hacer],
      En_Progreso: [...columnsState.En_Progreso],
      Hecho: [...columnsState.Hecho],
      Bloqueado: [...columnsState.Bloqueado],
    };

    const [removedTask] = nextState[sourceColumnKey].splice(source.index, 1);
    const updatedTask = {
      ...removedTask,
      estado: destinationColumnKey,
    } as Tarea;

    nextState[destinationColumnKey].splice(destination.index, 0, updatedTask);

    setAllowExternalSync(false);
    setColumnsState(nextState);

    try {
      await updateTarea(taskId, {
        estado: destinationColumnKey,
      });

      toast.success("Tarea movida exitosamente");

      // Refresh tasks
      await fetchTareas({ proyectoId });
      setAllowExternalSync(true);
    } catch (error: any) {
      setColumnsState(previousState);
      setAllowExternalSync(true);
      toast.error(error.message || "Error al mover la tarea");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Kanban board - sin contenedor separado */}
        <div className="-mx-1 overflow-x-auto pb-2 md:mx-0 md:overflow-visible">
          <div className="flex gap-3 px-1 snap-x snap-mandatory md:grid md:grid-cols-2 xl:grid-cols-4 md:snap-none">
            {columns.map(({ estado, config, tareas: columnTareas }) => {
              const percentage = tareas.length === 0 ? 0 : Math.round((columnTareas.length / tareas.length) * 100);
              return (
                <div
                  key={estado}
                  className="flex min-h-[420px] min-w-[270px] flex-col rounded-xl border border-border/60 bg-card p-3 shadow-sm snap-start"
                >
                  <div className="flex items-start justify-between gap-2 border-b pb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
                        {config.label}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {columnTareas.length === 0
                          ? "Sin tareas"
                          : `${columnTareas.length} ${columnTareas.length === 1 ? "tarea" : "tareas"} · ${percentage}% del total`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
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
                                      "group flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/90 p-4 text-sm shadow-sm transition-all",
                                      "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
                                      snapshot.isDragging && "rotate-1 scale-105 shadow-2xl",
                                      prioridadConfig[tarea.prioridad].accent
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-2" >
                                      <div className="flex items-center gap-2" {...provided.dragHandleProps}>
                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                        {stagesEnabled && (() => {
                                          const stageMeta = tarea.etapa?.id ? stageMetaMap[tarea.etapa.id] : undefined;
                                          if (!stageMeta) return null;
                                          const gradientHex = stageColorMap?.[stageMeta.id];
                                          const fallbackHex = stageMeta.color && isHexColor(stageMeta.color) ? stageMeta.color : undefined;
                                          const accentHex = gradientHex || fallbackHex;
                                          const accentClass = stageMeta.color && !isHexColor(stageMeta.color) ? stageMeta.color : undefined;
                                          return (
                                            <span
                                              className={cn(
                                                "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] font-semibold",
                                                accentClass && "text-white"
                                              )}
                                              style={
                                                accentHex
                                                  ? {
                                                      borderColor: hexToRgba(accentHex, 0.45),
                                                      backgroundColor: hexToRgba(accentHex, 0.15),
                                                      color: accentHex,
                                                    }
                                                  : undefined
                                              }
                                            >
                                              <span className="text-[10px] font-semibold opacity-80">
                                                #{formatStageOrder(stageMeta?.orden)}
                                              </span>
                                              <span>{stageMeta?.nombre}</span>
                                            </span>
                                          );
                                        })()}
                                      </div>
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
                                                <Edit className="mr-2 h-4 w-4" />
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
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                              </DropdownMenuItem>
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <h4 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
                                        {tarea.titulo}
                                      </h4>
                                      {tarea.descripcion && (
                                        <p className="text-xs text-muted-foreground line-clamp-3">
                                          {tarea.descripcion}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2 text-[11px] text-muted-foreground">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className={cn("text-[10px] font-semibold", prioridadConfig[tarea.prioridad].badge)}
                                        >
                                          <Flag className={cn("mr-1 h-3 w-3", prioridadConfig[tarea.prioridad].color)} />
                                          {tarea.prioridad}
                                        </Badge>
                                        {(() => {
                                          const due = formatDate(tarea.fechaVencimiento);
                                          if (!due) {
                                            return (
                                              <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5">
                                                <Calendar className="h-3 w-3" />
                                                Sin fecha
                                              </span>
                                            );
                                          }
                                          return (
                                            <span
                                              className={cn(
                                                "inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5",
                                                due.isOverdue && "text-red-500 border-red-500/40"
                                              )}
                                            >
                                              <Calendar className="h-3 w-3" />
                                              {due.text}
                                            </span>
                                          );
                                        })()}
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-1">
                                          <MessageSquare className="h-3.5 w-3.5" />
                                          <span className="font-medium text-foreground">
                                            {tarea._count?.comentarios ?? 0}
                                          </span>
                                          <span className="text-muted-foreground/70">comentarios</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {tarea.asignado ? (
                                            <>
                                              <Avatar className="h-7 w-7 border border-background/60">
                                                <AvatarImage src={tarea.asignado.avatarUrl || undefined} />
                                                <AvatarFallback className="text-[10px]">
                                                  {getInitials(tarea.asignado.nombreCompleto)}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-xs text-foreground line-clamp-1">
                                                {tarea.asignado.nombreCompleto}
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-xs italic text-muted-foreground">Sin responsable</span>
                                          )}
                                        </div>
                                      </div>
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
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
