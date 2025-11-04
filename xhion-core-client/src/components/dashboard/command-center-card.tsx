"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Bell, 
  Zap, 
  Loader2,
  AlertCircle,
  TrendingUp,
  Target
} from "lucide-react"
import { useDashboardStore } from "@/store/dashboardStore"
import { cn } from "@/lib/utils"

/**
 * Centro de Comando Unificado
 * 
 * Problema resuelto: #1 - Flujo de trabajo fragmentado y descentralizado
 * 
 * Funcionalidades:
 * - Vista consolidada de todas las tareas del día
 * - Notificaciones en tiempo real
 * - Acciones rápidas (crear tarea, proyecto, comentario)
 * - Shortcuts a secciones críticas
 * - Estado de sincronización
 */
export function CommandCenterCard() {
  const { 
    stats, 
    todayTasks, 
    isLoadingStats, 
    isLoadingTasks,
    fetchStats, 
    fetchTodayTasks 
  } = useDashboardStore()

  useEffect(() => {
    fetchStats()
    fetchTodayTasks()
  }, [])

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Urgente':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'Alta':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'Media':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'Baja':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'En Progreso':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Centro de Comando</CardTitle>
              <CardDescription className="text-xs">Tu día en un vistazo</CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-2">
          {isLoadingStats ? (
            <div className="col-span-3 flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                <div className="text-2xl font-bold text-foreground">
                  {stats.tareasHoy.pendientes}
                </div>
                <div className="text-xs text-muted-foreground text-center">Pendientes</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.tareasHoy.enProgreso}
                </div>
                <div className="text-xs text-muted-foreground text-center">En Progreso</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card">
                <div className="text-2xl font-bold text-green-600">
                  {stats.tareasHoy.completadas}
                </div>
                <div className="text-xs text-muted-foreground text-center">Completadas</div>
              </div>
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center py-4 text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">No se pudieron cargar las estadísticas</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Tareas del Día */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Tareas de Hoy</h3>
            {stats && (
              <Badge variant="secondary" className="text-xs">
                {stats.tareasHoy.total}
              </Badge>
            )}
          </div>

          {isLoadingTasks ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : todayTasks.length > 0 ? (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-2">
                {todayTasks.map((tarea) => (
                  <div
                    key={tarea.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getEstadoIcon(tarea.estado)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {tarea.titulo}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs flex-shrink-0", getPriorityColor(tarea.prioridad))}
                        >
                          {tarea.prioridad}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: tarea.proyecto.color }}
                          />
                          {tarea.proyecto.nombre}
                        </span>
                        {tarea.fechaVencimiento && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tarea.fechaVencimiento).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
              <p className="text-sm font-medium text-foreground">¡Todo listo!</p>
              <p className="text-xs text-muted-foreground mt-1">
                No tienes tareas pendientes para hoy
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-2 justify-start">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Notificaciones</span>
            {stats && stats.comunicacion.comentariosSinLeer > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {stats.comunicacion.comentariosSinLeer}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 justify-start">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Acciones</span>
          </Button>
        </div>

        {/* Indicador de Progreso del Día */}
        {stats && stats.tareasHoy.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso del día</span>
              <span className="font-medium text-foreground">
                {Math.round((stats.tareasHoy.completadas / stats.tareasHoy.total) * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${(stats.tareasHoy.completadas / stats.tareasHoy.total) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
