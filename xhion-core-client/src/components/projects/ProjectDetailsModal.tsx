import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Layers, 
  FileText, 
  Building2,
  User,
  Clock,
  TrendingUp
} from "lucide-react";
import { type Proyecto, type ProyectoMiembro } from "@/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyecto: Proyecto;
  miembros: ProyectoMiembro[];
}

const estadoColors = {
  Activo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  En_Pausa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Archivado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const rolColors = {
  Responsable: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Miembro: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

export function ProjectDetailsModal({ open, onOpenChange, proyecto, miembros }: ProjectDetailsModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularProgreso = () => {
    const totalTareas = proyecto._count?.tareas || 0;
    if (totalTareas === 0) return 0;
    // Aquí podrías calcular el progreso real basado en tareas completadas
    // Por ahora retornamos un valor estimado
    return Math.round((totalTareas / (totalTareas + 5)) * 100);
  };

  const calcularDuracion = () => {
    if (!proyecto.fechaInicio || !proyecto.fechaFin) return null;
    const inicio = new Date(proyecto.fechaInicio);
    const fin = new Date(proyecto.fechaFin);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const responsable = miembros.find(m => m.rol === "Responsable");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detalles del Proyecto</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Información General */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{proyecto.nombre}</h3>
                  <Badge className={cn("text-xs w-fit", estadoColors[proyecto.estado])}>
                    {proyecto.estado.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {proyecto.descripcion && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proyecto.descripcion}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Información del Responsable */}
            {responsable && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Responsable del Proyecto
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={responsable.usuario.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(responsable.usuario.nombreCompleto)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{responsable.usuario.nombreCompleto}</p>
                      <p className="text-xs text-muted-foreground">{responsable.usuario.email}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Departamento */}
            {proyecto.departamento && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4" />
                    Departamento
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{proyecto.departamento.nombre}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Fechas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Cronograma
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fecha de Inicio</p>
                  <p className="text-sm font-medium">{formatDate(proyecto.fechaInicio)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fecha de Finalización</p>
                  <p className="text-sm font-medium">{formatDate(proyecto.fechaFin)}</p>
                </div>
                {calcularDuracion() && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Duración Estimada</p>
                    <p className="text-sm font-medium">{calcularDuracion()} días</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Estadísticas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Estadísticas
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-xs">Tareas</span>
                  </div>
                  <p className="text-2xl font-bold">{proyecto._count?.tareas || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Miembros</span>
                  </div>
                  <p className="text-2xl font-bold">{miembros.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs">Etapas</span>
                  </div>
                  <p className="text-2xl font-bold">{proyecto._count?.etapas || 0}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Equipo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Equipo del Proyecto ({miembros.length})
              </div>
              <div className="space-y-2">
                {miembros.map((miembro) => (
                  <div
                    key={miembro.usuario.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={miembro.usuario.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(miembro.usuario.nombreCompleto)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {miembro.usuario.nombreCompleto}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {miembro.usuario.email}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", rolColors[miembro.rol as keyof typeof rolColors])}
                    >
                      {miembro.rol}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Información de Sistema */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Información del Sistema
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-medium">Fecha de Creación</p>
                  <p>{formatDateTime(proyecto.fechaCreacion)}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Última Actualización</p>
                  <p>{formatDateTime(proyecto.fechaActualizacion)}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">ID del Proyecto</p>
                  <p className="font-mono">{proyecto.id}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
