import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Layers,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Etapa {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  fechaInicio?: string
  fechaFin?: string
  presupuestoAsignado?: number
  presupuestoGastado?: number
  completada?: boolean
  color?: string
}

interface ProjectStagesWidgetProps {
  etapas: Etapa[]
  isPreview?: boolean
  onExpand?: () => void
  onCreateEtapa?: () => void
  onEditEtapa?: (etapa: Etapa) => void
  onDeleteEtapa?: (etapaId: string) => void
}

export function ProjectStagesWidget({
  etapas,
  isPreview = false,
  onExpand,
  onCreateEtapa,
  onEditEtapa,
  onDeleteEtapa,
}: ProjectStagesWidgetProps) {
  const [showFullView, setShowFullView] = useState(false)

  const handleExpand = () => {
    if (isPreview && onExpand) {
      onExpand()
    } else {
      setShowFullView(true)
    }
  }

  const etapasCompletadas = etapas.filter((e) => e.completada).length
  const porcentajeCompletado = etapas.length > 0 ? (etapasCompletadas / etapas.length) * 100 : 0

  const presupuestoTotal = etapas.reduce((sum, e) => sum + (e.presupuestoAsignado || 0), 0)
  const presupuestoGastadoTotal = etapas.reduce((sum, e) => sum + (e.presupuestoGastado || 0), 0)
  const porcentajePresupuesto = presupuestoTotal > 0 ? (presupuestoGastadoTotal / presupuestoTotal) * 100 : 0

  // Vista previa: mostrar solo primeras 3 etapas
  const etapasToShow = isPreview ? etapas.slice(0, 3) : etapas

  const renderContent = () => (
    <div className="space-y-4">
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Progreso</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{etapasCompletadas}</span>
              <span className="text-sm text-muted-foreground">/ {etapas.length}</span>
            </div>
            <Progress value={porcentajeCompletado} className="h-1.5" />
            <span className="text-xs text-muted-foreground">{Math.round(porcentajeCompletado)}% completado</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Presupuesto</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold">S/</span>
              <span className="text-2xl font-bold">{presupuestoGastadoTotal.toLocaleString()}</span>
            </div>
            <Progress 
              value={porcentajePresupuesto} 
              className={cn(
                "h-1.5",
                porcentajePresupuesto > 90 && "bg-red-200"
              )}
              indicatorClassName={porcentajePresupuesto > 90 ? "bg-red-600" : undefined}
            />
            <span className="text-xs text-muted-foreground">
              de S/ {presupuestoTotal.toLocaleString()} ({Math.round(porcentajePresupuesto)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Etapas */}
      <div className="space-y-2">
        {etapasToShow.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay etapas creadas</p>
            {!isPreview && onCreateEtapa && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateEtapa}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Etapa
              </Button>
            )}
          </div>
        ) : (
          etapasToShow.map((etapa) => {
            const porcentajeEtapa = etapa.presupuestoAsignado && etapa.presupuestoAsignado > 0
              ? ((etapa.presupuestoGastado || 0) / etapa.presupuestoAsignado) * 100
              : 0

            return (
              <div
                key={etapa.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  etapa.completada ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : "bg-card hover:bg-accent/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {etapa.completada ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{etapa.nombre}</h4>
                          <Badge variant="outline" className="text-[10px] px-1 h-4">
                            #{etapa.orden}
                          </Badge>
                        </div>
                        {etapa.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {etapa.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Fechas */}
                      {(etapa.fechaInicio || etapa.fechaFin) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {etapa.fechaInicio && (
                            <span>{format(new Date(etapa.fechaInicio), "dd MMM", { locale: es })}</span>
                          )}
                          {etapa.fechaInicio && etapa.fechaFin && <span>-</span>}
                          {etapa.fechaFin && (
                            <span>{format(new Date(etapa.fechaFin), "dd MMM yyyy", { locale: es })}</span>
                          )}
                        </div>
                      )}

                      {/* Presupuesto */}
                      {etapa.presupuestoAsignado && etapa.presupuestoAsignado > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Presupuesto</span>
                            <span className="font-medium">
                              S/ {(etapa.presupuestoGastado || 0).toLocaleString()} / S/ {etapa.presupuestoAsignado.toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={porcentajeEtapa} 
                            className={cn(
                              "h-1",
                              porcentajeEtapa > 90 && "bg-red-200"
                            )}
                            indicatorClassName={porcentajeEtapa > 90 ? "bg-red-600" : undefined}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  {!isPreview && (
                    <div className="flex items-center gap-1">
                      {onEditEtapa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditEtapa(etapa)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDeleteEtapa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteEtapa(etapa.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Ver más en vista previa */}
      {isPreview && etapas.length > 3 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleExpand}
        >
          Ver todas las etapas ({etapas.length})
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Botón crear en vista completa */}
      {!isPreview && onCreateEtapa && etapas.length > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onCreateEtapa}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Etapa
        </Button>
      )}
    </div>
  )

  if (isPreview) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExpand}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            Etapas del Proyecto
            <Badge variant="secondary" className="ml-auto">
              {etapas.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {renderContent()}
      
      {/* Dialog para vista completa cuando no es preview */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Etapas del Proyecto
            </DialogTitle>
            <DialogDescription>
              Gestiona las etapas y presupuestos del proyecto
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {renderContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
