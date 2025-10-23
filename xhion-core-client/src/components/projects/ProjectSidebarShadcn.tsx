import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
  Folder,
  Building2,
} from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectSidebarShadcnProps {
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

export function ProjectSidebarShadcn({
  proyectos,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
}: ProjectSidebarShadcnProps) {
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
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Star className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative px-2">
          <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* New Project Button */}
        <div className="px-2">
          <Button onClick={onCreateProject} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </SidebarHeader>

      {/* Projects List - Grouped by Department */}
      <SidebarContent>
        {groupedByDepartment.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? "No se encontraron proyectos" : "No hay proyectos"}
          </div>
        ) : (
          groupedByDepartment.map((department) => {
            // Auto-abrir solo si el usuario no ha interactuado manualmente
            const wasUserToggled = userToggledDepartments.has(department.id);
            const isOpen = wasUserToggled
              ? openDepartments.has(department.id)
              : openDepartments.has(department.id) || department.id === selectedDeptId;
            const isDeptSelected = department.id === selectedDeptId;

            return (
              <Collapsible
                key={department.id}
                open={isOpen}
                onOpenChange={() => toggleDepartment(department.id)}
              >
                <SidebarGroup>
                  {/* Department Header */}
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          "flex w-full items-center gap-2",
                          isDeptSelected && "bg-accent/30"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isOpen && "rotate-90"
                          )}
                        />
                        {department.id === "sin-departamento" ? (
                          <Folder className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                        <span className="flex-1 truncate text-left">
                          {department.nombre}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {department.proyectos.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>

                  {/* Projects in Department */}
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {department.proyectos.map((proyecto) => {
                          const progress = calculateProgress(proyecto);
                          const isSelected = proyecto.id === selectedProjectId;

                          return (
                            <SidebarMenuItem key={proyecto.id}>
                              <SidebarMenuButton
                                onClick={() => onProjectSelect(proyecto.id)}
                                isActive={isSelected}
                                className="h-auto flex-col items-start py-2"
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  <span className="flex-1 truncate font-medium text-sm">
                                    {proyecto.nombre}
                                  </span>
                                  <div
                                    className={cn(
                                      "h-2 w-2 rounded-full flex-shrink-0",
                                      estadoColors[proyecto.estado]
                                    )}
                                  />
                                </div>

                                {/* Progress Bar */}
                                <Progress
                                  value={progress}
                                  className="h-1 w-full"
                                  indicatorClassName={estadoColors[proyecto.estado]}
                                />

                                {/* Stats */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{progress}%</span>
                                  {proyecto._count && (
                                    <>
                                      <span>•</span>
                                      <span>{proyecto._count.tareas}t</span>
                                      <span>•</span>
                                      <span>{proyecto._count.miembros}m</span>
                                    </>
                                  )}
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })
        )}
      </SidebarContent>

      {/* Footer Stats */}
      <SidebarFooter>
        <div className="grid grid-cols-3 gap-2 text-center px-2">
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
      </SidebarFooter>
    </div>
  );
}
