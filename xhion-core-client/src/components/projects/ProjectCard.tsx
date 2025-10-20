import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Users, ListTodo, Calendar } from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  proyecto: Proyecto;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const estadoColors = {
  Activo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  En_Pausa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Archivado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ProjectCard({ proyecto, onClick, onEdit, onDelete }: ProjectCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:border-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-lg leading-none tracking-tight">
            {proyecto.nombre}
          </h3>
          {proyecto.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {proyecto.descripcion}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}>
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Badge className={estadoColors[proyecto.estado]}>
            {proyecto.estado.replace("_", " ")}
          </Badge>
          {proyecto.departamento && (
            <span className="text-xs text-muted-foreground">
              {proyecto.departamento.nombre}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ListTodo className="h-4 w-4" />
              <span>{proyecto._count?.tareas || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{proyecto._count?.miembros || 0}</span>
            </div>
            {proyecto._count?.etapas && proyecto._count.etapas > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{proyecto._count.etapas}</span>
              </div>
            )}
          </div>

          <div className="flex -space-x-2">
            {proyecto.responsable && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={proyecto.responsable.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(proyecto.responsable.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
            )}
            {proyecto.miembros && proyecto.miembros.slice(0, 3).map((miembro) => (
              <Avatar key={miembro.usuarioId} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={miembro.usuario.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(miembro.usuario.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
            ))}
            {proyecto._count && proyecto._count.miembros > 4 && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  +{proyecto._count.miembros - 4}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
