import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ZoomIn, ZoomOut, FolderKanban, Layers } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";
import { Gantt as ReactGantt, ViewMode as GTViewMode, TitleColumn } from "@wamra/gantt-task-react";
import type { Task as GTTask, ColumnProps } from "@wamra/gantt-task-react";
import "@wamra/gantt-task-react/dist/style.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TaskTimelineViewProps {
  tareas: Tarea[];
  etapas: Etapa[];
  onTaskClick?: (taskId: string) => void;
  stagesEnabled?: boolean;
  groupBy?: "none" | "project" | "stage";
}

const estadoProgress = {
  Por_Hacer: 0,
  En_Progreso: 50,
  Hecho: 100,
  Bloqueado: 25,
};

export function TaskTimelineView({ tareas, etapas, onTaskClick, stagesEnabled = true, groupBy = "none" }: TaskTimelineViewProps) {
  const [viewMode, setViewMode] = useState<GTViewMode>(GTViewMode.Week);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Detect theme
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDarkTheme(el.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Responsive width
  useEffect(() => {
    if (!ganttContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setContainerWidth(e.contentRect.width);
    });
    ro.observe(ganttContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Colors
  const ganttColors = useMemo(() => (
    isDarkTheme
      ? {
        evenTaskBackgroundColor: "#171717",
        oddTaskBackgroundColor: "#171717",
        selectedTaskBackgroundColor: "#262626",
        todayColor: "rgba(56,189,248,0.24)",
        arrowColor: "#525252",
        barBackgroundColor: "#262626",
        barBackgroundSelectedColor: "#404040",
        barProgressColor: "#22c55e",
        barProgressSelectedColor: "#16a34a",
        projectBackgroundColor: "#27272a",
        projectBackgroundSelectedColor: "#3f3f46",
        projectProgressColor: "#38bdf8",
        projectProgressSelectedColor: "#0ea5e9",
        barLabelColor: "#e5e5e5",
        barLabelWhenOutsideColor: "#e5e5e5",
      }
      : {
        todayColor: "rgba(59,130,246,0.16)",
        arrowColor: "#94a3b8",
        evenTaskBackgroundColor: "#f8fafc",
        oddTaskBackgroundColor: "#ffffff",
        selectedTaskBackgroundColor: "#e5e7eb",
        barBackgroundColor: "#e5e7eb",
        barBackgroundSelectedColor: "#cbd5e1",
        barProgressColor: "#16a34a",
        barProgressSelectedColor: "#15803d",
        projectBackgroundColor: "#cbd5e1",
        projectBackgroundSelectedColor: "#94a3b8",
        projectProgressColor: "#3b82f6",
        projectProgressSelectedColor: "#2563eb",
        barLabelColor: "#0f172a",
        barLabelWhenOutsideColor: "#0f172a",
      }
  ), [isDarkTheme]);

  // Convert tasks to GTTask
  const tasks = useMemo(() => {
    const result: GTTask[] = [];
    let order = 0;

    const parseDate = (d?: string) => d ? new Date(d) : new Date();

    if (groupBy === "project") {
      // Group by project
      const groups: Record<string, { id: string; nombre: string; tareas: Tarea[] }> = {};
      tareas.forEach(t => {
        const pid = t.proyectoId || "no-project";
        if (!groups[pid]) {
          groups[pid] = {
            id: pid,
            nombre: t.proyecto?.nombre || "Sin Proyecto",
            tareas: []
          };
        }
        groups[pid].tareas.push(t);
      });

      Object.values(groups).forEach(group => {
        const projectId = `proj-${group.id}`;

        // Calculate project dates based on tasks
        const taskDates = group.tareas.map(t => parseDate(t.fechaVencimiento).getTime());
        const minDate = taskDates.length ? new Date(Math.min(...taskDates)) : new Date();
        const maxDate = taskDates.length ? new Date(Math.max(...taskDates)) : new Date();

        result.push({
          id: projectId,
          type: "project",
          name: group.nombre,
          start: minDate,
          end: maxDate,
          progress: 0, // Could calculate average
          isDisabled: true,
          displayOrder: order++,
          hideChildren: false,
          styles: {
            projectBackgroundColor: ganttColors.projectBackgroundColor,
            projectBackgroundSelectedColor: ganttColors.projectBackgroundSelectedColor,
            projectProgressColor: ganttColors.projectProgressColor,
            projectProgressSelectedColor: ganttColors.projectProgressSelectedColor,
          }
        });

        group.tareas.forEach(t => {
          const start = t.fechaCreacion ? new Date(t.fechaCreacion) : new Date();
          const end = t.fechaVencimiento ? new Date(t.fechaVencimiento) : new Date(start.getTime() + 86400000);
          // Ensure end >= start
          const safeEnd = end < start ? start : end;

          result.push({
            id: t.id,
            type: "task",
            name: t.titulo,
            start,
            end: safeEnd,
            progress: estadoProgress[t.estado as keyof typeof estadoProgress] || 0,
            parent: projectId,
            displayOrder: order++,
            styles: {
              barBackgroundColor: ganttColors.barBackgroundColor,
              barBackgroundSelectedColor: ganttColors.barBackgroundSelectedColor,
              barProgressColor: ganttColors.barProgressColor,
              barProgressSelectedColor: ganttColors.barProgressSelectedColor,
            }
          });
        });
      });

    } else if (stagesEnabled || groupBy === "stage") {
      // Group by stage
      const groups: Record<string, { id: string; nombre: string; tareas: Tarea[] }> = {};

      // Initialize with stages
      etapas.forEach(e => {
        groups[e.id] = { id: e.id, nombre: e.nombre, tareas: [] };
      });
      groups["no-stage"] = { id: "no-stage", nombre: "Sin Etapa", tareas: [] };

      tareas.forEach(t => {
        const sid = t.etapaId || "no-stage";
        if (!groups[sid]) groups[sid] = { id: sid, nombre: "Desconocida", tareas: [] };
        groups[sid].tareas.push(t);
      });

      Object.values(groups).forEach(group => {
        if (group.tareas.length === 0 && group.id === "no-stage") return;

        const stageId = `stage-${group.id}`;
        const taskDates = group.tareas.map(t => parseDate(t.fechaVencimiento).getTime());
        const minDate = taskDates.length ? new Date(Math.min(...taskDates)) : new Date();
        const maxDate = taskDates.length ? new Date(Math.max(...taskDates)) : new Date();

        result.push({
          id: stageId,
          type: "project", // Use project type for grouping header
          name: group.nombre,
          start: minDate,
          end: maxDate,
          progress: 0,
          isDisabled: true,
          displayOrder: order++,
          hideChildren: false,
          styles: {
            projectBackgroundColor: ganttColors.projectBackgroundColor,
            projectBackgroundSelectedColor: ganttColors.projectBackgroundSelectedColor,
            projectProgressColor: ganttColors.projectProgressColor,
            projectProgressSelectedColor: ganttColors.projectProgressSelectedColor,
          }
        });

        group.tareas.forEach(t => {
          const start = t.fechaCreacion ? new Date(t.fechaCreacion) : new Date();
          const end = t.fechaVencimiento ? new Date(t.fechaVencimiento) : new Date(start.getTime() + 86400000);
          const safeEnd = end < start ? start : end;

          result.push({
            id: t.id,
            type: "task",
            name: t.titulo,
            start,
            end: safeEnd,
            progress: estadoProgress[t.estado as keyof typeof estadoProgress] || 0,
            parent: stageId,
            displayOrder: order++,
            styles: {
              barBackgroundColor: ganttColors.barBackgroundColor,
              barBackgroundSelectedColor: ganttColors.barBackgroundSelectedColor,
              barProgressColor: ganttColors.barProgressColor,
              barProgressSelectedColor: ganttColors.barProgressSelectedColor,
            }
          });
        });
      });
    } else {
      // Flat list
      tareas.forEach(t => {
        const start = t.fechaCreacion ? new Date(t.fechaCreacion) : new Date();
        const end = t.fechaVencimiento ? new Date(t.fechaVencimiento) : new Date(start.getTime() + 86400000);
        const safeEnd = end < start ? start : end;

        result.push({
          id: t.id,
          type: "task",
          name: t.titulo,
          start,
          end: safeEnd,
          progress: estadoProgress[t.estado as keyof typeof estadoProgress] || 0,
          displayOrder: order++,
          styles: {
            barBackgroundColor: ganttColors.barBackgroundColor,
            barBackgroundSelectedColor: ganttColors.barBackgroundSelectedColor,
            barProgressColor: ganttColors.barProgressColor,
            barProgressSelectedColor: ganttColors.barProgressSelectedColor,
          }
        });
      });
    }

    return result;
  }, [tareas, groupBy, etapas, stagesEnabled, ganttColors]);

  // Column definition
  const columns = useMemo(() => {
    return [
      {
        id: 'title',
        title: 'Tarea',
        width: 250,
        Cell: (props: ColumnProps) => {
          return (
            <div className="flex items-center gap-2 pr-2 overflow-hidden">
              <div className="min-w-0 flex-1 truncate">
                {props.data.task.name}
              </div>
            </div>
          );
        }
      },
    ];
  }, []);

  const TooltipContent = ({ task }: { task: GTTask }) => {
    return (
      <div className="p-2 text-xs bg-popover text-popover-foreground rounded shadow-md border border-border">
        <div className="font-semibold mb-1">{task.name}</div>
        <div className="text-muted-foreground">
          <div>Inicio: {format(task.start, 'dd/MM/yyyy', { locale: es })}</div>
          <div>Fin: {format(task.end, 'dd/MM/yyyy', { locale: es })}</div>
          <div>Progreso: {task.progress}%</div>
        </div>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No hay tareas para mostrar en el timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background" ref={ganttContainerRef}>
      {/* Toolbar */}
      <div className="border-b bg-card p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">Diagrama de Gantt</span>
          <Badge variant="secondary" className="ml-2">
            {tareas.length} tareas
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as GTViewMode)}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GTViewMode.Day}>Día</SelectItem>
              <SelectItem value={GTViewMode.Week}>Semana</SelectItem>
              <SelectItem value={GTViewMode.Month}>Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ReactGantt
          tasks={tasks}
          viewMode={viewMode}
          locale="es"
          columns={columns}
          columnWidth={viewMode === GTViewMode.Month ? 100 : 60}
          listCellWidth=""
          ganttHeight={0} // Auto height
          headerHeight={50}
          rowHeight={40}
          barFill={60}
          barCornerRadius={4}
          handleWidth={8}
          fontFamily="inherit"
          fontSize="12px"
          colors={ganttColors}
          TooltipContent={TooltipContent}
          onExpanderClick={(task) => {
            // Handle expand/collapse if needed, usually handled by library state
            // But we might need to update tasks state to toggle hideChildren
            // For now, let's assume library handles it or we need to manage state
            // Actually, gantt-task-react expects us to manage `hideChildren`
            // But for simplicity in this iteration, we leave it open.
            // To implement collapse: update task.hideChildren in state.
            // Since `tasks` is memoized, we'd need a local state copy or update the logic.
            // For now, all expanded.
          }}
          onSelect={(task, isSelected) => {
            if (isSelected && onTaskClick && task.type === 'task') {
              onTaskClick(task.id);
            }
          }}
        />
      </div>
    </div>
  );
}
