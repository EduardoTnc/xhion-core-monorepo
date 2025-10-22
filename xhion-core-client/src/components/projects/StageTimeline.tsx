import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Settings, CheckCircle2, Circle, Clock, Calendar, Target, TrendingUp, Sparkles } from "lucide-react";
import { type Etapa } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface StageTimelineProps {
  etapas: Etapa[];
  onCreateEtapa: () => void;
  onEditEtapa: (etapa: Etapa) => void;
}

const estadoConfig = {
  Pendiente: {
    icon: Circle,
    color: "text-gray-500",
    bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
    borderColor: "border-gray-300 dark:border-gray-600",
    lineColor: "bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600",
    ringColor: "ring-gray-500/10",
    glowColor: "shadow-gray-500/20",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  En_Progreso: {
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 dark:from-blue-950 dark:via-blue-900 dark:to-cyan-950",
    borderColor: "border-blue-500 dark:border-blue-400",
    lineColor: "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 dark:from-blue-600 dark:via-blue-500 dark:to-cyan-500",
    ringColor: "ring-blue-500/20",
    glowColor: "shadow-blue-500/40",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  Completada: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgGradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950",
    borderColor: "border-green-500 dark:border-green-400",
    lineColor: "bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 dark:from-green-600 dark:via-emerald-500 dark:to-teal-500",
    ringColor: "ring-green-500/20",
    glowColor: "shadow-green-500/40",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

export function StageTimeline({ etapas, onCreateEtapa, onEditEtapa }: StageTimelineProps) {
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
      <div className="border-b bg-gradient-to-br from-card via-card to-muted/20">
        <div className="px-6 py-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
              <Target className="h-10 w-10 text-muted-foreground/40 relative" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                No hay etapas definidas
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                Las etapas te ayudan a organizar tu proyecto en fases claras
              </p>
            </div>
            <Button onClick={onCreateEtapa} size="sm" className="mt-1">
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
    <div className="border-b bg-gradient-to-br from-card via-card to-muted/10">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Etapas del Proyecto
              </h3>
              <Badge variant="secondary" className="text-xs font-semibold px-1.5 py-0">
                {completedStages}/{sortedEtapas.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <Button onClick={onCreateEtapa} size="sm" className="shadow-sm h-7 text-xs">
            <Plus className="h-3 w-3 sm:mr-1.5" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-max lg:min-w-0 px-2">
            {sortedEtapas.map((etapa, index) => {
              const config = estadoConfig[etapa.estado];
              const Icon = config.icon;
              const isLast = index === sortedEtapas.length - 1;
              const isActive = etapa.estado === "En_Progreso";
              const isCompleted = etapa.estado === "Completada";

              return (
                <div key={etapa.id} className="flex items-center flex-1">
                  {/* Stage Node */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEditEtapa(etapa)}
                          className={cn(
                            "relative group flex flex-col items-center gap-2 transition-all duration-300",
                            "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-1"
                          )}
                        >
                          {/* Glow effect for active stage */}
                          {isActive && (
                            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse" />
                          )}

                          {/* Circle */}
                          <div
                            className={cn(
                              "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center",
                              "transition-all duration-300 shadow-md",
                              config.bgGradient,
                              config.borderColor,
                              config.glowColor,
                              isActive && "ring-2 ring-offset-1 ring-offset-background",
                              isActive && config.ringColor,
                              isCompleted && "shadow-lg",
                              "group-hover:shadow-xl group-hover:border-[3px]"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 transition-transform duration-300", config.color, "group-hover:scale-110")} />
                            
                            {/* Pulse animation for active stage */}
                            {isActive && (
                              <>
                                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                                <span className="absolute -inset-1 rounded-full bg-blue-500 animate-pulse opacity-10" />
                              </>
                            )}

                            {/* Sparkle for completed */}
                            {isCompleted && (
                              <Sparkles className="absolute -top-0.5 -right-0.5 h-3 w-3 text-green-500 animate-pulse" />
                            )}
                          </div>

                          {/* Stage Info */}
                          <div className="text-center max-w-[120px] space-y-0.5">
                            <div className={cn(
                              "font-semibold text-[11px] truncate transition-colors leading-tight",
                              isActive && "text-primary",
                              isCompleted && "text-green-600 dark:text-green-400"
                            )}>
                              {etapa.nombre}
                            </div>
                            
                            {etapa._count && etapa._count.tareas > 0 && (
                              <div className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-muted text-[10px] font-medium">
                                <Target className="h-2.5 w-2.5" />
                                {etapa._count.tareas}
                              </div>
                            )}
                          </div>

                          {/* Edit icon on hover */}
                          <div className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                            <div className="bg-primary text-primary-foreground border border-primary rounded-full p-1 shadow-md">
                              <Settings className="h-2.5 w-2.5" />
                            </div>
                          </div>

                          {/* Order number */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-background border border-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                            {index + 1}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <div className="space-y-1.5">
                          <div className="font-bold text-sm">{etapa.nombre}</div>
                          {etapa.descripcion && (
                            <div className="text-xs text-muted-foreground leading-snug">
                              {etapa.descripcion.slice(0, 100)}{etapa.descripcion.length > 100 ? '...' : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {etapa.estado.replace("_", " ")}
                            </Badge>
                            {etapa._count && etapa._count.tareas > 0 && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {etapa._count.tareas} tareas
                              </Badge>
                            )}
                            {(etapa.fechaInicio || etapa.fechaFin) && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                <Calendar className="h-2.5 w-2.5 mr-0.5" />
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
                    <div className="flex-1 h-0.5 mx-2 relative rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted" />
                      <div
                        className={cn(
                          "absolute inset-0 transition-all duration-700 ease-out",
                          config.lineColor,
                          isCompleted ? "w-full" : "w-0",
                          isCompleted && "shadow-md"
                        )}
                      >
                        {isCompleted && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}
                      </div>
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
