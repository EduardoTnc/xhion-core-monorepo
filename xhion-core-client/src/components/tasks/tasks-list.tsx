"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, MessageSquare, Paperclip, MoreVertical, Flag } from "lucide-react"

const tasks = [
  {
    id: 1,
    title: "Investigar nuevas tecnologías de IA",
    project: "Rediseño Web",
    status: "backlog",
    priority: "low",
    assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    comments: 2,
    attachments: 1,
    dueDate: "20 Ene",
    completed: false,
  },
  {
    id: 2,
    title: "Diseñar sistema de notificaciones push",
    project: "App Móvil iOS",
    status: "todo",
    priority: "high",
    assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    comments: 3,
    attachments: 2,
    dueDate: "12 Ene",
    completed: false,
  },
  {
    id: 3,
    title: "Implementar autenticación OAuth 2.0",
    project: "Rediseño Web",
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
    id: 4,
    title: "Componentes UI del dashboard principal",
    project: "Rediseño Web",
    status: "review",
    priority: "medium",
    assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    comments: 12,
    attachments: 5,
    dueDate: "09 Ene",
    completed: false,
  },
  {
    id: 5,
    title: "Setup inicial del proyecto y configuración",
    project: "Rediseño Web",
    status: "done",
    priority: "high",
    assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    comments: 4,
    attachments: 2,
    dueDate: "05 Ene",
    completed: true,
  },
  {
    id: 6,
    title: "Diseño de wireframes principales",
    project: "App Móvil iOS",
    status: "done",
    priority: "high",
    assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    comments: 7,
    attachments: 8,
    dueDate: "06 Ene",
    completed: true,
  },
]

export function TasksList() {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <Checkbox checked={task.completed} />

          <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-medium ${
                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {task.title}
                </h4>
                {task.aiRisk && <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{task.project}</p>
            </div>

            <Badge
              variant={
                task.status === "backlog"
                  ? "secondary"
                  : task.status === "todo"
                    ? "outline"
                    : task.status === "in-progress"
                      ? "default"
                      : task.status === "review"
                        ? "secondary"
                        : "outline"
              }
              className="text-xs whitespace-nowrap"
            >
              {task.status === "backlog"
                ? "Backlog"
                : task.status === "todo"
                  ? "Por hacer"
                  : task.status === "in-progress"
                    ? "En progreso"
                    : task.status === "review"
                      ? "En revisión"
                      : "Completado"}
            </Badge>

            <Badge
              variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
              className="text-xs gap-1 whitespace-nowrap"
            >
              <Flag className="h-3 w-3" />
              {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {task.dueDate}
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
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
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
