import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { type DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { type Etapa } from "@/services/projectService";

interface CreateEtapaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  etapaToEdit?: Etapa | null;
}

interface EtapaFormData {
  nombre: string;
  descripcion: string;
  color: string;
  orden: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado: string;
}

export function CreateEtapaModal({
  open,
  onOpenChange,
  proyectoId,
  etapaToEdit,
}: CreateEtapaModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { createEtapa, updateEtapa, etapas, isLoading } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EtapaFormData>({
    defaultValues: {
      color: "#3B82F6",
      orden: etapas.length + 1,
      estado: "Pendiente",
    },
  });

  useEffect(() => {
    if (etapaToEdit) {
      setValue("nombre", etapaToEdit.nombre);
      setValue("descripcion", etapaToEdit.descripcion || "");
      setValue("color", etapaToEdit.color || "#3B82F6");
      setValue("orden", etapaToEdit.orden);
      
      // Convertir fechas ISO string a Date para el DateRangePicker
      const from = etapaToEdit.fechaInicio ? new Date(etapaToEdit.fechaInicio) : undefined;
      const to = etapaToEdit.fechaFin ? new Date(etapaToEdit.fechaFin) : undefined;
      
      if (from || to) {
        setDateRange({ from, to });
      }
      
      setValue("fechaInicio", from);
      setValue("fechaFin", to);
      setValue("estado", etapaToEdit.estado);
    } else {
      setDateRange(undefined);
      reset({
        color: "#3B82F6",
        orden: etapas.length + 1,
        estado: "Pendiente",
      });
    }
  }, [etapaToEdit, reset, setValue, etapas.length]);

  const onSubmit = async (data: EtapaFormData) => {
    try {
      setIsSubmitting(true);

      if (etapaToEdit) {
        // Al actualizar, incluir el estado
        const etapaData = {
          nombre: data.nombre,
          descripcion: data.descripcion || undefined,
          color: data.color || undefined,
          orden: Number(data.orden),
          fechaInicio: dateRange?.from?.toISOString() || undefined,
          fechaFin: dateRange?.to?.toISOString() || undefined,
          estado: data.estado as any,
        };
        await updateEtapa(proyectoId, etapaToEdit.id, etapaData);
        toast.success("Etapa actualizada exitosamente");
      } else {
        // Al crear, NO incluir el estado (se establece automáticamente como Pendiente)
        const etapaData = {
          nombre: data.nombre,
          descripcion: data.descripcion || undefined,
          color: data.color || undefined,
          orden: Number(data.orden),
          fechaInicio: dateRange?.from?.toISOString() || undefined,
          fechaFin: dateRange?.to?.toISOString() || undefined,
        };
        await createEtapa(proyectoId, etapaData);
        toast.success("Etapa creada exitosamente");
      }

      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar etapa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEstado = watch("estado");
  const selectedColor = watch("color");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{etapaToEdit ? "Editar Etapa" : "Crear Nueva Etapa"}</DialogTitle>
          <DialogDescription>
            {etapaToEdit
              ? "Actualiza la información de la etapa"
              : "Define una nueva etapa para el proyecto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre de la Etapa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Planificación, Desarrollo, Testing..."
              {...register("nombre", {
                required: "El nombre es requerido",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres",
                },
              })}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el objetivo de esta etapa..."
              rows={2}
              {...register("descripcion")}
            />
          </div>

          <ColorPicker
            label="Color de la Etapa (Opcional)"
            value={selectedColor}
            onChange={(color) => setValue("color", color)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orden">
                Orden <span className="text-destructive">*</span>
              </Label>
              <Input
                id="orden"
                type="number"
                min="1"
                {...register("orden", {
                  required: "El orden es requerido",
                  min: { value: 1, message: "El orden debe ser mayor a 0" },
                })}
              />
              {errors.orden && (
                <p className="text-sm text-destructive">{errors.orden.message}</p>
              )}
            </div>

            {etapaToEdit && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={selectedEstado} onValueChange={(value) => setValue("estado", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En_Progreso">En Progreso</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechas">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fechas de la Etapa (Opcional)
            </Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setValue("fechaInicio", range?.from);
                setValue("fechaFin", range?.to);
              }}
              placeholder="Selecciona inicio y fin"
              numberOfMonths={2}
            />
            <p className="text-xs text-muted-foreground">
              Define el período de duración de la etapa
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {etapaToEdit ? "Actualizar" : "Crear"} Etapa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
