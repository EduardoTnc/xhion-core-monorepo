"use client"

import { Users, FolderKanban, CheckSquare, TrendingUp, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Departamento } from "@/services/departmentService"
import { getDepartmentIcon } from "@/lib/department-icons"

interface DepartmentCardProps {
  department: Departamento
  onClick: () => void
}

export function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  const totalPuestos = department._count?.puestosTrabajo || 0
  const totalProyectos = department._count?.proyectos || 0
  const performance = 85 // Placeholder - obtener de estadísticas
  
  // Obtener icono dinámico
  const { icon: DepartmentIcon, color: iconColor } = getDepartmentIcon(department.icono)
  
  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      className="group cursor-pointer border-2 border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-muted/30"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md border bg-background flex items-center justify-center">
            <DepartmentIcon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{department.nombre}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {department.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>

      {/* Lead */}
      {department.jefe && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={department.jefe.avatarUrl} alt={department.jefe.nombreCompleto} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(department.jefe.nombreCompleto)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{department.jefe.nombreCompleto}</p>
            <p className="text-xs text-muted-foreground">
              {department.jefe.puestoTrabajo?.titulo || "Jefe de Departamento"}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">Puestos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{totalPuestos}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            <span className="text-xs">Proyectos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">{totalProyectos}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="text-xs">Contexto</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">
            {department.contextoDepartamento ? "✓" : "—"}
          </p>
        </div>
      </div>

      {/* Performance */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rendimiento</span>
          <span className="font-semibold text-foreground">{performance}%</span>
        </div>
        <Progress value={performance} className="mt-2" />
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-between">
        <Badge variant="default" className="gap-1.5">
          <TrendingUp className="h-3 w-3" />
          Activo
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(department.fechaCreacion).toLocaleDateString()}
        </span>
      </div>
    </Card>
  )
}
