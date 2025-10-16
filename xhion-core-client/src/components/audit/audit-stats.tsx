"use client"

import { Shield, Activity, AlertTriangle, CheckCircle2 } from "lucide-react"

export function AuditStats() {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">1,247</p>
            <p className="text-xs text-muted-foreground">Eventos hoy</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">98.7%</p>
            <p className="text-xs text-muted-foreground">Integridad</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Alertas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
            <Shield className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">45</p>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
