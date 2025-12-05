"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useCalendarStore } from "@/store/calendarStore"
import { generateTimeSlots } from "@/lib/calendar-utils"
import { EventDetailPopover } from "./event-detail-popover"
import { cn } from "@/lib/utils"

export function CalendarDay() {
  const { currentDate, calendarItems, openCreateEventModal } = useCalendarStore()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const timeSlots = generateTimeSlots()

  const handleTimeSlotClick = (hour: number, minute: number) => {
    const clickedDate = new Date(currentDate)
    clickedDate.setHours(hour, minute, 0, 0)
    openCreateEventModal(clickedDate)
  }

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setSelectedItemId(itemId)
  }

  // Get items for the current day
  const dayItems = calendarItems.filter(item => {
    const itemStart = parseISO(item.startDate)
    return format(itemStart, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  })

  // Get items for a specific time slot
  const getItemsForSlot = (hour: number, minute: number) => {
    return dayItems.filter(item => {
      const itemStart = parseISO(item.startDate)
      const itemStartHour = itemStart.getHours()
      const itemStartMinutes = itemStart.getMinutes()
      const slotMinutes = hour * 60 + minute
      const itemMinutesTotal = itemStartHour * 60 + itemStartMinutes
      return itemMinutesTotal >= slotMinutes && itemMinutesTotal < slotMinutes + 30
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {format(currentDate, "EEEE", { locale: es })}
          </div>
          <div className="text-2xl font-semibold mt-1">
            {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[700px]">
        <div className="grid grid-cols-[80px_1fr]">
          {timeSlots.map((time, index) => {
            const [hourStr, minuteStr] = time.split(':')
            const hour = parseInt(hourStr)
            const minute = parseInt(minuteStr)
            const isHourMark = minute === 0

            // Find items that start in this time slot
            const slotItems = getItemsForSlot(hour, minute)

            return (
              <div key={index} className="contents">
                {/* Time label */}
                <div
                  className={cn(
                    "p-3 text-sm text-muted-foreground text-right border-r border-border",
                    isHourMark ? "border-b border-border" : "border-b border-dashed border-border/50"
                  )}
                >
                  {isHourMark && time}
                </div>

                {/* Event column */}
                <div
                  className={cn(
                    "relative min-h-[40px] hover:bg-muted/20 cursor-pointer transition-colors",
                    isHourMark ? "border-b border-border" : "border-b border-dashed border-border/50"
                  )}
                  onClick={() => handleTimeSlotClick(hour, minute)}
                >
                  {slotItems.map((item) => {
                    const isSelected = selectedItemId === item.id
                    const isEvent = item.type === 'event' && item.evento
                    const itemStart = parseISO(item.startDate)
                    const itemEnd = parseISO(item.endDate)
                    const durationMinutes = (itemEnd.getTime() - itemStart.getTime()) / (1000 * 60)
                    const heightSlots = Math.ceil(durationMinutes / 30)

                    return isEvent ? (
                      <EventDetailPopover
                        key={item.id}
                        evento={item.evento!}
                        open={isSelected}
                        onOpenChange={(open) => !open && setSelectedItemId(null)}
                      >
                        <div
                          className={cn(
                            "absolute inset-x-2 rounded-lg p-3 text-white cursor-pointer hover:shadow-lg transition-all z-10",
                            isSelected && "ring-2 ring-foreground"
                          )}
                          style={{
                            backgroundColor: item.color || '#6b7280',
                            top: '4px',
                            height: `calc(${heightSlots * 40}px - 8px)`,
                          }}
                          onClick={(e) => handleItemClick(e, item.id)}
                        >
                          <div className="font-semibold text-sm mb-1">{item.title}</div>
                          <div className="text-xs opacity-90">
                            {format(itemStart, "HH:mm")} - {format(itemEnd, "HH:mm")}
                          </div>
                          {item.evento?.ubicacion && (
                            <div className="text-xs opacity-80 mt-1 truncate">
                              📍 {item.evento.ubicacion}
                            </div>
                          )}
                          {item.description && (
                            <div className="text-xs opacity-80 mt-2 line-clamp-2">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </EventDetailPopover>
                    ) : (
                      <div
                        key={item.id}
                        className={cn(
                          "absolute inset-x-2 rounded-lg p-3 text-white cursor-pointer hover:shadow-lg transition-all z-10",
                          isSelected && "ring-2 ring-foreground"
                        )}
                        style={{
                          backgroundColor: item.color || '#6b7280',
                          top: '4px',
                          height: `calc(${heightSlots * 40}px - 8px)`,
                        }}
                        onClick={(e) => handleItemClick(e, item.id)}
                        title={item.title}
                      >
                        <div className="font-semibold text-sm mb-1">{item.title}</div>
                        {item.description && (
                          <div className="text-xs opacity-80 mt-2 line-clamp-2">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
