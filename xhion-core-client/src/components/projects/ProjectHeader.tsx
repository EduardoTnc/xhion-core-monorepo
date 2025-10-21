import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Settings, MoreVertical, Calendar, Users } from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { type ProyectoMiembro } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  proyecto: Proyecto;
  miembros: ProyectoMiembro[];
  onEdit: () => void;
  onInvite: () => void;
}

const estadoColors = {
  Activo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  En_Pausa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Archivado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ProjectHeader({ proyecto, miembros, onEdit, onInvite }: ProjectHeaderProps) {
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

  return (
    <div className="border-b bg-card">
      <div className="px-4 lg:px-6 py-4">
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
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Team Avatars */}
            <div className="flex -space-x-2 sm:mr-2">
              {proyecto.responsable && (
                <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border">
                  <AvatarImage src={proyecto.responsable.avatarUrl} />
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
                  <AvatarImage src={miembro.usuario.avatarUrl} />
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
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                  <DropdownMenuItem>Duplicar proyecto</DropdownMenuItem>
                  <DropdownMenuItem>Exportar datos</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Archivar proyecto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
