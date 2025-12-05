"use client"

import { useState } from "react"
import { format, isSameMonth, isToday, parseISO } from "date-fns"
import { useCalendarStore } from "@/store/calendarStore"
import { getMonthCalendarDays } from "@/lib/calendar-utils"
import { EventDetailPopover } from "./event-detail-popover"
import { cn } from "@/lib/utils"

export function CalendarMonth() {
  const { currentDate, calendarItems, openCreateEventModal } = useCalendarStore()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const calendarDays = getMonthCalendarDays(currentDate)

  const handleDayClick = (date: Date) => {
    openCreateEventModal(date)
  }

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setSelectedItemId(itemId)
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayItems = getItemsForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] md:min-h-[120px] border-b border-r border-border p-1 md:p-2 transition-colors hover:bg-muted/30 cursor-pointer",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div
                className={cn(
                  "mb-1 md:mb-2 flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full text-xs md:text-sm font-medium transition-colors",
                  isCurrentDay
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5 md:space-y-1">
                {dayItems.slice(0, 3).map((item) => {
                  const isSelected = selectedItemId === item.id
                  const isEvent = item.type === 'event' && item.evento

                  return isEvent ? (
                    <EventDetailPopover
                      key={item.id}
                      evento={item.evento!}
                      open={isSelected}
                      onOpenChange={(open) => !open && setSelectedItemId(null)}
                    >
                      <div
                        className={cn(
                          "rounded px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-white transition-all hover:shadow-sm cursor-pointer",
                          isSelected && "ring-2 ring-foreground"
                        )}
                        style={{ backgroundColor: item.color || '#6b7280' }}
                        onClick={(e) => handleItemClick(e, item.id)}
                        title={item.title}
                      >
                        <div className="truncate flex items-center gap-1">
                          {!item.allDay && (
                            <span className="hidden md:inline">
                              {format(parseISO(item.startDate), "HH:mm")}
                            </span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      </div>
                    </EventDetailPopover>
                  ) : (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-white transition-all hover:shadow-sm cursor-pointer",
                        isSelected && "ring-2 ring-foreground"
                      )}
                      style={{ backgroundColor: item.color || '#6b7280' }}
                      onClick={(e) => handleItemClick(e, item.id)}
                      title={item.title}
                    >
                      <div className="truncate">{item.title}</div>
                    </div>
                  )
                })}
                {dayItems.length > 3 && (
                  <div className="px-1 md:px-2 text-[10px] md:text-xs text-muted-foreground">
                    +{dayItems.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
