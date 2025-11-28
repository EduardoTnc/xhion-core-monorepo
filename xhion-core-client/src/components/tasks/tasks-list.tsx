"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, MoreVertical, Flag } from "lucide-react"

import { type Tarea } from "@/services/taskService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface TasksListProps {
  tasks: Tarea[]
}

export function TasksList({ tasks }: TasksListProps) {
  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No hay tareas para mostrar
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <Checkbox checked={task.estado === "Hecho"} />

            <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-medium ${task.estado === "Hecho" ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                  >
                    {task.titulo}
                  </h4>
                  {/* AI Risk indicator would go here if available in model */}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.proyecto?.nombre || "Sin proyecto"}</p>
              </div>

              <Badge
                variant={
                  task.estado === "Por_Hacer"
                    ? "outline"
                    : task.estado === "En_Progreso"
                      ? "default"
                      : task.estado === "Bloqueado"
                        ? "destructive"
                        : "secondary"
                }
                className="text-xs whitespace-nowrap"
              >
                {task.estado.replace("_", " ")}
              </Badge>

              <Badge
                variant="default"
                className="text-xs gap-1 whitespace-nowrap"
              >
                <Flag className="h-3 w-3" />
                {/* Display priority directly or map it */}
                Prioridad
              </Badge>

              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {task.fechaVencimiento ? format(new Date(task.fechaVencimiento), "d MMM", { locale: es }) : "Sin fecha"}
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={task.asignado?.avatarUrl || "/placeholder.svg"} alt={task.asignado?.nombreCompleto} />
                  <AvatarFallback>{task.asignado?.nombreCompleto?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {(task.comentarios?.length || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {task.comentarios?.length}
                    </div>
                  )}
                  {/* {(task.archivos?.length || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" />
                      {task.archivos?.length}
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  )
}
