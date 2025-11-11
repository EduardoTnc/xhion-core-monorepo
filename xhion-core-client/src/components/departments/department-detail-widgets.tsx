import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Users,
  FolderKanban,
  TrendingUp,
  Coins,
  Sparkles,
  FileText,
  MoreVertical,
  Edit,
  Loader2,
  Plus,
  Eye,
  Map,
} from "lucide-react"
import { getDepartmentIcon } from "@/lib/department-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDepartmentStore } from "@/store/departmentStore"
import { useConocimientoStore } from "@/store/conocimientoStore"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { DepartmentContextModal } from "./DepartmentContextModal"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { DepartmentWidgetCard } from "./DepartmentWidgetCard"
import { DepartmentProjectsView } from "./DepartmentProjectsView"
import { DepartmentTeamView } from "./DepartmentTeamView"
import { DepartmentContextView } from "./DepartmentContextView"
import { DepartmentOrgChart } from "./DepartmentOrgChart"
import { BudgetView } from "@/components/budgets/BudgetView"
import { DepartmentDocumentsManager } from "./DepartmentDocumentsManager"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DepartmentDetailWidgetsProps {
  departamentoId: string
  onBack: () => void
}

export function DepartmentDetailWidgets({ departamentoId, onBack }: DepartmentDetailWidgetsProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const contexto = contextosDepartamento.find((c) => c.departamentoId === departamentoId)

  // Lista de widgets disponibles para navegación rápida
  const allWidgets = [
    { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
    { id: 'equipo', label: 'Equipo', icon: Users },
    { id: 'rendimiento', label: 'Rendimiento', icon: TrendingUp },
    { id: 'presupuesto', label: 'Presupuesto', icon: Coins },
    { id: 'contexto', label: 'Contexto', icon: Sparkles },
    { id: 'organigrama', label: 'Organigrama', icon: Map },
    { id: 'documentos', label: 'Documentos', icon: FileText },
  ]

  const getAvailableWidgets = (currentId: string) => 
    allWidgets.filter(w => w.id !== currentId)

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

  // Obtener icono dinámico del departamento
  const { icon: DepartmentIcon, color: iconColor } = getDepartmentIcon(departamentoActual.icono)

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-16 w-16 rounded-md border-2 border-border bg-background flex items-center justify-center">
            <DepartmentIcon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{departamentoActual.nombre}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {departamentoActual.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowEditModal(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Departamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowContextModal(true)}>
              <FileText className="mr-2 h-4 w-4" />
              {contexto ? "Editar Contexto" : "Agregar Contexto"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AI Insights Banner */}
      {contexto && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Contexto del Departamento</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {contexto.objetivos || "No hay objetivos definidos"}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <Badge variant="outline">
                    KPIs: {contexto.kpis ? "Definidos" : "Sin definir"}
                  </Badge>
                  <Badge variant="outline">
                    Procesos: {contexto.procesosClave ? "Documentados" : "Sin documentar"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr relative">
        {/* Widget: Proyectos */}
        <DepartmentWidgetCard
          title="Proyectos"
          icon={FolderKanban}
          iconColor="text-blue-600"
          isExpanded={expandedWidget === 'proyectos'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'proyectos'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'proyectos' ? null : 'proyectos')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('proyectos')}
          summary={
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total:</span>
                <span className="font-semibold">{estadisticas?.estadisticas.proyectos.total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activos:</span>
                <span className="font-semibold text-green-600">{estadisticas?.estadisticas.proyectos.activos || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completados:</span>
                <span className="font-semibold text-blue-600">{estadisticas?.estadisticas.proyectos.completados || 0}</span>
              </div>
            </div>
          }
          quickActions={
            <>
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation()
                setShowCreateProjectModal(true)
              }}>
                <Plus className="h-3 w-3 mr-1" />
                Nuevo
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => {
                e.stopPropagation()
                navigate('/proyectos')
              }}>
                <Eye className="h-3 w-3 mr-1" />
                Ver Todos
              </Button>
            </>
          }
          fullContent={
            <DepartmentProjectsView
              proyectos={departamentoActual.proyectos}
              departamentoId={departamentoId}
              departamentoNombre={departamentoActual.nombre}
              onProjectClick={(projectId) => navigate(`/proyectos/${projectId}`)}
              onCreateProject={() => setShowCreateProjectModal(true)}
              onViewAllProjects={() => navigate('/proyectos')}
            />
          }
        />

        {/* Widget: Equipo */}
        <DepartmentWidgetCard
          title="Equipo"
          icon={Users}
          iconColor="text-purple-600"
          isExpanded={expandedWidget === 'equipo'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'equipo'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'equipo' ? null : 'equipo')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('equipo')}
          summary={
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Empleados:</span>
                <span className="font-semibold">{estadisticas?.estadisticas.totalEmpleados || 0}</span>
              </div>
              {estadisticas?.jefe && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={estadisticas.jefe.avatarUrl} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(estadisticas.jefe.nombreCompleto)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{estadisticas.jefe.nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground">Líder</p>
                  </div>
                </div>
              )}
            </div>
          }
          fullContent={
            <DepartmentTeamView
              departamentoId={departamentoId}
              departamentoNombre={departamentoActual.nombre}
              jefe={departamentoActual.jefe}
              empleados={departamentoActual.usuarios}
              puestosTrabajo={departamentoActual.puestosTrabajo}
              totalEmpleados={estadisticas?.estadisticas.totalEmpleados || 0}
            />
          }
        />

        {/* Widget: Rendimiento */}
        <DepartmentWidgetCard
          title="Rendimiento"
          icon={TrendingUp}
          iconColor="text-green-600"
          isExpanded={expandedWidget === 'rendimiento'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'rendimiento'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'rendimiento' ? null : 'rendimiento')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('rendimiento')}
          summary={
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tasa de Completación</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Tareas Abiertas</p>
                  <p className="font-semibold">{estadisticas?.estadisticas.tareas.abiertas || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completadas</p>
                  <p className="font-semibold text-green-600">{tareasCompletadas}</p>
                </div>
              </div>
            </div>
          }
          fullContent={
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Métricas de Rendimiento</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Tasa de Completación</span>
                        <span className="font-semibold text-foreground">{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Proyectos Activos</span>
                        <span className="font-semibold text-foreground">
                          {estadisticas?.estadisticas.proyectos.activos || 0} /{" "}
                          {estadisticas?.estadisticas.proyectos.total || 0}
                        </span>
                      </div>
                      <Progress
                        value={
                          estadisticas?.estadisticas.proyectos.total
                            ? (estadisticas.estadisticas.proyectos.activos /
                                estadisticas.estadisticas.proyectos.total) *
                              100
                            : 0
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Estadísticas Detalladas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Proyectos</p>
                      <p className="text-2xl font-bold">{estadisticas?.estadisticas.proyectos.total || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Completados</p>
                      <p className="text-2xl font-bold text-green-600">{estadisticas?.estadisticas.proyectos.completados || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tareas Abiertas</p>
                      <p className="text-2xl font-bold">{estadisticas?.estadisticas.tareas.abiertas || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Puestos</p>
                      <p className="text-2xl font-bold">{estadisticas?.estadisticas.totalPuestos || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        />

        {/* Widget: Presupuesto */}
        <DepartmentWidgetCard
          title="Presupuesto"
          icon={Coins}
          iconColor="text-yellow-600"
          isExpanded={expandedWidget === 'presupuesto'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'presupuesto'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'presupuesto' ? null : 'presupuesto')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('presupuesto')}
          summary={
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Gestión financiera y control de gastos del departamento
              </p>
              <Button size="sm" variant="outline" className="w-full" onClick={(e) => e.stopPropagation()}>
                <Eye className="h-3 w-3 mr-1" />
                Ver Detalles
              </Button>
            </div>
          }
          fullContent={
            <BudgetView
              entityId={departamentoId}
              entityType="departamento"
              entityName={departamentoActual.nombre}
            />
          }
        />

        {/* Widget: Contexto */}
        <DepartmentWidgetCard
          title="Contexto"
          icon={Sparkles}
          iconColor="text-pink-600"
          isExpanded={expandedWidget === 'contexto'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'contexto'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'contexto' ? null : 'contexto')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('contexto')}
          summary={
            <div className="space-y-2">
              {contexto ? (
                <>
                  <p className="text-xs line-clamp-2">{contexto.objetivos || "Sin objetivos"}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {contexto.kpis ? "KPIs ✓" : "Sin KPIs"}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No hay contexto definido</p>
              )}
            </div>
          }
          quickActions={
            <Button size="sm" variant="outline" onClick={(e) => {
              e.stopPropagation()
              setShowContextModal(true)
            }}>
              <Edit className="h-3 w-3 mr-1" />
              {contexto ? "Editar" : "Crear"}
            </Button>
          }
          fullContent={
            <DepartmentContextView
              contexto={contexto}
              departamentoId={departamentoId}
              departamentoNombre={departamentoActual.nombre}
              onEdit={() => setShowContextModal(true)}
              onCreate={() => setShowContextModal(true)}
            />
          }
        />

        {/* Widget: Organigrama */}
        <DepartmentWidgetCard
          title="Organigrama"
          icon={Map}
          iconColor="text-indigo-600"
          isExpanded={expandedWidget === 'organigrama'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'organigrama'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'organigrama' ? null : 'organigrama')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('organigrama')}
          summary={
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Puestos de Trabajo:</span>
                <span className="font-semibold">{estadisticas?.estadisticas.totalPuestos || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estructura jerárquica del departamento
              </p>
            </div>
          }
          fullContent={
            <DepartmentOrgChart
              departamentoId={departamentoId}
              departamentoNombre={departamentoActual.nombre}
            />
          }
        />

        {/* Widget: Documentos */}
        <DepartmentWidgetCard
          title="Documentos"
          icon={FileText}
          iconColor="text-orange-600"
          isExpanded={expandedWidget === 'documentos'}
          isOtherExpanded={expandedWidget !== null && expandedWidget !== 'documentos'}
          onToggleExpand={() => setExpandedWidget(expandedWidget === 'documentos' ? null : 'documentos')}
          onChangeWidget={(widgetId: string) => setExpandedWidget(widgetId)}
          availableWidgets={getAvailableWidgets('documentos')}
          summary={
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Gestión de documentos y archivos del departamento
              </p>
              <Button size="sm" variant="outline" className="w-full" onClick={(e) => e.stopPropagation()}>
                <Eye className="h-3 w-3 mr-1" />
                Ver Documentos
              </Button>
            </div>
          }
          fullContent={
            <DepartmentDocumentsManager
              departamentoId={departamentoId}
              departamentoNombre={departamentoActual.nombre}
            />
          }
        />
      </div>

      {/* Modals */}
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
  )
}
