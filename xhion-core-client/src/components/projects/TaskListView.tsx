import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Calendar,
  Flag,
  Circle,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  PlusCircle,
  Edit3,
  ListChecks,
} from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  etapas: Etapa[];
  onCreateStage: () => void;
  onEditStage: (etapa: Etapa) => void;
  onDeleteStage: (etapa: Etapa) => void;
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

export function TaskListView({
  tareas,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  etapas,
  onCreateStage,
  onEditStage,
  onDeleteStage,
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

  const stageStats = useMemo(() => {
    return etapas.map((etapa) => {
      const tareasCount = tareas.filter((tarea) => tarea.etapa?.id === etapa.id).length;
      return {
        ...etapa,
        tareasCount,
      };
    });
  }, [etapas, tareas]);

  // Group by etapa
  const groupedTareas = tareas.reduce((acc, tarea) => {
    const key = tarea.etapa?.nombre || "Sin etapa";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tarea);
    return acc;
  }, {} as Record<string, Tarea[]>);

  return (
    <div className="w-full bg-background space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <p className="text-[13px] font-semibold text-foreground tracking-tight">Etapas del proyecto</p>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {etapas.length === 0 ? "Sin etapas registradas" : `${etapas.length} etapas activas`}
            </span>
          </div>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={onCreateStage}>
            <PlusCircle className="mr-2 h-3.5 w-3.5" /> Nueva etapa
          </Button>
        </div>

        {stageStats.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-[13px] text-muted-foreground">
            Aún no hay etapas registradas. Crea la primera para organizar las listas.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stageStats.map((stage) => {
              const hasHexColor = isHexColor(stage.color);
              const accentHex = hasHexColor ? stage.color! : undefined;
              const accentClass = !hasHexColor && stage.color ? stage.color : undefined;
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs shadow-sm",
                    accentClass && "text-white"
                  )}
                  style={
                    hasHexColor && accentHex
                      ? {
                          borderColor: hexToRgba(accentHex, 0.4),
                          backgroundColor: hexToRgba(accentHex, 0.18),
                        }
                      : undefined
                  }
                >
                  <span className="text-sm font-semibold leading-none">{stage.nombre}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em]">
                    Orden {stage.orden}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                    <ListChecks className="h-3 w-3" /> {stage.tareasCount}
                  </Badge>
                  {stage.estado && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em]">
                      {stage.estado.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => onEditStage(stage)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteStage(stage)}>
                          Eliminar etapa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-5">
          {Object.entries(groupedTareas).map(([etapaName, etapaTareas]) => (
            <div key={etapaName} className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm">
              {/* Group Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight text-foreground">{etapaName}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span>{etapaTareas.length} tareas</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {etapaTareas.length > 4 ? "Alta actividad" : "Monitoreo"}
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {etapaTareas.map((tarea) => {
                  const EstadoIcon = estadoConfig[tarea.estado].icon;
                  const PrioridadIcon = prioridadConfig[tarea.prioridad].icon;
                  const dueDate = formatDate(tarea.fechaVencimiento);

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
                          {tarea.etapa && (
                            <Badge variant="secondary" className="ml-auto text-[10px]">
                              {tarea.etapa.nombre}
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
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
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
                        </div>
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
    </div>
  );
}
