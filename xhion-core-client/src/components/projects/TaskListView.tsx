import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Calendar, Flag, Circle, CheckCircle2, Clock, XCircle, MoreVertical, Edit, Trash2, FolderKanban } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  etapas: Etapa[];
  stageColorMap?: Record<string, string>;
  stagesEnabled?: boolean;
  groupBy?: "none" | "project" | "stage";
}

const prioridadConfig = {
  Baja: { color: "text-gray-500", icon: Flag },
  Media: { color: "text-blue-500", icon: Flag },
  Alta: { color: "text-orange-500", icon: Flag },
  Urgente: { color: "text-red-500", icon: Flag },
};

const estadoConfig = {
  Por_Hacer: { icon: Circle, color: "text-slate-500", label: "Por hacer" },
  En_Progreso: { icon: Clock, color: "text-blue-500", label: "En progreso" },
  Hecho: { icon: CheckCircle2, color: "text-green-500", label: "Hecho" },
  Bloqueado: { icon: XCircle, color: "text-red-500", label: "Bloqueado" },
};

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

export function TaskListView({
  tareas,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  etapas,
  stageColorMap,
  stagesEnabled = true,
  groupBy = "none",
}: TaskListViewProps) {
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

  const stageMetaMap = useMemo(() => {
    return etapas.reduce<Record<string, Etapa>>((acc, etapa) => {
      acc[etapa.id] = etapa;
      return acc;
    }, {});
  }, [etapas]);

  // Grouping logic
  const groupedEntries = useMemo(() => {
    if (groupBy === "project") {
      const groups: Record<string, { id: string; nombre: string; tareas: Tarea[] }> = {};
      tareas.forEach(t => {
        const projectId = t.proyectoId;
        if (!groups[projectId]) {
          groups[projectId] = {
            id: projectId,
            nombre: t.proyecto.nombre,
            tareas: []
          };
        }
        groups[projectId].tareas.push(t);
      });
      return Object.values(groups).map(g => ({
        group: { id: g.id, nombre: g.nombre, type: "project" },
        tareas: g.tareas
      }));
    } else if (stagesEnabled || groupBy === "stage") {
      // Existing stage grouping logic
      const grouped = etapas.reduce((acc, etapa) => {
        const etapaTareas = tareas.filter(t => t.etapaId === etapa.id);
        if (etapaTareas.length > 0) {
          acc.push({
            group: { id: etapa.id, nombre: etapa.nombre, type: "stage", color: etapa.color, orden: etapa.orden },
            tareas: etapaTareas
          });
        }
        return acc;
      }, [] as { group: any, tareas: Tarea[] }[]);

      const tareasWithoutEtapa = tareas.filter(t => !t.etapaId);
      if (tareasWithoutEtapa.length > 0) {
        grouped.push({
          group: { id: "none", nombre: "Sin etapa", type: "stage" },
          tareas: tareasWithoutEtapa
        });
      }
      return grouped;
    } else {
      return [{
        group: { id: "general", nombre: "Listado general", type: "general" },
        tareas
      }];
    }
  }, [tareas, etapas, stagesEnabled, groupBy]);

  return (
    <div className="w-full bg-background space-y-4">
      <div className="space-y-5">
        {groupedEntries.map(({ group, tareas: groupTareas }) => {
          const isStageGroup = group.type === "stage";
          const isProjectGroup = group.type === "project";

          const accentHex = isStageGroup ? stageColorMap?.[group.id] : undefined;
          const fallbackHex = isStageGroup && group.color && isHexColor(group.color) ? group.color : undefined;
          const chipColor = accentHex || fallbackHex;

          return (
            <div key={group.id} className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isProjectGroup && <FolderKanban className="h-4 w-4 text-muted-foreground" />}
                  {isStageGroup && chipColor && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chipColor }}
                    />
                  )}
                  <p className="text-sm font-semibold text-foreground">{group.nombre}</p>
                  {isStageGroup && (
                    <span className="text-xs text-muted-foreground">{groupTareas.length} tareas</span>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em]">
                  {groupTareas.length} tareas
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {groupTareas.map((tarea) => {
                  const EstadoIcon = estadoConfig[tarea.estado].icon;
                  const PrioridadIcon = prioridadConfig[tarea.prioridad].icon;
                  const dueDate = formatDate(tarea.fechaVencimiento);
                  const etapaId = tarea.etapa?.id;
                  const stageBadgeHex = etapaId ? stageColorMap?.[etapaId] : undefined;
                  const stageFallback = etapaId ? stageMetaMap[etapaId]?.color : undefined;
                  const badgeColor = stageBadgeHex || (stageFallback && isHexColor(stageFallback) ? stageFallback : undefined);

                  return (
                    <div
                      key={tarea.id}
                      onClick={() => onTaskClick(tarea.id)}
                      className={cn(
                        "group flex flex-col gap-3 p-4 rounded-lg border border-border/60 bg-background/80",
                        "hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={tarea.estado === "Hecho"}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-start gap-2">
                            <h4 className="font-semibold text-sm flex-1 min-w-0 text-foreground">
                              {tarea.titulo}
                            </h4>
                            <PrioridadIcon
                              className={cn("h-4 w-4", prioridadConfig[tarea.prioridad].color)}
                            />
                          </div>
                          {tarea.descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {tarea.descripcion}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 text-[11px] text-muted-foreground sm:grid-cols-3">
                        <div className="flex items-center gap-1 font-medium">
                          <EstadoIcon className={cn("h-4 w-4", estadoConfig[tarea.estado].color)} />
                          {estadoConfig[tarea.estado].label}
                        </div>
                        <div className="flex items-center gap-1">
                          {tarea._count && tarea._count.comentarios > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {tarea._count.comentarios}
                            </span>
                          )}
                          {/* Show stage badge if not grouped by stage */}
                          {(!isStageGroup && tarea.etapa) && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-[10px]"
                              style={
                                badgeColor
                                  ? {
                                    borderColor: hexToRgba(badgeColor, 0.4),
                                    backgroundColor: hexToRgba(badgeColor, 0.12),
                                    color: badgeColor,
                                  }
                                  : undefined
                              }
                            >
                              #{formatStageOrder(tarea.etapa.orden)} · {tarea.etapa.nombre}
                            </Badge>
                          )}
                          {/* Show project badge if not grouped by project */}
                          {(!isProjectGroup && tarea.proyecto) && (
                            <Badge variant="outline" className="ml-auto text-[10px]">
                              {tarea.proyecto.nombre}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {dueDate && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                tarea.estado !== "Hecho" && dueDate.isOverdue && "text-destructive"
                              )}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {dueDate.text}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {tarea.asignado && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={tarea.asignado.avatarUrl || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(tarea.asignado.nombreCompleto)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {(onEditTask || onDeleteTask) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {tareas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No hay tareas en este proyecto
          </div>
        )}
      </div>
    </div>
  );
}
