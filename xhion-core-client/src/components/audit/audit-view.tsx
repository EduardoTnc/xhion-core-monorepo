"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw, Sparkles } from "lucide-react"
import { AuditTable } from "./audit-table"
import { AuditDetail } from "./audit-detail"
import { AuditStats } from "./audit-stats"

export function AuditView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUser, setFilterUser] = useState("all")
  const [filterEvent, setFilterEvent] = useState("all")
  const [filterModule, setFilterModule] = useState("all")
  const [selectedLog, setSelectedLog] = useState<number | null>(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Seguridad y Auditoría</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Registros inmutables de todas las acciones del sistema
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowAIAnalysis(true)}>
                <Sparkles className="h-4 w-4" />
                Análisis IA
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en registros de auditoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="ana">Ana García</SelectItem>
                <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                <SelectItem value="maria">María López</SelectItem>
                <SelectItem value="juan">Juan Pérez</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                <SelectItem value="create">Creación</SelectItem>
                <SelectItem value="update">Edición</SelectItem>
                <SelectItem value="delete">Eliminación</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="permission">Cambio de permisos</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                <SelectItem value="projects">Proyectos</SelectItem>
                <SelectItem value="tasks">Tareas</SelectItem>
                <SelectItem value="users">Usuarios</SelectItem>
                <SelectItem value="roles">Roles</SelectItem>
                <SelectItem value="auth">Autenticación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <AuditStats />

        {/* AI Analysis Banner */}
        {showAIAnalysis && (
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-2">Análisis de Seguridad IA - Últimas 24h</h4>
                  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>
                      Se detectaron <span className="font-medium text-foreground">3 intentos de acceso fallidos</span>{" "}
                      desde la IP 192.168.1.45 entre las 02:00 y 02:15 AM.
                    </p>
                    <p>
                      Se realizaron <span className="font-medium text-foreground">2 cambios de permisos</span> en el rol
                      Marketing por el usuario Ana García a las 14:30.
                    </p>
                    <p>
                      Actividad normal detectada. No se identificaron patrones sospechosos o anomalías de seguridad.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      Ver detalles completos
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAIAnalysis(false)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit table */}
        <div className="flex-1 overflow-y-auto p-6">
          <AuditTable onSelectLog={setSelectedLog} />
        </div>
      </div>

      {/* Detail sidebar */}
      {selectedLog && <AuditDetail logId={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
