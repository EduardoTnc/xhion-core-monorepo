import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Settings, CheckCircle2, Circle, Clock } from "lucide-react";
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
    color: "text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-700",
    lineColor: "bg-gray-200 dark:bg-gray-700",
  },
  En_Progreso: {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    borderColor: "border-blue-500",
    lineColor: "bg-blue-300 dark:bg-blue-700",
  },
  Completada: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-500",
    lineColor: "bg-green-300 dark:bg-green-700",
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
      <div className="border-b bg-card">
        <div className="px-6 py-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No hay etapas definidas para este proyecto
            </p>
            <Button onClick={onCreateEtapa} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Crear primera etapa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-card">
      <div className="px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Etapas del Proyecto
          </h3>
          <Button onClick={onCreateEtapa} size="sm" variant="ghost">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Etapa</span>
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative overflow-x-auto">
          <div className="flex items-center justify-between min-w-max lg:min-w-0">
            {sortedEtapas.map((etapa, index) => {
              const config = estadoConfig[etapa.estado];
              const Icon = config.icon;
              const isLast = index === sortedEtapas.length - 1;

              return (
                <div key={etapa.id} className="flex items-center flex-1">
                  {/* Stage Node */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEditEtapa(etapa)}
                          className={cn(
                            "relative group flex flex-col items-center gap-3 transition-all",
                            "hover:scale-105"
                          )}
                        >
                          {/* Circle */}
                          <div
                            className={cn(
                              "relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center",
                              "transition-all shadow-sm",
                              config.bgColor,
                              config.borderColor,
                              etapa.estado === "En_Progreso" && "ring-4 ring-blue-500/20 shadow-lg"
                            )}
                          >
                            <Icon className={cn("h-6 w-6", config.color)} />
                            
                            {/* Pulse animation for active stage */}
                            {etapa.estado === "En_Progreso" && (
                              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                            )}
                          </div>

                          {/* Stage Info */}
                          <div className="text-center max-w-[140px]">
                            <div className="font-medium text-sm truncate">{etapa.nombre}</div>
                            {(etapa.fechaInicio || etapa.fechaFin) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(etapa.fechaInicio)} - {formatDate(etapa.fechaFin)}
                              </div>
                            )}
                            {etapa._count && etapa._count.tareas > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {etapa._count.tareas} tareas
                              </div>
                            )}
                          </div>

                          {/* Edit icon on hover */}
                          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-background border rounded-full p-1 shadow-sm">
                              <Settings className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{etapa.nombre}</div>
                          {etapa.descripcion && (
                            <div className="text-xs text-muted-foreground max-w-xs">
                              {etapa.descripcion}
                            </div>
                          )}
                          <div className="text-xs">
                            Estado: {etapa.estado.replace("_", " ")}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-2 relative">
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                      <div
                        className={cn(
                          "absolute inset-0 transition-all",
                          config.lineColor,
                          etapa.estado === "Completada" ? "w-full" : "w-0"
                        )}
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
