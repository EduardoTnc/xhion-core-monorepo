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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DepartmentDetailProps {
  department: {
    id: number
    name: string
    description: string
    color: string
    members: number
    activeProjects: number
    completedTasks: number
    pendingTasks: number
    performance: number
    budget: number
    budgetUsed: number
    lead: {
      name: string
      avatar: string
      role: string
    }
    recentActivity: Array<{
      type: string
      name: string
      status: string
    }>
    aiInsights: {
      productivity: number
      riskLevel: string
      recommendation: string
    }
  }
  onBack: () => void
}

export function DepartmentDetail({ department, onBack }: DepartmentDetailProps) {
  const budgetPercentage = (department.budgetUsed / department.budget) * 100
  const totalTasks = department.completedTasks + department.pendingTasks
  const completionRate = Math.round((department.completedTasks / totalTasks) * 100)

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-16 w-16 rounded-xl" style={{ backgroundColor: department.color }} />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{department.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{department.description}</p>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros</p>
              <p className="text-2xl font-bold text-foreground">{department.members}</p>
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
              <p className="text-2xl font-bold text-foreground">{department.activeProjects}</p>
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
              <p className="text-2xl font-bold text-foreground">{department.completedTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rendimiento</p>
              <p className="text-2xl font-bold text-foreground">{department.performance}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Recomendación de IA</h3>
            <p className="mt-1 text-sm text-muted-foreground">{department.aiInsights.recommendation}</p>
            <div className="mt-3 flex items-center gap-4">
              <Badge variant="outline">Productividad: {department.aiInsights.productivity}%</Badge>
              <Badge variant={department.aiInsights.riskLevel === "low" ? "default" : "destructive"}>
                {department.aiInsights.riskLevel === "low" ? "Bajo Riesgo" : "Requiere Atención"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
              <TabsTrigger value="team">Equipo</TabsTrigger>
              <TabsTrigger value="budget">Presupuesto</TabsTrigger>
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
                      <span className="text-muted-foreground">Productividad</span>
                      <span className="font-semibold text-foreground">{department.aiInsights.productivity}%</span>
                    </div>
                    <Progress value={department.aiInsights.productivity} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rendimiento General</span>
                      <span className="font-semibold text-foreground">{department.performance}%</span>
                    </div>
                    <Progress value={department.performance} className="mt-2" />
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">Actividad Reciente</h3>
                <div className="mt-4 space-y-3">
                  {department.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          {activity.type === "project" && <FolderKanban className="h-4 w-4 text-primary" />}
                          {activity.type === "task" && <CheckSquare className="h-4 w-4 text-primary" />}
                          {activity.type === "member" && <Users className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                        </div>
                      </div>
                      <Badge variant="outline">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card className="border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Lista de proyectos del departamento...</p>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card className="border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Miembros del equipo...</p>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card className="border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Análisis presupuestario...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Department Lead */}
          <Card className="border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Líder del Departamento</h3>
            <div className="mt-4 flex items-center gap-3">
              <img
                src={department.lead.avatar || "/placeholder.svg"}
                alt={department.lead.name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-medium text-foreground">{department.lead.name}</p>
                <p className="text-sm text-muted-foreground">{department.lead.role}</p>
              </div>
            </div>
            <Button className="mt-4 w-full bg-transparent" variant="outline">
              Ver Perfil
            </Button>
          </Card>

          {/* Budget Overview */}
          <Card className="border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Presupuesto</h3>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">S/. {department.budgetUsed.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ S/. {department.budget.toLocaleString()}</span>
              </div>
              <Progress value={budgetPercentage} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">{budgetPercentage.toFixed(1)}% utilizado</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Acciones Rápidas</h3>
            <div className="mt-4 space-y-2">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <FolderKanban className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Agregar Miembro
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Programar Reunión
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
