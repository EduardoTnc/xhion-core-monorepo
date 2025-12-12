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
import { MessageSquare, Flag, Calendar, MoreVertical, GripVertical, Edit, Trash2, FolderKanban, ChevronDown, ChevronRight } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { useMoveTask } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Restricted } from "../auth/Restricted";

interface TaskKanbanViewDnDProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  proyectoId: string;
  etapas: Etapa[];
  stageColorMap?: Record<string, string>;
  stagesEnabled?: boolean;
  onRefresh?: () => Promise<void>;
  groupBy?: "none" | "project" | "stage";
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
    if (base[task.estado as EstadoColumnKey]) {
      base[task.estado as EstadoColumnKey].push(task);
    }
  });

  return base;
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
  onRefresh,
  groupBy = "none",
}: TaskKanbanViewDnDProps) {
  // TanStack Query mutation for moving tasks
  const moveTaskMutation = useMoveTask();

  // We need to maintain local state for optimistic updates.
  // When grouped by project, we need a structure like { [projectId]: { [status]: Tarea[] } }
  // When not grouped, just { [status]: Tarea[] }
  // However, to simplify, we can just use the `tareas` prop and re-calculate columns on render,
  // BUT DnD requires stable state during the drag.
  // So we will use a single state object that holds ALL tasks, and we derive the views from it.
  const [localTareas, setLocalTareas] = useState<Tarea[]>(tareas);

  useEffect(() => {
    setLocalTareas(tareas);
  }, [tareas]);

  const stageMetaMap = useMemo(() => {
    return etapas.reduce<Record<string, Etapa>>((acc, etapa) => {
      acc[etapa.id] = etapa;
      return acc;
    }, {});
  }, [etapas]);

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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Parse droppableIds
    // Format: "${projectId}::${status}" or just "${status}" if not grouped (or global project)
    const getParts = (id: string) => {
      if (id.includes("::")) {
        const [pid, status] = id.split("::");
        return { pid, status: status as EstadoColumnKey };
      }
      return { pid: "global", status: id as EstadoColumnKey };
    };

    const sourceParts = getParts(source.droppableId);
    const destParts = getParts(destination.droppableId);

    // Optimistic update
    const newTareas = [...localTareas];
    const taskIndex = newTareas.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const task = newTareas[taskIndex];

    // Update task status
    const updatedTask = { ...task, estado: destParts.status };

    // If moving between projects (if we allowed it), we'd update project ID too.
    // For now, let's assume we only drag within the same project or "global" lists.
    // If we support cross-project drag, we need to handle it here.
    if (sourceParts.pid !== destParts.pid && destParts.pid !== "global") {
      // updatedTask.proyectoId = destParts.pid; // If we wanted to support moving projects
      // For now, let's restrict or just update status. 
      // If the user drags to another project's column, it implies changing project.
      // Let's support it if the backend supports it.
      // updatedTask.proyectoId = destParts.pid;
    }

    newTareas[taskIndex] = updatedTask;
    setLocalTareas(newTareas);

    try {
      // Using TanStack Query mutation hook for consistent cache invalidation
      await moveTaskMutation.mutateAsync({
        id: draggableId,
        data: { estado: destParts.status },
      });
      // Toast and cache invalidation handled by the mutation hook
      if (onRefresh) onRefresh();
    } catch (error) {
      setLocalTareas(tareas); // Revert on error
    }
  };
  const groupedData = useMemo(() => {
    if (groupBy === "project") {
      const groups: Record<string, { id: string; nombre: string; tareas: Tarea[] }> = {};
      localTareas.forEach(t => {
        const pid = t.proyectoId || "sin-proyecto";
        if (!groups[pid]) {
          groups[pid] = {
            id: pid,
            nombre: t.proyecto?.nombre || "Sin Proyecto",
            tareas: []
          };
        }
        groups[pid].tareas.push(t);
      });
      return Object.values(groups);
    }
    return [{ id: "global", nombre: "Todas las tareas", tareas: localTareas }];
  }, [localTareas, groupBy]);

  const renderBoard = (groupTareas: Tarea[], groupId: string, groupName: string) => {
    const columns = buildColumnsFromTasks(groupTareas);

    return (
      <div key={groupId} className="mb-8">
        {groupBy === "project" && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
            <Badge variant="secondary" className="ml-2">{groupTareas.length}</Badge>
          </div>
        )}

        <div className="-mx-1 overflow-x-auto pb-2 md:mx-0 md:overflow-visible">
          <div className="flex gap-3 px-1 snap-x snap-mandatory md:grid md:grid-cols-4 md:snap-none">
            {Object.entries(estadoConfig).map(([estado, config]) => {
              const columnTareas = columns[estado as EstadoColumnKey] || [];
              const droppableId = groupBy === "project" ? `${groupId}::${estado}` : estado;
              const percentage = groupTareas.length === 0 ? 0 : Math.round((columnTareas.length / groupTareas.length) * 100);

              return (
                <div
                  key={droppableId}
                  className="flex min-h-[200px] min-w-[270px] flex-col rounded-xl border border-border/60 bg-card p-3 shadow-sm snap-start"
                >
                  <div className="flex items-start justify-between gap-2 border-b pb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
                        {config.label}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {columnTareas.length} {columnTareas.length === 1 ? "tarea" : "tareas"}
                      </p>
                    </div>
                  </div>

                  <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "mt-3 flex-1 rounded-2xl border border-dashed border-transparent bg-transparent transition-colors min-h-[100px]",
                          snapshot.isDraggingOver && "border-primary/40 bg-primary/5"
                        )}
                      >
                        <div className="flex flex-col gap-2">
                          {columnTareas.map((tarea, index) => (
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
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2" {...provided.dragHandleProps}>
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                      {/* Stage Badge */}
                                      {stagesEnabled && (() => {
                                        const stageMeta = tarea.etapa?.id ? stageMetaMap[tarea.etapa.id] : undefined;
                                        if (!stageMeta) return null;
                                        const accentHex = stageColorMap?.[stageMeta.id] || (stageMeta.color && isHexColor(stageMeta.color) ? stageMeta.color : undefined);
                                        return (
                                          <span
                                            className={cn(
                                              "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] font-semibold",
                                            )}
                                            style={accentHex ? {
                                              borderColor: hexToRgba(accentHex, 0.45),
                                              backgroundColor: hexToRgba(accentHex, 0.15),
                                              color: accentHex,
                                            } : undefined}
                                          >
                                            <span className="text-[10px] font-semibold opacity-80">#{formatStageOrder(stageMeta?.orden)}</span>
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
                                            <Restricted to="tareas.editar">
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditTask(tarea.id); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                              </DropdownMenuItem>
                                            </Restricted>
                                          )}
                                          {onDeleteTask && (
                                            <Restricted to="tareas.eliminar">
                                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteTask(tarea.id); }}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                              </DropdownMenuItem>
                                            </Restricted>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="text-base font-semibold leading-snug text-foreground line-clamp-2">{tarea.titulo}</h4>
                                    {tarea.descripcion && (
                                      <p className="text-xs text-muted-foreground line-clamp-3">{tarea.descripcion}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-[11px] text-muted-foreground">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="outline" className={cn("text-[10px] font-semibold", prioridadConfig[tarea.prioridad].badge)}>
                                        <Flag className={cn("mr-1 h-3 w-3", prioridadConfig[tarea.prioridad].color)} />
                                        {tarea.prioridad}
                                      </Badge>
                                      {(() => {
                                        const due = formatDate(tarea.fechaVencimiento);
                                        if (!due) return <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5"><Calendar className="h-3 w-3" /> Sin fecha</span>;
                                        return (
                                          <span className={cn("inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5", due.isOverdue && "text-red-500 border-red-500/40")}>
                                            <Calendar className="h-3 w-3" /> {due.text}
                                          </span>
                                        );
                                      })()}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span className="font-medium text-foreground">{tarea._count?.comentarios ?? 0}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {tarea.asignado ? (
                                          <>
                                            <Avatar className="h-7 w-7 border border-background/60">
                                              <AvatarImage src={tarea.asignado.avatarUrl || undefined} />
                                              <AvatarFallback className="text-[10px]">{getInitials(tarea.asignado.nombreCompleto)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-foreground line-clamp-1">{tarea.asignado.nombreCompleto}</span>
                                          </>
                                        ) : <span className="text-xs italic text-muted-foreground">Sin responsable</span>}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
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
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {groupedData.map(group => renderBoard(group.tareas, group.id, group.nombre))}
      </DragDropContext>
    </div>
  );
}
