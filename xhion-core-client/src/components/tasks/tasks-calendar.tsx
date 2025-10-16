"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const calendarTasks = [
  { id: 1, title: "Implementar OAuth", date: 10, priority: "high", project: "Web" },
  { id: 2, title: "Optimizar queries", date: 11, priority: "medium", project: "Cloud" },
  { id: 3, title: "Diseñar notificaciones", date: 12, priority: "high", project: "Mobile" },
  { id: 4, title: "Documentar API", date: 15, priority: "medium", project: "Web" },
  { id: 5, title: "Testing integración", date: 16, priority: "high", project: "Web" },
  { id: 6, title: "Revisar código", date: 17, priority: "low", project: "Mobile" },
  { id: 7, title: "Deploy staging", date: 18, priority: "high", project: "Cloud" },
]

const daysInMonth = 31
const firstDayOfWeek = 3 // Wednesday (0 = Sunday)

export function TasksCalendar() {
  const [currentMonth, setCurrentMonth] = useState("Enero 2025")

  const getDayTasks = (day: number) => {
    return calendarTasks.filter((task) => task.date === day)
  }

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{currentMonth}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Hoy
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-border bg-muted/10" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const tasks = getDayTasks(day)
            const isToday = day === 10

            return (
              <div
                key={day}
                className={`min-h-[120px] border-b border-r border-border p-2 transition-colors hover:bg-muted/30 ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`rounded px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                        task.priority === "high"
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : task.priority === "medium"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={`${task.title} - ${task.project}`}
                    >
                      <div className="truncate">{task.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Prioridad:</span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-destructive/10" />
          <span className="text-foreground">Alta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/10" />
          <span className="text-foreground">Media</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-muted" />
          <span className="text-foreground">Baja</span>
        </div>
      </div>
    </div>
  )
}
