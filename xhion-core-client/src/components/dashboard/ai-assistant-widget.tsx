"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles,
  Search,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Loader2,
  X,
  Check,
  Eye
} from "lucide-react"
import { useTimelineStore } from "@/store/timelineStore"
import type { SugerenciaIA } from "@/services/timelineService"
import { cn } from "@/lib/utils"

/**
 * AI Assistant Widget - Asistente Inteligente
 * 
 * Widget de IA que analiza toda la información y presenta
 * 3-5 sugerencias accionables del día, priorizadas por impacto.
 * Incluye búsqueda semántica global.
 */
export function AIAssistantWidget() {
  const { 
    timelineData,
    isLoadingTimeline,
    aplicarSugerencia,
    descartarSugerencia
  } = useTimelineStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [procesandoSugerencia, setProcesandoSugerencia] = useState<string | null>(null)

  const sugerencias = timelineData?.sugerenciasGlobales || []

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'oportunidad':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case 'optimizacion':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'prediccion':
        return <BarChart3 className="h-4 w-4 text-purple-600" />
      default:
        return <Sparkles className="h-4 w-4 text-primary" />
    }
  }

  const getSeveridadColor = (severidad: string) => {
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

  const handleAplicarSugerencia = async (sugerenciaId: string) => {
    setProcesandoSugerencia(sugerenciaId)
    await aplicarSugerencia(sugerenciaId)
    setProcesandoSugerencia(null)
  }

  const handleDescartarSugerencia = async (sugerenciaId: string) => {
    setProcesandoSugerencia(sugerenciaId)
    await descartarSugerencia(sugerenciaId)
    setProcesandoSugerencia(null)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Asistente Inteligente</CardTitle>
              <p className="text-xs text-muted-foreground">
                Sugerencias priorizadas por impacto
              </p>
            </div>
          </div>

          {sugerencias.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sugerencias.length} sugerencias
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4 min-h-0">
        {/* Búsqueda Semántica Global */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en toda la plataforma con IA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Sugerencias */}
        {isLoadingTimeline ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analizando datos...</p>
            </div>
          </div>
        ) : sugerencias.length > 0 ? (
          <div className="flex-1 min-h-0">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              💡 Sugerencias de Hoy
            </h3>
            
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {sugerencias.map((sugerencia, idx) => (
                  <div
                    key={sugerencia.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-2"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {getTipoIcon(sugerencia.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {idx + 1}.
                            </span>
                            <h4 className="text-sm font-medium text-foreground line-clamp-1">
                              {sugerencia.titulo}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {sugerencia.descripcion}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs flex-shrink-0", getSeveridadColor(sugerencia.severidad))}
                      >
                        {sugerencia.severidad}
                      </Badge>
                    </div>

                    {/* Entidad Relacionada */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{sugerencia.entidad.tipo}:</span>
                      <span>{sugerencia.entidad.nombre}</span>
                    </div>

                    {/* Acción Sugerida */}
                    <div className="p-2 rounded bg-primary/5 border border-primary/10">
                      <p className="text-xs text-foreground">
                        <strong className="text-primary">→ Sugerencia:</strong> {sugerencia.accionSugerida}
                      </p>
                      {sugerencia.impacto && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Impacto:</strong> {sugerencia.impacto}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-1">
                      {sugerencia.acciones.map((accion) => {
                        const isProcesando = procesandoSugerencia === sugerencia.id

                        if (accion.tipo === 'aplicar') {
                          return (
                            <Button
                              key={accion.tipo}
                              size="sm"
                              onClick={() => handleAplicarSugerencia(sugerencia.id)}
                              disabled={isProcesando}
                              className="gap-1.5 h-7 text-xs"
                            >
                              {isProcesando ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              {accion.label}
                            </Button>
                          )
                        }

                        if (accion.tipo === 'ver') {
                          return (
                            <Button
                              key={accion.tipo}
                              size="sm"
                              variant="outline"
                              className="gap-1.5 h-7 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                              {accion.label}
                            </Button>
                          )
                        }

                        if (accion.tipo === 'descartar') {
                          return (
                            <Button
                              key={accion.tipo}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDescartarSugerencia(sugerencia.id)}
                              disabled={isProcesando}
                              className="gap-1.5 h-7 text-xs ml-auto"
                            >
                              {isProcesando ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {accion.label}
                            </Button>
                          )
                        }

                        return null
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-foreground">Todo bajo control</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              No hay sugerencias en este momento. La IA está monitoreando continuamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
