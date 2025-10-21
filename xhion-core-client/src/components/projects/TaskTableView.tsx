import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MessageSquare, Flag, ArrowUpDown } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { cn } from "@/lib/utils";

interface TaskTableViewProps {
  tareas: Tarea[];
  onTaskClick: (taskId: string) => void;
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

type SortField = "titulo" | "prioridad" | "estado" | "fechaVencimiento";
type SortOrder = "asc" | "desc";

export function TaskTableView({ tareas, onTaskClick }: TaskTableViewProps) {
  const [sortField, setSortField] = useState<SortField>("titulo");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTareas = [...tareas].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "titulo":
        comparison = a.titulo.localeCompare(b.titulo);
        break;
      case "prioridad":
        const prioridadOrder = { Baja: 1, Media: 2, Alta: 3, Urgente: 4 };
        comparison = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
        break;
      case "estado":
        comparison = a.estado.localeCompare(b.estado);
        break;
      case "fechaVencimiento":
        const dateA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 0;
        const dateB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 0;
        comparison = dateA - dateB;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3 font-semibold"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 border-b">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>
                <SortButton field="titulo">Tarea</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="estado">Estado</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="prioridad">Prioridad</SortButton>
              </TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>
                <SortButton field="fechaVencimiento">Vencimiento</SortButton>
              </TableHead>
              <TableHead className="w-20 text-center">Comentarios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTareas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No hay tareas en este proyecto
                </TableCell>
              </TableRow>
            ) : (
              sortedTareas.map((tarea) => {
                const isOverdue =
                  tarea.fechaVencimiento &&
                  new Date(tarea.fechaVencimiento) < new Date() &&
                  tarea.estado !== "Hecho";

                return (
                  <TableRow
                    key={tarea.id}
                    onClick={() => onTaskClick(tarea.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={tarea.estado === "Hecho"}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tarea.titulo}</div>
                        {tarea.descripcion && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {tarea.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", estadoColors[tarea.estado])}>
                        {tarea.estado.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", prioridadColors[tarea.prioridad])}>
                        <Flag className="h-3 w-3 mr-1" />
                        {tarea.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tarea.etapa ? (
                        <Badge variant="outline" className="text-xs">
                          {tarea.etapa.nombre}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin etapa</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tarea.asignado ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={tarea.asignado.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {getInitials(tarea.asignado.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{tarea.asignado.nombreCompleto}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue && "text-red-500 font-medium"
                        )}
                      >
                        {formatDate(tarea.fechaVencimiento)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {tarea._count && tarea._count.comentarios > 0 ? (
                        <div className="inline-flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">{tarea._count.comentarios}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
