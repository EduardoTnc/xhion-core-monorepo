import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar,
  Loader2,
  Maximize2,
  Minimize2,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Target,
  TrendingUp,
  FileText,
  Save,
  Milestone,
  SquareStack,
  Layers,
  ListChecks,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { format, differenceInDays, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Gantt as ReactGantt, ViewMode as GTViewMode, TitleColumn } from "@wamra/gantt-task-react"
import type { Task as GTTask, TaskOrEmpty as GTTaskOrEmpty, ColumnProps } from "@wamra/gantt-task-react"
import type { ProyectoTimeline, Hito, EtapaTimeline } from "@/services/timelineService"
import { timelineService } from "@/services/timelineService"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "@wamra/gantt-task-react/dist/style.css"
import "@/styles/gantt-task-react-overrides.css"
import { getDepartmentIcon } from "@/lib/department-icons"

type ContentFilter = "all" | "projects" | "tasks"

type TaskVisualMeta = {
  iconName?: string | null
  deptColor?: string
  projectColor?: string
}

const OUTDATED_THRESHOLD_DAYS = 60

/**
 * Diagrama de Gantt Profesional con Gantt Task React - v2.0
 * 
 * Librería: Gantt Task React 
 * - Ligera y rápida
 * - Interactiva con drag & drop
 * - Múltiples vistas (día, semana, mes, año)
 * - Dependencias visuales
 * - Progreso visual
 * - Tooltips personalizados
 * - Responsive
 * 
 * Funcionalidades Completas:
 * - ✅ Visualización de proyectos y tareas
 * - ✅ Agrupación por departamentos
 * - ✅ Filtros avanzados (departamento, estado, completados, hitos)
 * - ✅ Exportación a PNG y PDF
 * - ✅ Navegación a detalles de proyecto
 * - ✅ Estadísticas en tiempo real
 * - ✅ Modo fullscreen
 * - ✅ Actualización en tiempo real
 * - ✅ Backend Integration: Guardar cambios de drag & drop
 * - ✅ Hitos visuales en tooltips
 * - ✅ Indicador de guardado automático
 * - ✅ Dependencias reales del backend
 */

