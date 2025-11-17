import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Flag, ArrowUpDown, MoreVertical, Edit, Trash2, PlusCircle, Edit3, ListChecks } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskTableViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  etapas: Etapa[];
  onCreateStage: () => void;
  onEditStage: (etapa: Etapa) => void;
  onDeleteStage: (etapa: Etapa) => void;
}

const prioridadColors = {
  Baja: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Media: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Urgente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const estadoColors = {
  Por_Hacer: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  En_Progreso: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Hecho: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Bloqueado: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type SortField = "titulo" | "prioridad" | "estado" | "fechaVencimiento";
type SortOrder = "asc" | "desc";

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

export function TaskTableView({
  tareas,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  etapas,
  onCreateStage,
  onEditStage,
  onDeleteStage,
}: TaskTableViewProps) {
  const [sortField, setSortField] = useState<SortField>("titulo");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTareas = [...tareas].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "titulo":
        comparison = a.titulo.localeCompare(b.titulo);
        break;
      case "prioridad":
        const prioridadOrder = { Baja: 1, Media: 2, Alta: 3, Urgente: 4 };
        comparison = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
        break;
      case "estado":
        comparison = a.estado.localeCompare(b.estado);
        break;
      case "fechaVencimiento":
        const dateA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 0;
        const dateB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 0;
        comparison = dateA - dateB;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3 font-semibold"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const stageStats = useMemo(() => {
    return etapas.map((etapa) => {
      const tareasCount = tareas.filter((tarea) => tarea.etapa?.id === etapa.id).length;
      return {
        ...etapa,
        tareasCount,
      };
    });
  }, [etapas, tareas]);

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
            Aún no hay etapas registradas. Crea la primera para organizar la tabla.
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

      <div className="w-full">
        <Table>
          <TableHeader className="sticky top-0 z-10 border-b bg-card">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>
                <SortButton field="titulo">Tarea</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="estado">Estado</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="prioridad">Prioridad</SortButton>
              </TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>
                <SortButton field="fechaVencimiento">Vencimiento</SortButton>
              </TableHead>
              <TableHead className="w-20 text-center">Comentarios</TableHead>
              {(onEditTask || onDeleteTask) && (
                <TableHead className="w-16">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTareas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No hay tareas en este proyecto
                </TableCell>
              </TableRow>
            ) : (
              sortedTareas.map((tarea) => {
                const isOverdue =
                  tarea.fechaVencimiento &&
                  new Date(tarea.fechaVencimiento) < new Date() &&
                  tarea.estado !== "Hecho";

                return (
                  <TableRow
                    key={tarea.id}
                    onClick={() => onTaskClick(tarea.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={tarea.estado === "Hecho"}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tarea.titulo}</div>
                        {tarea.descripcion && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {tarea.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", estadoColors[tarea.estado])}>
                        {tarea.estado.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", prioridadColors[tarea.prioridad])}>
                        <Flag className="h-3 w-3 mr-1" />
                        {tarea.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tarea.etapa ? (
                        <Badge variant="outline" className="text-xs">
                          {tarea.etapa.nombre}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin etapa</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tarea.asignado ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={tarea.asignado.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {getInitials(tarea.asignado.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{tarea.asignado.nombreCompleto}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue && "text-red-500 font-medium"
                        )}
                      >
                        {formatDate(tarea.fechaVencimiento)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {tarea._count && tarea._count.comentarios > 0 ? (
                        <div className="inline-flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">{tarea._count.comentarios}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {(onEditTask || onDeleteTask) && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
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
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
