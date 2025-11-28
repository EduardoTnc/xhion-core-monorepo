"use client"

import { Shield, Activity, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { AuditStatsData } from "@/services/auditService"

interface AuditStatsProps {
  stats?: AuditStatsData
  onActiveUsersClick?: () => void
}

export function AuditStats({ stats, onActiveUsersClick }: AuditStatsProps) {
  if (!stats) return null;

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{stats.totalEventsToday}</p>
            <p className="text-xs text-muted-foreground">
              Eventos hoy
              {stats.trend !== 0 && (
                <span className={stats.trend > 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                  ({stats.trend > 0 ? "+" : ""}{stats.trend}%)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{stats.integrity}%</p>
            <p className="text-xs text-muted-foreground">Integridad</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{stats.criticalEventsToday}</p>
            <p className="text-xs text-muted-foreground">Alertas críticas</p>
          </div>
        </div>
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
          onClick={onActiveUsersClick}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
            <Shield className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{stats.activeUsersToday}</p>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
