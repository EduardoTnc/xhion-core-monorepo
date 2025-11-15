import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Target } from "lucide-react";
import type { Proyecto, Etapa } from "@/services/projectService";
import type { Tarea } from "@/services/taskService";
import { es } from "date-fns/locale";
import { format, differenceInDays } from "date-fns";
import {
  Gantt as ReactGantt,
  ViewMode as GTViewMode,
  TitleColumn,
  DateStartColumn,
  DateEndColumn,
} from "@wamra/gantt-task-react";
import type { Task as GTTask, TaskOrEmpty as GTTaskOrEmpty } from "@wamra/gantt-task-react";
import "@wamra/gantt-task-react/dist/style.css";
import "@/styles/gantt-task-react-overrides.css";

interface ProjectGanttTimelineProps {
  proyecto: Proyecto;
  etapas: Etapa[];
  tareas: Tarea[];
  onTaskClick?: (tareaId: string) => void;
}

export function ProjectGanttTimeline({ proyecto, etapas, tareas, onTaskClick }: ProjectGanttTimelineProps) {
  const [viewMode, setViewMode] = useState<GTViewMode>(GTViewMode.Week);
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(undefined);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localTasks, setLocalTasks] = useState<GTTask[]>([]);

  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const tareaByTaskIdRef = useRef<Map<string, Tarea>>(new Map());

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDarkTheme(el.classList.contains("dark"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!ganttContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(ganttContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const parseLocalDate = useCallback((value?: string | Date | null) => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      return new Date(year, month, day);
    }
    return new Date(value);
  }, []);

  const resumen = useMemo(() => {
    const total = tareas.length;
    const completadas = tareas.filter((t) => t.estado === "Hecho").length;
    const enCurso = tareas.filter((t) => t.estado === "En_Progreso").length;
    const bloqueadas = tareas.filter((t) => t.estado === "Bloqueado").length;

    const dates = [
      proyecto.fechaInicio,
      proyecto.fechaFin,
      ...etapas.flatMap((e) => [e.fechaInicio, e.fechaFin]),
      ...tareas.flatMap((t) => [t.fechaCreacion, t.fechaVencimiento]),
    ].filter(Boolean);

    const startDate = dates.length ? parseLocalDate(dates.reduce((min, curr) => (curr! < min! ? curr : min))) : new Date();
    const endDate = dates.length ? parseLocalDate(dates.reduce((max, curr) => (curr! > max! ? curr : max))) : new Date();

    const duracion = differenceInDays(endDate, startDate) || 1;
    const progreso = total ? Math.round((completadas * 100) / total) : 0;

    return {
      total,
      completadas,
      enCurso,
      bloqueadas,
      duracion,
      progreso,
    };
  }, [etapas, parseLocalDate, proyecto.fechaFin, proyecto.fechaInicio, tareas]);

  const ganttColors = useMemo(
    () =>
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
            milestoneBackgroundColor: "#f97316",
            milestoneBackgroundSelectedColor: "#ea580c",
            barLabelColor: "#e5e5e5",
            barLabelWhenOutsideColor: "#e5e5e5",
            contextMenuBgColor: "#171717",
            contextMenuTextColor: "#f5f5f5",
            contextMenuBoxShadow: "0 10px 15px -3px rgba(0,0,0,0.7)",
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
            milestoneBackgroundColor: "#f97316",
            milestoneBackgroundSelectedColor: "#ea580c",
            barLabelColor: "#0f172a",
            barLabelWhenOutsideColor: "#0f172a",
            contextMenuBgColor: "#ffffff",
            contextMenuTextColor: "#0f172a",
            contextMenuBoxShadow: "0 10px 15px -3px rgba(15,23,42,0.18)",
          },
    [isDarkTheme]
  );

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const computedDistances = useMemo(() => {
    const width = containerWidth || 1024;
    const tableWidth = clamp(Math.round(width * 0.36), 280, 420);
    const dateCellWidth = clamp(Math.round(width * 0.12), 90, 140);
    const titleCellWidth = clamp(tableWidth - dateCellWidth * 2, 180, 320);
    const columnWidth =
      viewMode === GTViewMode.Year
        ? 160
        : viewMode === GTViewMode.Month
        ? 80
        : viewMode === GTViewMode.Week
        ? 60
        : 40;

    return {
      columnWidth,
      barCornerRadius: 4,
      handleWidth: 6,
      barFill: 60,
      arrowIndent: 8,
      titleCellWidth,
      dateCellWidth,
      headerHeight: 44,
      rowHeight: 36,
      tableWidth,
      minimumRowDisplayed: 5,
    };
  }, [containerWidth, viewMode]);

  const columns = useMemo(() => {
    const isCompact = containerWidth > 0 && containerWidth < 680;
    const result: any[] = [{ id: "title", Cell: TitleColumn, width: computedDistances.titleCellWidth, title: "Elemento" }];
    if (!isCompact) {
      result.push({ id: "from", Cell: DateStartColumn, width: computedDistances.dateCellWidth, title: "Inicio" });
      result.push({ id: "to", Cell: DateEndColumn, width: computedDistances.dateCellWidth, title: "Fin" });
    }
    return result;
  }, [computedDistances.dateCellWidth, computedDistances.titleCellWidth, containerWidth]);

  const findDatesForTarea = useCallback(
    (tarea: Tarea, etapa?: Etapa) => {
      const end = parseLocalDate(tarea.fechaVencimiento || etapa?.fechaFin || proyecto.fechaFin || new Date());
      const start = parseLocalDate(tarea.fechaCreacion || etapa?.fechaInicio || proyecto.fechaInicio || end);
      if (start > end) {
        end.setDate(start.getDate() + 1);
      }
      return { start, end };
    },
    [parseLocalDate, proyecto.fechaFin, proyecto.fechaInicio]
  );

  const derivedTasks = useMemo(() => {
    const tasks: GTTask[] = [];
    const map = new Map<string, Tarea>();

    const stageById = new Map(etapas.map((e) => [e.id, e]));
    const projectStart = parseLocalDate(proyecto.fechaInicio || tareas[0]?.fechaCreacion || etapas[0]?.fechaInicio);
    const projectEnd = parseLocalDate(proyecto.fechaFin || tareas[0]?.fechaVencimiento || etapas[0]?.fechaFin || new Date());

    const projectTask: GTTask = {
      id: `proj-${proyecto.id}`,
      type: "project",
      name: proyecto.nombre,
      start: projectStart,
      end: projectEnd < projectStart ? new Date(projectStart.getTime() + 86400000) : projectEnd,
      progress: resumen.progreso,
      displayOrder: 0,
    };
    tasks.push(projectTask);

    let order = 1;

    etapas
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .forEach((etapa) => {
        const etapaStart = parseLocalDate(etapa.fechaInicio || proyecto.fechaInicio);
        const etapaEnd = parseLocalDate(etapa.fechaFin || etapaStart);
        tasks.push({
          id: `stage-${etapa.id}`,
          type: "project",
          name: etapa.nombre,
          start: etapaStart,
          end: etapaEnd < etapaStart ? new Date(etapaStart.getTime() + 86400000) : etapaEnd,
          progress: 0,
          parent: projectTask.id,
          displayOrder: order++,
          styles: {
            projectBackgroundColor: ganttColors.projectBackgroundColor,
            projectBackgroundSelectedColor: ganttColors.projectBackgroundSelectedColor,
            projectProgressColor: ganttColors.projectProgressColor,
            projectProgressSelectedColor: ganttColors.projectProgressSelectedColor,
          },
        });
      });

    const tasksWithoutStage: Tarea[] = [];

    tareas.forEach((tarea) => {
      const etapa = tarea.etapaId ? stageById.get(tarea.etapaId) : undefined;
      const { start, end } = findDatesForTarea(tarea, etapa);
      const taskId = `task-${tarea.id}`;
      const parent = etapa ? `stage-${etapa.id}` : projectTask.id;
      tasks.push({
        id: taskId,
        type: "task",
        name: tarea.titulo,
        start,
        end,
        progress: tarea.estado === "Hecho" ? 100 : tarea.estado === "En_Progreso" ? 50 : tarea.estado === "Bloqueado" ? 25 : 5,
        parent,
        displayOrder: order++,
        styles: {
          barBackgroundColor: ganttColors.barBackgroundColor,
          barBackgroundSelectedColor: ganttColors.barBackgroundSelectedColor,
          barProgressColor: ganttColors.barProgressColor,
          barProgressSelectedColor: ganttColors.barProgressSelectedColor,
        },
      });
      map.set(taskId, tarea);
      if (!etapa) tasksWithoutStage.push(tarea);
    });

    // Agrupar tareas sin etapa en un bloque virtual
    if (tasksWithoutStage.length) {
      const virtualStart = parseLocalDate(tasksWithoutStage[0].fechaCreacion || tareas[0]?.fechaCreacion);
      const virtualEnd = parseLocalDate(tasksWithoutStage[0].fechaVencimiento || tareas[0]?.fechaVencimiento || virtualStart);
      tasks.push({
        id: "stage-others",
        type: "project",
        name: "Tareas sin etapa",
        start: virtualStart,
        end: virtualEnd < virtualStart ? new Date(virtualStart.getTime() + 86400000) : virtualEnd,
        progress: 0,
        parent: projectTask.id,
        displayOrder: order++,
        styles: {
          projectBackgroundColor: "#e2e8f0",
          projectBackgroundSelectedColor: "#cbd5f5",
          projectProgressColor: ganttColors.projectProgressColor,
          projectProgressSelectedColor: ganttColors.projectProgressSelectedColor,
        },
      });
    }

    tasks.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    tareaByTaskIdRef.current = map;
    return tasks;
  }, [etapas, findDatesForTarea, ganttColors.barBackgroundColor, ganttColors.barBackgroundSelectedColor, ganttColors.barProgressColor, ganttColors.barProgressSelectedColor, ganttColors.projectBackgroundColor, ganttColors.projectBackgroundSelectedColor, ganttColors.projectProgressColor, ganttColors.projectProgressSelectedColor, parseLocalDate, proyecto.fechaFin, proyecto.fechaInicio, proyecto.id, proyecto.nombre, resumen.progreso, tareas]);

  useEffect(() => {
    setLocalTasks(derivedTasks);
  }, [derivedTasks]);

  useEffect(() => {
    if (!derivedTasks.length) return;
    const tasksWithDates = derivedTasks.filter((t) => t.start && t.end);
    if (!tasksWithDates.length) return;
    const starts = tasksWithDates.map((t) => t.start.getTime());
    const ends = tasksWithDates.map((t) => t.end.getTime());
    const minStart = new Date(Math.min(...starts));
    const maxEnd = new Date(Math.max(...ends));
    const today = new Date();
    const insideRange = today >= minStart && today <= maxEnd;
    setCurrentViewDate((prev) => prev ?? (insideRange ? today : new Date(minStart.getTime() + (maxEnd.getTime() - minStart.getTime()) / 2)));
  }, [derivedTasks]);

  const handleToday = () => {
    if (!derivedTasks.length) {
      setCurrentViewDate(new Date());
      return;
    }
    const tasksWithDates = derivedTasks.filter((t) => t.start && t.end);
    if (!tasksWithDates.length) {
      setCurrentViewDate(new Date());
      return;
    }
    const starts = tasksWithDates.map((t) => t.start.getTime());
    const ends = tasksWithDates.map((t) => t.end.getTime());
    const minStart = new Date(Math.min(...starts));
    const maxEnd = new Date(Math.max(...ends));
    const today = new Date();
    const clamped = today < minStart ? minStart : today > maxEnd ? maxEnd : today;
    setCurrentViewDate(clamped);
  };

  const handleClick = (task: GTTaskOrEmpty) => {
    if (!onTaskClick) return;
    const tarea = tareaByTaskIdRef.current.get((task as GTTask).id);
    if (tarea) {
      onTaskClick(tarea.id);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header sin contenedor Card */}
      <div className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeline del proyecto</p>
              <h3 className="text-lg font-semibold">{proyecto.nombre}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[GTViewMode.Day, GTViewMode.Week, GTViewMode.Month].map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className="h-8 px-3 text-xs"
              >
                {mode === GTViewMode.Day ? "Día" : mode === GTViewMode.Week ? "Semana" : "Mes"}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleToday} className="h-8 px-3 text-xs">
              Hoy
            </Button>
          </div>
        </div>

        {/* Stats cards - más sutiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Total tareas</p>
            <p className="text-base font-semibold">{resumen.total}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Completadas</p>
            <p className="text-base font-semibold text-emerald-500">{resumen.completadas}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">En curso</p>
            <p className="text-base font-semibold text-blue-500">{resumen.enCurso}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Bloqueadas</p>
            <p className="text-base font-semibold text-orange-500">{resumen.bloqueadas}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Duración</p>
            <p className="text-base font-semibold">{resumen.duracion} días</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Progreso</p>
              <p className="text-base font-semibold">{resumen.progreso}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt chart sin CardContent - Altura generosa para expansión completa */}
      <div className="w-full" style={{ minHeight: '600px', height: 'auto' }}>
        <div ref={ganttContainerRef} className="w-full overflow-auto rounded-lg gantt-scroll" style={{ minHeight: '600px', height: 'auto' }}>
          <ReactGantt
            tasks={localTasks}
            viewMode={viewMode}
            onDateChange={() => null}
            onDoubleClick={handleClick}
            onClick={handleClick}
            dateLocale={es}
            viewDate={currentViewDate}
            distances={computedDistances}
            canResizeColumns
            fontSize="12px"
            fontFamily="Inter, ui-sans-serif, system-ui"
            colors={ganttColors}
            columns={columns}
            TooltipContent={({ task }: { task: GTTask }) => {
              const tarea = tareaByTaskIdRef.current.get(task.id);
              if (!tarea) {
                return (
                  <div className="p-2 text-xs space-y-1">
                    <p className="font-semibold">{task.name}</p>
                    <p>Inicio: {format(task.start, "dd MMM yyyy", { locale: es })}</p>
                    <p>Fin: {format(task.end, "dd MMM yyyy", { locale: es })}</p>
                  </div>
                );
              }
              return (
                <div className="p-2 text-xs space-y-1 max-w-xs">
                  <p className="font-semibold">{tarea.titulo}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {format(task.start, "dd MMM", { locale: es })} → {format(task.end, "dd MMM yyyy", { locale: es })}
                  </p>
                  <p>Estado: {tarea.estado.replace("_", " ")}</p>
                  <p>Prioridad: {tarea.prioridad}</p>
                  {tarea.asignado && <p>Asignado a: {tarea.asignado.nombreCompleto}</p>}
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
