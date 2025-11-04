"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Calendar,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Target
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import type { ProyectoTimeline } from "@/services/timelineService"
import { cn } from "@/lib/utils"
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Cronograma Vivo - Timeline Maestro
 * 
 * El corazón del dashboard. Muestra todos los proyectos en una línea temporal
 * continua con toda la información crítica integrada.
 */
export function LiveTimelineWidget() {
  const { 
    timelineData, 
    vistaZoom,
    isLoadingTimeline,
    fetchTimelineData,
    setVistaZoom
  } = useTimelineStore()

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hoveredProyecto, setHoveredProyecto] = useState<string | null>(null)

  useEffect(() => {
    fetchTimelineData()
  }, [])

  // Calcular rango de fechas visible
  const getRangoFechas = () => {
    const hoy = new Date()
    let inicio: Date
    let fin: Date

    switch (vistaZoom) {
      case 'semanal':
        inicio = addDays(startOfWeek(hoy, { locale: es }), -14) // 2 semanas antes
        fin = addDays(endOfWeek(hoy, { locale: es }), 28) // 4 semanas después
        break
      case 'mensual':
        inicio = addDays(startOfMonth(hoy), -30) // 1 mes antes
        fin = addDays(endOfMonth(hoy), 60) // 2 meses después
        break
      case 'trimestral':
        inicio = addDays(hoy, -90) // 3 meses antes
        fin = addDays(hoy, 180) // 6 meses después
        break
      default:
        inicio = addDays(hoy, -30)
        fin = addDays(hoy, 60)
    }

    return { inicio, fin }
  }

  const { inicio: fechaInicio, fin: fechaFin } = getRangoFechas()
  const totalDias = differenceInDays(fechaFin, fechaInicio)
  const hoy = new Date()
  const diasDesdeInicio = differenceInDays(hoy, fechaInicio)
  const posicionHoy = (diasDesdeInicio / totalDias) * 100

  // Calcular posición de un proyecto en el timeline
  const calcularPosicionProyecto = (proyecto: ProyectoTimeline) => {
    const inicioProyecto = new Date(proyecto.fechaInicio)
    const finProyecto = new Date(proyecto.fechaFin)
    
    const diasDesdeInicioTimeline = differenceInDays(inicioProyecto, fechaInicio)
    const duracionProyecto = differenceInDays(finProyecto, inicioProyecto)
    
    const left = Math.max(0, (diasDesdeInicioTimeline / totalDias) * 100)
    const width = Math.min(100 - left, (duracionProyecto / totalDias) * 100)
    
    return { left, width }
  }

  // Obtener color según salud del proyecto
  const getSaludColor = (salud: string) => {
    switch (salud) {
      case 'saludable':
        return 'from-green-500 to-emerald-500'
      case 'atencion':
        return 'from-yellow-500 to-orange-500'
      case 'critico':
        return 'from-red-500 to-rose-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  // Obtener badge de severidad
  const getSeveridadBadge = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'alta':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'media':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'baja':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (isLoadingTimeline) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando cronograma...</p>
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Cronograma Vivo</h3>
              <p className="text-xs text-muted-foreground">
                Timeline maestro con visión completa
              </p>
            </div>
          </div>

          {/* Controles de Zoom */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={vistaZoom === 'semanal' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setVistaZoom('semanal')}
                className="h-7 px-2 text-xs"
              >
                Semanal
              </Button>
              <Button
                variant={vistaZoom === 'mensual' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setVistaZoom('mensual')}
                className="h-7 px-2 text-xs"
              >
                Mensual
              </Button>
              <Button
                variant={vistaZoom === 'trimestral' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setVistaZoom('trimestral')}
                className="h-7 px-2 text-xs"
              >
                Trimestral
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4 min-h-0">
        {/* Timeline Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Eje Temporal */}
          <div className="relative h-12 border-b mb-4">
            {/* Marcadores de tiempo */}
            <div className="absolute inset-0 flex items-center">
              <div className="flex-1 flex justify-between px-4 text-xs text-muted-foreground">
                <span>Pasado</span>
                <span className="font-medium text-foreground">HOY</span>
                <span>Futuro</span>
              </div>
            </div>

            {/* Línea HOY */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${posicionHoy}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Lista de Proyectos */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-3 pr-4">
              {timelineData.proyectos.map((proyecto) => {
                const { left, width } = calcularPosicionProyecto(proyecto)
                const isHovered = hoveredProyecto === proyecto.id

                return (
                  <TooltipProvider key={proyecto.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "relative p-3 rounded-lg border bg-card transition-all cursor-pointer",
                            isHovered && "shadow-lg border-primary/50 bg-accent/50"
                          )}
                          onMouseEnter={() => setHoveredProyecto(proyecto.id)}
                          onMouseLeave={() => setHoveredProyecto(null)}
                        >
                          {/* Header del Proyecto */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                {proyecto.nombre}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {proyecto.descripcion}
                              </p>
                            </div>

                            {/* Badges de Estado */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {proyecto.alertas.length > 0 && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {proyecto.alertas.length}
                                </Badge>
                              )}
                              {proyecto.sugerenciasIA.length > 0 && (
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {proyecto.sugerenciasIA.length}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Barra de Timeline */}
                          <div className="relative h-8 bg-muted/50 rounded-full overflow-hidden mb-2">
                            {/* Barra de Progreso */}
                            <div
                              className={cn(
                                "absolute top-0 bottom-0 bg-gradient-to-r transition-all",
                                getSaludColor(proyecto.salud)
                              )}
                              style={{ 
                                left: `${left}%`, 
                                width: `${width}%`,
                                opacity: 0.8
                              }}
                            >
                              {/* Progreso dentro de la barra */}
                              <div
                                className="absolute top-0 bottom-0 left-0 bg-white/20"
                                style={{ width: `${proyecto.progreso}%` }}
                              />
                            </div>

                            {/* Hitos */}
                            {proyecto.hitos.map((hito, idx) => {
                              const hitoFecha = new Date(hito.fecha)
                              const diasDesdeInicioHito = differenceInDays(hitoFecha, fechaInicio)
                              const posicionHito = (diasDesdeInicioHito / totalDias) * 100

                              return (
                                <div
                                  key={hito.id}
                                  className="absolute top-1/2 -translate-y-1/2 z-10"
                                  style={{ left: `${posicionHito}%` }}
                                >
                                  <div className={cn(
                                    "w-3 h-3 rounded-full border-2 border-background",
                                    hito.completado ? "bg-green-500" : "bg-gray-400"
                                  )} />
                                </div>
                              )
                            })}

                            {/* Indicador HOY en la barra */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-primary/50 z-5"
                              style={{ left: `${posicionHoy}%` }}
                            />
                          </div>

                          {/* Información Compacta */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {Math.round(proyecto.progreso)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {proyecto.tareas.completadas}/{proyecto.tareas.total}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {Math.round(proyecto.presupuesto.porcentaje)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {proyecto.equipo.length}
                            </span>
                            {proyecto.riesgos.length > 0 && (
                              <Badge variant="outline" className={cn("text-xs", getSeveridadBadge(proyecto.riesgos[0].impacto))}>
                                Riesgo {proyecto.riesgos[0].impacto}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm">
                        <div className="space-y-2">
                          <div>
                            <p className="font-semibold">{proyecto.nombre}</p>
                            <p className="text-xs text-muted-foreground">{proyecto.descripcion}</p>
                          </div>
                          <div className="text-xs space-y-1">
                            <p><strong>Inicio:</strong> {format(new Date(proyecto.fechaInicio), 'dd MMM yyyy', { locale: es })}</p>
                            <p><strong>Fin:</strong> {format(new Date(proyecto.fechaFin), 'dd MMM yyyy', { locale: es })}</p>
                            <p><strong>Progreso:</strong> {Math.round(proyecto.progreso)}%</p>
                            <p><strong>Responsable:</strong> {proyecto.responsable.nombre}</p>
                          </div>
                          {proyecto.alertas.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold mb-1">Alertas:</p>
                              {proyecto.alertas.slice(0, 2).map((alerta) => (
                                <p key={alerta.id} className="text-xs text-orange-600">• {alerta.mensaje}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Resumen Global */}
        <div className="flex-shrink-0 p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                <strong>{timelineData.resumen.activos}</strong> Activos
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <strong>{Math.round(timelineData.resumen.promedioProgreso)}%</strong> Promedio
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <strong>{timelineData.resumen.enRiesgo}</strong> En Riesgo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <strong>{timelineData.resumen.completadosMes}</strong> Completados (mes)
              </span>
            </div>

            {timelineData.sugerenciasGlobales.length > 0 && (
              <Button size="sm" variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Ver {timelineData.sugerenciasGlobales.length} Sugerencias IA
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
