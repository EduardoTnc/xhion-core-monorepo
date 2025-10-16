"use client"

const daysInMonth = 31
const firstDayOfWeek = 3 // Wednesday

const events = [
  { id: 1, title: "Daily Standup", date: 8, type: "meeting", color: "bg-chart-1" },
  { id: 2, title: "Implementar OAuth", date: 10, type: "task", color: "bg-chart-2" },
  { id: 3, title: "Code Review", date: 10, type: "meeting", color: "bg-chart-3" },
  { id: 4, title: "Revisión diseño", date: 12, type: "meeting", color: "bg-chart-1" },
  { id: 5, title: "Sprint Planning", date: 15, type: "meeting", color: "bg-chart-4" },
  { id: 6, title: "Deploy staging", date: 18, type: "deadline", color: "bg-destructive" },
  { id: 7, title: "Testing", date: 20, type: "task", color: "bg-chart-2" },
  { id: 8, title: "Retrospectiva", date: 25, type: "meeting", color: "bg-chart-3" },
]

export function CalendarMonth() {
  const getDayEvents = (day: number) => {
    return events.filter((event) => event.date === day)
  }

  return (
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
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-border bg-muted/10" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayEvents = getDayEvents(day)
          const isToday = day === 10

          return (
            <div
              key={day}
              className={`min-h-[120px] border-b border-r border-border p-2 transition-colors hover:bg-muted/30 cursor-pointer ${
                isToday ? "bg-primary/5" : ""
              }`}
            >
              <div
                className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`rounded px-2 py-1 text-xs font-medium text-white transition-all hover:shadow-sm ${event.color}`}
                    title={event.title}
                  >
                    <div className="truncate">{event.title}</div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="px-2 text-xs text-muted-foreground">+{dayEvents.length - 3} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
