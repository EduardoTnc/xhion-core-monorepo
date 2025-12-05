"use client"

import { format, isSameMonth, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useCalendarStore } from "@/store/calendarStore"
import { getMonthCalendarDays } from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"

export function CalendarYear() {
  const { currentDate, calendarItems, setCurrentDate, setViewMode } = useCalendarStore()

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(currentDate.getFullYear(), i, 1)
  })

  const handleMonthClick = (month: Date) => {
    setCurrentDate(month)
    setViewMode('month')
  }

  const handleDayClick = (day: Date) => {
    setCurrentDate(day)
    setViewMode('day')
  }

  // Get items for a specific date
  const getItemsForDate = (date: Date) => {
    return calendarItems.filter(item => {
      const itemStart = parseISO(item.startDate)
      const itemEnd = parseISO(item.endDate)
      const dateStart = new Date(date)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)

      return (itemStart <= dateEnd && itemEnd >= dateStart)
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((month, monthIndex) => {
        const monthDays = getMonthCalendarDays(month)
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        // Count items in this month
        const monthItemCount = calendarItems.filter(item => {
          const itemDate = parseISO(item.startDate)
          return itemDate >= monthStart && itemDate <= monthEnd
        }).length

        return (
          <div
            key={monthIndex}
            className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleMonthClick(month)}
          >
            {/* Month header */}
            <div className="bg-muted/30 p-2 border-b border-border">
              <h3 className="text-sm font-semibold text-center capitalize">
                {format(month, "MMMM", { locale: es })}
              </h3>
              {monthItemCount > 0 && (
                <p className="text-xs text-center text-muted-foreground mt-0.5">
                  {monthItemCount} {monthItemCount === 1 ? 'elemento' : 'elementos'}
                </p>
              )}
            </div>

            {/* Mini calendar */}
            <div className="p-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {["D", "L", "M", "X", "J", "V", "S"].map((day, i) => (
                  <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {monthDays.map((day, dayIndex) => {
                  const isCurrentMonth = isSameMonth(day, month)
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  const dayItemsCount = getItemsForDate(day).length
                  const hasItems = dayItemsCount > 0

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "aspect-square flex items-center justify-center text-[10px] rounded transition-colors",
                        !isCurrentMonth && "text-muted-foreground/50",
                        isCurrentMonth && "hover:bg-muted",
                        isToday && "bg-primary text-primary-foreground font-semibold",
                        hasItems && !isToday && "font-medium"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDayClick(day)
                      }}
                    >
                      <div className="relative">
                        {format(day, "d")}
                        {hasItems && !isToday && (
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
