import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, CheckCircle2, Circle, Clock, Calendar, Target, Sparkles } from "lucide-react";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface StageTimelineProps {
  etapas: Etapa[];
  onCreateEtapa?: () => void;
  onEditEtapa?: (etapa: Etapa) => void;
  stagesEnabled?: boolean;
}

const estadoConfig = {
  Pendiente: {
    icon: Circle,
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-600",
    lineColor: "bg-gray-300 dark:bg-gray-600",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  En_Progreso: {
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900",
    borderColor: "border-blue-500 dark:border-blue-400",
    lineColor: "bg-blue-500 dark:bg-blue-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  Completada: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-500 dark:border-green-400",
    lineColor: "bg-green-500 dark:bg-green-600",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

export function StageTimeline({ etapas, onCreateEtapa, onEditEtapa, stagesEnabled = true }: StageTimelineProps) {
  if (!stagesEnabled) {
    return (
      <div className="border-b bg-card">
        <div className="px-6 py-6">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Gestión de etapas desactivada</p>
              <p className="text-xs text-muted-foreground max-w-md">
                Activa las etapas para planificar hitos y visualizar su progreso cronológico dentro de este proyecto.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedEtapas = [...etapas].sort((a, b) => a.orden - b.orden);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  if (sortedEtapas.length === 0) {
    return (
      <div className="border-b bg-card">
        <div className="px-6 py-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Target className="h-10 w-10 text-muted-foreground/40" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                No hay etapas definidas
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                Las etapas te ayudan a organizar tu proyecto en fases claras
              </p>
            </div>
            <Button onClick={onCreateEtapa} size="sm">
              <Plus className="mr-2 h-3.5 w-3.5" />
              Crear primera etapa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress
  const completedStages = sortedEtapas.filter(e => e.estado === 'Completada').length;
  const progressPercentage = (completedStages / sortedEtapas.length) * 100;

  return (
    <div className="border-b bg-card">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Etapas del Proyecto
            </h3>
            <Badge variant="secondary" className="text-xs">
              {completedStages}/{sortedEtapas.length}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          {onCreateEtapa && (
            <Button onClick={onCreateEtapa} size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Etapa</span>
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-max lg:min-w-0 px-2">
            {sortedEtapas.map((etapa, index) => {
              const config = estadoConfig[etapa.estado];
              const Icon = config.icon;
              const isLast = index === sortedEtapas.length - 1;
              const customColor = etapa.color;

              return (
                <div key={etapa.id} className="flex items-center flex-1">
                  {/* Stage Node */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEditEtapa?.(etapa)}
                          className="relative group flex flex-col items-center gap-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg p-1"
                          disabled={!onEditEtapa}
                        >
                          {/* Circle */}
                          <div
                            className={cn(
                              "relative w-10 h-10 rounded-full border-2 flex items-center justify-center",
                              "transition-all shadow-sm",
                              !customColor && config.bg,
                              "group-hover:shadow-md"
                            )}
                            style={{
                              backgroundColor: customColor ? `${customColor}20` : undefined,
                              borderColor: customColor || undefined,
                            }}
                          >
                            <Icon 
                              className={cn("h-4 w-4", !customColor && config.color)} 
                              style={{ color: customColor || undefined }}
                            />
                          </div>

                          {/* Stage Info */}
                          <div className="text-center max-w-[120px]">
                            <div className="font-medium text-xs truncate">
                              {etapa.nombre}
                            </div>
                            
                            {etapa._count && etapa._count.tareas > 0 && (
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {etapa._count.tareas} {etapa._count.tareas === 1 ? 'tarea' : 'tareas'}
                              </div>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">{etapa.nombre}</p>
                          {etapa.descripcion && (
                            <p className="text-xs text-muted-foreground">
                              {etapa.descripcion.length > 100
                                ? `${etapa.descripcion.slice(0, 100)}...`
                                : etapa.descripcion}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                            <Badge className={cn("text-xs", config.badge)}>
                              {etapa.estado.replace("_", " ")}
                            </Badge>
                            {etapa._count && etapa._count.tareas > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {etapa._count.tareas} {etapa._count.tareas === 1 ? 'tarea' : 'tareas'}
                              </Badge>
                            )}
                            {(etapa.fechaInicio || etapa.fechaFin) && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(etapa.fechaInicio)} - {formatDate(etapa.fechaFin)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="flex-1 mx-2 h-0.5">
                      <div 
                        className={cn("h-full rounded-full", !customColor && config.lineColor)}
                        style={{ backgroundColor: customColor || undefined }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
