"use client"

import { format, addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { useCalendarStore } from "@/store/calendarStore"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function CalendarSidebar() {
  const { currentDate, calendarItems, setCurrentDate, setViewMode, selectEvento } = useCalendarStore()

  // Get upcoming items (next 7 days)
  const today = new Date()
  const upcomingItems = calendarItems
    .filter(item => {
      const itemDate = parseISO(item.startDate)
      return itemDate >= today && itemDate <= addDays(today, 7)
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 10)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
      setViewMode('day')
    }
  }

  const handleItemClick = (item: any) => {
    if (item.type === 'event' && item.evento) {
      selectEvento(item.evento)
    }
    const itemDate = parseISO(item.startDate)
    setCurrentDate(itemDate)
    setViewMode('day')
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📋'
      case 'project':
        return '🎯'
      default:
        return '📅'
    }
  }

  return (
    <div className="w-80 border-l border-border bg-card p-4 space-y-6 overflow-y-auto">
      {/* Mini Calendar */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Calendario
        </h3>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
          locale={es}
        />
      </div>

      <Separator />

      {/* Upcoming Items */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Próximos Elementos
        </h3>

        {upcomingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay elementos próximos</p>
        ) : (
          <div className="space-y-2">
            {upcomingItems.map((item) => {
              const itemDate = parseISO(item.startDate)
              const isToday = format(itemDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

              return (
                <div
                  key={item.id}
                  className="p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="h-10 w-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color || '#6b7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{getItemIcon(item.type)}</span>
                          <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        </div>
                        {isToday && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Hoy
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(itemDate, "d MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                      {item.evento?.ubicacion && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{item.evento.ubicacion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Item Type Legend */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Tipos de Elemento</h3>
        <div className="space-y-2">
          {[
            { type: 'event', icon: '📅', label: 'Eventos', color: '#3b82f6' },
            { type: 'task', icon: '📋', label: 'Tareas', color: '#10b981' },
            { type: 'project', icon: '🎯', label: 'Proyectos', color: '#8b5cf6' },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2 text-sm">
              <span className="text-base">{item.icon}</span>
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
