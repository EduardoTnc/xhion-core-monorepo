import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Search,
  Star,
  ChevronRight,
  ChevronDown,
  Folder,
  Building2,
} from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectSidebarEnhancedProps {
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

interface DepartmentGroup {
  id: string;
  nombre: string;
  proyectos: Proyecto[];
}

export function ProjectSidebarEnhanced({
  proyectos,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
}: ProjectSidebarEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(new Set());
  const [userToggledDepartments, setUserToggledDepartments] = useState<Set<string>>(new Set());

  // Filtrar proyectos por búsqueda
  const filteredProyectos = proyectos.filter((proyecto) =>
    proyecto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupar proyectos por departamento
  const groupedByDepartment = filteredProyectos.reduce<DepartmentGroup[]>((acc, proyecto) => {
    const deptId = proyecto.departamento?.id || "sin-departamento";
    const deptNombre = proyecto.departamento?.nombre || "Sin Departamento";

    let group = acc.find((g) => g.id === deptId);
    if (!group) {
      group = { id: deptId, nombre: deptNombre, proyectos: [] };
      acc.push(group);
    }
    group.proyectos.push(proyecto);
    return acc;
  }, []);

  // Ordenar departamentos alfabéticamente, "Sin Departamento" al final
  groupedByDepartment.sort((a, b) => {
    if (a.id === "sin-departamento") return 1;
    if (b.id === "sin-departamento") return -1;
    return a.nombre.localeCompare(b.nombre);
  });

  // Auto-abrir departamento del proyecto seleccionado
  const selectedProject = proyectos.find((p) => p.id === selectedProjectId);
  const selectedDeptId = selectedProject?.departamento?.id || "sin-departamento";

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
    
    // Marcar que el usuario interactuó manualmente
    setUserToggledDepartments((prev) => {
      const newSet = new Set(prev);
      newSet.add(deptId);
      return newSet;
    });
  };

  const calculateProgress = (proyecto: Proyecto) => {
    if (!proyecto._count?.tareas) return 0;
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

      {/* Projects List - Grouped by Department */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-2 space-y-2 overflow-x-hidden">
          {groupedByDepartment.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "No se encontraron proyectos" : "No hay proyectos"}
            </div>
          ) : (
            groupedByDepartment.map((department) => {
              // Auto-abrir solo si el usuario no ha interactuado manualmente con este departamento
              const wasUserToggled = userToggledDepartments.has(department.id);
              const isOpen = wasUserToggled 
                ? openDepartments.has(department.id) 
                : (openDepartments.has(department.id) || department.id === selectedDeptId);
              const isDeptSelected = department.id === selectedDeptId;

              return (
                <Collapsible
                  key={department.id}
                  open={isOpen}
                  onOpenChange={() => toggleDepartment(department.id)}
                  className="overflow-hidden"
                >
                  {/* Department Header */}
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                        "hover:bg-accent/50 transition-colors group",
                        "overflow-hidden min-w-0",
                        isDeptSelected && "bg-accent/30"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                      {department.id === "sin-departamento" ? (
                        <Folder className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-4 w-4 text-primary" />
                      )}
                      <span className="flex-1 text-left text-sm font-medium truncate min-w-0">
                        {department.nombre}
                      </span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {department.proyectos.length}
                      </Badge>
                    </button>
                  </CollapsibleTrigger>

                  {/* Projects in Department */}
                  <CollapsibleContent className="space-y-1 mt-1 overflow-hidden">
                    {department.proyectos.map((proyecto) => {
                      const progress = calculateProgress(proyecto);
                      const isSelected = proyecto.id === selectedProjectId;

                      return (
                        <button
                          key={proyecto.id}
                          onClick={() => onProjectSelect(proyecto.id)}
                          className={cn(
                            "w-full text-left px-2 py-2 ml-4 rounded-lg transition-all",
                            "hover:bg-accent/50 group relative overflow-hidden",
                            isSelected && "bg-accent shadow-sm border border-border"
                          )}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                          )}

                          <div className="space-y-1.5 min-w-0">
                            {/* Project Name & Status - Más compacto */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <h3
                                className={cn(
                                  "font-medium text-sm truncate flex-1 min-w-0",
                                  isSelected && "text-primary"
                                )}
                              >
                                {proyecto.nombre}
                              </h3>
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0",
                                  estadoColors[proyecto.estado]
                                )}
                              />
                            </div>

                            {/* Progress Bar - Más pequeña */}
                            <Progress
                              value={progress}
                              className="h-1"
                              indicatorClassName={estadoColors[proyecto.estado]}
                            />

                            {/* Stats - Una sola línea compacta */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
                              <span className="flex-shrink-0">{progress}%</span>
                              {proyecto._count && (
                                <>
                                  <span className="flex-shrink-0">•</span>
                                  <span className="flex-shrink-0">{proyecto._count.tareas}t</span>
                                  <span className="flex-shrink-0">•</span>
                                  <span className="flex-shrink-0">{proyecto._count.miembros}m</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
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
