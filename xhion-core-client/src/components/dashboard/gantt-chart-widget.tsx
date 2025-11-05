
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Loader2,
  Target,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Maximize2,
  Minimize2
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import type { ProyectoTimeline } from "@/services/timelineService"
import { ProjectDetailModal } from "./project-detail-modal"
import { cn } from "@/lib/utils"
import { 
  format, 
  differenceInDays, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isToday,
  isWeekend,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  subDays
} from "date-fns"
import { es } from "date-fns/locale"

/**
 * Diagrama de Gantt Profesional - Nivel Empresarial
 * 
 * Funcionalidades avanzadas:
 * - Zoom con Ctrl/Cmd + Scroll (0.25x - 4x)
 * - Navegación temporal con flechas
 * - Scroll horizontal infinito
 * - Drag to scroll
 * - Expand/collapse jerárquico
 * - Tooltips avanzados
 * - Modo fullscreen
 * - Atajos de teclado
 * 
 * Visualización profesional de proyectos con:
 * - Barras de progreso interactivas
 * - Dependencias visuales
 * - Hitos marcados
 * - Zoom dinámico
 * - Drag & drop (preparado)
 * - Tooltips informativos
 */
export function GanttChartWidget() {
  const { 
    timelineData, 
    vistaZoom,
    isLoadingTimeline,
    fetchTimelineData,
    setVistaZoom
  } = useTimelineStore()

  // Estados básicos
  const [hoveredProyecto, setHoveredProyecto] = useState<string | null>(null)
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoTimeline | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [expandedProyectos, setExpandedProyectos] = useState<Set<string>>(new Set())
  
  // Estados profesionales
  const [zoomLevel, setZoomLevel] = useState(1) // 0.25 - 4
  const [fechaBase, setFechaBase] = useState(new Date()) // Fecha central del timeline
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  
  // Refs
  const ganttScrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTimelineData()
  }, [])

  // Navegación temporal - Declarada antes de los useEffect que la usan
  const navegarTiempo = (direccion: 'prev' | 'next' | 'today' | 'start' | 'end') => {
    switch (direccion) {
      case 'prev':
        if (vistaZoom === 'semanal') {
          setFechaBase(subWeeks(fechaBase, 1))
        } else if (vistaZoom === 'mensual') {
          setFechaBase(subMonths(fechaBase, 1))
        } else {
          setFechaBase(subMonths(fechaBase, 3))
        }
        break
      case 'next':
        if (vistaZoom === 'semanal') {
          setFechaBase(addWeeks(fechaBase, 1))
        } else if (vistaZoom === 'mensual') {
          setFechaBase(addMonths(fechaBase, 1))
        } else {
          setFechaBase(addMonths(fechaBase, 3))
        }
        break
      case 'today':
        setFechaBase(new Date())
        break
      case 'start':
        if (vistaZoom === 'semanal') {
          setFechaBase(subWeeks(fechaBase, 4))
        } else if (vistaZoom === 'mensual') {
          setFechaBase(subMonths(fechaBase, 3))
        } else {
          setFechaBase(subMonths(fechaBase, 6))
        }
        break
      case 'end':
        if (vistaZoom === 'semanal') {
          setFechaBase(addWeeks(fechaBase, 4))
        } else if (vistaZoom === 'mensual') {
          setFechaBase(addMonths(fechaBase, 3))
        } else {
          setFechaBase(addMonths(fechaBase, 6))
        }
        break
    }
  }

  // Zoom con Ctrl/Cmd + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoomLevel((prev) => Math.max(0.25, Math.min(4, prev + delta)))
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navegación con flechas
      if (e.key === 'ArrowLeft' && !e.shiftKey) {
        navegarTiempo('prev')
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        navegarTiempo('next')
      } else if (e.key === 'ArrowLeft' && e.shiftKey) {
        navegarTiempo('start')
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        navegarTiempo('end')
      }
      // Zoom con +/-
      else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(4, prev + 0.25))
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel((prev) => Math.max(0.25, prev - 0.25))
      }
      // Reset zoom con 0
      else if (e.key === '0') {
        setZoomLevel(1)
      }
      // Hoy con H
      else if (e.key === 'h' || e.key === 'H') {
        navegarTiempo('today')
      }
      // Fullscreen con F
      else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fechaBase, isFullscreen])

  // Scroll infinito - Detectar cuando llega a los bordes
  useEffect(() => {
    const scrollContainer = ganttScrollRef.current
    if (!scrollContainer) return

    let scrollTimeout: NodeJS.Timeout | null = null
    let isLoading = false

    const handleScroll = () => {
      if (isLoading || isDragging) return

      // Debounce para evitar múltiples llamadas
      if (scrollTimeout) clearTimeout(scrollTimeout)

      scrollTimeout = setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
        const scrollableWidth = scrollWidth - clientWidth
        
        // Si está muy cerca del inicio (primeros 100px)
        if (scrollLeft < 100 && scrollableWidth > 0) {
          isLoading = true
          const prevScrollWidth = scrollWidth
          navegarTiempo('prev')
          
          // Ajustar scroll después de cargar
          requestAnimationFrame(() => {
            const newScrollWidth = scrollContainer.scrollWidth
            const addedWidth = newScrollWidth - prevScrollWidth
            scrollContainer.scrollLeft = scrollLeft + addedWidth
            isLoading = false
          })
        }
        // Si está muy cerca del final (últimos 100px)
        else if (scrollLeft > scrollableWidth - 100 && scrollableWidth > 0) {
          isLoading = true
          navegarTiempo('next')
          requestAnimationFrame(() => {
            isLoading = false
          })
        }
      }, 150) // Debounce de 150ms
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [isDragging, navegarTiempo])

  // Calcular rango de fechas visible basado en fechaBase
  const getRangoFechas = useCallback(() => {
    let inicio: Date
    let fin: Date

    switch (vistaZoom) {
      case 'semanal':
        inicio = subWeeks(startOfWeek(fechaBase, { locale: es }), 2)
        fin = addWeeks(endOfWeek(fechaBase, { locale: es }), 4)
        break
      case 'mensual':
        inicio = subDays(startOfMonth(fechaBase), 15)
        fin = addDays(endOfMonth(fechaBase), 60)
        break
      case 'trimestral':
        inicio = subMonths(startOfMonth(fechaBase), 2)
        fin = addMonths(endOfMonth(fechaBase), 6)
        break
      default:
        inicio = subDays(fechaBase, 30)
        fin = addDays(fechaBase, 60)
    }

    return { inicio, fin }
  }, [vistaZoom, fechaBase])

  // Generar columnas de tiempo para el Gantt
  const generarColumnasGantt = useMemo(() => {
    const { inicio, fin } = getRangoFechas()
    const columnas: { fecha: Date; label: string; tipo: 'dia' | 'semana' | 'mes'; isHoy: boolean; isWeekend: boolean }[] = []

    switch (vistaZoom) {
      case 'semanal':
        // Cada día
        const dias = eachDayOfInterval({ start: inicio, end: fin })
        dias.forEach((dia) => {
          columnas.push({
            fecha: dia,
            label: format(dia, 'EEE d', { locale: es }),
            tipo: 'dia',
            isHoy: isToday(dia),
            isWeekend: isWeekend(dia)
          })
        })
        break
      case 'mensual':
        // Cada semana
        const semanas = eachWeekOfInterval({ start: inicio, end: fin }, { locale: es })
        semanas.forEach((semana) => {
          columnas.push({
            fecha: semana,
            label: format(semana, 'd MMM', { locale: es }),
            tipo: 'semana',
            isHoy: false,
            isWeekend: false
          })
        })
        break
      case 'trimestral':
        // Cada mes
        const meses = eachMonthOfInterval({ start: inicio, end: fin })
        meses.forEach((mes) => {
          columnas.push({
            fecha: mes,
            label: format(mes, 'MMM', { locale: es }),
            tipo: 'mes',
            isHoy: false,
            isWeekend: false
          })
        })
        break
    }

    return columnas
  }, [vistaZoom, fechaBase, getRangoFechas])

  const { inicio: fechaInicio, fin: fechaFin } = getRangoFechas()
  const totalDias = differenceInDays(fechaFin, fechaInicio)
  const hoy = new Date()
  const diasDesdeInicio = differenceInDays(hoy, fechaInicio)
  const posicionHoy = (diasDesdeInicio / totalDias) * 100

  // Calcular posición de un proyecto en el Gantt
  const calcularPosicionProyecto = (proyecto: ProyectoTimeline) => {
    const inicioProyecto = new Date(proyecto.fechaInicio)
    const finProyecto = new Date(proyecto.fechaFin)
    
    const diasDesdeInicioTimeline = differenceInDays(inicioProyecto, fechaInicio)
    const duracionProyecto = differenceInDays(finProyecto, inicioProyecto)
    
    const left = Math.max(0, (diasDesdeInicioTimeline / totalDias) * 100)
    const width = Math.min(100 - left, (duracionProyecto / totalDias) * 100)
    
    return { left, width, duracionDias: duracionProyecto }
  }

  // Obtener color según salud
  const getSaludColor = (salud: string) => {
    switch (salud) {
      case 'saludable':
        return 'bg-green-500'
      case 'atencion':
        return 'bg-yellow-500'
      case 'critico':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Toggle expand/collapse proyecto
  const toggleProyecto = (proyectoId: string) => {
    const newExpanded = new Set(expandedProyectos)
    if (newExpanded.has(proyectoId)) {
      newExpanded.delete(proyectoId)
    } else {
      newExpanded.add(proyectoId)
    }
    setExpandedProyectos(newExpanded)
  }

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!ganttScrollRef.current) return
    setIsDragging(true)
    setDragStart({
      x: e.pageX - ganttScrollRef.current.offsetLeft,
      scrollLeft: ganttScrollRef.current.scrollLeft
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ganttScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - ganttScrollRef.current.offsetLeft
    const walk = (x - dragStart.x) * 2
    ganttScrollRef.current.scrollLeft = dragStart.scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Ancho de columna según zoom
  const getColumnWidth = () => {
    const baseWidth = vistaZoom === 'semanal' ? 60 : vistaZoom === 'mensual' ? 80 : 100
    return baseWidth * zoomLevel
  }

  const columnWidth = getColumnWidth()

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
    <Card className={cn("gantt-chart-widget flex flex-col", isFullscreen ? "fixed inset-0 z-50" : "h-full")} ref={containerRef}>
      {/* Header Profesional */}
      <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 flex-shrink-0 border-b">
        <div className="flex flex-col gap-2">
          {/* Fila 1: Título y Fullscreen */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Diagrama de Gantt Profesional</h3>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  {timelineData.proyectos.length} proyectos • {format(fechaBase, 'MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 p-0"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Fila 2: Navegación y Controles */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Navegación Temporal */}
            <div className="flex items-center gap-1">
              {/* Móvil: Solo flechas */}
              <div className="flex items-center gap-1 md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarTiempo('prev')}
                  className="h-7 w-7 p-0"
                  title="Anterior"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarTiempo('today')}
                  className="h-7 px-2 text-[10px]"
                  title="Hoy (H)"
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarTiempo('next')}
                  className="h-7 w-7 p-0"
                  title="Siguiente"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Desktop: Navegación completa */}
              <div className="hidden md:flex items-center gap-1 border rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navegarTiempo('start')}
                  className="h-6 w-6 p-0"
                  title="Inicio (Shift + ←)"
                >
                  <ChevronsLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navegarTiempo('prev')}
                  className="h-6 w-6 p-0"
                  title="Anterior (←)"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navegarTiempo('today')}
                  className="h-6 px-2 text-[10px]"
                  title="Hoy (H)"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Hoy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navegarTiempo('next')}
                  className="h-6 w-6 p-0"
                  title="Siguiente (→)"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navegarTiempo('end')}
                  className="h-6 w-6 p-0"
                  title="Final (Shift + →)"
                >
                  <ChevronsRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Controles de Zoom y Vista */}
            <div className="flex items-center gap-2">
              {/* Zoom Level */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
                  disabled={zoomLevel <= 0.25}
                  className="h-6 w-6 p-0"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-[10px] px-1 min-w-[35px] text-center font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.25))}
                  disabled={zoomLevel >= 4}
                  className="h-6 w-6 p-0"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                  className="h-6 px-2 text-[10px]"
                  title="Reset (0)"
                >
                  100%
                </Button>
              </div>

              {/* Vista */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5">
                <Button
                  variant={vistaZoom === 'semanal' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaZoom('semanal')}
                  className="h-6 px-2 text-[10px] sm:text-xs"
                >
                  Semana
                </Button>
                <Button
                  variant={vistaZoom === 'mensual' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaZoom('mensual')}
                  className="h-6 px-2 text-[10px] sm:text-xs"
                >
                  Mes
                </Button>
                <Button
                  variant={vistaZoom === 'trimestral' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaZoom('trimestral')}
                  className="h-6 px-2 text-[10px] sm:text-xs"
                >
                  Trimestre
                </Button>
              </div>
            </div>
          </div>

          {/* Fila 3: Ayuda de atajos (solo desktop) */}
          <div className="hidden lg:block text-[9px] text-muted-foreground">
            <span className="mr-3">💡 Atajos: </span>
            <span className="mr-2">← → Navegar</span>
            <span className="mr-2">Shift + ← → Saltar</span>
            <span className="mr-2">Ctrl/Cmd + Scroll Zoom</span>
            <span className="mr-2">+ - Zoom</span>
            <span className="mr-2">H Hoy</span>
            <span>F Fullscreen</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
        <div className="h-full flex">
          {/* Columna de Proyectos (Fija) */}
          <div className="w-64 flex-shrink-0 border-r bg-muted/30">
            {/* Header de columna */}
            <div className="h-10 border-b bg-background flex items-center px-3 sticky top-0 z-10">
              <span className="text-xs font-semibold text-foreground">Proyectos</span>
            </div>

            {/* Lista de proyectos */}
            <ScrollArea className="h-[calc(100%-2.5rem)]">
              <div className="p-2 space-y-1">
                {timelineData.proyectos.map((proyecto) => {
                  const isExpanded = expandedProyectos.has(proyecto.id)
                  const isHovered = hoveredProyecto === proyecto.id

                  return (
                    <div key={proyecto.id}>
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                          isHovered && "bg-accent"
                        )}
                        onMouseEnter={() => setHoveredProyecto(proyecto.id)}
                        onMouseLeave={() => setHoveredProyecto(null)}
                        onClick={() => toggleProyecto(proyecto.id)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleProyecto(proyecto.id)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {proyecto.nombre}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {proyecto.progreso}%
                            </span>
                            {proyecto.alertas.length > 0 && (
                              <Badge variant="outline" className="h-3 px-1 text-[8px] bg-orange-500/10 text-orange-600 border-orange-500/20">
                                {proyecto.alertas.length}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getSaludColor(proyecto.salud)
                        )} />
                      </div>

                      {/* Hitos expandidos */}
                      {isExpanded && proyecto.hitos.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {proyecto.hitos.map((hito, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-1.5 rounded-sm bg-background/50"
                            >
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                hito.completado ? "bg-green-500" : "bg-yellow-500"
                              )} />
                              <span className="text-[10px] text-muted-foreground line-clamp-1">
                                {hito.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Área del Gantt (Scrollable con Drag) */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={ganttScrollRef}
              className={cn(
                "h-full overflow-x-auto overflow-y-hidden gantt-scroll-area",
                isDragging && "cursor-grabbing"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                /* Scrollbar personalizado para tema oscuro/claro */
                .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar {
                  height: 14px;
                }
                
                .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.05);
                  border-radius: 8px;
                  margin: 0 8px;
                }
                
                .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 8px;
                  border: 3px solid transparent;
                  background-clip: padding-box;
                  transition: all 0.2s ease;
                }
                
                .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.35);
                  background-clip: padding-box;
                }
                
                .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb:active {
                  background: hsl(var(--primary));
                  background-clip: padding-box;
                }
                
                /* Tema oscuro */
                .dark .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                }
                
                .dark .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.15);
                }
                
                .dark .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.25);
                }
                
                .dark .gantt-chart-widget .gantt-scroll-area::-webkit-scrollbar-thumb:active {
                  background: hsl(var(--primary));
                }
                
                /* Firefox */
                .gantt-chart-widget .gantt-scroll-area {
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
                }
                
                .dark .gantt-chart-widget .gantt-scroll-area {
                  scrollbar-color: rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.05);
                }
              ` }} />
              <div style={{ minWidth: `${columnWidth * generarColumnasGantt.length}px` }}>
                {/* Header de tiempo */}
                <div className="h-10 border-b bg-background sticky top-0 z-10 flex">
                  {generarColumnasGantt.map((columna, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "border-r flex items-center justify-center",
                        columna.isHoy && "bg-primary/10 border-primary/30",
                        columna.isWeekend && "bg-muted/50"
                      )}
                      style={{ width: `${columnWidth}px` }}
                    >
                      <span className={cn(
                        "text-[10px] font-medium",
                        columna.isHoy ? "text-primary font-bold" : "text-muted-foreground"
                      )}>
                        {columna.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid de fondo y barras */}
                <ScrollArea className="h-[calc(100%-2.5rem)]">
                  <div className="relative">
                    {/* Columnas de fondo */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {generarColumnasGantt.map((columna, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "border-r",
                            columna.isHoy && "bg-primary/5",
                            columna.isWeekend && "bg-muted/30"
                          )}
                          style={{ width: `${columnWidth}px` }}
                        />
                      ))}
                    </div>

                    {/* Línea HOY */}
                    {posicionHoy >= 0 && posicionHoy <= 100 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
                        style={{ left: `${posicionHoy}%` }}
                      />
                    )}

                    {/* Barras de proyectos */}
                    <div className="relative p-2 space-y-1">
                    {timelineData.proyectos.map((proyecto) => {
                      const { left, width, duracionDias } = calcularPosicionProyecto(proyecto)
                      const isHovered = hoveredProyecto === proyecto.id
                      const isExpanded = expandedProyectos.has(proyecto.id)

                      return (
                        <div key={proyecto.id}>
                          {/* Barra principal del proyecto */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="relative h-8 cursor-pointer"
                                  onMouseEnter={() => setHoveredProyecto(proyecto.id)}
                                  onMouseLeave={() => setHoveredProyecto(null)}
                                  onClick={() => {
                                    setSelectedProyecto(proyecto)
                                    setShowDetailModal(true)
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "absolute h-full rounded-md transition-all",
                                      getSaludColor(proyecto.salud),
                                      isHovered && "shadow-lg scale-105"
                                    )}
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      opacity: 0.9
                                    }}
                                  >
                                    {/* Progreso dentro de la barra */}
                                    <div
                                      className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-l-md"
                                      style={{ width: `${proyecto.progreso}%` }}
                                    />

                                    {/* Texto en la barra - Siempre visible con ellipsis */}
                                    <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                                      <span 
                                        className="text-[10px] font-medium text-white truncate whitespace-nowrap"
                                        style={{ 
                                          maxWidth: '100%',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden'
                                        }}
                                      >
                                        {proyecto.nombre} ({proyecto.progreso}%)
                                      </span>
                                    </div>

                                    {/* Hitos en la barra */}
                                    {proyecto.hitos.map((hito, idx) => {
                                      const hitoDate = new Date(hito.fecha)
                                      const diasHito = differenceInDays(hitoDate, fechaInicio)
                                      const posHito = ((diasHito / totalDias) * 100 - left) / (width / 100)
                                      
                                      if (posHito < 0 || posHito > 100) return null

                                      return (
                                        <div
                                          key={idx}
                                          className="absolute top-1/2 -translate-y-1/2 z-10"
                                          style={{ left: `${posHito}%` }}
                                        >
                                          <div className={cn(
                                            "w-2 h-2 rounded-full border-2 border-white shadow-sm",
                                            hito.completado ? "bg-green-400" : "bg-yellow-400"
                                          )} />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm">{proyecto.nombre}</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">Inicio</p>
                                      <p className="font-medium">{format(new Date(proyecto.fechaInicio), 'd MMM yyyy', { locale: es })}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Fin</p>
                                      <p className="font-medium">{format(new Date(proyecto.fechaFin), 'd MMM yyyy', { locale: es })}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Duración</p>
                                      <p className="font-medium">{duracionDias} días</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Progreso</p>
                                      <p className="font-medium">{proyecto.progreso}%</p>
                                    </div>
                                  </div>
                                  {proyecto.alertas.length > 0 && (
                                    <p className="text-xs text-orange-600 pt-1 border-t">
                                      ⚠️ {proyecto.alertas.length} alerta(s) activa(s)
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Hitos expandidos */}
                          {isExpanded && proyecto.hitos.length > 0 && (
                            <div className="space-y-1 mt-1">
                              {proyecto.hitos.map((hito, idx) => {
                                const hitoDate = new Date(hito.fecha)
                                const diasHito = differenceInDays(hitoDate, fechaInicio)
                                const posHito = (diasHito / totalDias) * 100

                                if (posHito < 0 || posHito > 100) return null

                                return (
                                  <div key={idx} className="relative h-4">
                                    <div
                                      className="absolute top-1/2 -translate-y-1/2"
                                      style={{ left: `${posHito}%` }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <div className={cn(
                                          "w-3 h-3 rounded-full border-2 border-background shadow-sm",
                                          hito.completado ? "bg-green-500" : "bg-yellow-500"
                                        )} />
                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                          {hito.nombre}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Resumen Global */}
      <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-2 border-t bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3 text-primary" />
              <strong>{timelineData.resumen.activos}</strong> Activos
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <strong>{Math.round(timelineData.resumen.promedioProgreso)}%</strong> Promedio
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-600" />
              <strong>{timelineData.resumen.enRiesgo}</strong> En Riesgo
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <strong>{timelineData.resumen.completadosMes}</strong> Completados (mes)
            </span>
          </div>

          {timelineData.sugerenciasGlobales.length > 0 && (
            <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" />
              {timelineData.sugerenciasGlobales.length} Sugerencias IA
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Proyecto */}
      <ProjectDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        proyecto={selectedProyecto}
      />
    </Card>
  )
}
