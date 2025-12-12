"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Filter, Loader2 } from "lucide-react"
import { CalendarDay } from "./calendar-day"
import { CalendarWeek } from "./calendar-week"
import { CalendarMonth } from "./calendar-month"
import { CalendarYear } from "./calendar-year"
import { CalendarSidebar } from "./calendar-sidebar"
import { EventModal } from "./event-modal"
// UI state stays in store, data fetching now uses TanStack Query internally within the store
import { useCalendarStore } from "@/store/calendarStore"
import { useEvents } from "@/hooks/queries"
import { formatCalendarHeader } from "@/lib/calendar-utils"

export function CalendarView() {
  const {
    viewMode,
    currentDate,
    filters,
    setViewMode,
    goToToday,
    goToPrevious,
    goToNext,
    setFilters,
    openCreateEventModal,
  } = useCalendarStore()

  // TanStack Query hook for events data
  const { isLoading } = useEvents(filters)

  const headerText = formatCalendarHeader(currentDate, viewMode)

  return (
    <>
      <div className="flex h-full flex-col lg:flex-row">
        {/* Main calendar area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-border bg-card p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <h1 className="text-xl md:text-2xl font-semibold text-foreground capitalize">
                  {headerText}
                </h1>
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 bg-transparent"
                    onClick={goToPrevious}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 md:h-10 bg-transparent"
                    onClick={goToToday}
                    disabled={isLoading}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 bg-transparent"
                    onClick={goToNext}
                    disabled={isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
                <Select
                  value={filters.proyectoId || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, proyectoId: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger className="w-[140px] md:w-[180px]">
                    <SelectValue placeholder="Proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proyectos</SelectItem>
                    {/* TODO: Load real projects */}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.tipo || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, tipo: value === "all" ? undefined : (value as any) })
                  }
                >
                  <SelectTrigger className="w-[120px] md:w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Reunion">Reuniones</SelectItem>
                    <SelectItem value="Tarea">Tareas</SelectItem>
                    <SelectItem value="Proyecto">Proyectos</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Recordatorio">Recordatorios</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="gap-2 hidden md:flex"
                  onClick={() => openCreateEventModal()}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Evento
                </Button>
                <Button
                  size="icon"
                  className="md:hidden"
                  onClick={() => openCreateEventModal()}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* View mode selector */}
            <div className="mt-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
                  <TabsTrigger value="day">Día</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mes</TabsTrigger>
                  <TabsTrigger value="year">Año</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Calendar content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando eventos...</p>
                </div>
              </div>
            ) : (
              <>
                {viewMode === "day" && <CalendarDay />}
                {viewMode === "week" && <CalendarWeek />}
                {viewMode === "month" && <CalendarMonth />}
                {viewMode === "year" && <CalendarYear />}
              </>
            )}
          </div>
        </div>

        {/* Right sidebar - hidden on mobile by default */}
        <div className="hidden lg:block">
          <CalendarSidebar />
        </div>
      </div>

      {/* Event Modal */}
      <EventModal />
    </>
  )
}
