"use client"

import { useState, useEffect } from "react"
import { Building2, Users, FolderKanban, TrendingUp, Search, Filter, Plus, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DepartmentCard } from "./department-card"
import { DepartmentDetailWidgets } from "./department-detail-widgets"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { useDepartmentStore } from "@/store/departmentStore"

export function DepartmentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { departamentos, isLoading, fetchDepartamentos } = useDepartmentStore()

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  const filteredDepartments = departamentos.filter(
    (dept) =>
      dept.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.descripcion && dept.descripcion.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalMembers = departamentos.reduce((sum, dept) => sum + (dept._count?.puestosTrabajo || 0), 0)
  const totalProjects = departamentos.reduce((sum, dept) => sum + (dept._count?.proyectos || 0), 0)
  const avgPerformance = 85 // Placeholder - calcular con estadísticas reales

  if (selectedDepartment) {
    return <DepartmentDetailWidgets departamentoId={selectedDepartment} onBack={() => setSelectedDepartment(null)} />
  }

  if (isLoading && departamentos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Departamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión organizacional y recursos por departamento</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          <span>Nuevo Departamento</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md border bg-background">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Departamentos</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{departamentos.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md border bg-background">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Miembros</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{totalMembers}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md border bg-background">
              <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Proyectos</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-border bg-card p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md border bg-background">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Rendimiento</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{avgPerformance}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-2 border-primary bg-muted/50 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Análisis Organizacional</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              El departamento de <strong>Diseño Gráfico</strong> lidera en productividad (95%).
              <strong> Ventas</strong> requiere atención en gestión presupuestaria. Se recomienda redistribuir recursos
              de <strong>Operaciones</strong> hacia <strong>Desarrollo</strong> para el próximo trimestre.
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar departamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto h-10">
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </Button>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <Card className="border-2 border-dashed border-border p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md border-2 bg-background mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No se encontraron departamentos' : 'No hay departamentos'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer departamento para organizar tu empresa'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Crear Departamento</span>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={() => setSelectedDepartment(department.id)}
            />
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      <CreateDepartmentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  )
}
