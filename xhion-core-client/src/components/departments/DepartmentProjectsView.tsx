import { useMemo, useState } from "react"
import {
  FolderKanban,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { EditProjectModal } from "@/components/projects/EditProjectModal"
import { useDeleteProject } from "@/hooks/mutations/useProjectMutations"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Proyecto as ProyectoCompleto } from "@/services/projectService"

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
  proyectos?: Proyecto[]
  departamentoId: string
  departamentoNombre: string
  onProjectClick?: (projectId: string) => void
  onCreateProject?: () => void
  onViewAllProjects?: () => void
  variant?: "default" | "condensed"
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
  variant = "default",
}: DepartmentProjectsViewProps) {
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const deleteProjectMutation = useDeleteProject()

  const estadisticas = useMemo(() => {
    if (!proyectos) {
      return { total: 0, activos: 0, completados: 0, enPausa: 0, archivados: 0 }
    }
    return {
      total: proyectos.length,
      activos: proyectos.filter((p) => p.estado === "Activo").length,
      completados: proyectos.filter((p) => p.estado === "Completado").length,
      enPausa: proyectos.filter((p) => p.estado === "En_Pausa").length,
      archivados: proyectos.filter((p) => p.estado === "Archivado").length,
    }
  }, [proyectos])

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

  const filteredProyectos = proyectos || []

  return (
    <div className={`${variant === "condensed" ? "space-y-4" : "space-y-6"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Proyectos</p>
          <p className="text-sm text-foreground">
            {estadisticas.total} total · {estadisticas.activos} activos · {estadisticas.completados} completados
          </p>
        </div>
        <Button size="sm" variant={variant === "condensed" ? "ghost" : "default"} className="gap-2" onClick={onCreateProject}>
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      {/* Cards de Estadísticas */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <span>Activos {estadisticas.activos}</span> · <span>Completados {estadisticas.completados}</span> ·
        <span> En pausa {estadisticas.enPausa}</span>
      </div>

      <div className="divide-y divide-border">
        {filteredProyectos.map((proyecto) => {
          const config = estadoConfig[proyecto.estado as keyof typeof estadoConfig] || {
            icon: FolderKanban,
            color: "text-muted-foreground",
            label: proyecto.estado,
          }
          const EstadoIcon = config.icon

          return (
            <div key={proyecto.id} className="py-3 text-sm">
              <div className="flex items-center gap-3">
                <button className="text-left" onClick={() => onProjectClick?.(proyecto.id)}>
                  <p className="font-semibold text-foreground">{proyecto.nombre}</p>
                  {proyecto.descripcion && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{proyecto.descripcion}</p>
                  )}
                </button>
                <div className={`ml-auto flex items-center gap-1 text-xs ${config.color}`}>
                  <EstadoIcon className="h-3 w-3" />
                  {config.label}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Responsable: {proyecto.responsable?.nombreCompleto || "Sin asignar"}</span>
                <span>Tareas: {proyecto._count?.tareas ?? 0}</span>
                <span>Miembros: {proyecto._count?.miembros ?? 0}</span>
                <span>Etapas: {proyecto._count?.etapas ?? 0}</span>
                <span>Creado: {new Date(proyecto.fechaCreacion).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          )
        })}
      </div>

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
                    await deleteProjectMutation.mutateAsync(deletingProjectId);
                    setDeletingProjectId(null);
                  } catch (error) {
                    // Mutation handles error toast
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
