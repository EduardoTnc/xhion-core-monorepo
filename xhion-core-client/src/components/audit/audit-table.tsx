"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, AlertCircle, Loader2, Info, User, Calendar, Activity } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type AuditLog } from "@/services/auditService"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface AuditTableProps {
  logs: AuditLog[]
  isLoading: boolean
  onSelectLog: (id: string) => void
  onUserClick: (userId: string) => void
}

const getEventColor = (event: string) => {
  const lowerEvent = event.toLowerCase();
  if (lowerEvent.includes("creación") || lowerEvent.includes("create")) return "border-green-500/20 bg-green-500/10 text-green-700 hover:bg-green-500/20"
  if (lowerEvent.includes("edición") || lowerEvent.includes("update")) return "border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
  if (lowerEvent.includes("eliminación") || lowerEvent.includes("delete")) return "border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/20"
  if (lowerEvent.includes("login")) return "border-purple-500/20 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20"
  if (lowerEvent.includes("permisos")) return "border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
  return "border-border bg-muted text-muted-foreground hover:bg-muted/80"
}

export function AuditTable({ logs, isLoading, onSelectLog, onUserClick }: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
        <div className="text-center space-y-3">
          <div className="bg-muted/50 p-4 rounded-full inline-flex">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No se encontraron registros de auditoría</p>
          <p className="text-xs text-muted-foreground/60">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha y Hora
              </div>
            </TableHead>
            <TableHead className="w-[250px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuario
              </div>
            </TableHead>
            <TableHead className="w-[180px]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Evento
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell">Detalle</TableHead>
            <TableHead className="hidden lg:table-cell w-[150px] text-right">IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow
              key={log.id}
              className="cursor-pointer hover:bg-muted/30 group"
              onClick={() => onSelectLog(log.id)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {format(new Date(log.timestamp), "dd MMM yyyy", { locale: es })}
                <br />
                <span className="text-foreground font-medium">
                  {format(new Date(log.timestamp), "HH:mm:ss", { locale: es })}
                </span>
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-3 group/user"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (log.usuarioId) onUserClick(log.usuarioId);
                  }}
                >
                  {log.usuario ? (
                    <Avatar className="h-8 w-8 border border-border transition-transform group-hover/user:scale-105">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {log.usuario.nombreCompleto.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover/user:text-primary transition-colors">
                      {log.usuario?.nombreCompleto || "Sistema"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {log.usuario?.email || "Automático"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getEventColor(log.accion)} transition-colors`}>
                  {log.accion}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-[300px]">
                    {JSON.stringify(log.detalles).replace(/[{}"\\]/g, ' ').trim()}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px] break-words">
                        <p className="text-xs font-mono">{JSON.stringify(log.detalles, null, 2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-right">
                <code className="rounded bg-muted/50 px-2 py-1 text-xs font-mono text-muted-foreground border border-border/50">
                  {log.direccionIp || "127.0.0.1"}
                </code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div >
  )
}
