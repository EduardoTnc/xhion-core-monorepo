"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  ExternalLink
} from "lucide-react"
import type { ProyectoTimeline } from "@/services/timelineService"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ProjectDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyecto: ProyectoTimeline | null
}

/**
 * Modal de Detalle de Proyecto
 * 
 * Muestra información completa del proyecto seleccionado desde el timeline
 */
export function ProjectDetailModal({
  open,
  onOpenChange,
  proyecto
}: ProjectDetailModalProps) {
  if (!proyecto) return null

  const getSaludColor = (salud: string) => {
    switch (salud) {
      case 'saludable':
        return 'text-green-600 bg-green-500/10 border-green-500/20'
      case 'atencion':
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20'
      case 'critico':
        return 'text-red-600 bg-red-500/10 border-red-500/20'
      default:
        return 'text-muted-foreground bg-muted'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{proyecto.nombre}</DialogTitle>
              <p className="text-sm text-muted-foreground">{proyecto.descripcion}</p>
            </div>
            <Badge variant="outline" className={cn("flex-shrink-0", getSaludColor(proyecto.salud))}>
              {proyecto.salud === 'saludable' && '🟢 Saludable'}
              {proyecto.salud === 'atencion' && '🟡 Atención'}
              {proyecto.salud === 'critico' && '🔴 Crítico'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Progreso</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{proyecto.progreso}%</div>
                <Progress value={proyecto.progreso} className="mt-2" />
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Tareas</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {proyecto.tareas.completadas}/{proyecto.tareas.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {proyecto.tareas.enProgreso} en progreso
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Presupuesto</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {proyecto.presupuesto.porcentaje}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${proyecto.presupuesto.gastado.toLocaleString()} gastado
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">Equipo</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {proyecto.equipo.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">miembros</p>
              </div>
            </div>

            {/* Tabs de Información */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="alertas">
                  Alertas {proyecto.alertas.length > 0 && `(${proyecto.alertas.length})`}
                </TabsTrigger>
                <TabsTrigger value="equipo">Equipo</TabsTrigger>
                <TabsTrigger value="ia">
                  IA {proyecto.sugerenciasIA.length > 0 && `(${proyecto.sugerenciasIA.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Tab General */}
              <TabsContent value="general" className="space-y-4 mt-4">
                {/* Fechas */}
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Cronograma
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fecha de Inicio</p>
                      <p className="text-sm font-medium">
                        {format(new Date(proyecto.fechaInicio), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fecha de Fin</p>
                      <p className="text-sm font-medium">
                        {format(new Date(proyecto.fechaFin), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                    {proyecto.fechaFinProyectada && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Fecha Proyectada (IA)</p>
                        <p className="text-sm font-medium text-purple-600">
                          {format(new Date(proyecto.fechaFinProyectada), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hitos */}
                {proyecto.hitos.length > 0 && (
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Hitos
                    </h3>
                    <div className="space-y-2">
                      {proyecto.hitos.map((hito) => (
                        <div key={hito.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            {hito.completado ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">{hito.nombre}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(hito.fecha), 'dd MMM', { locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Riesgos */}
                {proyecto.riesgos.length > 0 && (
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Riesgos Detectados
                    </h3>
                    <div className="space-y-2">
                      {proyecto.riesgos.map((riesgo) => (
                        <div key={riesgo.id} className="p-3 rounded-lg border bg-muted/50">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium">{riesgo.tipo}</span>
                            <Badge variant="outline" className={getSeveridadColor(riesgo.impacto)}>
                              {riesgo.impacto}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{riesgo.descripcion}</p>
                          {riesgo.mitigacion && (
                            <p className="text-xs text-primary">
                              <strong>Mitigación:</strong> {riesgo.mitigacion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab Alertas */}
              <TabsContent value="alertas" className="space-y-3 mt-4">
                {proyecto.alertas.length > 0 ? (
                  proyecto.alertas.map((alerta) => (
                    <div key={alerta.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">{alerta.mensaje}</span>
                        </div>
                        <Badge variant="outline" className={getSeveridadColor(alerta.severidad)}>
                          {alerta.severidad}
                        </Badge>
                      </div>
                      {alerta.accionSugerida && (
                        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                          <p className="text-xs text-foreground">
                            <strong className="text-primary">→ Acción:</strong> {alerta.accionSugerida}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Detectada: {format(new Date(alerta.fechaDeteccion), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sin alertas</p>
                    <p className="text-xs text-muted-foreground">El proyecto está funcionando correctamente</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab Equipo */}
              <TabsContent value="equipo" className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proyecto.equipo.map((miembro) => (
                    <div key={miembro.id} className="p-3 rounded-lg border bg-card flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={miembro.avatar} />
                        <AvatarFallback>{miembro.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{miembro.nombre}</p>
                        <p className="text-xs text-muted-foreground">{miembro.rol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab IA */}
              <TabsContent value="ia" className="space-y-3 mt-4">
                {proyecto.sugerenciasIA.length > 0 ? (
                  proyecto.sugerenciasIA.map((sugerencia) => (
                    <div key={sugerencia.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">{sugerencia.titulo}</span>
                        </div>
                        <Badge variant="outline" className={getSeveridadColor(sugerencia.severidad)}>
                          {sugerencia.severidad}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{sugerencia.descripcion}</p>
                      <div className="mt-2 p-2 rounded bg-purple-500/5 border border-purple-500/10">
                        <p className="text-xs text-foreground">
                          <strong className="text-purple-600">→ Sugerencia:</strong> {sugerencia.accionSugerida}
                        </p>
                        {sugerencia.impacto && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Impacto:</strong> {sugerencia.impacto}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {sugerencia.acciones.map((accion) => (
                          <Button key={accion.tipo} size="sm" variant={accion.tipo === 'aplicar' ? 'default' : 'outline'}>
                            {accion.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sin sugerencias</p>
                    <p className="text-xs text-muted-foreground">La IA está monitoreando el proyecto</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Acciones del Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Proyecto
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
