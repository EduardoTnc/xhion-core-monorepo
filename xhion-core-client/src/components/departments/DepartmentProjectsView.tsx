import { useState } from "react";
import {
  FolderKanban,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Proyecto as ProyectoCompleto } from "@/services/projectService";

// Tipo simplificado de proyecto que viene del endpoint de departamentos
interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  fechaCreacion: string;
  fechaInicio?: string;
  fechaFin?: string;
  responsable: {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string;
  };
  _count?: {
    tareas: number;
    miembros: number;
    etapas: number;
  };
}

interface DepartmentProjectsViewProps {
  proyectos?: Proyecto[];
  departamentoId: string;
  departamentoNombre: string;
  onProjectClick?: (projectId: string) => void;
  onCreateProject?: () => void;
  onViewAllProjects?: () => void;
}

const estadoConfig = {
  Activo: {
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    label: "Activo",
  },
  Completado: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    label: "Completado",
  },
  En_Pausa: {
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    label: "En Pausa",
  },
  Archivado: {
    icon: XCircle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    label: "Archivado",
  },
};

export function DepartmentProjectsView({
  proyectos,
  departamentoId,
  departamentoNombre,
  onProjectClick,
  onCreateProject,
  onViewAllProjects,
}: DepartmentProjectsViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const filteredProyectos =
    filter === "all"
      ? proyectos
      : proyectos?.filter((p) => p.estado === filter);

  if (!proyectos || proyectos.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No hay proyectos asignados"
        description={`El departamento ${departamentoNombre} aún no tiene proyectos. Crea el primer proyecto para comenzar a organizar el trabajo.`}
        actionLabel="Crear Proyecto"
        onAction={onCreateProject}
        secondaryActionLabel="Ver Todos los Proyectos"
        onSecondaryAction={onViewAllProjects}
      />
    );
  }

  const estadisticas = {
    total: proyectos.length,
    activos: proyectos.filter((p) => p.estado === "Activo").length,
    completados: proyectos.filter((p) => p.estado === "Completado").length,
    enPausa: proyectos.filter((p) => p.estado === "En_Pausa").length,
    archivados: proyectos.filter((p) => p.estado === "Archivado").length,
  };

  return (
    <div className="space-y-6">
      {/* Header con Estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Proyectos</h2>
          <p className="text-sm text-muted-foreground">
            {estadisticas.total} proyecto{estadisticas.total !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button className="gap-2" onClick={onCreateProject}>
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{estadisticas.total}</p>
            </div>
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.activos}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.completados}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Pausa</p>
              <p className="text-2xl font-bold text-orange-600">{estadisticas.enPausa}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={filter === "Activo" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Activo")}
        >
          Activos
        </Button>
        <Button
          variant={filter === "Completado" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Completado")}
        >
          Completados
        </Button>
        <Button
          variant={filter === "En_Pausa" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("En_Pausa")}
        >
          En Pausa
        </Button>
        <Button
          variant={filter === "Archivado" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Archivado")}
        >
          Archivados
        </Button>
      </div>

      {/* Lista de Proyectos */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProyectos?.map((proyecto) => {
          const config = estadoConfig[proyecto.estado as keyof typeof estadoConfig] || {
            icon: FolderKanban,
            color: "bg-gray-100 text-gray-800",
            label: proyecto.estado,
          };
          const EstadoIcon = config.icon;

          return (
            <Card 
              key={proyecto.id} 
              className="border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onProjectClick?.(proyecto.id)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{proyecto.nombre}</h3>
                      {proyecto.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {proyecto.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectClick?.(proyecto.id);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(proyecto);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProjectId(proyecto.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Estado */}
                <Badge className={config.color}>
                  <EstadoIcon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{proyecto._count?.tareas ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Tareas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{proyecto._count?.miembros ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Miembros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{proyecto._count?.etapas ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Etapas</p>
                  </div>
                </div>

                {/* Fechas */}
                {(proyecto.fechaInicio || proyecto.fechaFin) && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    {proyecto.fechaInicio && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Inicio: {format(new Date(proyecto.fechaInicio), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    )}
                    {proyecto.fechaFin && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Fin: {format(new Date(proyecto.fechaFin), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredProyectos && filteredProyectos.length === 0 && (
        <Card className="border-dashed border-2 border-border bg-muted/30 p-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No hay proyectos con el filtro seleccionado</p>
            <Button variant="link" onClick={() => setFilter("all")}>
              Ver todos los proyectos
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de Editar Proyecto */}
      {editingProject && (
        <EditProjectModal
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          proyecto={{
            ...editingProject,
            estado: editingProject.estado as ProyectoCompleto['estado'],
            responsableId: editingProject.responsable.id,
            fechaActualizacion: editingProject.fechaCreacion,
            tareas: [],
            departamento: undefined,
          } as ProyectoCompleto}
        />
      )}

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={!!deletingProjectId} onOpenChange={(open) => !open && setDeletingProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el proyecto de forma permanente. Todas las tareas, etapas y datos
              asociados también serán eliminados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deletingProjectId) {
                  try {
                    const { deleteProyecto } = useProjectStore.getState();
                    await deleteProyecto(deletingProjectId);
                    toast.success("Proyecto eliminado correctamente");
                    setDeletingProjectId(null);
                  } catch (error) {
                    toast.error("Error al eliminar el proyecto");
                  }
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
