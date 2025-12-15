import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { UserPlus, Settings, MoreVertical, Calendar, Users, Eye, Copy, Download, Archive } from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { type ProyectoMiembro } from "@/services/projectService";
import { useDuplicateProject, useUpdateProject } from "@/hooks/mutations/useProjectMutations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProjectDetailsModal } from "./ProjectDetailsModal";

interface ProjectHeaderProps {
  proyecto: Proyecto;
  miembros: ProyectoMiembro[];
  onEdit: () => void;
  onInvite: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  etapasCount?: number;
  tareasCount?: number;
}

const estadoColors = {
  Activo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  En_Pausa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Archivado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ProjectHeader({
  proyecto,
  miembros,
  onEdit,
  onInvite,
  onDuplicate,
  onArchive,
  etapasCount,
  tareasCount,
}: ProjectHeaderProps) {
  // TanStack Query mutations
  const duplicateProjectMutation = useDuplicateProject();
  const updateProjectMutation = useUpdateProject();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 1. Ver detalles - Abrir modal con toda la información
  const handleVerDetalles = () => {
    setShowDetailsModal(true);
  };

  // 2. Duplicar proyecto
  const handleDuplicar = async () => {
    try {
      setIsDuplicating(true);
      await duplicateProjectMutation.mutateAsync(proyecto.id);
      if (onDuplicate) {
        onDuplicate();
      }
    } catch (error: any) {
      // Mutations handle errors
    } finally {
      setIsDuplicating(false);
    }
  };

  // 3. Exportar datos
  const handleExportar = () => {
    try {
      // Preparar datos para exportar
      const exportData = {
        proyecto: {
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          fechaInicio: proyecto.fechaInicio,
          fechaFin: proyecto.fechaFin,
          responsable: proyecto.responsable.nombreCompleto,
          departamento: proyecto.departamento?.nombre,
        },
        miembros: miembros.map(m => ({
          nombre: m.usuario.nombreCompleto,
          email: m.usuario.email,
          rol: m.rol,
        })),
        estadisticas: {
          totalTareas: proyecto._count?.tareas || 0,
          totalMiembros: miembros.length,
          totalEtapas: proyecto._count?.etapas || 0,
        },
      };

      // Crear y descargar archivo JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${proyecto.nombre.replace(/\s+/g, "_")}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Datos exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar los datos");
    }
  };

  // 4. Archivar proyecto
  const handleArchivar = async () => {
    try {
      setIsArchiving(true);
      await updateProjectMutation.mutateAsync({
        id: proyecto.id,
        data: { estado: "Archivado" }
      });
      setShowArchiveDialog(false);
      if (onArchive) {
        onArchive();
      }
    } catch (error: any) {
      // Mutations handle errors
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4">
          {/* Project Info */}
          <div className="space-y-2 flex-1 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{proyecto.nombre}</h1>
              <Badge className={cn("text-xs w-fit", estadoColors[proyecto.estado])}>
                {proyecto.estado.replace("_", " ")}
              </Badge>
            </div>

            {proyecto.descripcion && (
              <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2 lg:line-clamp-none">
                {proyecto.descripcion}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              {(proyecto.fechaInicio || proyecto.fechaFin) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(proyecto.fechaInicio) || "Sin inicio"} -{" "}
                    {formatDate(proyecto.fechaFin) || "Sin fin"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{miembros.length} miembros</span>
              </div>
            </div>

            {/* Compact stats */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Etapas</span>
                <span className="text-foreground text-sm tracking-normal">
                  {etapasCount ?? proyecto._count?.etapas ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>Tareas</span>
                <span className="text-foreground text-sm tracking-normal">
                  {tareasCount ?? proyecto._count?.tareas ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>Miembros</span>
                <span className="text-foreground text-sm tracking-normal">{miembros.length}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Team Avatars */}
            <div className="flex -space-x-2 sm:mr-2">
              {proyecto.responsable && (
                <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border">
                  <AvatarImage src={proyecto.responsable.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials(proyecto.responsable.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
              )}
              {miembros.slice(0, 4).map((miembro) => (
                <Avatar
                  key={miembro.usuarioId}
                  className="h-8 w-8 border-2 border-background ring-1 ring-border"
                >
                  <AvatarImage src={miembro.usuario.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(miembro.usuario.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {miembros.length > 4 && (
                <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border">
                  <AvatarFallback className="text-xs bg-muted">
                    +{miembros.length - 4}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex gap-2">
              {/* Invite Button */}
              <Button onClick={onInvite} size="sm" variant="outline" className="flex-1 sm:flex-none">
                <UserPlus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Invitar</span>
              </Button>

              {/* Settings Button */}
              <Button onClick={onEdit} size="sm" variant="outline" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ajustes</span>
              </Button>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleVerDetalles}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicar} disabled={isDuplicating}>
                    <Copy className="mr-2 h-4 w-4" />
                    {isDuplicating ? "Duplicando..." : "Duplicar proyecto"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportar}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar datos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowArchiveDialog(true)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar proyecto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Proyecto */}
      <ProjectDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        proyecto={proyecto}
        miembros={miembros}
      />

      {/* Dialog de Confirmación de Archivar */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              El proyecto "{proyecto.nombre}" será archivado. Podrás restaurarlo más tarde desde la sección de proyectos archivados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchivar}
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "Archivando..." : "Archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
