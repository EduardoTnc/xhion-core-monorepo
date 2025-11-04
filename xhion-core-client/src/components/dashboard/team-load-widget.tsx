"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users,
  AlertTriangle,
  Loader2,
  ArrowRight,
  TrendingUp
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import { cn } from "@/lib/utils"

/**
 * Team Load Widget - Mapa de Carga en Tiempo Real
 * 
 * Vista instantánea del estado del equipo completo,
 * mostrando disponibilidad y alertas de sobrecarga.
 */
export function TeamLoadWidget() {
  const { 
    teamLoadData, 
    isLoadingTeam,
    fetchTeamLoadData 
  } = useTimelineStore()

  useEffect(() => {
    fetchTeamLoadData()
  }, [])

  if (isLoadingTeam) {
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
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <CardTitle className="text-base">Equipo</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
        {/* Estadísticas de Carga */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Disponibles</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {teamLoadData?.estadisticas.disponibles || 0}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Normal</span>
            </div>
            <div className="text-xl font-bold text-yellow-600">
              {teamLoadData?.estadisticas.cargaNormal || 0}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">Sobrecarga</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {teamLoadData?.estadisticas.sobrecargados || 0}
            </div>
          </div>
        </div>

        {/* Alertas de Acción */}
        {teamLoadData && teamLoadData.alertas.length > 0 ? (
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Acción Requerida</h3>
            
            {teamLoadData.alertas.slice(0, 2).map((alerta, idx) => (
              <Alert key={idx} variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p className="font-medium mb-1">{alerta.mensaje}</p>
                  {alerta.miembros.length > 0 && (
                    <p className="text-xs opacity-90">
                      Afecta a: {alerta.miembros.map(m => m.nombre).join(', ')}
                    </p>
                  )}
                  {alerta.accionSugerida && (
                    <p className="text-xs mt-1 font-medium">
                      → {alerta.accionSugerida}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs font-medium text-foreground">Equipo Balanceado</p>
            <p className="text-xs text-muted-foreground mt-1">
              La carga está bien distribuida
            </p>
          </div>
        )}

        {/* Indicador de Salud del Equipo */}
        {teamLoadData && (
          <div className="flex-shrink-0 p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  teamLoadData.estadisticas.sobrecargados === 0 ? "bg-green-500" :
                  teamLoadData.estadisticas.sobrecargados <= 2 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span className="text-xs font-medium text-foreground">
                  Estado del Equipo
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {teamLoadData.estadisticas.sobrecargados === 0 ? "Óptimo" :
                 teamLoadData.estadisticas.sobrecargados <= 2 ? "Atención" : "Crítico"}
              </span>
            </div>
          </div>
        )}

        {/* Botón Ver Mapa Completo */}
        <Button size="sm" variant="outline" className="w-full gap-2">
          Ver Mapa Completo
          <ArrowRight className="h-3 w-3" />
        </Button>

        {/* Distribución Visual */}
        {teamLoadData && teamLoadData.estadisticas.total > 0 && (
          <div className="flex-shrink-0 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Distribución</span>
              <span className="font-medium text-foreground">
                {teamLoadData.estadisticas.total} miembros
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{
                  width: `${(teamLoadData.estadisticas.disponibles / teamLoadData.estadisticas.total) * 100}%`
                }}
              />
              <div
                className="bg-yellow-500 transition-all duration-500"
                style={{
                  width: `${(teamLoadData.estadisticas.cargaNormal / teamLoadData.estadisticas.total) * 100}%`
                }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{
                  width: `${(teamLoadData.estadisticas.sobrecargados / teamLoadData.estadisticas.total) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
