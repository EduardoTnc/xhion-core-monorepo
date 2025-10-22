import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Star, ChevronRight } from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  proyectos: Proyecto[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

const estadoColors = {
  Activo: "bg-blue-500",
  Completado: "bg-green-500",
  En_Pausa: "bg-yellow-500",
  Archivado: "bg-gray-500",
};

export function ProjectSidebar({
  proyectos,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
}: ProjectSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProyectos = proyectos.filter((proyecto) =>
    proyecto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProgress = (proyecto: Proyecto) => {
    if (!proyecto._count?.tareas) return 0;
    // Esto es una estimación simple, idealmente deberías tener un campo de progreso real
    return proyecto.estado === "Completado" ? 100 : Math.min(proyecto._count.tareas * 10, 90);
  };

  return (
    <div className="bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Star className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* New Project Button */}
        <Button onClick={onCreateProject} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {filteredProyectos.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "No se encontraron proyectos" : "No hay proyectos"}
            </div>
          ) : (
            filteredProyectos.map((proyecto) => {
              const progress = calculateProgress(proyecto);
              const isSelected = proyecto.id === selectedProjectId;

              return (
                <button
                  key={proyecto.id}
                  onClick={() => onProjectSelect(proyecto.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    "hover:bg-accent/50 group relative",
                    isSelected && "bg-accent shadow-sm border border-border"
                  )}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}

                  <div className="space-y-2">
                    {/* Project Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium text-sm truncate",
                            isSelected && "text-primary"
                          )}
                        >
                          {proyecto.nombre}
                        </h3>
                        {proyecto.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {proyecto.descripcion}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                          isSelected && "rotate-90 text-primary"
                        )}
                      />
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-1.5"
                        indicatorClassName={estadoColors[proyecto.estado]}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            estadoColors[proyecto.estado]
                          )}
                        />
                        <span>{proyecto.estado.replace("_", " ")}</span>
                      </div>
                      {proyecto._count && (
                        <>
                          <span>•</span>
                          <span>{proyecto._count.tareas} tareas</span>
                          <span>•</span>
                          <span>{proyecto._count.miembros} miembros</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-muted/30 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{proyectos.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {proyectos.filter((p) => p.estado === "Activo").length}
            </div>
            <div className="text-xs text-muted-foreground">Activos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {proyectos.filter((p) => p.estado === "Completado").length}
            </div>
            <div className="text-xs text-muted-foreground">Completos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
