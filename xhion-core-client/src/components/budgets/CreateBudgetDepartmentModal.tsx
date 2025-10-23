"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, DollarSign, Calendar } from "lucide-react"
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
import { EstadoPresupuesto, type PresupuestoDepartamento } from "@/services/presupuestoService"

const presupuestoSchema = z.object({
  montoTotal: z.number().min(0, "El monto debe ser mayor a 0"),
  periodo: z.string().min(1, "El periodo es requerido"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().min(1, "La fecha de fin es requerida"),
  estado: z.nativeEnum(EstadoPresupuesto).optional(),
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
  const { createPresupuestoDepartamento, updatePresupuestoDepartamento } = usePresupuestoStore()

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
      fechaInicio: "",
      fechaFin: "",
      estado: EstadoPresupuesto.Activo,
      descripcion: "",
    },
  })

  const selectedEstado = watch("estado")

  useEffect(() => {
    if (presupuestoExistente) {
      reset({
        montoTotal: Number(presupuestoExistente.montoTotal),
        periodo: presupuestoExistente.periodo,
        fechaInicio: presupuestoExistente.fechaInicio.split("T")[0],
        fechaFin: presupuestoExistente.fechaFin.split("T")[0],
        estado: presupuestoExistente.estado,
        descripcion: presupuestoExistente.descripcion || "",
      })
    } else {
      reset({
        montoTotal: 0,
        periodo: "",
        fechaInicio: "",
        fechaFin: "",
        estado: EstadoPresupuesto.Activo,
        descripcion: "",
      })
    }
  }, [presupuestoExistente, reset, open])

  const onSubmit = async (data: PresupuestoFormData) => {
    setIsSubmitting(true)
    try {
      if (presupuestoExistente) {
        await updatePresupuestoDepartamento(departamentoId, data)
      } else {
        await createPresupuestoDepartamento({
          ...data,
          departamentoId,
        })
      }
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error al guardar presupuesto:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-primary" />
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
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="montoTotal"
                type="number"
                step="0.01"
                placeholder="50000.00"
                className="pl-10"
                {...register("montoTotal", { valueAsNumber: true })}
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">
                Fecha de Inicio <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fechaInicio"
                  type="date"
                  className="pl-10"
                  {...register("fechaInicio")}
                />
              </div>
              {errors.fechaInicio && (
                <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">
                Fecha de Fin <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fechaFin" type="date" className="pl-10" {...register("fechaFin")} />
              </div>
              {errors.fechaFin && (
                <p className="text-sm text-destructive">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={selectedEstado}
              onValueChange={(value) => setValue("estado", value as EstadoPresupuesto)}
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
