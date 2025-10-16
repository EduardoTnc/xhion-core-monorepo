"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Clock, MessageSquare, Paperclip, MoreVertical } from "lucide-react"
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
    dueDate: "2 días",
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
    dueDate: "Hoy",
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
    dueDate: "Completado",
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
    dueDate: "Completado",
    completed: true,
  },
]

export function ProjectList() {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <Checkbox checked={task.completed} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm font-medium ${
                  task.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {task.title}
              </h4>
              {task.aiRisk && <AlertCircle className="h-4 w-4 text-destructive" />}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Badge
                variant={
                  task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {task.status === "todo"
                  ? "Por hacer"
                  : task.status === "in-progress"
                    ? "En progreso"
                    : task.status === "review"
                      ? "En revisión"
                      : "Completado"}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.dueDate}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
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
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
