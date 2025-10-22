import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TaskComments } from "./TaskComments";
import { useTaskStore } from "@/store/taskStore";
import { Loader2, Calendar, User, FolderKanban, Flag, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TaskDetailModalProps {
  tareaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (tarea: any) => void;
  onDelete?: (tareaId: string) => void;
}

const prioridadColors = {
  Baja: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Media: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Urgente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const estadoColors = {
  Por_Hacer: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  En_Progreso: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Hecho: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Bloqueado: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function TaskDetailModal({ tareaId, open, onOpenChange, onEdit, onDelete }: TaskDetailModalProps) {
  const { tareaActual, fetchTareaById, isLoading } = useTaskStore();

  useEffect(() => {
    if (tareaId && open) {
      fetchTareaById(tareaId);
    }
  }, [tareaId, open]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!tareaId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {tareaActual?.titulo || "Detalles de la Tarea"}
              </DialogTitle>
              <DialogDescription>
                Información completa de la tarea, incluyendo detalles, asignaciones y comentarios.
              </DialogDescription>
            </div>
            {tareaActual && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(tareaActual)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(tareaActual.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading && !tareaActual ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tareaActual ? (
          <>

            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={estadoColors[tareaActual.estado]}>
                  {tareaActual.estado.replace("_", " ")}
                </Badge>
                <Badge className={prioridadColors[tareaActual.prioridad]}>
                  <Flag className="mr-1 h-3 w-3" />
                  {tareaActual.prioridad}
                </Badge>
              </div>

              {/* Descripción */}
              {tareaActual.descripcion && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Descripción</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {tareaActual.descripcion}
                  </p>
                </div>
              )}

              <Separator />

              {/* Información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proyecto */}
                <div className="flex items-start gap-3">
                  <FolderKanban className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Proyecto</p>
                    <p className="text-sm text-muted-foreground">
                      {tareaActual.proyecto.nombre}
                    </p>
                  </div>
                </div>

                {/* Etapa */}
                {tareaActual.etapa && (
                  <div className="flex items-start gap-3">
                    <FolderKanban className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Etapa</p>
                      <p className="text-sm text-muted-foreground">
                        {tareaActual.etapa.nombre}
                      </p>
                    </div>
                  </div>
                )}

                {/* Asignado */}
                {tareaActual.asignado && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Asignado a</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={tareaActual.asignado.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(tareaActual.asignado.nombreCompleto)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {tareaActual.asignado.nombreCompleto}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha de vencimiento */}
                {tareaActual.fechaVencimiento && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Vencimiento</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tareaActual.fechaVencimiento), "PPP", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Creador */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Creado por</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={tareaActual.creador.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(tareaActual.creador.nombreCompleto)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {tareaActual.creador.nombreCompleto}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fecha de completado */}
                {tareaActual.fechaCompletado && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Completado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tareaActual.fechaCompletado), "PPP", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Comentarios */}
              <TaskComments
                tareaId={tareaActual.id}
                comentarios={tareaActual.comentarios || []}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No se pudo cargar la tarea</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
