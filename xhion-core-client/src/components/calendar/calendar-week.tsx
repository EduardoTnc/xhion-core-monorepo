"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useCalendarStore } from "@/store/calendarStore"
import {
  getWeekDays,
  generateTimeSlots
} from "@/lib/calendar-utils"
import { EventDetailPopover } from "./event-detail-popover"
import { cn } from "@/lib/utils"

export function CalendarWeek() {
  const { currentDate, calendarItems, openCreateEventModal } = useCalendarStore()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const weekDays = getWeekDays(currentDate)
  const timeSlots = generateTimeSlots()

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const clickedDate = new Date(day)
    clickedDate.setHours(hour, 0, 0, 0)
    openCreateEventModal(clickedDate)
  }

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setSelectedItemId(itemId)
  }

  // Get items for a specific date and time slot
  const getItemsForSlot = (day: Date, hour: number, minute: number) => {
    return calendarItems.filter(item => {
      const itemStart = parseISO(item.startDate)
      const itemStartHour = itemStart.getHours()
      const itemStartMinutes = itemStart.getMinutes()
      const slotMinutes = hour * 60 + minute
      const itemMinutesTotal = itemStartHour * 60 + itemStartMinutes

      // Check if item starts in this slot and is on this day
      const isSameDay = format(itemStart, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      return isSameDay && itemMinutesTotal >= slotMinutes && itemMinutesTotal < slotMinutes + 30
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="p-2 border-r border-border" /> {/* Time column header */}
        {weekDays.map((day, index) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          return (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r border-border last:border-r-0",
                isToday && "bg-primary/10"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {format(day, "EEE", { locale: es })}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold mt-1",
                  isToday && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => {
            const hour = parseInt(time.split(':')[0])
            const minute = parseInt(time.split(':')[1])
            const isHourMark = time.endsWith(':00')

            return (
              <div key={timeIndex} className="contents">
                {/* Time label */}
                <div
                  className={cn(
                    "p-2 text-xs text-muted-foreground text-right border-r border-border",
                    isHourMark ? "border-b border-border" : "border-b border-dashed border-border/50"
                  )}
                >
                  {isHourMark && time}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIndex) => {
                  const slotItems = getItemsForSlot(day, hour, minute)

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "relative min-h-[30px] border-r border-border last:border-r-0 hover:bg-muted/20 cursor-pointer transition-colors",
                        isHourMark ? "border-b border-border" : "border-b border-dashed border-border/50"
                      )}
                      onClick={() => handleTimeSlotClick(day, hour)}
                    >
                      {slotItems.map((item) => {
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
                                "absolute inset-x-1 rounded px-2 py-1 text-xs font-medium text-white cursor-pointer hover:shadow-md transition-all z-10",
                                isSelected && "ring-2 ring-foreground"
                              )}
                              style={{
                                backgroundColor: item.color || '#6b7280',
                                top: '2px',
                                height: 'calc(100% - 4px)',
                              }}
                              onClick={(e) => handleItemClick(e, item.id)}
                            >
                              <div className="font-semibold truncate">{item.title}</div>
                              <div className="text-[10px] opacity-90 truncate">
                                {format(parseISO(item.startDate), "HH:mm")} - {format(parseISO(item.endDate), "HH:mm")}
                              </div>
                            </div>
                          </EventDetailPopover>
                        ) : (
                          <div
                            key={item.id}
                            className={cn(
                              "absolute inset-x-1 rounded px-2 py-1 text-xs font-medium text-white cursor-pointer hover:shadow-md transition-all z-10",
                              isSelected && "ring-2 ring-foreground"
                            )}
                            style={{
                              backgroundColor: item.color || '#6b7280',
                              top: '2px',
                              height: 'calc(100% - 4px)',
                            }}
                            onClick={(e) => handleItemClick(e, item.id)}
                            title={item.title}
                          >
                            <div className="font-semibold truncate">{item.title}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
