"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, LayoutGrid, List, CalendarIcon, SlidersHorizontal } from "lucide-react"
import { TasksKanban } from "./tasks-kanban"
import { TasksList } from "./tasks-list"
import { TasksCalendar } from "./tasks-calendar"

export function TasksView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("kanban")
  const [filterProject, setFilterProject] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterAssignee, setFilterAssignee] = useState("all")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">Tareas</h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">Gestiona todas tus tareas en un solo lugar</p>
          </div>
          <Button className="gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>

        {/* Filters and search - responsive grid */}
        <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger>
              <SelectValue placeholder="Proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="web">Rediseño Web</SelectItem>
              <SelectItem value="mobile">App Móvil iOS</SelectItem>
              <SelectItem value="cloud">Migración Cloud</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Asignado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="me">Mis tareas</SelectItem>
                <SelectItem value="ana">Ana García</SelectItem>
                <SelectItem value="carlos">Carlos Ruiz</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View mode selector */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-3">
            <TabsTrigger value="kanban" className="gap-1 md:gap-2 text-xs md:text-sm">
              <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1 md:gap-2 text-xs md:text-sm">
              <List className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1 md:gap-2 text-xs md:text-sm">
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {viewMode === "kanban" && <TasksKanban />}
        {viewMode === "list" && <TasksList />}
        {viewMode === "calendar" && <TasksCalendar />}
      </div>
    </div>
  )
}
