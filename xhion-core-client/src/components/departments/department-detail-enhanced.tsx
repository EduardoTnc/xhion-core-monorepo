import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Users,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Coins,
  Sparkles,
  Calendar,
  MoreVertical,
  Edit,
  FileText,
  Loader2,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { BudgetView } from "@/components/budgets/BudgetView"
import { DepartmentProjectsView } from "./DepartmentProjectsView"
import { DepartmentTeamView } from "./DepartmentTeamView"
import { DepartmentContextView } from "./DepartmentContextView"
import { DepartmentOrgChart } from "./DepartmentOrgChart"
import { DepartmentDocumentsManager } from "./DepartmentDocumentsManager"
import { ProjectWorkspaceEnhanced } from "@/components/projects/ProjectWorkspaceEnhanced"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { useNavigate } from "react-router-dom"

interface DepartmentDetailProps {
  departamentoId: string
  onBack: () => void
}

export function DepartmentDetail({ departamentoId, onBack }: DepartmentDetailProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
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

  // Si hay un proyecto seleccionado, mostrar el workspace del proyecto
  if (selectedProjectId) {
    return (
      <div className="space-y-4 p-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProjectId(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {departamentoActual.nombre}
          </Button>
          <span>/</span>
          <span className="text-foreground font-medium">Proyecto</span>
        </div>

        {/* Project Workspace */}
        <ProjectWorkspaceEnhanced 
          proyectoId={selectedProjectId} 
          hideSidebar={true}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className={`h-16 w-16 rounded-xl flex items-center justify-center ${
              departamentoActual.color || "bg-primary"
            }`}
          >
            <Building2 className="h-8 w-8 text-white" />
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empleados</p>
              <p className="text-2xl font-bold text-foreground">
                {estadisticas?.estadisticas.totalEmpleados || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proyectos Activos</p>
              <p className="text-2xl font-bold text-foreground">
                {estadisticas?.estadisticas.proyectos.activos || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tareas Completadas</p>
              <p className="text-2xl font-bold text-foreground">{tareasCompletadas}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa Completación</p>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {contexto && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
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
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="budget">Presupuesto</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
              <TabsTrigger value="team">Empleados</TabsTrigger>
              <TabsTrigger value="context">Contexto</TabsTrigger>
              <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Performance Chart */}
              <Card className="border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">Rendimiento del Departamento</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasa de Completación</span>
                      <span className="font-semibold text-foreground">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
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
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Puestos de Trabajo */}
              <Card className="border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">Puestos de Trabajo</h3>
                <div className="mt-4 space-y-3">
                  {departamentoActual.puestosTrabajo?.map((puesto) => (
                    <div
                      key={puesto.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{puesto.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {puesto.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <Badge variant="outline">{puesto._count.usuarios} empleados</Badge>
                    </div>
                  ))}
                  {(!departamentoActual.puestosTrabajo ||
                    departamentoActual.puestosTrabajo.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay puestos de trabajo</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <BudgetView
                entityId={departamentoId}
                entityType="departamento"
                entityName={departamentoActual.nombre}
              />
            </TabsContent>

            <TabsContent value="projects">
              <DepartmentProjectsView
                proyectos={departamentoActual.proyectos}
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                onProjectClick={(projectId) => setSelectedProjectId(projectId)}
                onCreateProject={() => setShowCreateProjectModal(true)}
                onViewAllProjects={() => navigate('/proyectos')}
              />
            </TabsContent>

            <TabsContent value="team">
              <DepartmentTeamView
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                jefe={departamentoActual.jefe}
                empleados={departamentoActual.usuarios}
                puestosTrabajo={departamentoActual.puestosTrabajo}
                totalEmpleados={estadisticas?.estadisticas.totalEmpleados || 0}
              />
            </TabsContent>

            <TabsContent value="context">
              <DepartmentContextView
                contexto={contexto}
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
                onEdit={() => setShowContextModal(true)}
                onCreate={() => setShowContextModal(true)}
              />
            </TabsContent>

            <TabsContent value="organigrama">
              <DepartmentOrgChart
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
              />
            </TabsContent>

            <TabsContent value="documentos">
              <DepartmentDocumentsManager
                departamentoId={departamentoId}
                departamentoNombre={departamentoActual.nombre}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Department Lead */}
          {estadisticas?.jefe && (
            <Card className="border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Líder del Departamento</h3>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={estadisticas.jefe.avatarUrl} alt={estadisticas.jefe.nombreCompleto} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(estadisticas.jefe.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{estadisticas.jefe.nombreCompleto}</p>
                  <p className="text-sm text-muted-foreground">{estadisticas.jefe.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Estadísticas Rápidas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Proyectos</span>
                <span className="font-semibold text-foreground">
                  {estadisticas?.estadisticas.proyectos.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Proyectos Completados</span>
                <span className="font-semibold text-foreground">
                  {estadisticas?.estadisticas.proyectos.completados || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tareas Abiertas</span>
                <span className="font-semibold text-foreground">
                  {estadisticas?.estadisticas.tareas.abiertas || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puestos de Trabajo</span>
                <span className="font-semibold text-foreground">
                  {estadisticas?.estadisticas.totalPuestos || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Acciones Rápidas</h3>
            <div className="mt-4 space-y-2">
              <Button 
                className="w-full justify-start bg-transparent" 
                variant="outline"
                onClick={() => setShowCreateProjectModal(true)}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
              <Button 
                className="w-full justify-start bg-transparent" 
                variant="outline"
                onClick={() => setActiveTab("team")}
              >
                <Users className="mr-2 h-4 w-4" />
                Gestionar Empleados
              </Button>
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
                onClick={() => setShowContextModal(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Actualizar Contexto
              </Button>
            </div>
          </Card>
        </div>
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
          // Recargar datos del departamento para mostrar el nuevo proyecto
          fetchDepartamentoById(departamentoId);
          fetchEstadisticas(departamentoId);
        }}
      />
    </div>
  )
}
