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
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight line-clamp-1">{tarea.titulo}</h4>
              {tarea.descripcion && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {tarea.descripcion}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreVertical className="h-3 w-3" />
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
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", prioridadColors[tarea.prioridad])}>
              {tarea.prioridad}
            </Badge>
            {tarea.etapa && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {tarea.etapa.nombre}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              {tarea.fechaVencimiento && (
                <div
                  className={cn(
                    "flex items-center gap-0.5",
                    isOverdue && "text-destructive",
                    isDueToday && "text-orange-600 dark:text-orange-400"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">
                    {format(new Date(tarea.fechaVencimiento), "dd MMM", { locale: es })}
                  </span>
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                </div>
              )}
              {tarea._count && tarea._count.comentarios > 0 && (
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-[10px]">{tarea._count.comentarios}</span>
                </div>
              )}
            </div>

            {tarea.asignado && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={tarea.asignado.avatarUrl} />
                <AvatarFallback className="text-[9px]">
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
