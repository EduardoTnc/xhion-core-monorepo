"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, MapPin, Users, Video, Sparkles } from "lucide-react"

const upcomingEvents = [
  {
    id: 1,
    title: "Daily Standup",
    type: "meeting",
    time: "09:00 - 09:30",
    date: "Hoy",
    location: "Zoom",
    attendees: 4,
  },
  {
    id: 2,
    title: "Implementar OAuth",
    type: "task",
    time: "10:00 - 12:00",
    date: "Hoy",
    assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
  },
  {
    id: 3,
    title: "Revisión de diseño UI",
    type: "meeting",
    time: "14:00 - 15:30",
    date: "Hoy",
    location: "Sala 3",
    attendees: 6,
  },
  {
    id: 4,
    title: "Sprint Planning",
    type: "meeting",
    time: "10:00 - 12:00",
    date: "Mañana",
    location: "Zoom",
    attendees: 8,
  },
]

const filters = [
  { id: "tasks", label: "Tareas", color: "bg-chart-2", checked: true },
  { id: "meetings", label: "Reuniones", color: "bg-chart-1", checked: true },
  { id: "deadlines", label: "Deadlines", color: "bg-destructive", checked: true },
]

export function CalendarSidebar() {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Mini calendar */}
      <div className="border-b border-border p-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 text-center text-sm font-medium text-foreground">Enero 2025</div>
          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1">
              {["D", "L", "M", "X", "J", "V", "S"].map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1
                const isToday = day === 10
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Filtros</h3>
        <div className="space-y-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <Checkbox id={filter.id} defaultChecked={filter.checked} />
              <div className={`h-3 w-3 rounded ${filter.color}`} />
              <label htmlFor={filter.id} className="text-sm text-foreground cursor-pointer">
                {filter.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Próximos eventos</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-border bg-background p-3 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground leading-tight">{event.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{event.date}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type === "meeting" ? "Reunión" : "Tarea"}
                </Badge>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {event.location.includes("Zoom") ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {event.location}
                  </div>
                )}
                {event.attendees && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {event.attendees} asistentes
                  </div>
                )}
                {event.assignee && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={event.assignee.avatar || "/placeholder.svg"} alt={event.assignee.name} />
                      <AvatarFallback>{event.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-foreground">{event.assignee.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI suggestions */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Sugerencia IA</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tienes 3 reuniones consecutivas hoy. Considera reprogramar la revisión de diseño para mañana.
          </p>
          <Button variant="outline" size="sm" className="mt-3 w-full text-xs bg-transparent">
            Reprogramar automáticamente
          </Button>
        </div>
      </div>
    </div>
  )
}
