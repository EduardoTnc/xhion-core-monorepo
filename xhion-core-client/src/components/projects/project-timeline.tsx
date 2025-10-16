"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"

const timelineData = [
  {
    date: "10 Ene",
    tasks: [
      {
        id: 1,
        title: "Implementar autenticación OAuth",
        priority: "high",
        assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
        aiRisk: true,
        duration: 3,
      },
    ],
  },
  {
    date: "12 Ene",
    tasks: [
      {
        id: 2,
        title: "Optimizar queries de base de datos",
        priority: "medium",
        assignee: { name: "Juan Pérez", avatar: "/man.jpg" },
        duration: 2,
      },
    ],
  },
  {
    date: "15 Ene",
    tasks: [
      {
        id: 3,
        title: "Diseñar sistema de notificaciones",
        priority: "high",
        assignee: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
        duration: 4,
      },
      {
        id: 4,
        title: "Documentar API endpoints",
        priority: "medium",
        assignee: { name: "Carlos Ruiz", avatar: "/man.jpg" },
        duration: 2,
      },
    ],
  },
]

export function ProjectTimeline() {
  return (
    <div className="space-y-6">
      {timelineData.map((day) => (
        <div key={day.date}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground">{day.date}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {day.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                    {task.aiRisk && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={task.priority === "high" ? "destructive" : "default"} className="text-xs">
                      {task.priority === "high" ? "Alta" : "Media"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.duration} días</span>
                  </div>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                  <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
