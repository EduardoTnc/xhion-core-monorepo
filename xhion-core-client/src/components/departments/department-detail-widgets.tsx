import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { getDepartmentIcon } from "@/lib/department-icons"
import { Button } from "@/components/ui/button"
import { useDepartmentStore } from "@/store/departmentStore"
import { useConocimientoStore } from "@/store/conocimientoStore"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { DepartmentContextModal } from "./DepartmentContextModal"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { DepartmentProjectsView } from "./DepartmentProjectsView"
import { DepartmentTeamView } from "./DepartmentTeamView"
import { DepartmentContextView } from "./DepartmentContextView"
import { DepartmentOrgChart } from "./DepartmentOrgChart"
import { BudgetView } from "@/components/budgets/BudgetView"
import { DepartmentDocumentsManager } from "./DepartmentDocumentsManager"
import { useNavigate } from "react-router-dom"

interface DepartmentDetailWidgetsProps {
  departamentoId: string
  onBack: () => void
}

export function DepartmentDetailWidgets({ departamentoId, onBack }: DepartmentDetailWidgetsProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const navigate = useNavigate()

  const {
    departamentoActual,
    estadisticas,
    isLoading,
    fetchDepartamentoById,
    fetchEstadisticas,
    clearDepartamentoActual,
  } = useDepartmentStore()

  const { fetchContextoDepartamento, contextosDepartamento } = useConocimientoStore()

  useEffect(() => {
    fetchDepartamentoById(departamentoId)
    fetchEstadisticas(departamentoId)
    fetchContextoDepartamento(departamentoId)

    return () => {
      clearDepartamentoActual()
    }
  }, [departamentoId])

  const contexto = contextosDepartamento.find((c) => c.departamentoId === departamentoId)

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
    <div className="bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-full border border-border/70 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Departamento estratégico</span>
                  <div className={`h-8 w-8 rounded-xl ${departmentColorClass} flex items-center justify-center shadow-inner`}>
                    <DepartmentIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">
                    {departamentoActual.nombre}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {departamentoActual.descripcion || "Sin descripción"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                  <div>
                    <p className="uppercase tracking-[0.18em]">Líder</p>
                    <p className="text-foreground font-medium">
                      {departamentoActual.jefe?.nombreCompleto || "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em]">Creado</p>
                    <p className="text-foreground font-medium">
                      {new Date(departamentoActual.fechaCreacion).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em]">Contexto</p>
                    <p className="text-foreground font-medium">{contexto ? "Documentado" : "Pendiente"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <Button className="h-10 rounded-full px-4 font-semibold shadow-sm" onClick={() => setShowCreateProjectModal(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Nuevo proyecto
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-full border-dashed px-4 font-semibold"
                onClick={() => setShowContextModal(true)}
              >
                Actualizar contexto
              </Button>
              <Button
                variant="secondary"
                className="h-10 rounded-full px-4 font-semibold"
                onClick={() => setShowEditModal(true)}
              >
                Editar ficha
              </Button>
              <Button
                variant="ghost"
                className="h-10 rounded-full px-4 font-semibold text-primary underline-offset-4"
                onClick={() => navigate("/proyectos")}
              >
                Ver portafolio
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm text-xs">
          <p className="uppercase tracking-[0.2em] text-muted-foreground">Indicadores clave</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Proyectos activos",
                value: proyectosActivos,
                helper: `${proyectosTotales} totales`,
              },
              {
                label: "Equipo asignado",
                value: totalEmpleados,
                helper: `${totalPuestos} puestos`,
              },
              {
                label: "Tasa de completación",
                value: `${completionRate}%`,
                helper: `${tareasCompletadas} de ${totalTareas} tareas`,
              },
              {
                label: "Vacantes estructurales",
                value: vacantes,
                helper: `${puestosConTalento}/${puestos.length} puestos cubiertos`,
              },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1 rounded-xl border border-border/50 bg-background/50 p-3 shadow-inner">
                <p className="uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                <p className="text-muted-foreground">{metric.helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
          <header className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
            <div>
              <p className="uppercase tracking-[0.2em] text-muted-foreground">Portafolio y carga</p>
              <p className="text-sm text-foreground">Proyectos y tareas activas</p>
            </div>
            <span className="text-muted-foreground">
              {tareasAbiertas} tareas abiertas · {proyectosActivos} proyectos activos
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

        <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
          <header className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
            <div>
              <p className="uppercase tracking-[0.2em] text-muted-foreground">Talento</p>
              <p className="text-sm text-foreground">Equipo y roles asignados</p>
            </div>
            <span className="text-muted-foreground">
              {totalEmpleados} personas · {totalPuestos} puestos
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

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-4 text-xs">
          <header className="flex flex-wrap items-center justify-between gap-3 font-medium">
            <div>
              <p className="uppercase tracking-[0.2em] text-muted-foreground">Finanzas</p>
              <p className="text-sm text-foreground">Presupuesto operativo</p>
            </div>
          </header>
          <BudgetView entityId={departamentoId} entityType="departamento" entityName={departamentoActual.nombre} variant="condensed" />
        </section>

        <section className="space-y-4 text-xs">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4">
              <header>
                <p className="uppercase tracking-[0.2em] text-muted-foreground">Base de conocimiento</p>
                <p className="text-sm text-foreground">Contexto documentado</p>
              </header>
              <DepartmentContextView
                contexto={contexto}
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                onEdit={() => setShowContextModal(true)}
                onCreate={() => setShowContextModal(true)}
                variant="condensed"
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4">
              <header>
                <p className="uppercase tracking-[0.2em] text-muted-foreground">Documentación</p>
                <p className="text-sm text-foreground">Entregables y notas</p>
              </header>
              <DepartmentDocumentsManager
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                variant="condensed"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4 text-xs">
          <header className="flex flex-wrap items-center justify-between gap-3 font-medium">
            <div>
              <p className="uppercase tracking-[0.2em] text-muted-foreground">Organigrama</p>
              <p className="text-sm text-foreground">Estructura y puestos</p>
            </div>
            <span className="text-muted-foreground">
              {puestos.length} puestos definidos · {vacantes} vacantes
            </span>
          </header>
          {puestos.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-background/60 p-3 shadow-inner">
                  <p className="uppercase tracking-[0.2em] text-muted-foreground">Puestos</p>
                  <p className="text-lg font-semibold text-foreground">{puestos.length}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/60 p-3 shadow-inner">
                  <p className="uppercase tracking-[0.2em] text-muted-foreground">Cubiertos</p>
                  <p className="text-lg font-semibold text-foreground">{puestosConTalento}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/60 p-3 shadow-inner">
                  <p className="uppercase tracking-[0.2em] text-muted-foreground">Vacantes</p>
                  <p className="text-lg font-semibold text-foreground">{vacantes}</p>
                </div>
              </div>
              <details className="rounded-xl border border-dashed border-border/60 bg-background/40 p-3">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Ver organigrama completo
                </summary>
                <div className="mt-4 rounded-xl border border-border/60 bg-card/70 p-3">
                  <DepartmentOrgChart
                    departamentoId={departamentoId}
                    departamentoNombre={departamentoActual.nombre}
                  />
                </div>
              </details>
            </div>
          ) : (
            <p className="text-muted-foreground">No se han definido puestos para este departamento.</p>
          )}
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
            fetchDepartamentoById(departamentoId)
            fetchEstadisticas(departamentoId)
          }}
        />
      </div>
    </div>
  )
}
