"use client"

import { useEffect, useState, useRef } from "react"
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
  Users,
  Sparkles,
  TrendingUp,
  Loader2,
  Target,
  Clock
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
  isToday
} from "date-fns"
import { es } from "date-fns/locale"

/**
 * Cronograma Vivo - Timeline Maestro V2
 * 
 * Versión optimizada para mostrar 15+ proyectos simultáneamente
 * con diseño compacto, fechas precisas y responsive completo
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
  const [hoveredProyecto, setHoveredProyecto] = useState<string | null>(null)
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoTimeline | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchTimelineData()
  }, [])

  // Calcular rango de fechas visible optimizado
  const getRangoFechas = () => {
    const hoy = new Date()
    let inicio: Date
    let fin: Date

    switch (vistaZoom) {
      case 'semanal':
        inicio = addDays(startOfWeek(hoy, { locale: es }), -7)
        fin = addDays(endOfWeek(hoy, { locale: es }), 21)
        break
      case 'mensual':
        inicio = addDays(startOfMonth(hoy), -15)
        fin = addDays(endOfMonth(hoy), 45)
        break
      case 'trimestral':
        inicio = addDays(startOfMonth(hoy), -30)
        fin = addDays(endOfMonth(hoy), 120)
        break
      default:
        inicio = addDays(hoy, -15)
        fin = addDays(hoy, 45)
    }

    return { inicio, fin }
  }

  // Generar marcadores de fecha precisos
  const generarMarcadoresFecha = () => {
    const { inicio, fin } = getRangoFechas()
    const marcadores: { fecha: Date; label: string; posicion: number }[] = []
    const totalDias = differenceInDays(fin, inicio)

    switch (vistaZoom) {
      case 'semanal':
        // Cada día
        const dias = eachDayOfInterval({ start: inicio, end: fin })
        dias.forEach((dia) => {
          const diasDesdeInicio = differenceInDays(dia, inicio)
          marcadores.push({
            fecha: dia,
            label: format(dia, 'd MMM', { locale: es }),
            posicion: (diasDesdeInicio / totalDias) * 100
          })
        })
        break
      case 'mensual':
        // Cada semana
        const semanas = eachWeekOfInterval({ start: inicio, end: fin }, { locale: es })
        semanas.forEach((semana) => {
          const diasDesdeInicio = differenceInDays(semana, inicio)
          marcadores.push({
            fecha: semana,
            label: format(semana, 'd MMM', { locale: es }),
            posicion: (diasDesdeInicio / totalDias) * 100
          })
        })
        break
      case 'trimestral':
        // Cada mes
        const meses = eachMonthOfInterval({ start: inicio, end: fin })
        meses.forEach((mes) => {
          const diasDesdeInicio = differenceInDays(mes, inicio)
          marcadores.push({
            fecha: mes,
            label: format(mes, 'MMM yyyy', { locale: es }),
            posicion: (diasDesdeInicio / totalDias) * 100
          })
        })
        break
    }

    return marcadores
  }

  const marcadoresFecha = generarMarcadoresFecha()
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

  // Obtener color según salud
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
      {/* Header Compacto */}
      <CardHeader className="pb-2 px-3 sm:px-4 md:px-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Cronograma Vivo</h3>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {timelineData.proyectos.length} proyectos activos
              </p>
            </div>
          </div>

          {/* Controles de Zoom - Responsive */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            <Button
              variant={vistaZoom === 'semanal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVistaZoom('semanal')}
              className="h-6 px-2 text-[10px] sm:text-xs"
            >
              Semanal
            </Button>
            <Button
              variant={vistaZoom === 'mensual' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVistaZoom('mensual')}
              className="h-6 px-2 text-[10px] sm:text-xs"
            >
              Mensual
            </Button>
            <Button
              variant={vistaZoom === 'trimestral' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVistaZoom('trimestral')}
              className="h-6 px-2 text-[10px] sm:text-xs"
            >
              Trimestral
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 px-3 sm:px-4 md:px-6 pb-3 min-h-0">
        {/* Eje Temporal con Marcadores Precisos */}
        <div className="relative h-8 border-b flex-shrink-0">
          {/* Marcadores de Fecha */}
          <div className="absolute inset-0 flex items-end pb-1">
            {marcadoresFecha.map((marcador, idx) => (
              <div
                key={idx}
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${marcador.posicion}%`, transform: 'translateX(-50%)' }}
              >
                <div className="h-2 w-px bg-border" />
                <span className={cn(
                  "text-[9px] mt-0.5 whitespace-nowrap",
                  isToday(marcador.fecha) ? "font-bold text-primary" : "text-muted-foreground"
                )}>
                  {marcador.label}
                </span>
              </div>
            ))}
          </div>

          {/* Línea HOY */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
            style={{ left: `${posicionHoy}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* Lista de Proyectos - Diseño Ultra Compacto */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-1.5 pr-2">
            {timelineData.proyectos.map((proyecto) => {
              const { left, width } = calcularPosicionProyecto(proyecto)
              const isHovered = hoveredProyecto === proyecto.id

              return (
                <TooltipProvider key={proyecto.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative p-2 rounded-md border bg-card transition-all cursor-pointer hover:shadow-md",
                          isHovered && "shadow-lg border-primary/50 bg-accent/50 scale-[1.02]"
                        )}
                        onMouseEnter={() => setHoveredProyecto(proyecto.id)}
                        onMouseLeave={() => setHoveredProyecto(null)}
                        onClick={() => {
                          setSelectedProyecto(proyecto)
                          setShowDetailModal(true)
                        }}
                      >
                        {/* Header Compacto */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <h4 className="text-xs font-medium text-foreground line-clamp-1">
                              {proyecto.nombre}
                            </h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {proyecto.progreso}%
                            </span>
                          </div>

                          {/* Badges Compactos */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {proyecto.alertas.length > 0 && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] bg-orange-500/10 text-orange-600 border-orange-500/20">
                                <AlertTriangle className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                            {proyecto.sugerenciasIA.length > 0 && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                                <Sparkles className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Barra de Timeline Compacta */}
                        <div className="relative h-5 bg-muted/50 rounded-full overflow-hidden mb-1">
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

                          {/* Hitos en la barra */}
                          {proyecto.hitos.map((hito, idx) => {
                            const hitoDate = new Date(hito.fecha)
                            const diasHito = differenceInDays(hitoDate, fechaInicio)
                            const posHito = (diasHito / totalDias) * 100
                            
                            if (posHito < 0 || posHito > 100) return null

                            return (
                              <div
                                key={idx}
                                className="absolute top-1/2 -translate-y-1/2 z-10"
                                style={{ left: `${posHito}%` }}
                              >
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full border-2 border-background",
                                  hito.completado ? "bg-green-500" : "bg-yellow-500"
                                )} />
                              </div>
                            )
                          })}
                        </div>

                        {/* Info Compacta */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {format(new Date(proyecto.fechaInicio), 'd MMM', { locale: es })} - {format(new Date(proyecto.fechaFin), 'd MMM', { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {proyecto.tareas.completadas}/{proyecto.tareas.total}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5" />
                              {proyecto.equipo.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>

                    {/* Tooltip con Info Extendida */}
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-sm">{proyecto.nombre}</p>
                          <p className="text-xs text-muted-foreground">{proyecto.descripcion}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Progreso</p>
                            <p className="font-medium">{proyecto.progreso}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Salud</p>
                            <p className="font-medium capitalize">{proyecto.salud}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Presupuesto</p>
                            <p className="font-medium">{proyecto.presupuesto.porcentaje}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Equipo</p>
                            <p className="font-medium">{proyecto.equipo.length} miembros</p>
                          </div>
                        </div>
                        {proyecto.alertas.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-orange-600">
                              {proyecto.alertas.length} alerta(s) activa(s)
                            </p>
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

        {/* Resumen Global Compacto */}
        <div className="flex-shrink-0 p-2 rounded-lg border bg-muted/30">
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
            </div>

            {timelineData.sugerenciasGlobales.length > 0 && (
              <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" />
                {timelineData.sugerenciasGlobales.length} Sugerencias IA
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Modal de Detalle de Proyecto */}
      <ProjectDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        proyecto={selectedProyecto}
      />
    </Card>
  )
}
