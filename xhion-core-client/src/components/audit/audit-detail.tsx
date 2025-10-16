"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Copy, ExternalLink, Shield } from "lucide-react"

interface AuditDetailProps {
  logId: number
  onClose: () => void
}

const logDetails: Record<number, any> = {
  1: {
    id: 1,
    timestamp: "2025-01-10 15:34:22.847",
    user: { name: "Ana García", email: "ana.garcia@xhion.com" },
    event: "Cambio de permisos",
    module: "Roles",
    action: "UPDATE",
    detail: "Modificó permisos del rol Marketing",
    ip: "192.168.1.23",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    result: "success",
    entityId: "role_marketing_001",
    entityType: "Role",
    changes: {
      before: { projects: { read: true, update: false } },
      after: { projects: { read: true, update: true } },
    },
    hash: "a3f5c9d2e1b4",
    previousHash: "f8d1c4a7e2b9",
    verified: true,
  },
}

export function AuditDetail({ logId, onClose }: AuditDetailProps) {
  const log = logDetails[logId] || logDetails[1]

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
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600">
                {log.event}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Timestamp</label>
            <p className="mt-1 text-sm font-mono text-foreground">{log.timestamp}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Usuario</label>
            <p className="mt-1 text-sm text-foreground">{log.user.name}</p>
            <p className="text-xs text-muted-foreground">{log.user.email}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Módulo</label>
            <p className="mt-1 text-sm text-foreground">{log.module}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Acción</label>
            <p className="mt-1 text-sm text-foreground">{log.action}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Detalle</label>
            <p className="mt-1 text-sm text-foreground">{log.detail}</p>
          </div>
        </div>

        {/* Network info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Información de Red</h4>
          <div>
            <label className="text-xs font-medium text-muted-foreground">IP Address</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="text-xs font-mono text-foreground">{log.ip}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">User Agent</label>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{log.userAgent}</p>
          </div>
        </div>

        {/* Entity info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Entidad Afectada</h4>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
            <p className="mt-1 text-sm text-foreground">{log.entityType}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">ID</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="text-xs font-mono text-foreground">{log.entityId}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Changes */}
        {log.changes && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Cambios Realizados</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Antes</label>
                <pre className="mt-1 rounded bg-background p-2 text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(log.changes.before, null, 2)}
                </pre>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Después</label>
                <pre className="mt-1 rounded bg-background p-2 text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(log.changes.after, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Integrity */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold text-foreground">Integridad del Registro</h4>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Hash Actual</label>
            <code className="mt-1 block text-xs font-mono text-foreground break-all">{log.hash}</code>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Hash Anterior</label>
            <code className="mt-1 block text-xs font-mono text-foreground break-all">{log.previousHash}</code>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
              Verificado
            </Badge>
            <span className="text-xs text-muted-foreground">Registro inmutable</span>
          </div>
        </div>

        {/* Result */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Resultado</label>
          <div className="mt-1">
            <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
              {log.result === "success" ? "Exitoso" : "Fallido"}
            </Badge>
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
