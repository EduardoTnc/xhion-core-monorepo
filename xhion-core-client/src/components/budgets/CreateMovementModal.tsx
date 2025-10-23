import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, ArrowRightLeft, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePresupuestoStore } from "@/store/presupuestoStore"
import { TipoMovimientoPresupuesto } from "@/services/presupuestoService"
import { formatCurrency } from "@/lib/formatCurrency"

const movimientoSchema = z.object({
  tipo: z.nativeEnum(TipoMovimientoPresupuesto),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  categoria: z.string().optional(),
  fechaMovimiento: z.string().optional(),
  horaMovimiento: z.string().optional(),
})

type MovimientoFormData = z.infer<typeof movimientoSchema>

interface CreateMovementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presupuestoId: string
  tipo: "departamento" | "proyecto"
  montoDisponible: number
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

export function CreateMovementModal({
  open,
  onOpenChange,
  presupuestoId,
  tipo,
  montoDisponible,
}: CreateMovementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createMovimientoDepartamento, createMovimientoProyecto } = usePresupuestoStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MovimientoFormData>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      tipo: TipoMovimientoPresupuesto.Gasto,
      monto: 0,
      descripcion: "",
      categoria: "",
      fechaMovimiento: new Date().toISOString().split("T")[0],
      horaMovimiento: new Date().toTimeString().slice(0, 5),
    },
  })

  const selectedTipo = watch("tipo")
  const TipoIcon = tipoIcons[selectedTipo]

  useEffect(() => {
    if (open) {
      reset({
        tipo: TipoMovimientoPresupuesto.Gasto,
        monto: 0,
        descripcion: "",
        categoria: "",
        fechaMovimiento: new Date().toISOString().split("T")[0],
        horaMovimiento: new Date().toTimeString().slice(0, 5),
      })
    }
  }, [open, reset])

  const onSubmit = async (data: MovimientoFormData) => {
    setIsSubmitting(true)
    try {
      // Combinar fecha y hora en formato ISO
      let fechaMovimientoISO = data.fechaMovimiento
      if (data.fechaMovimiento && data.horaMovimiento) {
        fechaMovimientoISO = `${data.fechaMovimiento}T${data.horaMovimiento}:00.000Z`
      }

      const movimientoData = {
        tipo: data.tipo,
        monto: data.monto,
        descripcion: data.descripcion,
        categoria: data.categoria,
        fechaMovimiento: fechaMovimientoISO,
        [tipo === "departamento" ? "presupuestoDepartamentoId" : "presupuestoProyectoId"]:
          presupuestoId,
      }

      if (tipo === "departamento") {
        await createMovimientoDepartamento(movimientoData as any)
      } else {
        await createMovimientoProyecto(movimientoData as any)
      }

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error al registrar movimiento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TipoIcon className={`h-6 w-6 ${tipoColors[selectedTipo]}`} />
            Registrar Movimiento
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo movimiento en el presupuesto
            {selectedTipo === TipoMovimientoPresupuesto.Gasto && (
              <span className="block mt-1 text-sm">
                Disponible: <span className="font-semibold">{formatCurrency(montoDisponible)}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Tipo de Movimiento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Movimiento <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTipo}
              onValueChange={(value) => setValue("tipo", value as TipoMovimientoPresupuesto)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoMovimientoPresupuesto.Asignacion}>
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    Asignación
                  </div>
                </SelectItem>
                <SelectItem value={TipoMovimientoPresupuesto.Gasto}>
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    Gasto
                  </div>
                </SelectItem>
                <SelectItem value={TipoMovimientoPresupuesto.Ajuste}>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    Ajuste
                  </div>
                </SelectItem>
                <SelectItem value={TipoMovimientoPresupuesto.Transferencia}>
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                    Transferencia
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">
              Monto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              placeholder="1000.00"
              {...register("monto", { valueAsNumber: true })}
            />
            {errors.monto && <p className="text-sm text-destructive">{errors.monto.message}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el motivo del movimiento..."
              rows={3}
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              placeholder="Ej: Salarios, Equipamiento, Marketing"
              {...register("categoria")}
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaMovimiento">Fecha del Movimiento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fechaMovimiento"
                  type="date"
                  className="pl-10"
                  {...register("fechaMovimiento")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaMovimiento">Hora del Movimiento</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="horaMovimiento"
                  type="time"
                  className="pl-10"
                  {...register("horaMovimiento")}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
