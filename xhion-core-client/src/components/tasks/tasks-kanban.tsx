"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Clock, MessageSquare, Paperclip, Flag } from "lucide-react"

const columns = [
  {
    id: "backlog",
    title: "Backlog",
    color: "text-muted-foreground",
    tasks: [
      {
        id: 1,
        title: "Investigar nuevas tecnologías de IA",
        project: "Rediseño Web",
        priority: "low",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        comments: 2,
        attachments: 1,
        dueDate: "20 Ene",
      },
    ],
  },
  {
    id: "todo",
    title: "Por hacer",
    color: "text-blue-500",
    tasks: [
      {
        id: 2,
        title: "Diseñar sistema de notificaciones push",
        project: "App Móvil iOS",
        priority: "high",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        comments: 3,
        attachments: 2,
        dueDate: "12 Ene",
      },
      {
        id: 3,
        title: "Documentar API REST endpoints",
        project: "Rediseño Web",
        priority: "medium",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        comments: 1,
        attachments: 0,
        dueDate: "15 Ene",
      },
    ],
  },
  {
    id: "in-progress",
    title: "En progreso",
    color: "text-amber-500",
    tasks: [
      {
        id: 4,
        title: "Implementar autenticación OAuth 2.0",
        project: "Rediseño Web",
        priority: "high",
        assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
        comments: 8,
        attachments: 1,
        dueDate: "10 Ene",
        aiRisk: true,
      },
      {
        id: 5,
        title: "Optimizar queries de base de datos",
        project: "Migración Cloud",
        priority: "medium",
        assignee: { name: "Juan Pérez", avatar: "/man.jpg" },
        comments: 5,
        attachments: 3,
        dueDate: "11 Ene",
      },
    ],
  },
  {
    id: "review",
    title: "En revisión",
    color: "text-purple-500",
    tasks: [
      {
        id: 6,
        title: "Componentes UI del dashboard principal",
        project: "Rediseño Web",
        priority: "medium",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        comments: 12,
        attachments: 5,
        dueDate: "09 Ene",
      },
    ],
  },
  {
    id: "done",
    title: "Completado",
    color: "text-green-500",
    tasks: [
      {
        id: 7,
        title: "Setup inicial del proyecto y configuración",
        project: "Rediseño Web",
        priority: "high",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        comments: 4,
        attachments: 2,
        dueDate: "05 Ene",
      },
      {
        id: 8,
        title: "Diseño de wireframes principales",
        project: "App Móvil iOS",
        priority: "high",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        comments: 7,
        attachments: 8,
        dueDate: "06 Ene",
      },
    ],
  },
]

export function TasksKanban() {
  return (
    <div className="flex gap-4 h-full">
      {columns.map((column) => (
        <div key={column.id} className="flex-1 min-w-[280px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${column.color.replace("text-", "bg-")}`} />
              <h3 className={`font-medium ${column.color}`}>{column.title}</h3>
            </div>
            <Badge variant="secondary" className="rounded-full">
              {column.tasks.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{task.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{task.project}</p>
                  </div>
                  {task.aiRisk && (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" title="Riesgo detectado por IA" />
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={
                      task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                    }
                    className="text-xs gap-1"
                  >
                    <Flag className="h-3 w-3" />
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
