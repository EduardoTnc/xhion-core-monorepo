import { useState } from "react"
import { ArrowLeft, Loader2, Plus, Users, Briefcase, TrendingUp, AlertCircle } from "lucide-react"
import { getDepartmentIcon } from "@/lib/department-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDepartment, useDepartmentStats, useContextoDepartamento } from "@/hooks/queries"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { DepartmentContextModal } from "./DepartmentContextModal"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { DepartmentProjectsView } from "./DepartmentProjectsView"
import { DepartmentTeamView } from "./DepartmentTeamView"
import { DepartmentContextView } from "./DepartmentContextView"
import { DepartmentOrgChart } from "./DepartmentOrgChart"
import { DepartmentDocumentsManager } from "./DepartmentDocumentsManager"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DepartmentDetailWidgetsProps {
  departamentoId: string
  onBack: () => void
}

export function DepartmentDetailWidgets({ departamentoId, onBack }: DepartmentDetailWidgetsProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const navigate = useNavigate()

  // TanStack Query for department data
  const { data: departamentoActual, isLoading, refetch: refetchDepartamento } = useDepartment(departamentoId)
  const { data: estadisticas, refetch: refetchEstadisticas } = useDepartmentStats(departamentoId)

  // TanStack Query for department context
  const { data: contexto } = useContextoDepartamento(departamentoId)

  if (isLoading && !departamentoActual) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!departamentoActual) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Departamento no encontrado</p>
      </div>
    )
  }

  const totalTareas = estadisticas?.estadisticas.tareas.total || 0
  const tareasCompletadas = estadisticas?.estadisticas.tareas.completadas || 0
  const completionRate = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0
  const totalEmpleados = estadisticas?.estadisticas.totalEmpleados || 0
  const totalPuestos = estadisticas?.estadisticas.totalPuestos || 0
  const proyectosActivos = estadisticas?.estadisticas.proyectos.activos || 0
  const proyectosTotales = estadisticas?.estadisticas.proyectos.total || 0
  const tareasAbiertas = estadisticas?.estadisticas.tareas.abiertas || 0
  const puestos = departamentoActual.puestosTrabajo || []
  const puestosConTalento = puestos.filter((puesto) => {
    const assignedFromCount = (puesto as any)._count?.usuarios ?? 0
    const assignedFromList = (puesto as any).empleados?.length ?? 0
    return assignedFromCount > 0 || assignedFromList > 0
  }).length
  const vacantes = Math.max(puestos.length - puestosConTalento, 0)

  // Obtener icono dinámico del departamento y color principal
  const { icon: DepartmentIcon } = getDepartmentIcon(departamentoActual.icono)
  const departmentColorClass = departamentoActual.color || "bg-blue-500"

  return (
    <div className="bg-background px-4 py-4 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        {/* Compact Header with Integrated Metrics */}
        <section className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Top Row: Back Button + Title + Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-9 w-9 rounded-full border border-border/70 shadow-sm flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-7 w-7 rounded-lg ${departmentColorClass} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <DepartmentIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground truncate">
                      {departamentoActual.nombre}
                    </h1>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {departamentoActual.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex flex-wrap gap-2 text-xs flex-shrink-0">
                <Button size="sm" className="h-8 px-3 text-xs" onClick={() => setShowCreateProjectModal(true)}>
                  <Plus className="mr-1.5 h-3 w-3" /> Proyecto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setShowContextModal(true)}
                >
                  Contexto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setShowEditModal(true)}
                >
                  Editar
                </Button>
              </div>
            </div>

            {/* Metrics Row - Inline Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="h-7 px-2.5 gap-1.5">
                <Briefcase className="h-3 w-3" />
                <span className="font-semibold">{proyectosActivos}</span>
                <span className="text-muted-foreground">/{proyectosTotales} proyectos</span>
              </Badge>
              <Badge variant="secondary" className="h-7 px-2.5 gap-1.5">
                <Users className="h-3 w-3" />
                <span className="font-semibold">{totalEmpleados}</span>
                <span className="text-muted-foreground">personas</span>
              </Badge>
              <Badge variant="secondary" className="h-7 px-2.5 gap-1.5">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">{completionRate}%</span>
                <span className="text-muted-foreground">completado</span>
              </Badge>
              {vacantes > 0 && (
                <Badge variant="outline" className="h-7 px-2.5 gap-1.5 border-orange-500/50 text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-semibold">{vacantes}</span>
                  <span>vacantes</span>
                </Badge>
              )}
              <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
                <div>
                  <span className="uppercase tracking-wider">Líder:</span>{" "}
                  <span className="text-foreground font-medium">{departamentoActual.jefe?.nombreCompleto || "Sin asignar"}</span>
                </div>
                <div>
                  <span className="uppercase tracking-wider">Contexto:</span>{" "}
                  <span className="text-foreground font-medium">{contexto ? "Sí" : "Pendiente"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Projects */}
            <section className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <header className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Portafolio</p>
                  <p className="text-sm font-medium text-foreground">Proyectos activos</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tareasAbiertas} tareas abiertas
                </span>
              </header>
              <DepartmentProjectsView
                proyectos={departamentoActual.proyectos}
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                onProjectClick={(projectId) => navigate(`/proyectos/${projectId}`)}
                onCreateProject={() => setShowCreateProjectModal(true)}
                onViewAllProjects={() => navigate("/proyectos")}
                variant="condensed"
              />
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Team */}
            <section className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <header className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Talento</p>
                  <p className="text-sm font-medium text-foreground">Equipo asignado</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {totalPuestos} puestos
                </span>
              </header>
              <DepartmentTeamView
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                jefe={departamentoActual.jefe}
                empleados={departamentoActual.usuarios}
                puestosTrabajo={departamentoActual.puestosTrabajo}
                totalEmpleados={totalEmpleados}
                variant="condensed"
              />
            </section>

            {/* Context & Documents - Tabs */}
            <section className="rounded-xl border border-border/70 bg-card/60 p-3">
              <Tabs defaultValue="context" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="context" className="text-xs">Contexto</TabsTrigger>
                  <TabsTrigger value="docs" className="text-xs">Documentos</TabsTrigger>
                </TabsList>
                <TabsContent value="context" className="mt-3 space-y-2">
                  <DepartmentContextView
                    contexto={contexto}
                    departamentoId={departamentoId}
                    departamentoNombre={departamentoActual.nombre}
                    onEdit={() => setShowContextModal(true)}
                    onCreate={() => setShowContextModal(true)}
                    variant="condensed"
                  />
                </TabsContent>
                <TabsContent value="docs" className="mt-3 space-y-2">
                  <DepartmentDocumentsManager
                    departamentoId={departamentoId}
                    departamentoNombre={departamentoActual.nombre}
                    variant="condensed"
                  />
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>

        {/* Org Chart - Collapsible */}
        <section className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Organigrama</p>
                <p className="text-sm font-medium text-foreground">Estructura y puestos</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span><span className="font-semibold text-foreground">{puestos.length}</span> puestos</span>
                  <span><span className="font-semibold text-foreground">{puestosConTalento}</span> cubiertos</span>
                  <span><span className="font-semibold text-foreground">{vacantes}</span> vacantes</span>
                </div>
                <div className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </div>
              </div>
            </summary>
            <div className="mt-3 pt-3 border-t border-border/50">
              {puestos.length > 0 ? (
                <DepartmentOrgChart
                  departamentoId={departamentoId}
                  departamentoNombre={departamentoActual.nombre}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No se han definido puestos para este departamento.
                </p>
              )}
            </div>
          </details>
        </section>

        <CreateDepartmentModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          departamento={departamentoActual}
        />

        <DepartmentContextModal
          open={showContextModal}
          onOpenChange={setShowContextModal}
          departamentoId={departamentoId}
          departamentoNombre={departamentoActual.nombre}
          contextoExistente={contexto}
        />

        <CreateProjectModal
          open={showCreateProjectModal}
          onOpenChange={setShowCreateProjectModal}
          departamentoIdPredeterminado={departamentoId}
          onSuccess={() => {
            refetchDepartamento()
            refetchEstadisticas()
          }}
        />
      </div>
    </div>
  )
}
