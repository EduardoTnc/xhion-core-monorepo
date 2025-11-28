import { type Tarea } from "@/services/taskService"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageSquare, Flag } from "lucide-react"

interface TasksKanbanProps {
  tasks: Tarea[]
}

const COLUMNS = [
  { id: "Por_Hacer", title: "Por hacer", color: "text-blue-500" },
  { id: "En_Progreso", title: "En progreso", color: "text-amber-500" },
  { id: "Bloqueado", title: "Bloqueado", color: "text-red-500" },
  { id: "Hecho", title: "Hecho", color: "text-green-500" },
]

export function TasksKanban({ tasks }: TasksKanbanProps) {
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.estado === status)
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id)

        return (
          <div key={column.id} className="flex-1 min-w-[280px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${column.color.replace("text-", "bg-")}`} />
                <h3 className={`font-medium ${column.color}`}>{column.title}</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {columnTasks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{task.titulo}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{task.proyecto?.nombre || "Sin proyecto"}</p>
                    </div>
                    {/* AI Risk would go here */}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="text-xs gap-1"
                    >
                      <Flag className="h-3 w-3" />
                      {task.prioridad}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.fechaVencimiento ? new Date(task.fechaVencimiento).toLocaleDateString() : "Sin fecha"}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Avatar className="h-6 w-6">
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
                      {(task._count?.comentarios || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {task._count?.comentarios}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
