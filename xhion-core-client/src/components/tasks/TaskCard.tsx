import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, MessageSquare, Calendar, AlertCircle } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCardProps {
  tarea: Tarea;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
}

const prioridadColors = {
  Baja: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Media: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Urgente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function TaskCard({ tarea, onClick, onEdit, onDelete, draggable }: TaskCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = tarea.fechaVencimiento && isPast(new Date(tarea.fechaVencimiento)) && tarea.estado !== "Hecho";
  const isDueToday = tarea.fechaVencimiento && isToday(new Date(tarea.fechaVencimiento));

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:border-primary",
        draggable && "cursor-move"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <h4 className="font-medium leading-none">{tarea.titulo}</h4>
              {tarea.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tarea.descripcion}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
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
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={prioridadColors[tarea.prioridad]}>
              {tarea.prioridad}
            </Badge>
            {tarea.etapa && (
              <Badge variant="secondary" className="text-xs">
                {tarea.etapa.nombre}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {tarea.fechaVencimiento && (
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-destructive",
                    isDueToday && "text-orange-600 dark:text-orange-400"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(tarea.fechaVencimiento), "dd MMM", { locale: es })}
                  </span>
                  {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                </div>
              )}
              {tarea._count && tarea._count.comentarios > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{tarea._count.comentarios}</span>
                </div>
              )}
            </div>

            {tarea.asignado && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={tarea.asignado.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(tarea.asignado.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
