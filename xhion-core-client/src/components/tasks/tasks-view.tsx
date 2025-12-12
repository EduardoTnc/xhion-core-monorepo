"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Layers, Filter, X, CheckSquare } from "lucide-react"
// TanStack Query hooks - replacing useTaskStore
import { useTasks, useMyTasks, useUsers, useDeleteTask } from "@/hooks/queries"
import { useAuthStore } from "@/store/authStore"
import { type ProyectoMiembro } from "@/services/projectService"
import { TaskViewSwitcher } from "../projects/TaskViewSwitcher"
import { TaskFilters, type TaskFiltersType, applyTaskFilters } from "../projects/TaskFilters"
import { TaskKanbanViewDnD } from "../projects/TaskKanbanViewDnD"
import { TaskListView } from "../projects/TaskListView"
import { TaskTableView } from "../projects/TaskTableView"
import { TaskTimelineView } from "../projects/TaskTimelineView"
import { CreateTaskModal } from "./CreateTaskModal"
import { TaskDetailModal } from "./TaskDetailModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PageHeaderSimple } from "@/components/layout/PageHeader"

type ViewMode = "kanban" | "list" | "table" | "timeline"
type GroupBy = "none" | "project" | "stage"

const initialFilters: TaskFiltersType = {
  search: "",
  estado: "all",
  prioridad: "all",
  asignadoId: "all",
  etapaId: "all",
  fechaDesde: "",
  fechaHasta: "",
}

export function TasksView() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [filters, setFilters] = useState<TaskFiltersType>(initialFilters)
  const [groupBy, setGroupBy] = useState<GroupBy>("project") // Default group by project for global view

  // Modals state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const { user } = useAuthStore()

  const canViewAll = user?.permisos?.includes("tareas.ver_todas")
  const canCreate = user?.permisos?.includes("tareas.crear")

  // ==================== TanStack Query Hooks ====================
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()
  const { data: tareas = [], isLoading: isLoadingAllTasks, refetch: refetchTareas } = useTasks({}, { enabled: canViewAll })
  const { data: misTareas = [], isLoading: isLoadingMyTasks, refetch: refetchMisTareas } = useMyTasks({ enabled: !canViewAll })
  const deleteTaskMutation = useDeleteTask()

  const tasksToDisplay = canViewAll ? tareas : misTareas
  const isLoadingTasks = canViewAll ? isLoadingAllTasks : isLoadingMyTasks

  // Refresh function
  const refreshTasks = async () => {
    if (canViewAll) {
      await refetchTareas()
    } else {
      await refetchMisTareas()
    }
  }

  // Map users to ProyectoMiembro format for TaskFilters
  const miembrosForFilters: ProyectoMiembro[] = useMemo(() => {
    return users.map(u => ({
      id: u.id,
      usuarioId: u.id,
      proyectoId: "global",
      rol: "Miembro",
      fechaUnion: new Date().toISOString(),
      usuario: {
        id: u.id,
        nombreCompleto: u.nombreCompleto,
        email: u.email,
        avatarUrl: u.avatarUrl || undefined
      }
    }))
  }, [users])

  // Apply filters locally
  const filteredTasks = useMemo(() => {
    return applyTaskFilters(tasksToDisplay, filters)
  }, [tasksToDisplay, filters])

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setShowTaskDetailModal(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await deleteTaskMutation.mutateAsync(taskId)
        // Success toast is handled by the mutation hook
      } catch (error) {
        // Error toast is handled by the mutation hook
      }
    }
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== "all" && v !== "")

  const isLoading = isLoadingTasks || isLoadingUsers

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Header */}
      <PageHeaderSimple
        icon={CheckSquare}
        title="Tareas Globales"
        subtitle={canViewAll ? "Gestiona todas las tareas del sistema" : "Gestiona tus tareas asignadas"}
        actions={
          canCreate && (
            <Button onClick={() => setShowCreateTaskModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          )
        }
      />

      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <TaskViewSwitcher
              viewMode={viewMode}
              onViewChange={setViewMode}
              defaultView="kanban"
              onSetDefaultView={() => { }}
            />

            <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />

            {/* Group By */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Agrupar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin agrupar</SelectItem>
                  <SelectItem value="project">Por Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />

              <Select value={filters.estado} onValueChange={(v) => setFilters({ ...filters, estado: v })}>
                <SelectTrigger className="h-8 w-[140px] text-xs border-dashed">
                  <span className="truncate">
                    {filters.estado === 'all' ? 'Estado: Todos' :
                      filters.estado === 'Por_Hacer' ? 'Estado: Por Hacer' :
                        filters.estado === 'En_Progreso' ? 'Estado: En Progreso' :
                          filters.estado === 'Hecho' ? 'Estado: Hecho' :
                            filters.estado === 'Bloqueado' ? 'Estado: Bloqueado' : 'Estado'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Por_Hacer">Por Hacer</SelectItem>
                  <SelectItem value="En_Progreso">En Progreso</SelectItem>
                  <SelectItem value="Hecho">Hecho</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.prioridad} onValueChange={(v) => setFilters({ ...filters, prioridad: v })}>
                <SelectTrigger className="h-8 w-[140px] text-xs border-dashed">
                  <span className="truncate">
                    {filters.prioridad === 'all' ? 'Prioridad: Todas' : `Prioridad: ${filters.prioridad}`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.asignadoId} onValueChange={(v) => setFilters({ ...filters, asignadoId: v })}>
                <SelectTrigger className="h-8 w-[150px] text-xs border-dashed">
                  <span className="truncate">
                    {filters.asignadoId === 'all' ? 'Asignado: Todos' :
                      filters.asignadoId === 'unassigned' ? 'Asignado: Sin asignar' :
                        `Asignado: ${users.find(u => u.id === filters.asignadoId)?.nombreCompleto || 'Desconocido'}`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nombreCompleto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <TaskFilters
              filters={filters}
              onFiltersChange={setFilters}
              miembros={miembrosForFilters}
              etapas={[]} // No stages in global view for now
              stagesEnabled={false}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {viewMode === "kanban" && (
              <TaskKanbanViewDnD
                tareas={filteredTasks}
                onTaskClick={handleTaskClick}
                onDeleteTask={handleDeleteTask}
                proyectoId="" // Global context
                etapas={[]}
                stagesEnabled={false}
                onRefresh={refreshTasks}
                groupBy={groupBy}
              />
            )}
            {viewMode === "list" && (
              <TaskListView
                tareas={filteredTasks}
                onTaskClick={handleTaskClick}
                onDeleteTask={handleDeleteTask}
                etapas={[]}
                stagesEnabled={false}
                groupBy={groupBy}
              />
            )}
            {viewMode === "table" && (
              <TaskTableView
                tareas={filteredTasks}
                onTaskClick={handleTaskClick}
                onDeleteTask={handleDeleteTask}
                etapas={[]}
                stagesEnabled={false}
                groupBy={groupBy}
              />
            )}
            {viewMode === "timeline" && (
              <TaskTimelineView
                tareas={filteredTasks}
                etapas={[]}
                stagesEnabled={false}
                onTaskClick={handleTaskClick}
                groupBy={groupBy}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={(open) => {
          setShowCreateTaskModal(open)
        }}
        proyectoId="" // Global context
        stagesEnabled={false}
      />

      <TaskDetailModal
        tareaId={selectedTaskId}
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
