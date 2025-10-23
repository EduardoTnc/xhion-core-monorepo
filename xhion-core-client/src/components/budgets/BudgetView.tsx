import { useEffect, useState } from "react"
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  ArrowRightLeft,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePresupuestoStore } from "@/store/presupuestoStore"
import { CreateBudgetDepartmentModal } from "./CreateBudgetDepartmentModal"
import { CreateMovementModal } from "./CreateMovementModal"
import { EstadoPresupuesto, TipoMovimientoPresupuesto } from "@/services/presupuestoService"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/formatCurrency"

interface BudgetViewProps {
  entityId: string
  entityType: "departamento" | "proyecto"
  entityName: string
}

const estadoColors = {
  [EstadoPresupuesto.Activo]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [EstadoPresupuesto.Agotado]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [EstadoPresupuesto.Cerrado]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  [EstadoPresupuesto.Suspendido]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

const tipoIcons = {
  [TipoMovimientoPresupuesto.Asignacion]: ArrowUpCircle,
  [TipoMovimientoPresupuesto.Gasto]: ArrowDownCircle,
  [TipoMovimientoPresupuesto.Ajuste]: RefreshCw,
  [TipoMovimientoPresupuesto.Transferencia]: ArrowRightLeft,
}

const tipoColors = {
  [TipoMovimientoPresupuesto.Asignacion]: "text-green-500",
  [TipoMovimientoPresupuesto.Gasto]: "text-red-500",
  [TipoMovimientoPresupuesto.Ajuste]: "text-blue-500",
  [TipoMovimientoPresupuesto.Transferencia]: "text-purple-500",
}

export function BudgetView({ entityId, entityType, entityName }: BudgetViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)

  const {
    presupuestosDepartamento,
    presupuestosProyecto,
    fetchPresupuestoDepartamento,
    fetchPresupuestoProyecto,
    deletePresupuestoDepartamento,
    deletePresupuestoProyecto,
  } = usePresupuestoStore()

  const presupuesto =
    entityType === "departamento"
      ? presupuestosDepartamento.get(entityId)
      : presupuestosProyecto.get(entityId)

  useEffect(() => {
    if (entityType === "departamento") {
      fetchPresupuestoDepartamento(entityId).catch(() => {})
    } else {
      fetchPresupuestoProyecto(entityId).catch(() => {})
    }
  }, [entityId, entityType])

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este presupuesto?")) return
    try {
      if (entityType === "departamento") {
        await deletePresupuestoDepartamento(entityId)
      } else {
        await deletePresupuestoProyecto(entityId)
      }
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error)
    }
  }

  if (!presupuesto) {
    return (
      <Card className="border-border bg-card p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Sin Presupuesto Asignado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este {entityType} aún no tiene un presupuesto configurado
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Presupuesto
          </Button>
        </div>

        {entityType === "departamento" && (
          <CreateBudgetDepartmentModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            departamentoId={entityId}
            departamentoNombre={entityName}
          />
        )}
      </Card>
    )
  }

  const montoTotal = Number(presupuesto.montoTotal)
  const montoGastado = Number(presupuesto.montoGastado)
  const montoDisponible = Number(presupuesto.montoDisponible)
  const porcentajeGastado = montoTotal > 0 ? (montoGastado / montoTotal) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header con Estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Presupuesto</h2>
          {entityType === "departamento" && "periodo" in presupuesto && (
            <p className="text-sm text-muted-foreground">Periodo: {presupuesto.periodo}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={estadoColors[presupuesto.estado]}>{presupuesto.estado}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCreateModal(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Presupuesto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Presupuesto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monto Total</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(montoTotal)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gastado</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(montoGastado)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {porcentajeGastado.toFixed(1)}% del total
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disponible</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(montoDisponible)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(100 - porcentajeGastado).toFixed(1)}% restante
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de Progreso */}
      <Card className="border-border bg-card p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consumo del Presupuesto</span>
            <span className="font-semibold text-foreground">{porcentajeGastado.toFixed(1)}%</span>
          </div>
          <Progress value={porcentajeGastado} className="h-3" />
          {porcentajeGastado > 90 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>Advertencia: El presupuesto está próximo a agotarse</span>
            </div>
          )}
        </div>
      </Card>

      {/* Movimientos */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Movimientos Recientes</h3>
          <Button onClick={() => setShowMovementModal(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>

        <div className="space-y-3">
          {presupuesto.movimientos && presupuesto.movimientos.length > 0 ? (
            presupuesto.movimientos.slice(0, 5).map((movimiento) => {
              const TipoIcon = tipoIcons[movimiento.tipo]
              return (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <TipoIcon className={`h-5 w-5 ${tipoColors[movimiento.tipo]}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {movimiento.descripcion}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>
                          {format(new Date(movimiento.fechaMovimiento), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                        {movimiento.categoria && (
                          <>
                            <span>•</span>
                            <span>{movimiento.categoria}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        movimiento.tipo === TipoMovimientoPresupuesto.Gasto
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {movimiento.tipo === TipoMovimientoPresupuesto.Gasto ? "-" : "+"}
                      {formatCurrency(Number(movimiento.monto))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movimiento.registradoPor.nombreCompleto}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay movimientos registrados
            </p>
          )}
        </div>
      </Card>

      {/* Modales */}
      {entityType === "departamento" && (
        <CreateBudgetDepartmentModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          departamentoId={entityId}
          departamentoNombre={entityName}
          presupuestoExistente={presupuesto as any}
        />
      )}

      <CreateMovementModal
        open={showMovementModal}
        onOpenChange={setShowMovementModal}
        presupuestoId={presupuesto.id}
        tipo={entityType}
        montoDisponible={montoDisponible}
      />
    </div>
  )
}
