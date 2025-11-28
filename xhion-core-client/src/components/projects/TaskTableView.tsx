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
import { MessageSquare, Flag, ArrowUpDown, MoreVertical, Edit, Trash2, FolderKanban } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface TaskTableViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
  onEditTask?: (tareaId: string) => void;
  onDeleteTask?: (tareaId: string) => void;
  etapas: Etapa[];
  stageColorMap?: Record<string, string>;
  stagesEnabled?: boolean;
  groupBy?: "none" | "project" | "stage";
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

const formatStageOrder = (orden?: number) =>
  typeof orden === "number" ? orden.toString().padStart(2, "0") : "—";

export function TaskTableView({
  tareas,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  etapas,
  stageColorMap,
  stagesEnabled = true,
  groupBy = "none",
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

  const sortedTareas = useMemo(() => {
    return [...tareas].sort((a, b) => {
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
  }, [tareas, sortField, sortOrder]);

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
      sortedTareas.forEach(t => {
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
        const etapaTareas = sortedTareas.filter(t => t.etapaId === etapa.id);
        if (etapaTareas.length > 0) {
          acc.push({
            group: { id: etapa.id, nombre: etapa.nombre, type: "stage", color: etapa.color, orden: etapa.orden },
            tareas: etapaTareas
          });
        }
        return acc;
      }, [] as { group: any, tareas: Tarea[] }[]);

      const tareasWithoutEtapa = sortedTareas.filter(t => !t.etapaId);
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
        tareas: sortedTareas
      }];
    }
  }, [sortedTareas, etapas, stagesEnabled, groupBy]);

  return (
    <div className="w-full bg-background space-y-4">
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
            {groupedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No hay tareas en este proyecto
                </TableCell>
              </TableRow>
            ) : (
              groupedEntries.map(({ group, tareas: groupTareas }) => {
                const isStageGroup = group.type === "stage";
                const isProjectGroup = group.type === "project";

                const accentHex = isStageGroup ? stageColorMap?.[group.id] : undefined;
                const fallbackHex = isStageGroup && group.color && isHexColor(group.color) ? group.color : undefined;
                const chipColor = accentHex || fallbackHex;

                return (
                  <>
                    {/* Group Header Row */}
                    {(isStageGroup || isProjectGroup) && (
                      <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableCell colSpan={9} className="py-2">
                          <div className="flex items-center gap-2 font-medium">
                            {isProjectGroup && <FolderKanban className="h-4 w-4 text-muted-foreground" />}
                            {isStageGroup && chipColor && (
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: chipColor }}
                              />
                            )}
                            <span>{group.nombre}</span>
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              {groupTareas.length}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Tasks Rows */}
                    {groupTareas.map((tarea) => {
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
                            {/* Show stage badge if not grouped by stage */}
                            {(!isStageGroup && tarea.etapa) ? (
                              <div
                                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-xs font-semibold"
                                style={(() => {
                                  const etapaId = tarea.etapa?.id;
                                  const badgeHex = etapaId ? stageColorMap?.[etapaId] : undefined;
                                  const fallback = etapaId ? stageMetaMap[etapaId]?.color : undefined;
                                  const color = badgeHex || (fallback && isHexColor(fallback) ? fallback : undefined);
                                  return color
                                    ? {
                                      borderColor: hexToRgba(color, 0.4),
                                      backgroundColor: hexToRgba(color, 0.12),
                                      color,
                                    }
                                    : undefined;
                                })()}
                              >
                                <span className="text-[11px] text-muted-foreground">#{formatStageOrder(stageMetaMap[tarea.etapa.id]?.orden)}</span>
                                <span>{tarea.etapa.nombre}</span>
                              </div>
                            ) : (
                              !isStageGroup && <span className="text-xs text-muted-foreground">Sin etapa</span>
                            )}
                            {/* Show project badge if not grouped by project */}
                            {(!isProjectGroup && tarea.proyecto) && (
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                {tarea.proyecto.nombre}
                              </Badge>
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
                    })}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
