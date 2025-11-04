"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Loader2,
  ArrowRight,
  DollarSign
} from "lucide-react"
import { useDashboardStore } from "@/store/dashboardStore"
import { cn } from "@/lib/utils"

/**
 * Panel de Control Ejecutivo
 * 
 * Problema resuelto: #4 - Nula visibilidad en tiempo real para gerencia
 * 
 * Funcionalidades:
 * - Vista de todos los proyectos activos
 * - % de completado en tiempo real
 * - Riesgos detectados por proyecto
 * - Presupuesto vs gastado
 * - Gráficos de progreso
 * - Drill-down a detalles
 */
export function ExecutivePanelCard() {
  const { 
    stats, 
    activeProjects, 
    isLoadingStats, 
    isLoadingProjects,
    fetchStats, 
    fetchActiveProjects 
  } = useDashboardStore()

  useEffect(() => {
    fetchStats()
    fetchActiveProjects()
  }, [])

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo) {
      case 'Crítico':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'Alto':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'Medio':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'Bajo':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getProgresoColor = (progreso: number) => {
    if (progreso >= 80) return 'bg-green-500'
    if (progreso >= 50) return 'bg-blue-500'
    if (progreso >= 25) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <BarChart3 className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-lg">Panel Ejecutivo</CardTitle>
              <CardDescription className="text-xs">Visibilidad total en tiempo real</CardDescription>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="gap-2">
            <span className="text-xs">Ver Todos</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
        {/* Métricas Clave */}
        <div className="grid grid-cols-2 gap-2">
          {isLoadingStats ? (
            <div className="col-span-2 flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <>
              <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Activos</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.proyectos.activos}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Avance</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(stats.proyectos.promedioAvance)}%
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">En Riesgo</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.proyectos.enRiesgo}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Completados</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.proyectos.completados}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Lista de Proyectos */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-foreground mb-2">Proyectos Activos</h3>
          
          {isLoadingProjects ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeProjects.length > 0 ? (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3">
                {activeProjects.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group space-y-2"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {proyecto.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {proyecto.descripcion}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs flex-shrink-0", getRiesgoColor(proyecto.riesgo))}
                      >
                        {proyecto.riesgo}
                      </Badge>
                    </div>

                    {/* Progreso */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium text-foreground">
                          {Math.round(proyecto.progreso)}%
                        </span>
                      </div>
                      <Progress 
                        value={proyecto.progreso} 
                        className="h-1.5"
                        indicatorClassName={getProgresoColor(proyecto.progreso)}
                      />
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {proyecto.tareas.completadas}/{proyecto.tareas.total}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {Math.round(proyecto.presupuesto.porcentaje)}%
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {proyecto.equipo.activos}/{proyecto.equipo.total}
                      </span>
                    </div>

                    {/* Fechas */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(proyecto.fechaInicio).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                        {' → '}
                        {new Date(proyecto.fechaFin).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No hay proyectos activos</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crea un nuevo proyecto para comenzar
              </p>
            </div>
          )}
        </div>

        {/* Resumen de Salud */}
        {stats && stats.proyectos.activos > 0 && (
          <div className="p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  stats.proyectos.enRiesgo === 0 ? "bg-green-500" :
                  stats.proyectos.enRiesgo <= 2 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span className="text-xs font-medium text-foreground">
                  Estado General
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {stats.proyectos.enRiesgo === 0 ? "Saludable" :
                 stats.proyectos.enRiesgo <= 2 ? "Atención Requerida" : "Crítico"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
