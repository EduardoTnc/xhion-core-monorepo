"use client"

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const firstDayOfMonths = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1] // Day of week for 1st of each month

const eventDays = [
  [10, 15, 18, 25], // January
  [5, 12, 20], // February
  [8, 15, 22, 29], // March
  [3, 10, 18, 25], // April
  [7, 14, 21, 28], // May
  [4, 11, 18, 25], // June
  [2, 9, 16, 23, 30], // July
  [6, 13, 20, 27], // August
  [3, 10, 17, 24], // September
  [1, 8, 15, 22, 29], // October
  [5, 12, 19, 26], // November
  [3, 10, 17, 24, 31], // December
]

export function CalendarYear() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((month, monthIndex) => (
        <div key={month} className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-center text-sm font-semibold text-foreground">{month}</h3>

          {/* Mini calendar */}
          <div className="space-y-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1">
              {["D", "L", "M", "X", "J", "V", "S"].map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before month starts */}
              {Array.from({ length: firstDayOfMonths[monthIndex] }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonths[monthIndex] }).map((_, i) => {
                const day = i + 1
                const hasEvent = eventDays[monthIndex].includes(day)
                const isToday = monthIndex === 0 && day === 10 // January 10th

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : hasEvent
                          ? "bg-chart-1/20 text-foreground hover:bg-chart-1/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
