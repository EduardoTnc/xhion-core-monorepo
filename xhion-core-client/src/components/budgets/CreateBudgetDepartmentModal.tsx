import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { type DateRange } from "react-day-picker"
import { Coins, Calendar } from "lucide-react"
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
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useFinanzasStore } from "@/store/finanzasStore"
import { toast } from "sonner"

// Constantes y tipos locales
const EstadoPresupuesto = {
  Activo: 'Activo',
  Agotado: 'Agotado',
  Cerrado: 'Cerrado',
  Suspendido: 'Suspendido',
} as const

type EstadoPresupuestoType = typeof EstadoPresupuesto[keyof typeof EstadoPresupuesto]

type PresupuestoDepartamento = {
  id: string
  montoTotal: number
  periodo: string
  fechaInicio: string
  fechaFin: string
  estado: EstadoPresupuestoType
  descripcion?: string
}

const presupuestoSchema = z.object({
  montoTotal: z.number().min(0, "El monto debe ser mayor a 0"),
  periodo: z.string().min(1, "El periodo es requerido"),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
  estado: z.string().optional(),
  descripcion: z.string().optional(),
})

type PresupuestoFormData = z.infer<typeof presupuestoSchema>

interface CreateBudgetDepartmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departamentoId: string
  departamentoNombre: string
  presupuestoExistente?: PresupuestoDepartamento
}

export function CreateBudgetDepartmentModal({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  presupuestoExistente,
}: CreateBudgetDepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { crearPresupuestoDepartamento, actualizarPresupuestoDepartamento } = useFinanzasStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: {
      montoTotal: 0,
      periodo: "",
      fechaInicio: undefined,
      fechaFin: undefined,
      estado: EstadoPresupuesto.Activo,
      descripcion: "",
    },
  })

  const selectedEstado = watch("estado")

  useEffect(() => {
    if (presupuestoExistente) {
      const from = new Date(presupuestoExistente.fechaInicio)
      const to = new Date(presupuestoExistente.fechaFin)
      setDateRange({ from, to })
      reset({
        montoTotal: Number(presupuestoExistente.montoTotal),
        periodo: presupuestoExistente.periodo,
        fechaInicio: from,
        fechaFin: to,
        estado: presupuestoExistente.estado,
        descripcion: presupuestoExistente.descripcion || "",
      })
    } else {
      setDateRange(undefined)
      reset({
        montoTotal: 0,
        periodo: "",
        fechaInicio: undefined,
        fechaFin: undefined,
        estado: EstadoPresupuesto.Activo,
        descripcion: "",
      })
    }
  }, [presupuestoExistente, reset, open])

  const onSubmit = async (data: PresupuestoFormData) => {
    setIsSubmitting(true)
    try {
      // Validar que las fechas estén presentes
      if (!dateRange?.from || !dateRange?.to) {
        toast.error("Las fechas de inicio y fin son requeridas")
        setIsSubmitting(false)
        return
      }

      // Convertir fechas Date a ISO string para la API
      const presupuestoData = {
        ...data,
        fechaInicio: dateRange.from.toISOString(),
        fechaFin: dateRange.to.toISOString(),
      } as any

      if (presupuestoExistente) {
        await actualizarPresupuestoDepartamento(departamentoId, presupuestoData)
      } else {
        await crearPresupuestoDepartamento(departamentoId, presupuestoData)
      }
      onOpenChange(false)
      reset()
      setDateRange(undefined)
    } catch (error: any) {
      console.error("Error al guardar presupuesto:", error)
      toast.error(error.response?.data?.message || error.message || "Error al guardar presupuesto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-primary" />
            {presupuestoExistente ? "Editar" : "Crear"} Presupuesto
          </DialogTitle>
          <DialogDescription>
            {presupuestoExistente ? "Actualiza" : "Define"} el presupuesto para el departamento{" "}
            <span className="font-semibold">{departamentoNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Monto Total */}
          <div className="space-y-2">
            <Label htmlFor="montoTotal">
              Monto Total <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="montoTotal"
                type="number"
                step="0.01"
                placeholder="50000.00"
                className="pl-10"
                {...register("montoTotal", { valueAsNumber: true })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Monto en Soles Peruanos (S/.)
            </p>
            {errors.montoTotal && (
              <p className="text-sm text-destructive">{errors.montoTotal.message}</p>
            )}
          </div>

          {/* Periodo */}
          <div className="space-y-2">
            <Label htmlFor="periodo">
              Periodo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="periodo"
              placeholder="Ej: 2025-Q1, 2025, Enero 2025"
              {...register("periodo")}
            />
            {errors.periodo && (
              <p className="text-sm text-destructive">{errors.periodo.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Define el periodo del presupuesto (trimestre, año, mes, etc.)
            </p>
          </div>

          {/* Fechas */}
          <div className="space-y-2">
            <Label htmlFor="fechas">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fechas del Presupuesto <span className="text-destructive">*</span>
            </Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range)
                setValue("fechaInicio", range?.from)
                setValue("fechaFin", range?.to)
              }}
              placeholder="Selecciona inicio y fin"
              minDate={new Date()}
              numberOfMonths={2}
            />
            <p className="text-xs text-muted-foreground">
              Define el período de vigencia del presupuesto
            </p>
            {(errors.fechaInicio || errors.fechaFin) && (
              <p className="text-sm text-destructive">
                {errors.fechaInicio?.message || errors.fechaFin?.message}
              </p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={selectedEstado}
              onValueChange={(value) => setValue("estado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EstadoPresupuesto.Activo}>Activo</SelectItem>
                <SelectItem value={EstadoPresupuesto.Agotado}>Agotado</SelectItem>
                <SelectItem value={EstadoPresupuesto.Cerrado}>Cerrado</SelectItem>
                <SelectItem value={EstadoPresupuesto.Suspendido}>Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción opcional del presupuesto..."
              rows={3}
              {...register("descripcion")}
            />
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
              {isSubmitting
                ? "Guardando..."
                : presupuestoExistente
                ? "Actualizar Presupuesto"
                : "Crear Presupuesto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
