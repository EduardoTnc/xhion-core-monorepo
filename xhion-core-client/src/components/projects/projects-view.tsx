"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Settings,
  UserPlus,
  MoreVertical,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Table2,
  Calendar,
  Menu,
  X,
} from "lucide-react"
import { ProjectKanban } from "./project-kanban"
import { ProjectList } from "./project-list"
import { ProjectTable } from "./project-table"
import { ProjectTimeline } from "./project-timeline"
import { cn } from "@/lib/utils"

const projects = [
  {
    id: 1,
    name: "Rediseño Web Corporativo",
    status: "active",
    progress: 68,
    color: "bg-chart-1",
  },
  {
    id: 2,
    name: "App Móvil iOS",
    status: "active",
    progress: 42,
    color: "bg-chart-2",
  },
  {
    id: 3,
    name: "Migración Cloud",
    status: "planning",
    progress: 15,
    color: "bg-chart-3",
  },
  {
    id: 4,
    name: "Sistema CRM",
    status: "completed",
    progress: 100,
    color: "bg-chart-4",
  },
]

const stages = [
  { id: 1, name: "Planificación", status: "completed" },
  { id: 2, name: "Diseño", status: "completed" },
  { id: 3, name: "Desarrollo", status: "active" },
  { id: 4, name: "Testing", status: "pending" },
  { id: 5, name: "Despliegue", status: "pending" },
]

const teamMembers = [
  { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
  { name: "Carlos Ruiz", avatar: "/man.jpg" },
  { name: "María López", avatar: "/diverse-woman-portrait.png" },
  { name: "Juan Pérez", avatar: "/man.jpg" },
]

export function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState(projects[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "table" | "timeline">("kanban")
  const [showProjectsSidebar, setShowProjectsSidebar] = useState(false)

  return (
    <div className="flex h-full relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 z-10 lg:hidden"
        onClick={() => setShowProjectsSidebar(!showProjectsSidebar)}
      >
        {showProjectsSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {showProjectsSidebar && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setShowProjectsSidebar(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-80 border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          showProjectsSidebar ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedProject.id === project.id
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{project.name}</span>
                  {project.status === "active" && <Circle className="h-2 w-2 fill-primary text-primary" />}
                  {project.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div className={`h-full rounded-full ${project.color}`} style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{project.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="border-b border-border bg-card p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="pl-12 lg:pl-0">
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">{selectedProject.name}</h1>
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">Etapa actual: Desarrollo</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent text-xs md:text-sm">
                  <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Invitar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent text-xs md:text-sm">
                  <Settings className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Ajustes</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                        stage.status === "completed"
                          ? "border-primary bg-primary text-primary-foreground"
                          : stage.status === "active"
                            ? "border-primary bg-background text-primary"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {stage.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : stage.status === "active" ? (
                        <Circle className="h-3 w-3 fill-primary" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        stage.status === "active" ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`h-0.5 flex-1 ${stage.status === "completed" ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <h3 className="font-medium text-foreground">Desarrollo</h3>
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                  Implementación de funcionalidades core y componentes UI
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {teamMembers.map((member, i) => (
                    <Avatar key={i} className="h-7 w-7 md:h-8 md:w-8 border-2 border-background">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="text-xs md:text-sm bg-transparent">
                  Editar etapa
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="border-b border-border bg-card px-4 md:px-6 py-3">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
                  <TabsTrigger value="kanban" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <List className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <Table2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Tabla</span>
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Timeline</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="h-full overflow-y-auto p-4 md:p-6">
              {viewMode === "kanban" && <ProjectKanban />}
              {viewMode === "list" && <ProjectList />}
              {viewMode === "table" && <ProjectTable />}
              {viewMode === "timeline" && <ProjectTimeline />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
