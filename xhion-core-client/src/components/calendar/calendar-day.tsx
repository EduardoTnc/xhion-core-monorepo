"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin, Users, Video } from "lucide-react"

const hours = Array.from({ length: 24 }, (_, i) => i)

const events = [
  {
    id: 1,
    title: "Daily Standup",
    type: "meeting",
    time: "09:00 - 09:30",
    hour: 9,
    duration: 0.5,
    location: "Zoom",
    attendees: 4,
    color: "bg-chart-1",
  },
  {
    id: 2,
    title: "Implementar OAuth",
    type: "task",
    time: "10:00 - 12:00",
    hour: 10,
    duration: 2,
    assignee: { name: "María López", avatar: "/diverse-woman-portrait.png" },
    color: "bg-chart-2",
  },
  {
    id: 3,
    title: "Revisión de diseño UI",
    type: "meeting",
    time: "14:00 - 15:30",
    hour: 14,
    duration: 1.5,
    location: "Sala 3",
    attendees: 6,
    color: "bg-chart-3",
  },
  {
    id: 4,
    title: "Deadline: Deploy staging",
    type: "deadline",
    time: "18:00",
    hour: 18,
    duration: 0.5,
    color: "bg-destructive",
  },
]

export function CalendarDay() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex">
        {/* Time column */}
        <div className="w-20 border-r border-border">
          <div className="h-12 border-b border-border" />
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b border-border px-3 py-2 text-right">
              <span className="text-xs text-muted-foreground">{hour.toString().padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {/* Events column */}
        <div className="flex-1 relative">
          <div className="h-12 border-b border-border bg-muted/30 px-4 flex items-center">
            <span className="text-sm font-medium text-foreground">Miércoles, 10 de Enero</span>
          </div>
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-border hover:bg-muted/20 transition-colors" />
            ))}

            {/* Events overlay */}
            {events.map((event) => (
              <div
                key={event.id}
                className={`absolute left-2 right-2 rounded-lg ${event.color} p-3 shadow-sm cursor-pointer transition-all hover:shadow-md`}
                style={{
                  top: `${event.hour * 80 + 48}px`,
                  height: `${event.duration * 80 - 8}px`,
                }}
              >
                <div className="flex flex-col h-full text-white">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                      {event.type === "meeting" ? "Reunión" : event.type === "task" ? "Tarea" : "Deadline"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs opacity-90">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </div>
                  {event.location && (
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                      {event.location.includes("Zoom") ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {event.location}
                    </div>
                  )}
                  {event.attendees && (
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                      <Users className="h-3 w-3" />
                      {event.attendees} asistentes
                    </div>
                  )}
                  {event.assignee && (
                    <div className="mt-auto flex items-center gap-2">
                      <Avatar className="h-5 w-5 border border-white/20">
                        <AvatarImage src={event.assignee.avatar || "/placeholder.svg"} alt={event.assignee.name} />
                        <AvatarFallback>{event.assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs opacity-90">{event.assignee.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
