"use client"

import { useState } from "react"
import { Building2, Users, FolderKanban, TrendingUp, Search, Filter, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DepartmentCard } from "./department-card"
import { DepartmentDetail } from "./department-detail"

const departments = [
  {
    id: 1,
    name: "Marketing",
    description: "Estrategia de marca, campañas y contenido digital",
    color: "oklch(0.7 0.15 270)",
    members: 12,
    activeProjects: 8,
    completedTasks: 156,
    pendingTasks: 43,
    performance: 87,
    budget: 45000,
    budgetUsed: 32500,
    lead: {
      name: "Ana García",
      avatar: "/diverse-woman-portrait.png",
      role: "Marketing Director",
    },
    recentActivity: [
      { type: "project", name: "Campaña Q1 2025", status: "En progreso" },
      { type: "task", name: "Diseño de landing page", status: "Completada" },
      { type: "member", name: "Carlos López se unió al equipo", status: "Nuevo" },
    ],
    aiInsights: {
      productivity: 92,
      riskLevel: "low",
      recommendation: "El equipo está superando las expectativas. Considera asignar proyectos más complejos.",
    },
  },
  {
    id: 2,
    name: "Diseño Gráfico",
    description: "Identidad visual, UI/UX y producción creativa",
    color: "oklch(0.7 0.15 330)",
    members: 8,
    activeProjects: 12,
    completedTasks: 203,
    pendingTasks: 67,
    performance: 91,
    budget: 38000,
    budgetUsed: 28900,
    lead: {
      name: "Miguel Torres",
      avatar: "/man.jpg",
      role: "Design Lead",
    },
    recentActivity: [
      { type: "project", name: "Rediseño de marca", status: "En revisión" },
      { type: "task", name: "Mockups de app móvil", status: "En progreso" },
      { type: "project", name: "Sistema de diseño", status: "Completado" },
    ],
    aiInsights: {
      productivity: 95,
      riskLevel: "low",
      recommendation: "Excelente rendimiento. El equipo podría liderar workshops internos de diseño.",
    },
  },
  {
    id: 3,
    name: "Ventas",
    description: "Desarrollo de negocio, relaciones con clientes y cierres",
    color: "oklch(0.7 0.15 140)",
    members: 15,
    activeProjects: 6,
    completedTasks: 189,
    pendingTasks: 52,
    performance: 78,
    budget: 52000,
    budgetUsed: 48300,
    lead: {
      name: "Laura Martínez",
      avatar: "/woman-business.jpg",
      role: "Sales Director",
    },
    recentActivity: [
      { type: "project", name: "Pipeline Q1", status: "En progreso" },
      { type: "task", name: "Propuesta Cliente A", status: "Completada" },
      { type: "member", name: "3 nuevos leads asignados", status: "Nuevo" },
    ],
    aiInsights: {
      productivity: 82,
      riskLevel: "medium",
      recommendation:
        "El presupuesto está cerca del límite. Revisa la asignación de recursos para el próximo trimestre.",
    },
  },
  {
    id: 4,
    name: "Desarrollo",
    description: "Ingeniería de software, infraestructura y DevOps",
    color: "oklch(0.7 0.15 210)",
    members: 18,
    activeProjects: 10,
    completedTasks: 342,
    pendingTasks: 98,
    performance: 89,
    budget: 78000,
    budgetUsed: 62400,
    lead: {
      name: "David Chen",
      avatar: "/man-developer.jpg",
      role: "Engineering Manager",
    },
    recentActivity: [
      { type: "project", name: "API v3.0", status: "En progreso" },
      { type: "task", name: "Migración a microservicios", status: "En progreso" },
      { type: "project", name: "Dashboard Analytics", status: "Completado" },
    ],
    aiInsights: {
      productivity: 88,
      riskLevel: "low",
      recommendation: "Buen ritmo de desarrollo. Considera implementar más automatización en testing.",
    },
  },
  {
    id: 5,
    name: "Recursos Humanos",
    description: "Talento, cultura organizacional y desarrollo profesional",
    color: "oklch(0.7 0.15 30)",
    members: 6,
    activeProjects: 4,
    completedTasks: 87,
    pendingTasks: 23,
    performance: 85,
    budget: 28000,
    budgetUsed: 19600,
    lead: {
      name: "Patricia Ruiz",
      avatar: "/professional-woman.png",
      role: "HR Director",
    },
    recentActivity: [
      { type: "project", name: "Programa de onboarding", status: "En progreso" },
      { type: "task", name: "Evaluaciones Q4", status: "Completada" },
      { type: "member", name: "5 nuevas contrataciones", status: "Nuevo" },
    ],
    aiInsights: {
      productivity: 90,
      riskLevel: "low",
      recommendation: "El equipo está bien organizado. Considera expandir los programas de desarrollo profesional.",
    },
  },
  {
    id: 6,
    name: "Operaciones",
    description: "Logística, procesos internos y optimización operativa",
    color: "oklch(0.7 0.15 60)",
    members: 10,
    activeProjects: 7,
    completedTasks: 178,
    pendingTasks: 41,
    performance: 83,
    budget: 42000,
    budgetUsed: 35700,
    lead: {
      name: "Roberto Sánchez",
      avatar: "/man-manager.jpg",
      role: "Operations Manager",
    },
    recentActivity: [
      { type: "project", name: "Optimización de procesos", status: "En progreso" },
      { type: "task", name: "Auditoría de inventario", status: "Completada" },
      { type: "project", name: "Sistema de tracking", status: "En revisión" },
    ],
    aiInsights: {
      productivity: 86,
      riskLevel: "low",
      recommendation: "Rendimiento estable. Evalúa la implementación de automatización en tareas repetitivas.",
    },
  },
]

export function DepartmentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalMembers = departments.reduce((sum, dept) => sum + dept.members, 0)
  const totalProjects = departments.reduce((sum, dept) => sum + dept.activeProjects, 0)
  const totalTasks = departments.reduce((sum, dept) => sum + dept.pendingTasks, 0)
  const avgPerformance = Math.round(departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length)

  if (selectedDepartment) {
    const department = departments.find((d) => d.id === selectedDepartment)
    if (department) {
      return <DepartmentDetail department={department} onBack={() => setSelectedDepartment(null)} />
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión organizacional y recursos por departamento</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Departamento
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departamentos</p>
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Miembros</p>
              <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
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
              <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rendimiento Promedio</p>
              <p className="text-2xl font-bold text-foreground">{avgPerformance}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Análisis Organizacional con IA</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              El departamento de <strong>Diseño Gráfico</strong> lidera en productividad (95%).
              <strong> Ventas</strong> requiere atención en gestión presupuestaria. Se recomienda redistribuir recursos
              de <strong>Operaciones</strong> hacia <strong>Desarrollo</strong> para el próximo trimestre.
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar departamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onClick={() => setSelectedDepartment(department.id)}
          />
        ))}
      </div>
    </div>
  )
}