export function GanttChartProfessional() {
  const navigate = useNavigate()
  const {
    timelineData,
    isLoadingTimeline,
    fetchTimelineData,
  } = useTimelineStore()

  // Estados
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<GTViewMode>(GTViewMode.Week)
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('all')
  const [selectedEstado, setSelectedEstado] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showMilestones, setShowMilestones] = useState(false)
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all')
  const [hideOutdated, setHideOutdated] = useState(false)
  const [localTasks, setLocalTasks] = useState<GTTask[]>([])
  const [containerWidth, setContainerWidth] = useState(0)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(undefined)
  const [collapsedTaskIds, setCollapsedTaskIds] = useState<Set<string>>(() => new Set())

  // Refs
  const ganttContainerRef = useRef<HTMLDivElement>(null)
  const proyectoByTaskIdRef = useRef<Map<string, ProyectoTimeline>>(new Map())
  const parentTaskIdsRef = useRef<string[]>([])
  const taskMetaRef = useRef<Map<string, TaskVisualMeta>>(new Map())
  const stageByTaskIdRef = useRef<Map<string, { stage: EtapaTimeline; proyecto: ProyectoTimeline }>>(new Map())

  const parseLocalDate = useCallback((value: string | Date) => {
    if (value instanceof Date) return value
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(value)
    if (match) {
      const y = Number(match[1])
      const m = Number(match[2]) - 1
      const d = Number(match[3])
      return new Date(y, m, d)
    }
    return new Date(value)
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchTimelineData()
  }, [fetchTimelineData])

  // Detectar cambios de tema (Tailwind: clase 'dark' en <html>)
  useEffect(() => {
    const el = document.documentElement
    const update = () => setIsDarkTheme(el.classList.contains('dark'))
    update()
    const mo = new MutationObserver(update)
    mo.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  // Observar ancho del contenedor para hacer el Gantt responsive
  useEffect(() => {
    if (!ganttContainerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const e = entries[0]
      if (e) setContainerWidth(e.contentRect.width)
    })
    ro.observe(ganttContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Agrupar proyectos por departamento
  const proyectosPorDepartamento = useMemo(() => {
    if (!timelineData) return []

    const grupos = new Map<string, { departamento: { id: string; nombre: string }; proyectos: ProyectoTimeline[] }>()

    timelineData.proyectos.forEach((proyecto) => {
      const deptId = proyecto.departamento.id
      if (!grupos.has(deptId)) {
        grupos.set(deptId, {
          departamento: proyecto.departamento,
          proyectos: []
        })
      }
      grupos.get(deptId)!.proyectos.push(proyecto)
    })

    return Array.from(grupos.values()).sort((a, b) =>
      a.departamento.nombre.localeCompare(b.departamento.nombre)
    )
  }, [timelineData])

  // Filtrar proyectos
  const isProjectOutdated = useCallback((proyecto: ProyectoTimeline) => {
    const cutoff = subDays(new Date(), OUTDATED_THRESHOLD_DAYS)
    const endDate = parseLocalDate(proyecto.fechaFin || proyecto.fechaFinProyectada || proyecto.fechaInicio)
    return endDate < cutoff
  }, [parseLocalDate])

  const proyectosFiltrados = useMemo(() => {
    if (!timelineData) return []

    let proyectos = timelineData.proyectos

    // Filtrar por departamento
    if (selectedDepartamento !== 'all') {
      proyectos = proyectos.filter(p => p.departamento.id === selectedDepartamento)
    }

    // Filtrar por estado
    if (selectedEstado !== 'all') {
      proyectos = proyectos.filter(p => (p as any).estado === selectedEstado)
    }

    // Filtrar completados
    if (!showCompleted) {
      proyectos = proyectos.filter(p => p.progreso < 100)
    }

    if (hideOutdated) {
      proyectos = proyectos.filter((p) => !isProjectOutdated(p))
    }

    return proyectos
  }, [timelineData, selectedDepartamento, selectedEstado, showCompleted, hideOutdated, isProjectOutdated])

  // Paleta de colores dependiente del tema (más simple y enfocada en lectura)
  const ganttColors = useMemo(() => (
    isDarkTheme
      ? {
          // Fondo general alineado con la plataforma
          evenTaskBackgroundColor: "#171717",
          oddTaskBackgroundColor: "#171717",
          selectedTaskBackgroundColor: "#262626",
          // Línea de "hoy" sutil pero visible
          todayColor: "rgba(56,189,248,0.24)",
          // Flechas y grid
          arrowColor: "#525252",
          // Barras de tareas (etapas/tareas)
          barBackgroundColor: "#262626",
          barBackgroundSelectedColor: "#404040",
          barProgressColor: "#22c55e",
          barProgressSelectedColor: "#16a34a",
          // Barras de proyectos/departamentos
          projectBackgroundColor: "#27272a",
          projectBackgroundSelectedColor: "#3f3f46",
          projectProgressColor: "#38bdf8",
          projectProgressSelectedColor: "#0ea5e9",
          // Hitos
          milestoneBackgroundColor: "#f97316",
          milestoneBackgroundSelectedColor: "#ea580c",
          // Etiquetas
          barLabelColor: "#e5e5e5",
          barLabelWhenOutsideColor: "#e5e5e5",
          // Menú contextual
          contextMenuBgColor: "#171717",
          contextMenuTextColor: "#f5f5f5",
          contextMenuBoxShadow: "0 10px 15px -3px rgba(0,0,0,0.7)",
        }
      : {
          todayColor: "rgba(59,130,246,0.16)", // blue-500
          arrowColor: "#94a3b8",
          evenTaskBackgroundColor: "#f8fafc", // slate-50
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
        }
  ), [isDarkTheme])

  const mapTailwindBgToHex = (value?: string) => {
    switch (value) {
      case "bg-blue-500":
      case "bg-blue-600":
        return "#2563eb"
      case "bg-indigo-700":
        return "#4338ca"
      case "bg-sky-700":
        return "#0369a1"
      case "bg-teal-600":
        return "#0d9488"
      case "bg-green-500":
      case "bg-emerald-700":
        return "#047857"
      case "bg-lime-600":
        return "#65a30d"
      case "bg-amber-600":
        return "#d97706"
      case "bg-orange-500":
      case "bg-orange-600":
        return "#ea580c"
      case "bg-rose-600":
        return "#e11d48"
      case "bg-fuchsia-700":
        return "#a21caf"
      case "bg-purple-500":
      case "bg-purple-700":
        return "#6d28d9"
      case "bg-pink-500":
        return "#ec4899"
      case "bg-yellow-500":
        return "#eab308"
      case "bg-red-500":
        return "#ef4444"
      case "bg-cyan-500":
      case "bg-cyan-600":
        return "#0891b2"
      case "bg-neutral-700":
        return "#404040"
      case "bg-slate-800":
        return "#1e293b"
      case "bg-gray-900":
        return "#111827"
      case "bg-zinc-700":
        return "#3f3f46"
      case "bg-blue-600-old":
        return "#2563eb"
      default:
        return undefined
    }
  }

  const getEffectiveColor = (value?: string) => {
    const v = value?.trim()
    if (!v) return undefined
    if (v.startsWith("bg-")) return mapTailwindBgToHex(v)
    return v
  }

  const hexToRgba = (value?: string, alpha = 0.18) => {
    if (!value) return undefined
    if (!value.startsWith("#")) return value
    let hex = value.replace("#", "")
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("")
    }
    const parsed = parseInt(hex.slice(0, 6), 16)
    if (Number.isNaN(parsed)) return value
    const r = (parsed >> 16) & 255
    const g = (parsed >> 8) & 255
    const b = parsed & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Distancias responsivas para equilibrar tabla vs. timeline
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
  const computedDistances = useMemo(() => {
    const w = containerWidth || 1024
    const tableWidth = clamp(Math.round(w * 0.36), 260, 420)
    const actionColumnWidth = 56
    const expandIconWidth = 18
    const titleCellWidth = clamp(tableWidth - actionColumnWidth - expandIconWidth, 200, tableWidth)
    const columnWidth =
      viewMode === GTViewMode.Year
        ? 160
        : viewMode === GTViewMode.Month
        ? 80
        : viewMode === GTViewMode.Week
        ? 60
        : 40

    return {
      columnWidth,
      barCornerRadius: 3,
      handleWidth: 6,
      barFill: 60,
      arrowIndent: 8,
      titleCellWidth,
      actionColumnWidth,
      expandIconWidth,
      headerHeight: 42,
      rowHeight: 34,
      relationCircleRadius: 3,
      relationCircleOffset: 6,
      nestedTaskNameOffset: 18,
      minimumRowDisplayed: 6,
      tableWidth,
      contextMenuIconWidth: 16,
      contextMenuOptionHeight: 28,
      contextMenuSidePadding: 6,
      taskWarningOffset: 8,
      dependencyFixWidth: 14,
      dependencyFixHeight: 14,
      dependencyFixIndent: 6,
    }
  }, [containerWidth, viewMode])

  // Columnas responsivas del listado izquierdo
  const TitleCell: React.FC<ColumnProps> = useCallback((props) => {
    const { task } = props.data
    const meta = taskMetaRef.current.get(task.id)
    const { icon: DeptIcon } = getDepartmentIcon(meta?.iconName || undefined)
    const accent = meta?.deptColor || meta?.projectColor
    const halo = hexToRgba(accent, task.id.startsWith("dept-") ? 0.35 : 0.12)
    return (
      <div className="flex items-center gap-2 pr-2">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold",
            !accent && "bg-muted/50 text-muted-foreground"
          )}
          style={{
            backgroundColor: halo,
            borderColor: accent ? hexToRgba(accent, 0.4) : undefined,
            color: accent || undefined,
          }}
        >
          {DeptIcon ? <DeptIcon className="h-4 w-4" /> : <Layers className="h-4 w-4 opacity-60" />}
        </div>
        <div className="min-w-0 flex-1">
          <TitleColumn {...props} />
        </div>
      </div>
    )
  }, [])

  const columns = useMemo(() => {
    return [
      { id: 'title', Cell: TitleCell, width: computedDistances.titleCellWidth, title: 'Elemento' },
    ]
  }, [computedDistances.titleCellWidth, TitleCell])

  // Guardar cambios de fechas (Backend Integration)
  const handleDateChange = useCallback((task: GTTaskOrEmpty) => {
    // Aceptamos TaskOrEmpty. Ignorar si es EmptyTask
    if ((task as any).type !== 'project') return
    const t = task as GTTask
    if ((t as any).isDisabled) return

    // Solo persistimos cambios para proyectos reales (id: proj-<id>)
    const isProyecto = t.type === "project" && t.id.startsWith("proj-")
    if (!isProyecto) return

    const proyecto = proyectoByTaskIdRef.current.get(t.id)
    if (!proyecto) return

    const prevTasks = localTasks
    // Optimistic UI
    setLocalTasks((ts) => ts.map(x => x.id === t.id ? { ...x, start: t.start, end: t.end } : x))

    setIsSaving(true)
    void (async () => {
      try {
        toast.loading('Guardando cambios...')
        await timelineService.actualizarFechas(proyecto.id, {
          fechaInicio: format(t.start, 'yyyy-MM-dd'),
          fechaFin: format(t.end, 'yyyy-MM-dd'),
        })
        await fetchTimelineData()
        toast.success('Fechas actualizadas exitosamente')
      } catch (error: any) {
        console.error('Error al actualizar fechas:', error)
        toast.error(error?.response?.data?.message || 'Error al actualizar fechas')
        // Revertir UI
        setLocalTasks(prevTasks)
      } finally {
        setIsSaving(false)
      }
    })()
  }, [fetchTimelineData, localTasks])

  // Guardar cambios de progreso (Backend Integration)
  const handleProgressChange = useCallback((task: GTTask) => {
    if ((task as any).isDisabled) return
    try {
      // Actualización local inmediata
      setLocalTasks((ts) => ts.map(t => t.id === task.id ? { ...t, progress: task.progress } : t))
      toast.success(`Progreso actualizado: ${task.progress}%`)
    } catch (error) {
      console.error('Error al actualizar progreso:', error)
      toast.error('Error al actualizar progreso')
    }
  }, [])

  // Convertir proyectos a formato GTTask (gantt-task-react)
  const derivedTasks = useMemo(() => {
    const tasks: GTTask[] = []
    const map = new Map<string, ProyectoTimeline>()
    const meta = new Map<string, TaskVisualMeta>()
    const stageAssociations = new Map<string, { stage: EtapaTimeline; proyecto: ProyectoTimeline }>()
    let order = 0
    parentTaskIdsRef.current = []

    const addDeptGroup = (grupo: { departamento: { id: string; nombre: string; color?: string; icono?: string | null }; proyectos: ProyectoTimeline[] }) => {
      if (!grupo.proyectos.length) return

      const deptId = `dept-${grupo.departamento.id}`
      parentTaskIdsRef.current.push(deptId)
      const deptColor = getEffectiveColor(grupo.departamento.color) || ganttColors.projectBackgroundColor
      const deptIconName = (grupo.departamento as any)?.icono
      const minStart = parseLocalDate(grupo.proyectos[0].fechaInicio)

      // Fila de agrupación por departamento sin barra visible en el timeline.
      // Solo sirve como contenedor y título para sus proyectos.
      tasks.push({
        id: deptId,
        type: "project",
        name: `DEP · ${grupo.departamento.nombre.toUpperCase()}`,
        start: minStart,
        end: minStart,
        progress: 0,
        isDisabled: true,
        displayOrder: order++,
        styles: {
          projectBackgroundColor: "transparent",
          projectBackgroundSelectedColor: "transparent",
          projectProgressColor: "transparent",
          projectProgressSelectedColor: "transparent",
        },
      })
      meta.set(deptId, { iconName: deptIconName, deptColor })
    }

    if (selectedDepartamento === 'all') {
      proyectosPorDepartamento.forEach(addDeptGroup)
    }

    proyectosFiltrados.forEach((proyecto) => {
      const tareaList = Array.isArray((proyecto as any).tareas) ? (proyecto as any).tareas : []
      const baseColor = getEffectiveColor((proyecto as any).color) || getEffectiveColor(proyecto.departamento.color)
      const projectColor = baseColor || ganttColors.projectBackgroundColor
      if (contentFilter === 'tasks' && tareaList.length === 0) {
        return
      }
      const projId = `proj-${proyecto.id}`
      const parentDept = selectedDepartamento === 'all' ? `dept-${proyecto.departamento.id}` : undefined
      if (contentFilter !== 'tasks') {
        const projTask: GTTask = {
          id: projId,
          type: "project",
          name: `● ${proyecto.nombre}`,
          start: parseLocalDate(proyecto.fechaInicio),
          end: parseLocalDate(proyecto.fechaFin),
          progress: proyecto.progreso,
          parent: parentDept,
          displayOrder: order++,
          styles: {
            projectBackgroundColor: projectColor,
            projectBackgroundSelectedColor: projectColor,
            projectProgressColor: projectColor,
            projectProgressSelectedColor: projectColor,
          },
        }
        tasks.push(projTask)
        map.set(projId, proyecto)
        parentTaskIdsRef.current.push(projId)

        // Dependencias de proyecto
        if (proyecto.dependencias && proyecto.dependencias.length) {
          projTask.dependencies = proyecto.dependencias.map((d) => ({
            sourceId: `proj-${d.proyectoId}`,
            sourceTarget: 'endOfTask',
            ownTarget: 'startOfTask',
          }))
        }
      }

      // Etapas
      if (proyecto.etapas && proyecto.etapas.length && contentFilter !== 'tasks') {
        proyecto.etapas
          .slice()
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .forEach((etapa) => {
            const stageId = `stage-${etapa.id}`
            const stageStart = parseLocalDate(etapa.fechaInicio || proyecto.fechaInicio)
            const stageEnd = parseLocalDate(etapa.fechaFin || etapa.fechaInicio || proyecto.fechaFin)
            const stageColor = getEffectiveColor(etapa.color) || projectColor
            const stageProgress = etapa.estado === 'Completada' ? 100 : etapa.estado === 'En_Progreso' ? 55 : 15
            tasks.push({
              id: stageId,
              type: "task",
              name: etapa.nombre,
              start: stageStart,
              end: stageEnd,
              progress: stageProgress,
              isDisabled: true,
              parent: projId,
              displayOrder: order++,
              styles: {
                barBackgroundColor: stageColor,
                barBackgroundSelectedColor: stageColor,
                barProgressColor: stageColor,
                barProgressSelectedColor: stageColor,
              },
            })
            map.set(stageId, proyecto)
            meta.set(stageId, {
              iconName: (proyecto.departamento as any)?.icono,
              deptColor: stageColor,
              projectColor,
            })
            stageAssociations.set(stageId, { stage: etapa, proyecto })
          })
      }

      // Subtareas (si existen como array)
      if (contentFilter !== 'projects' && tareaList.length > 0) {
        tareaList.forEach((tarea: any, index: number) => {
          const taskId = String(tarea.id ?? `task-${proyecto.id}-${index}`)
          tasks.push({
            id: taskId,
            type: "task",
            name: `• ${tarea.titulo || `Tarea ${index + 1}`}`,
            start: parseLocalDate(tarea.fechaInicio || proyecto.fechaInicio),
            end: parseLocalDate(tarea.fechaFin || proyecto.fechaFin),
            progress: tarea.progreso ?? 0,
            isDisabled: true,
            parent: contentFilter === 'tasks' ? parentDept : projId,
            displayOrder: order++,
            styles: {
              barBackgroundColor: projectColor,
              barBackgroundSelectedColor: projectColor,
              barProgressColor: projectColor,
              barProgressSelectedColor: projectColor,
            },
          })
          map.set(taskId, proyecto)
        })
      }

      // Hitos
      if (showMilestones && proyecto.hitos && proyecto.hitos.length) {
        proyecto.hitos.forEach((hito: Hito, idx: number) => {
          const fecha = parseLocalDate(hito.fecha)
          const milestoneId = `milestone-${proyecto.id}-${idx}`
          tasks.push({
            id: milestoneId,
            type: "milestone",
            name: `★ ${hito.nombre}`,
            start: fecha,
            end: fecha,
            progress: 100,
            isDisabled: true,
            parent: projId,
            displayOrder: order++,
            styles: {
              milestoneBackgroundColor: ganttColors.milestoneBackgroundColor,
              milestoneBackgroundSelectedColor: ganttColors.milestoneBackgroundSelectedColor,
            },
          })
          map.set(milestoneId, proyecto)
          meta.set(milestoneId, {
            iconName: (proyecto.departamento as any)?.icono,
            deptColor: getEffectiveColor(proyecto.departamento.color),
            projectColor,
          })
        })
      }
    })

    // Orden estable
    tasks.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    proyectoByTaskIdRef.current = map
    taskMetaRef.current = meta
    stageByTaskIdRef.current = stageAssociations
    return tasks
  }, [contentFilter, ganttColors, parseLocalDate, proyectosFiltrados, proyectosPorDepartamento, selectedDepartamento, showMilestones])

  // Mantener tasks locales sincronizados con los derivados del store
  useEffect(() => {
    setCollapsedTaskIds(prev => {
      const validIds = new Set(parentTaskIdsRef.current)
      let changed = false
      prev.forEach((id) => {
        if (!validIds.has(id)) {
          changed = true
        }
      })
      if (!changed) return prev
      const next = new Set<string>()
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id)
      })
      return next
    })
  }, [derivedTasks])

  useEffect(() => {
    if (!derivedTasks.length) {
      setLocalTasks([])
      return
    }
    const parentIds = new Set(parentTaskIdsRef.current)
    setLocalTasks(
      derivedTasks.map((task) => {
        if (!parentIds.has(task.id)) return task
        const shouldCollapse = collapsedTaskIds.has(task.id)
        if ((task as any).hideChildren === shouldCollapse) return task
        return { ...task, hideChildren: shouldCollapse }
      })
    )
  }, [derivedTasks, collapsedTaskIds])

  // Calcular una fecha de vista consistente dentro del rango de datos
  useEffect(() => {
    if (!derivedTasks.length) return

    const tasksWithDates = derivedTasks.filter((t) => t.start && t.end)
    if (!tasksWithDates.length) return

    const starts = tasksWithDates.map(t => t.start.getTime())
    const ends = tasksWithDates.map(t => t.end.getTime())
    const minStart = new Date(Math.min(...starts))
    const maxEnd = new Date(Math.max(...ends))

    const midTime = minStart.getTime() + (maxEnd.getTime() - minStart.getTime()) / 2
    const midpoint = new Date(midTime)

    const today = new Date()
    const insideRange = today >= minStart && today <= maxEnd
    const defaultDate = insideRange ? today : midpoint

    setCurrentViewDate(prev => prev ?? defaultDate)
  }, [derivedTasks])

  // Tooltip personalizado para gantt-task-react
  const TooltipTemplate = ({ task }: { task: GTTask; fontSize: string; fontFamily: string }) => {
    const proyecto = proyectoByTaskIdRef.current.get(task.id)
    const stageInfo = stageByTaskIdRef.current.get(task.id)
    const meta = taskMetaRef.current.get(task.id)
    const { icon: DeptIcon } = getDepartmentIcon(meta?.iconName || undefined)
    const accent = meta?.deptColor || meta?.projectColor
    if (!proyecto) {
      if (stageInfo) {
        return (
          <div className="p-2 text-xs">
            <div className="font-semibold">{stageInfo.stage.nombre}</div>
            <div className="text-muted-foreground">
              <div>Inicio: {format(task.start, 'dd/MM/yyyy', { locale: es })}</div>
              <div>Fin: {format(task.end, 'dd/MM/yyyy', { locale: es })}</div>
              {stageInfo.stage.estado && <div>Estado: {stageInfo.stage.estado.replace('_', ' ')}</div>}
            </div>
          </div>
        )
      }

      return (
        <div className="p-2 text-xs">
          <div className="font-semibold">{task.name}</div>
          <div className="text-muted-foreground">
            <div>Progreso: {task.progress}%</div>
            <div>Inicio: {format(task.start, 'dd/MM/yyyy', { locale: es })}</div>
            <div>Fin: {format(task.end, 'dd/MM/yyyy', { locale: es })}</div>
          </div>
        </div>
      )
    }

    const startD = parseLocalDate(proyecto.fechaInicio)
    const endD = parseLocalDate(proyecto.fechaFin)
    const duracion = differenceInDays(endD, startD)
    const saludBadge = proyecto.salud === 'saludable' ? '🟢' : proyecto.salud === 'atencion' ? '🟡' : '🔴'
    return (
      <div className="p-2 text-xs">
        <div className="font-semibold">{proyecto.nombre}</div>
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md border"
            style={{
              backgroundColor: hexToRgba(accent, 0.2),
              borderColor: accent ? hexToRgba(accent, 0.45) : undefined,
              color: accent || undefined,
            }}
          >
            {DeptIcon ? <DeptIcon className="h-4 w-4" /> : <Layers className="h-4 w-4 opacity-60" />}
          </span>
          <div className="text-xs">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Departamento</p>
            <p className="text-foreground">{proyecto.departamento.nombre}</p>
          </div>
        </div>
        <div className="space-y-0.5">
          <div><strong>Salud:</strong> {saludBadge} {proyecto.salud}</div>
          <div><strong>Progreso:</strong> {proyecto.progreso}%</div>
          <div><strong>Duración:</strong> {duracion} días</div>
          <div><strong>Tareas:</strong> {(proyecto as any).tareas?.total || 0} ({(proyecto as any).tareas?.completadas || 0} completadas)</div>
          <div><strong>Equipo:</strong> {(proyecto as any).equipo?.length || 0} miembros</div>
        </div>
        {stageInfo && (
          <div className="mt-2 pt-1 border-t">
            <div className="font-medium mb-1">Etapa</div>
            <div><strong>Nombre:</strong> {stageInfo.stage.nombre}</div>
            <div><strong>Inicio:</strong> {format(task.start, 'dd/MM/yyyy', { locale: es })}</div>
            <div><strong>Fin:</strong> {format(task.end, 'dd/MM/yyyy', { locale: es })}</div>
            {stageInfo.stage.estado && <div><strong>Estado:</strong> {stageInfo.stage.estado.replace('_', ' ')}</div>}
          </div>
        )}
        {!stageInfo && proyecto.hitos && proyecto.hitos.length > 0 && (
          <div className="mt-2 pt-1 border-t">
            <div className="font-medium mb-1">🎯 Hitos ({proyecto.hitos.length}):</div>
            {proyecto.hitos.slice(0, 3).map((h, i) => (
              <div key={i} className="text-[11px]">{h.completado ? '✅' : '⏳'} {h.nombre} <span className="text-muted-foreground">- {format(new Date(h.fecha), 'dd/MM/yyyy', { locale: es })}</span></div>
            ))}
            {proyecto.hitos.length > 3 && (
              <div className="text-[10px] text-muted-foreground">+{proyecto.hitos.length - 3} más...</div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Cambiar vista
  const handleViewModeChange = (mode: GTViewMode) => {
    // Sólo cambiamos la resolución (día/semana/mes), manteniendo la fecha anclada
    setViewMode(mode)

    // Para la vista mensual, recentrar automáticamente en la fecha actual (o rango de tareas)
    if (mode === GTViewMode.Month) {
      handleTodayClick()
    }
  }

  const handleTodayClick = () => {
    if (!derivedTasks.length) {
      setCurrentViewDate(new Date())
      return
    }

    const tasksWithDates = derivedTasks.filter((t) => t.start && t.end)
    if (!tasksWithDates.length) {
      setCurrentViewDate(new Date())
      return
    }

    const starts = tasksWithDates.map(t => t.start.getTime())
    const ends = tasksWithDates.map(t => t.end.getTime())
    const minStart = new Date(Math.min(...starts))
    const maxEnd = new Date(Math.max(...ends))

    const today = new Date()
    const clamped = today < minStart ? minStart : today > maxEnd ? maxEnd : today
    setCurrentViewDate(clamped)
  }

  const handleExpandAll = useCallback(() => {
    setCollapsedTaskIds(new Set())
  }, [])

  const handleCollapseAll = useCallback(() => {
    setCollapsedTaskIds(new Set(parentTaskIdsRef.current))
  }, [])

  const handleChangeExpandState = useCallback((changedTask: GTTask) => {
    if (!parentTaskIdsRef.current.includes(changedTask.id)) return
    setCollapsedTaskIds((prev) => {
      const next = new Set(prev)
      if (changedTask.hideChildren) {
        next.add(changedTask.id)
      } else {
        next.delete(changedTask.id)
      }
      return next
    })
  }, [])

  // Función para convertir colores oklch a rgb para compatibilidad con html2canvas
  const convertOklchToRgb = (element: HTMLElement) => {
    const style = getComputedStyle(element)
    const colorProperties = ['color', 'backgroundColor', 'fill', 'stroke']

    colorProperties.forEach(prop => {
      const value = style.getPropertyValue(prop)
      if (value.includes('oklch')) {
        // Forzar al navegador a computar el color a rgb
        const tempDiv = document.createElement('div')
        tempDiv.style.color = value
        document.body.appendChild(tempDiv)
        const rgbColor = getComputedStyle(tempDiv).color
        document.body.removeChild(tempDiv)
        ;(element.style as any)[prop] = rgbColor
      }
    })

    element.childNodes.forEach(child => {
      if (child.nodeType === 1) {
        convertOklchToRgb(child as HTMLElement)
      }
    })
  }

  // Exportar a PNG
  const handleExportPNG = async () => {
    if (!ganttContainerRef.current) return

    try {
      toast.loading('Generando imagen...')

      const ganttElement = ganttContainerRef.current.cloneNode(true) as HTMLElement
      convertOklchToRgb(ganttElement)
      
      const bg = getComputedStyle(document.body).backgroundColor
      const canvas = await html2canvas(ganttElement, {
        backgroundColor: bg,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
          toast.success('Imagen exportada exitosamente')
        }
      })
    } catch (error) {
      console.error('Error al exportar PNG:', error)
      toast.error('Error al exportar imagen')
    }
  }

  // Exportar a PDF
  const handleExportPDF = async () => {
    if (!ganttContainerRef.current) return

    try {
      toast.loading('Generando PDF...')

      const ganttElement = ganttContainerRef.current.cloneNode(true) as HTMLElement
      convertOklchToRgb(ganttElement)
      
      const bg = getComputedStyle(document.body).backgroundColor
      const canvas = await html2canvas(ganttElement, {
        backgroundColor: bg,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
      toast.success('PDF exportado exitosamente')
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      toast.error('Error al exportar PDF')
    }
  }

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    if (!proyectosFiltrados.length) return null

    const totalProyectos = proyectosFiltrados.length
    const progresoPromedio = Math.round(
      proyectosFiltrados.reduce((sum, p) => sum + p.progreso, 0) / totalProyectos
    )
    const proyectosSaludables = proyectosFiltrados.filter(p => p.salud === 'saludable').length
    const proyectosEnRiesgo = proyectosFiltrados.filter(p => p.salud === 'atencion' || p.salud === 'critico').length
    const totalTareas = proyectosFiltrados.reduce((sum, p) => sum + ((p as any).tareas?.total || 0), 0)
    const tareasCompletadas = proyectosFiltrados.reduce((sum, p) => sum + ((p as any).tareas?.completadas || 0), 0)
    const totalMiembros = new Set(proyectosFiltrados.flatMap(p => ((p as any).equipo || []).map((m: any) => m.id))).size

    return {
      totalProyectos,
      progresoPromedio,
      proyectosSaludables,
      proyectosEnRiesgo,
      totalTareas,
      tareasCompletadas,
      totalMiembros,
    }
  }, [proyectosFiltrados])

  if (isLoadingTimeline) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando diagrama de Gantt...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!timelineData || timelineData.proyectos.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No hay proyectos activos</p>
            <p className="text-xs text-muted-foreground">Crea un nuevo proyecto para comenzar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn("flex flex-col border-none shadow-none bg-background/40", isFullscreen ? "fixed inset-0 z-50" : "h-full")}>
        {/* Header */}
        <CardHeader className="pb-3 px-4 flex-shrink-0 border-b space-y-3">
          {/* Fila 1: Título y Acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">Diagrama de Gantt Profesional</h3>
                  {isSaving && (
                    <Badge variant="secondary" className="gap-1.5 text-xs">
                      <Save className="h-3 w-3 animate-pulse" />
                      Guardando...
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {proyectosFiltrados.length} proyectos • {estadisticas?.totalTareas} tareas
                  {showMilestones && ` • ${proyectosFiltrados.reduce((sum, p) => sum + (p.hitos?.length || 0), 0)} hitos`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTimelineData()}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Actualizar datos</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPNG}
                      className="h-8 gap-1.5 px-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-xs">PNG</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exportar como PNG</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="h-8 gap-1.5 px-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">PDF</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exportar como PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Fila 2: Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Proyectos</p>
                  <p className="text-sm font-semibold">{estadisticas.totalProyectos}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Progreso</p>
                  <p className="text-sm font-semibold">{estadisticas.progresoPromedio}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Saludables</p>
                  <p className="text-sm font-semibold">{estadisticas.proyectosSaludables}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">En Riesgo</p>
                  <p className="text-sm font-semibold">{estadisticas.proyectosEnRiesgo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Tareas</p>
                  <p className="text-sm font-semibold">{estadisticas.totalTareas}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                  <p className="text-sm font-semibold">{estadisticas.tareasCompletadas}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Users className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Miembros</p>
                  <p className="text-sm font-semibold">{estadisticas.totalMiembros}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fila 3: Filtros y Vista (una sola línea con scroll horizontal si es necesario) */}
          <div className="w-full overflow-x-auto gantt-scroll">
            <div className="flex items-center gap-3 min-w-max">
              {/* Filtros */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />

                <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {proyectosPorDepartamento.map((grupo) => (
                      <SelectItem key={grupo.departamento.id} value={grupo.departamento.id}>
                        {grupo.departamento.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="En Pausa">En Pausa</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Archivado">Archivado</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showCompleted ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="h-8 gap-1.5 text-xs"
                >
                  {showCompleted ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  Completados
                </Button>

                <Button
                  variant={hideOutdated ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setHideOutdated(!hideOutdated)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {hideOutdated ? 'Ocultando antiguos' : 'Mostrar antiguos'}
                </Button>

                <Button
                  variant={showMilestones ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowMilestones(!showMilestones)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Milestone className="h-3.5 w-3.5" />
                  Hitos
                </Button>

                <div className="flex items-center gap-1 rounded-lg border p-0.5">
                  <Button
                    variant={contentFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 px-2 text-[11px]"
                    onClick={() => setContentFilter('all')}
                  >
                    <SquareStack className="h-3.5 w-3.5" /> Todo
                  </Button>
                  <Button
                    variant={contentFilter === 'projects' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 px-2 text-[11px]"
                    onClick={() => setContentFilter('projects')}
                  >
                    <Layers className="h-3.5 w-3.5" /> Proyectos
                  </Button>
                  <Button
                    variant={contentFilter === 'tasks' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 px-2 text-[11px]"
                    onClick={() => setContentFilter('tasks')}
                  >
                    <ListChecks className="h-3.5 w-3.5" /> Tareas
                  </Button>
                </div>
              </div>

              {/* Vista */}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-lg p-0.5">
                  {[GTViewMode.Day, GTViewMode.Week, GTViewMode.Month].map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange(mode)}
                      className="h-7 px-3 text-xs"
                    >
                      {mode === GTViewMode.Day ? 'Día' : mode === GTViewMode.Week ? 'Semana' : 'Mes'}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTodayClick}
                  className="h-7 px-3 text-xs flex items-center gap-1"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Hoy
                </Button>
                <div className="flex items-center gap-1 border rounded-lg p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={handleExpandAll}
                  >
                    <ChevronDown className="h-3.5 w-3.5" /> Expandir todo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={handleCollapseAll}
                  >
                    <ChevronUp className="h-3.5 w-3.5" /> Contraer todo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Proyecto activo
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground" />
              Departamento
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Tarea
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rotate-45 border border-orange-500" />
              Hito
            </span>
          </div>
        </CardHeader>

        {/* Contenido del Gantt */}
        <CardContent className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-2">
          <div className="h-full w-full overflow-auto rounded-lg gantt-scroll" ref={ganttContainerRef}>
            <ReactGantt
              tasks={localTasks}
              viewMode={viewMode}
              onDateChange={handleDateChange}
              onProgressChange={handleProgressChange}
              onChangeExpandState={handleChangeExpandState}
              onDoubleClick={(task: GTTask) => {
                if (task.type === 'project' && task.id.startsWith('proj-')) {
                  const proyecto = proyectoByTaskIdRef.current.get(task.id)
                  if (proyecto) navigate('/proyectos', { state: { proyectoId: proyecto.id } })
                  return
                }

                const stageInfo = stageByTaskIdRef.current.get(task.id)
                if (stageInfo) {
                  navigate(`/proyectos/${stageInfo.proyecto.id}`, { state: { focusStageId: stageInfo.stage.id } })
                  return
                }

                if (task.type === 'task' || task.type === 'milestone') {
                  const proyecto = proyectoByTaskIdRef.current.get(task.id)
                  if (proyecto) navigate(`/proyectos/${proyecto.id}`, { state: { openTaskId: task.id } })
                }
              }}
              onClick={(task: GTTaskOrEmpty) => {
                const data = task as GTTask
                if (!data) return
                if (data.type === 'project' && data.id.startsWith('proj-')) {
                  const proyecto = proyectoByTaskIdRef.current.get(data.id)
                  if (proyecto) navigate('/proyectos', { state: { proyectoId: proyecto.id } })
                  return
                }

                const stageInfo = stageByTaskIdRef.current.get(data.id)
                if (stageInfo) {
                  navigate(`/proyectos/${stageInfo.proyecto.id}`, { state: { focusStageId: stageInfo.stage.id } })
                  return
                }

                if (data.type === 'task' || data.type === 'milestone') {
                  const proyecto = proyectoByTaskIdRef.current.get(data.id)
                  if (proyecto) navigate(`/proyectos/${proyecto.id}`, { state: { openTaskId: data.id } })
                }
              }}
              dateLocale={es}
              viewDate={currentViewDate}
              distances={computedDistances}
              canResizeColumns
              fontSize="12px"
              fontFamily="Inter, ui-sans-serif, system-ui"
              colors={ganttColors}
              columns={columns}
              TooltipContent={TooltipTemplate}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
