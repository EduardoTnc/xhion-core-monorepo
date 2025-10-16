"use client"

import { Users, FolderKanban, CheckSquare, TrendingUp, AlertCircle, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DepartmentCardProps {
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
    aiInsights: {
      productivity: number
      riskLevel: string
      recommendation: string
    }
  }
  onClick: () => void
}

export function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  const budgetPercentage = (department.budgetUsed / department.budget) * 100

  return (
    <Card
      className="group cursor-pointer border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: department.color }} />
          <div>
            <h3 className="font-semibold text-foreground">{department.name}</h3>
            <p className="text-xs text-muted-foreground">{department.description}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>

      {/* Lead */}
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <img
          src={department.lead.avatar || "/placeholder.svg"}
          alt={department.lead.name}
          className="h-10 w-10 rounded-full"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{department.lead.name}</p>
          <p className="text-xs text-muted-foreground">{department.lead.role}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">Miembros</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{department.members}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            <span className="text-xs">Proyectos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{department.activeProjects}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="text-xs">Tareas</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{department.pendingTasks}</p>
        </div>
      </div>

      {/* Performance */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rendimiento</span>
          <span className="font-semibold text-foreground">{department.performance}%</span>
        </div>
        <Progress value={department.performance} className="mt-2" />
      </div>

      {/* Budget */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Presupuesto</span>
          <span className="font-semibold text-foreground">
            ${department.budgetUsed.toLocaleString()} / ${department.budget.toLocaleString()}
          </span>
        </div>
        <Progress value={budgetPercentage} className="mt-2" />
      </div>

      {/* AI Risk Badge */}
      <div className="mt-4 flex items-center justify-between">
        <Badge variant={department.aiInsights.riskLevel === "low" ? "default" : "destructive"} className="gap-1.5">
          {department.aiInsights.riskLevel === "low" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          {department.aiInsights.riskLevel === "low" ? "Bajo Riesgo" : "Requiere Atención"}
        </Badge>
        <span className="text-xs text-muted-foreground">Productividad: {department.aiInsights.productivity}%</span>
      </div>
    </Card>
  )
}
