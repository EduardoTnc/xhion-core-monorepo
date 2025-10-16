"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Clock, MessageSquare, Paperclip } from "lucide-react"

const columns = [
  {
    id: "todo",
    title: "Por hacer",
    tasks: [
      {
        id: 1,
        title: "Diseñar sistema de notificaciones",
        priority: "high",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        comments: 3,
        attachments: 2,
        dueDate: "2 días",
      },
      {
        id: 2,
        title: "Documentar API endpoints",
        priority: "medium",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        comments: 1,
        attachments: 0,
        dueDate: "5 días",
      },
    ],
  },
  {
    id: "in-progress",
    title: "En progreso",
    tasks: [
      {
        id: 3,
        title: "Implementar autenticación OAuth",
        priority: "high",
        assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
        comments: 8,
        attachments: 1,
        dueDate: "Hoy",
        aiRisk: true,
      },
      {
        id: 4,
        title: "Optimizar queries de base de datos",
        priority: "medium",
        assignee: { name: "Juan Pérez", avatar: "/man.jpg" },
        comments: 5,
        attachments: 3,
        dueDate: "Mañana",
      },
    ],
  },
  {
    id: "review",
    title: "En revisión",
    tasks: [
      {
        id: 5,
        title: "Componentes UI del dashboard",
        priority: "low",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        comments: 12,
        attachments: 5,
        dueDate: "Completado",
      },
    ],
  },
  {
    id: "done",
    title: "Completado",
    tasks: [
      {
        id: 6,
        title: "Setup inicial del proyecto",
        priority: "high",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        comments: 4,
        attachments: 2,
        dueDate: "Completado",
      },
    ],
  },
]

export function ProjectKanban() {
  return (
    <div className="flex gap-4 h-full">
      {columns.map((column) => (
        <div key={column.id} className="flex-1 min-w-[280px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-foreground">{column.title}</h3>
            <Badge variant="secondary" className="rounded-full">
              {column.tasks.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground leading-snug">{task.title}</h4>
                  {task.aiRisk && <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={
                      task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.dueDate}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Avatar className="h-6 w-6">
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
