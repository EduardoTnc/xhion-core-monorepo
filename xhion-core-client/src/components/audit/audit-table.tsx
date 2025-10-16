"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, AlertCircle } from "lucide-react"

interface AuditTableProps {
  onSelectLog: (id: number) => void
}

const auditLogs = [
  {
    id: 1,
    timestamp: "2025-01-10 15:34:22",
    user: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    event: "Cambio de permisos",
    module: "Roles",
    detail: "Modificó permisos del rol Marketing",
    ip: "192.168.1.23",
    result: "success",
    hash: "a3f5c9d2e1b4",
  },
  {
    id: 2,
    timestamp: "2025-01-10 15:28:15",
    user: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    event: "Creación",
    module: "Proyectos",
    detail: "Creó proyecto 'Migración Cloud v2'",
    ip: "192.168.1.45",
    result: "success",
    hash: "b7e2d4f1c8a3",
  },
  {
    id: 3,
    timestamp: "2025-01-10 15:15:08",
    user: { name: "Sistema", avatar: "" },
    event: "Sistema",
    module: "Sistema",
    detail: "Backup automático completado",
    ip: "127.0.0.1",
    result: "success",
    hash: "c9a1f3e5d2b7",
  },
  {
    id: 4,
    timestamp: "2025-01-10 14:52:33",
    user: { name: "María López", avatar: "/diverse-woman-portrait.png" },
    event: "Edición",
    module: "Tareas",
    detail: "Actualizó tarea #1247",
    ip: "192.168.1.67",
    result: "success",
    hash: "d4b8e2f7a1c5",
  },
  {
    id: 5,
    timestamp: "2025-01-10 14:45:19",
    user: { name: "Desconocido", avatar: "" },
    event: "Login",
    module: "Autenticación",
    detail: "Intento de login fallido",
    ip: "203.45.67.89",
    result: "failed",
    hash: "e1c5f9a3d7b2",
    alert: true,
  },
  {
    id: 6,
    timestamp: "2025-01-10 14:30:45",
    user: { name: "Juan Pérez", avatar: "/man.jpg" },
    event: "Login",
    module: "Autenticación",
    detail: "Login exitoso",
    ip: "192.168.1.89",
    result: "success",
    hash: "f7d2a4e8c1b9",
  },
  {
    id: 7,
    timestamp: "2025-01-10 14:15:22",
    user: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    event: "Eliminación",
    module: "Tareas",
    detail: "Eliminó tarea #1245",
    ip: "192.168.1.23",
    result: "success",
    hash: "a8e3f1d5c2b4",
  },
  {
    id: 8,
    timestamp: "2025-01-10 13:58:11",
    user: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    event: "Creación",
    module: "Usuarios",
    detail: "Creó usuario 'nuevo.usuario@xhion.com'",
    ip: "192.168.1.45",
    result: "success",
    hash: "b2f7d9a4e1c8",
  },
]

const getEventColor = (event: string) => {
  switch (event) {
    case "Creación":
      return "border-green-500/20 bg-green-500/10 text-green-600"
    case "Edición":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600"
    case "Eliminación":
      return "border-red-500/20 bg-red-500/10 text-red-600"
    case "Login":
      return "border-purple-500/20 bg-purple-500/10 text-purple-600"
    case "Cambio de permisos":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600"
    case "Sistema":
      return "border-gray-500/20 bg-gray-500/10 text-gray-600"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export function AuditTable({ onSelectLog }: AuditTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Fecha y Hora</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Usuario</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Evento</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Módulo</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Detalle</th>
            <th className="p-4 text-left text-sm font-medium text-muted-foreground">Hash</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelectLog(log.id)}
              className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/30 ${
                log.alert ? "bg-destructive/5" : ""
              }`}
            >
              <td className="p-4">
                <span className="text-sm text-foreground font-mono">{log.timestamp}</span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {log.user.avatar ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={log.user.avatar || "/placeholder.svg"} alt={log.user.name} />
                      <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm text-foreground">{log.user.name}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getEventColor(log.event)}>
                    {log.event}
                  </Badge>
                  {log.alert && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm text-foreground">{log.module}</span>
              </td>
              <td className="p-4">
                <span className="text-sm text-muted-foreground">{log.detail}</span>
              </td>
              <td className="p-4">
                <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">{log.hash}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
