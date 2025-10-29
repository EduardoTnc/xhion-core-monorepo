import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Timer,
  Calendar,
  User
} from "lucide-react"
import { toast } from "sonner"
import apiClient from "../../api/axios"

interface InvitacionReciente {
  id: string
  email: string
  nombre_completo: string
  fecha_utilizacion: string
  fecha_creacion: string
  rol: {
    nombre: string
    color: string
  }
}

interface EstadisticasInvitaciones {
  total: number
  utilizadas: number
  pendientes: number
  expiradas: number
  tasaAceptacion: string
  tiempoPromedioAceptacionHoras: number
  invitacionesRecientes: InvitacionReciente[]
}

interface InvitationsStatsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvitationsStatsModal({ open, onOpenChange }: InvitationsStatsModalProps) {
  const [stats, setStats] = useState<EstadisticasInvitaciones | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchStats()
    }
  }, [open])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/invitaciones/estadisticas")
      setStats(response.data)
    } catch (error: any) {
      toast.error("Error al cargar estadísticas")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTiempoAceptacion = (horas: number) => {
    if (horas < 1) return "< 1 hora"
    if (horas < 24) return `${horas} horas`
    const dias = Math.floor(horas / 24)
    const horasRestantes = horas % 24
    return `${dias}d ${horasRestantes}h`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas de Invitaciones
          </DialogTitle>
          <DialogDescription>
            Métricas y análisis del sistema de invitaciones de usuarios
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-32" />
          </div>
        ) : stats ? (
          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Cards de estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Invitaciones</p>
                  </CardContent>
                </Card>

                {/* Utilizadas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Utilizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.utilizadas}</div>
                    <p className="text-xs text-muted-foreground">{stats.tasaAceptacion}</p>
                  </CardContent>
                </Card>

                {/* Pendientes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.pendientes}</div>
                    <p className="text-xs text-muted-foreground">Activas</p>
                  </CardContent>
                </Card>

                {/* Expiradas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Expiradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.expiradas}</div>
                    <p className="text-xs text-muted-foreground">Sin usar</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tiempo promedio de aceptación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Tiempo Promedio de Aceptación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatTiempoAceptacion(stats.tiempoPromedioAceptacionHoras)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Desde que se envía la invitación hasta que el usuario la acepta
                  </p>
                </CardContent>
              </Card>

              {/* Invitaciones recientes */}
              {stats.invitacionesRecientes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Invitaciones Aceptadas Recientemente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.invitacionesRecientes.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">
                                {inv.nombre_completo}
                              </p>
                              <Badge variant="outline" className={inv.rol.color}>
                                {inv.rol.nombre}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              {inv.email}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {formatDate(inv.fecha_utilizacion)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
