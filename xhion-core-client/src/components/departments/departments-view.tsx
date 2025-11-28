"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { ChevronRight, Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DepartmentDetailWidgets } from "./department-detail-widgets"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { useDepartmentStore } from "@/store/departmentStore"
import { departmentService, type DepartamentoDetalle } from "@/services/departmentService"
import { taskService, type Tarea } from "@/services/taskService"
import { toast } from "sonner"
import { getDepartmentIcon } from "@/lib/department-icons"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DepartmentContextModal } from "./DepartmentContextModal"
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal"
import { Restricted } from "../auth/Restricted"

export function DepartmentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({})
  const [departmentDetails, setDepartmentDetails] = useState<Record<string, DepartamentoDetalle | undefined>>({})
  const [departmentLoading, setDepartmentLoading] = useState<Record<string, boolean>>({})
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [projectTasks, setProjectTasks] = useState<Record<string, Tarea[] | undefined>>({})
  const [projectTasksLoading, setProjectTasksLoading] = useState<Record<string, boolean>>({})
  const [leaderModalInfo, setLeaderModalInfo] = useState<{ leader: DepartamentoDetalle["jefe"] | null; departmentName: string } | null>(null)
  const [contextModalInfo, setContextModalInfo] = useState<{ departmentId: string; departmentName: string } | null>(null)
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null)
  const navigate = useNavigate()

  const { departamentos, isLoading, fetchDepartamentos } = useDepartmentStore()

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  const filteredDepartments = departamentos.filter((dept) => {
    const matchesSearch =
      dept.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.descripcion && dept.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  if (selectedDepartment) {
    return <DepartmentDetailWidgets departamentoId={selectedDepartment} onBack={() => setSelectedDepartment(null)} />
  }

  const prefetchProjectTasks = useCallback(
    (projects: DepartamentoDetalle["proyectos"]) => {
      projects.forEach((project) => {
        if (projectTasks[project.id] || projectTasksLoading[project.id]) {
          return
        }

        setProjectTasksLoading((prev) => ({ ...prev, [project.id]: true }))
        taskService
          .getAll({ proyectoId: project.id })
          .then((tasks) => {
            setProjectTasks((prev) => ({ ...prev, [project.id]: tasks }))
          })
          .catch(() => {
            toast.error(`No se pudieron cargar las tareas de ${project.nombre}`)
          })
          .finally(() => {
            setProjectTasksLoading((prev) => ({ ...prev, [project.id]: false }))
          })
      })
    },
    [projectTasks, projectTasksLoading]
  )

  useEffect(() => {
    if (departamentos.length === 0) {
      return
    }

    departamentos.forEach((dept) => {
      if (departmentDetails[dept.id] || departmentLoading[dept.id]) {
        return
      }

      setDepartmentLoading((prev) => ({ ...prev, [dept.id]: true }))
      departmentService
        .getById(dept.id)
        .then((detail) => {
          setDepartmentDetails((prev) => ({ ...prev, [dept.id]: detail }))
          prefetchProjectTasks(detail.proyectos)
        })
        .catch(() => {
          toast.error(`No se pudo cargar el detalle de ${dept.nombre}`)
        })
        .finally(() => {
          setDepartmentLoading((prev) => ({ ...prev, [dept.id]: false }))
        })
    })
  }, [departamentos, departmentDetails, departmentLoading, prefetchProjectTasks])

  const handleToggleAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {}

    departamentos.forEach((dept) => {
      nextState[dept.id] = expand
    })

    setExpandedDepartments(nextState)
  }

  if (isLoading && departamentos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const toggleDepartmentExpansion = async (departmentId: string) => {
    setExpandedDepartments((prev) => ({ ...prev, [departmentId]: !prev[departmentId] }))
  }

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  const handleTaskClick = (task: Tarea) => {
    setTaskDetailId(task.id)
  }

  const renderProjectRow = (project: DepartamentoDetalle["proyectos"][number]) => {
    const isExpanded = !!expandedProjects[project.id]
    const tasks = projectTasks[project.id]
    const isLoadingTasks = projectTasksLoading[project.id]

    return (
      <div key={project.id} className="border border-border/40 rounded-lg bg-background/70 p-3 shadow-sm">
        <button
          type="button"
          className="flex w-full items-center gap-3 text-left text-sm"
          onClick={() => toggleProjectExpansion(project.id)}
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
          />
          <div className="flex-1">
            <p className="font-medium text-foreground">{project.nombre}</p>
            <div className="text-xs text-muted-foreground">
              <span>{project.estado}</span>
              {project.responsable?.nombreCompleto && (
                <span className="ml-3">Responsable: {project.responsable.nombreCompleto}</span>
              )}
              <span className="ml-3">Tareas: {project._count?.tareas ?? 0}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {project.fechaInicio && project.fechaFin
              ? `${new Date(project.fechaInicio).toLocaleDateString("es-ES")} → ${new Date(project.fechaFin).toLocaleDateString("es-ES")}`
              : new Date(project.fechaCreacion).toLocaleDateString("es-ES")}
          </div>
        </button>
        {isExpanded && (
          <div className="mt-3 space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
            {isLoadingTasks ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Cargando tareas
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-2 text-xs">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-md border border-border/40 bg-background/80 px-3 py-2 text-left hover:border-primary/60"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{task.titulo}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.asignado?.nombreCompleto || "Sin asignar"} · {task.estado}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      {task.fechaVencimiento
                        ? new Date(task.fechaVencimiento).toLocaleDateString("es-ES")
                        : "Sin fecha"}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No hay tareas registradas en este proyecto.</p>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() =>
                  navigate("/proyectos", {
                    state: { proyectoId: project.id },
                  })
                }
              >
                Ir al proyecto
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDepartmentDetail = (departmentId: string) => {
    if (departmentLoading[departmentId]) {
      return (
        <div className="flex items-center gap-2 px-4 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando información del departamento
        </div>
      )
    }

    const detail = departmentDetails[departmentId]

    if (!detail) {
      return (
        <div className="px-4 py-4 text-xs text-muted-foreground">
          No hay información disponible para este departamento.
        </div>
      )
    }

    return (
      <div className="px-4 py-4 text-sm">
        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
          <span>Creado: {new Date(detail.fechaCreacion).toLocaleDateString("es-ES")}</span>
          <span>
            Líder: {detail.jefe ? (
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
                onClick={() => setLeaderModalInfo({ leader: detail.jefe, departmentName: detail.nombre })}
              >
                {detail.jefe.nombreCompleto}
              </button>
            ) : (
              "Sin asignar"
            )}
          </span>
          <span>
            Contexto: {detail.contextoDepartamento ? (
              <span className="text-foreground">Documentado</span>
            ) : (
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setContextModalInfo({ departmentId: detail.id, departmentName: detail.nombre })}
              >
                Pendiente
              </button>
            )}
          </span>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Proyectos ({detail.proyectos.length})</p>
            <div className="mt-2 space-y-3">
              {detail.proyectos.length > 0
                ? detail.proyectos.map((project) => renderProjectRow(project))
                : (
                  <p className="py-3 text-xs text-muted-foreground">Sin proyectos registrados.</p>
                )}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Equipo & estructura</p>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <p>
                Total de puestos: <span className="font-medium text-foreground">{detail._count?.puestosTrabajo ?? 0}</span>
              </p>
              <p>
                Talento asignado: <span className="font-medium text-foreground">{detail.usuarios?.length ?? 0}</span>
              </p>
              {detail.usuarios && detail.usuarios.length > 0 && (
                <div className="max-h-28 overflow-auto border border-dashed border-border/40 p-2 gantt-scroll">
                  <ul className="space-y-1">
                    {detail.usuarios.slice(0, 10).map((user) => (
                      <li key={user.id} className="flex justify-between text-[13px]">
                        <span>{user.nombreCompleto}</span>
                        <span className="text-muted-foreground">
                          {user.puestoTrabajo?.titulo || "Sin puesto"}
                        </span>
                      </li>
                    ))}
                    {detail.usuarios.length > 10 && (
                      <li className="text-[11px] text-muted-foreground">
                        +{detail.usuarios.length - 10} colaboradores adicionales
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {detail.objetivos && (
          <div className="mt-4 border-t border-dashed border-border/60 pt-3 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wide">Objetivos</p>
            <p className="mt-1 text-foreground">{detail.objetivos}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-10">
      <div className="mb-4 flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por nombre, responsable o descripción"
            className="h-10 rounded-md border border-border bg-background pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDepartamentos()} className="h-9 text-xs">
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => handleToggleAll(!departamentos.every((dept) => expandedDepartments[dept.id]))}
          >
            {departamentos.every((dept) => expandedDepartments[dept.id]) ? "Contraer todos" : "Desplegar todos"}
          </Button>
          <Restricted to="departamentos.crear">
            <Button size="sm" className="h-9 gap-2 text-xs" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </Button>
          </Restricted>
        </div>
      </div>

      <div className="rounded-lg border border-border/60">
        <div className="overflow-x-auto gantt-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16" />
                <TableHead className="min-w-[220px] text-xs uppercase tracking-wide text-muted-foreground">
                  Departamento
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Responsable</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-center">
                  Proyectos
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-center">
                  Puestos
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-center">
                  Contexto
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
                  Creado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => {
                const { icon: DepartmentIcon } = getDepartmentIcon(department.icono)
                const color = department.color || "bg-muted"
                const isExpanded = !!expandedDepartments[department.id]

                return (
                  <Fragment key={department.id}>
                    <TableRow className="text-sm">
                      <TableCell className="w-16">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          className={`flex w-full items-center justify-center gap-2 rounded-md border px-2 py-1 text-[11px] font-semibold transition hover:border-primary hover:text-primary ${isExpanded ? "border-primary/70 text-primary" : "border-border/60 text-muted-foreground"
                            }`}
                          onClick={() => toggleDepartmentExpansion(department.id)}
                        >
                          <ChevronRight
                            className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
                          />
                          <span>{isExpanded ? "Cerrar" : "Abrir"}</span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color} text-white`}>
                            <DepartmentIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-foreground font-medium">{department.nombre}</div>
                            {department.descripcion && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{department.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {department.jefe ? (
                          <button
                            type="button"
                            className="font-medium text-foreground underline-offset-2 hover:underline"
                            onClick={() => setLeaderModalInfo({ leader: department.jefe, departmentName: department.nombre })}
                          >
                            {department.jefe.nombreCompleto}
                          </button>
                        ) : (
                          "Sin asignar"
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm text-foreground">
                        {department._count?.proyectos ?? 0}
                      </TableCell>
                      <TableCell className="text-center text-sm text-foreground">
                        {department._count?.puestosTrabajo ?? 0}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {department.contextoDepartamento ? (
                          "Sí"
                        ) : (
                          <button
                            type="button"
                            className="font-medium text-primary underline-offset-2 hover:underline"
                            onClick={() => setContextModalInfo({ departmentId: department.id, departmentName: department.nombre })}
                          >
                            Pendiente
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        <div className="flex flex-col items-end gap-1">
                          <span>{new Date(department.fechaCreacion).toLocaleDateString("es-ES")}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 text-[11px]"
                            onClick={() => navigate(`/departamentos/${department.id}`)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/15 text-sm">
                        <TableCell colSpan={7} className="p-0">
                          {renderDepartmentDetail(department.id)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {filteredDepartments.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No hay departamentos para mostrar.</p>
        )}
      </div>

      <CreateDepartmentModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      <TaskDetailModal tareaId={taskDetailId} open={!!taskDetailId} onOpenChange={(open) => !open && setTaskDetailId(null)} />

      {leaderModalInfo?.leader && (
        <Dialog open={!!leaderModalInfo} onOpenChange={(open) => !open && setLeaderModalInfo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Información del líder</DialogTitle>
              <DialogDescription>
                {leaderModalInfo.departmentName ? `Departamento ${leaderModalInfo.departmentName}` : "Departamento"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p className="text-base font-semibold text-foreground">{leaderModalInfo.leader.nombreCompleto}</p>
              {leaderModalInfo.leader.email && <p className="text-muted-foreground">{leaderModalInfo.leader.email}</p>}
              {leaderModalInfo.leader.puestoTrabajo?.titulo && (
                <p className="text-muted-foreground">{leaderModalInfo.leader.puestoTrabajo.titulo}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {contextModalInfo && (
        <DepartmentContextModal
          open={!!contextModalInfo}
          onOpenChange={(open) => !open && setContextModalInfo(null)}
          departamentoId={contextModalInfo.departmentId}
          departamentoNombre={contextModalInfo.departmentName}
          contextoExistente={departmentDetails[contextModalInfo.departmentId]?.contextoDepartamento as any}
        />
      )}
    </div>
  )
}
