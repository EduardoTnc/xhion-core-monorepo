"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react"
import { CalendarDay } from "./calendar-day"
import { CalendarWeek } from "./calendar-week"
import { CalendarMonth } from "./calendar-month"
import { CalendarYear } from "./calendar-year"
import { CalendarSidebar } from "./calendar-sidebar"

export function CalendarView() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "year">("month")
  const [currentDate, setCurrentDate] = useState("Enero 2025")
  const [filterProject, setFilterProject] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Main calendar area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">{currentDate}</h1>
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10 bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 md:h-10 bg-transparent">
                  Hoy
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10 bg-transparent">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-[140px] md:w-[180px]">
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="web">Rediseño Web</SelectItem>
                  <SelectItem value="mobile">App Móvil iOS</SelectItem>
                  <SelectItem value="cloud">Migración Cloud</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px] md:w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="task">Tareas</SelectItem>
                  <SelectItem value="meeting">Reuniones</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="hidden md:flex bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="gap-2 hidden md:flex">
                <Plus className="h-4 w-4" />
                Nuevo Evento
              </Button>
              <Button size="icon" className="md:hidden">
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
          {viewMode === "day" && <CalendarDay />}
          {viewMode === "week" && <CalendarWeek />}
          {viewMode === "month" && <CalendarMonth />}
          {viewMode === "year" && <CalendarYear />}
        </div>
      </div>

      {/* Right sidebar - hidden on mobile by default */}
      <div className="hidden lg:block">
        <CalendarSidebar />
      </div>
    </div>
  )
}
