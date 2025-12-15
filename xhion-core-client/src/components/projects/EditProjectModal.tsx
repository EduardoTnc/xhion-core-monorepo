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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useUpdateProject, useDepartments } from "@/hooks/queries";
import { toast } from "sonner";
import { Loader2, Building2, Calendar } from "lucide-react";
import { type Proyecto } from "@/services/projectService";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyecto: Proyecto | null;
}

interface ProjectFormData {
  nombre: string;
  descripcion: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado: string;
  departamentoId?: string;
}

export function EditProjectModal({ open, onOpenChange, proyecto }: EditProjectModalProps) {
  // TanStack Query mutations
  const updateProjectMutation = useUpdateProject();

  // TanStack Query for departments
  const { data: departamentos = [] } = useDepartments({ enabled: open });

  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>();

  useEffect(() => {
    if (proyecto) {
      setValue("nombre", proyecto.nombre);
      setValue("descripcion", proyecto.descripcion || "");

      // Convertir fechas ISO string a Date para el DateRangePicker
      const from = proyecto.fechaInicio ? new Date(proyecto.fechaInicio) : undefined;
      const to = proyecto.fechaFin ? new Date(proyecto.fechaFin) : undefined;

      if (from || to) {
        setDateRange({ from, to });
      }

      setValue("fechaInicio", from);
      setValue("fechaFin", to);
      setValue("estado", proyecto.estado);
      setSelectedDepartamento(proyecto.departamentoId || "none");
    }
  }, [proyecto, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!proyecto) return;

    try {
      const projectData = {
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        fechaInicio: dateRange?.from?.toISOString() || undefined,
        fechaFin: dateRange?.to?.toISOString() || undefined,
        estado: data.estado as any,
        departamentoId: selectedDepartamento === "none" ? undefined : selectedDepartamento,
      };

      await updateProjectMutation.mutateAsync({ id: proyecto.id, data: projectData });
      onOpenChange(false);
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  const selectedEstado = watch("estado");

  if (!proyecto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
          <DialogDescription>
            Actualiza la información del proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Sistema de Gestión de Tareas"
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
              placeholder="Describe el objetivo y alcance del proyecto..."
              rows={3}
              {...register("descripcion")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechas">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fechas del Proyecto
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
              Define el período de duración del proyecto
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={selectedEstado} onValueChange={(value) => setValue("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="En_Pausa">En Pausa</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="Archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departamentoId">
                <Building2 className="inline h-4 w-4 mr-1" />
                Departamento
              </Label>
              <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departamentos?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.nombre}
                    </SelectItem>
                  )) || null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProjectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
