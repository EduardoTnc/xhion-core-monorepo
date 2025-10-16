"use client"
import { Clock } from "lucide-react"

const days = ["Lun 8", "Mar 9", "Mié 10", "Jue 11", "Vie 12", "Sáb 13", "Dom 14"]
const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8am to 8pm

const events = [
  { id: 1, title: "Daily Standup", day: 0, hour: 9, duration: 0.5, color: "bg-chart-1" },
  { id: 2, title: "Implementar OAuth", day: 0, hour: 10, duration: 2, color: "bg-chart-2" },
  { id: 3, title: "Code Review", day: 1, hour: 11, duration: 1, color: "bg-chart-3" },
  { id: 4, title: "Revisión diseño UI", day: 2, hour: 14, duration: 1.5, color: "bg-chart-1" },
  { id: 5, title: "Sprint Planning", day: 3, hour: 10, duration: 2, color: "bg-chart-4" },
  { id: 6, title: "Deploy staging", day: 4, hour: 16, duration: 1, color: "bg-destructive" },
]

export function CalendarWeek() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex">
        {/* Time column */}
        <div className="w-20 border-r border-border flex-shrink-0">
          <div className="h-12 border-b border-border" />
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-border px-3 py-2 text-right">
              <span className="text-xs text-muted-foreground">{hour.toString().padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="flex-1 flex overflow-x-auto">
          {days.map((day, dayIndex) => (
            <div key={day} className="flex-1 min-w-[140px] border-r border-border last:border-r-0">
              <div className="h-12 border-b border-border bg-muted/30 px-3 flex items-center justify-center">
                <span className={`text-sm font-medium ${dayIndex === 2 ? "text-primary" : "text-foreground"}`}>
                  {day}
                </span>
              </div>
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b border-border hover:bg-muted/20 transition-colors" />
                ))}

                {/* Events for this day */}
                {events
                  .filter((event) => event.day === dayIndex)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 rounded ${event.color} p-2 shadow-sm cursor-pointer transition-all hover:shadow-md`}
                      style={{
                        top: `${(event.hour - 8) * 64 + 48}px`,
                        height: `${event.duration * 64 - 4}px`,
                      }}
                    >
                      <div className="flex flex-col h-full text-white">
                        <h4 className="font-medium text-xs leading-tight line-clamp-2">{event.title}</h4>
                        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-90">
                          <Clock className="h-2.5 w-2.5" />
                          {event.hour}:00
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
