"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Clock, 
  Circle,
  Plus,
  Loader2,
  Target,
  ArrowRight
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import { cn } from "@/lib/utils"

/**
 * Mi Día - Centro de Comando Personal
 * 
 * Vista ultra-compacta de las tareas del usuario actual,
 * enfocada en lo que debe hacer HOY.
 */
export function MyDayWidget() {
  const { 
    myDayData, 
    isLoadingMyDay,
    fetchMyDayData 
  } = useTimelineStore()

  useEffect(() => {
    fetchMyDayData()
  }, [])

  const getPrioridadColor = (prioridad: string) => {
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

  if (isLoadingMyDay) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <CardTitle className="text-base">Mi Día</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Completadas</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {myDayData?.estadisticas.completadas || 0}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">En Progreso</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {myDayData?.estadisticas.enProgreso || 0}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {myDayData?.estadisticas.pendientes || 0}
            </div>
          </div>
        </div>

        {/* Próxima Tarea */}
        {myDayData?.proximaTarea ? (
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Próxima Tarea</h3>
            <div className="p-3 rounded-lg border bg-accent/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                  {myDayData.proximaTarea.titulo}
                </h4>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs flex-shrink-0", getPrioridadColor(myDayData.proximaTarea.prioridad))}
                >
                  {myDayData.proximaTarea.prioridad}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: myDayData.proximaTarea.proyecto.color }}
                  />
                  {myDayData.proximaTarea.proyecto.nombre}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {myDayData.proximaTarea.tiempoEstimado}h
                </span>
              </div>

              {myDayData.proximaTarea.descripcion && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {myDayData.proximaTarea.descripcion}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-xs font-medium text-foreground">¡Todo listo!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No tienes tareas pendientes
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex-shrink-0 space-y-2">
          <Button size="sm" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
          
          {myDayData && myDayData.estadisticas.total > 0 && (
            <Button size="sm" variant="outline" className="w-full gap-2">
              Ver Todas
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Progreso del Día */}
        {myDayData && myDayData.estadisticas.total > 0 && (
          <div className="flex-shrink-0 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso del día</span>
              <span className="font-medium text-foreground">
                {Math.round((myDayData.estadisticas.completadas / myDayData.estadisticas.total) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${(myDayData.estadisticas.completadas / myDayData.estadisticas.total) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
