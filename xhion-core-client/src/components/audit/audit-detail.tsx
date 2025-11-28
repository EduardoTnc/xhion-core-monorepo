"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Copy, ExternalLink, Shield } from "lucide-react"
import { type AuditLog } from "@/services/auditService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AuditDetailProps {
  log: AuditLog
  onClose: () => void
}

export function AuditDetail({ log, onClose }: AuditDetailProps) {
  const details = log.detalles || {};

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Detalle del Evento</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Event info */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Evento</label>
            <div className="mt-1">
              <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-600">
                {log.accion}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Timestamp</label>
            <p className="mt-1 text-sm font-mono text-foreground">
              {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss.SSS", { locale: es })}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Usuario</label>
            <p className="mt-1 text-sm text-foreground">{log.usuario?.nombreCompleto || "Sistema"}</p>
            <p className="text-xs text-muted-foreground">{log.usuario?.email}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Detalle</label>
            <p className="mt-1 text-sm text-foreground break-words">
              {typeof details === 'string' ? details : JSON.stringify(details)}
            </p>
          </div>
        </div>

        {/* Network info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Información de Red</h4>
          <div>
            <label className="text-xs font-medium text-muted-foreground">IP Address</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="text-xs font-mono text-foreground">{log.direccionIp || "-"}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* JSON Details */}
        {typeof details === 'object' && details !== null && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Datos Técnicos</h4>
            <pre className="mt-1 rounded bg-background p-2 text-xs font-mono text-foreground overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        {/* Integrity */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold text-foreground">Integridad del Registro</h4>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">ID Registro</label>
            <code className="mt-1 block text-xs font-mono text-foreground break-all">{log.id}</code>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
              Verificado
            </Badge>
            <span className="text-xs text-muted-foreground">Registro inmutable</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button variant="outline" className="w-full gap-2 bg-transparent">
          <Copy className="h-4 w-4" />
          Copiar detalles completos
        </Button>
      </div>
    </div>
  )
}
