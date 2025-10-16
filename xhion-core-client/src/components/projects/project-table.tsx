"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, MessageSquare, Paperclip, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

const tasks = [
  {
    id: 1,
    title: "Diseñar sistema de notificaciones",
    status: "todo",
    priority: "high",
    assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    comments: 3,
    attachments: 2,
    dueDate: "15 Ene",
    completed: false,
  },
  {
    id: 2,
    title: "Implementar autenticación OAuth",
    status: "in-progress",
    priority: "high",
    assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
    comments: 8,
    attachments: 1,
    dueDate: "10 Ene",
    aiRisk: true,
    completed: false,
  },
  {
    id: 3,
    title: "Componentes UI del dashboard",
    status: "review",
    priority: "low",
    assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    comments: 12,
    attachments: 5,
    dueDate: "08 Ene",
    completed: false,
  },
  {
    id: 4,
    title: "Setup inicial del proyecto",
    status: "done",
    priority: "high",
    assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    comments: 4,
    attachments: 2,
    dueDate: "05 Ene",
    completed: true,
  },
]

export function ProjectTable() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="w-12 p-4">
              <Checkbox />
            </th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tarea</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Estado</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Prioridad</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Asignado</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Fecha</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actividad</th>
            <th className="w-12 p-4"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-border transition-colors hover:bg-muted/30">
              <td className="p-4">
                <Checkbox checked={task.completed} />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      task.completed ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.aiRisk && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline" className="text-xs">
                  {task.status === "todo"
                    ? "Por hacer"
                    : task.status === "in-progress"
                      ? "En progreso"
                      : task.status === "review"
                        ? "En revisión"
                        : "Completado"}
                </Badge>
              </td>
              <td className="p-4">
                <Badge
                  variant={
                    task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                </Badge>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{task.assignee.name}</span>
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm text-muted-foreground">{task.dueDate}</span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {task.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {task.comments}
                    </div>
                  )}
                  {task.attachments > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" />
                      {task.attachments}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
