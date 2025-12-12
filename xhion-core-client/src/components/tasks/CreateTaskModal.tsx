import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useProjectStages, useProjectMembers } from "@/hooks/queries";
import { useCreateTask, useUpdateTask } from "@/hooks/mutations/useTaskMutations";
import { Loader2 } from "lucide-react";
import { type Tarea } from "@/services/taskService";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  tareaToEdit?: Tarea | null;
  stagesEnabled?: boolean;
}

interface TaskFormData {
  titulo: string;
  descripcion: string;
  proyectoId: string;
  etapaId: string;
  asignadoId: string;
  prioridad: string;
  fechaVencimiento?: Date;
}

export function CreateTaskModal({ open, onOpenChange, proyectoId, tareaToEdit, stagesEnabled = true }: CreateTaskModalProps) {
  // TanStack Query hooks
  const { data: etapas = [] } = useProjectStages(proyectoId, { enabled: open && !!proyectoId });
  const { data: miembros = [] } = useProjectMembers(proyectoId, { enabled: open && !!proyectoId });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      proyectoId,
      prioridad: "Media",
    },
  });

  useEffect(() => {
    if (tareaToEdit) {
      setValue("titulo", tareaToEdit.titulo);
      setValue("descripcion", tareaToEdit.descripcion || "");
      setValue("etapaId", tareaToEdit.etapaId || "");
      setValue("asignadoId", tareaToEdit.asignadoId || "");
      setValue("prioridad", tareaToEdit.prioridad);
      const fecha = tareaToEdit.fechaVencimiento ? new Date(tareaToEdit.fechaVencimiento) : undefined;
      setFechaVencimiento(fecha);
      setValue("fechaVencimiento", fecha);
    } else {
      reset({ proyectoId, prioridad: "Media" });
      setFechaVencimiento(undefined);
    }
  }, [tareaToEdit, reset, setValue, proyectoId]);

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending;

  const onSubmit = async (data: TaskFormData) => {
    const taskData = {
      titulo: data.titulo,
      descripcion: data.descripcion || undefined,
      proyectoId: data.proyectoId,
      etapaId: data.etapaId || undefined,
      asignadoId: data.asignadoId || undefined,
      prioridad: data.prioridad as any,
      fechaVencimiento: fechaVencimiento?.toISOString() || undefined,
    };

    const onSuccess = () => {
      reset();
      onOpenChange(false);
    };

    if (tareaToEdit) {
      updateTaskMutation.mutate({ id: tareaToEdit.id, data: taskData }, { onSuccess });
    } else {
      createTaskMutation.mutate(taskData, { onSuccess });
    }
  };

  const selectedEtapaId = watch("etapaId");
  const selectedAsignadoId = watch("asignadoId");
  const selectedPrioridad = watch("prioridad");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tareaToEdit ? "Editar Tarea" : "Crear Nueva Tarea"}</DialogTitle>
          <DialogDescription>
            {tareaToEdit
              ? "Actualiza la información de la tarea"
              : "Completa la información para crear una nueva tarea"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Implementar sistema de autenticación"
              {...register("titulo", {
                required: "El título es requerido",
                minLength: {
                  value: 3,
                  message: "El título debe tener al menos 3 caracteres",
                },
              })}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe los detalles de la tarea..."
              rows={3}
              {...register("descripcion")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etapaId">Etapa (Opcional)</Label>
              {stagesEnabled ? (
                <Select
                  value={selectedEtapaId || undefined}
                  onValueChange={(value) => setValue("etapaId", value)}
                  disabled={etapas.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={etapas.length > 0 ? "Sin etapa asignada" : "No hay etapas"} />
                  </SelectTrigger>
                  <SelectContent>
                    {etapas.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay etapas disponibles
                      </div>
                    ) : (
                      etapas.map((etapa) => (
                        <SelectItem key={etapa.id} value={etapa.id}>
                          {etapa.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">
                  La gestión de etapas está desactivada para este proyecto.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asignadoId">Asignar a (Opcional)</Label>
              <Select
                value={selectedAsignadoId || undefined}
                onValueChange={(value) => setValue("asignadoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {miembros.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No hay miembros disponibles
                    </div>
                  ) : (
                    miembros.map((miembro) => (
                      <SelectItem key={miembro.usuarioId} value={miembro.usuarioId}>
                        {miembro.usuario.nombreCompleto}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridad">
                Prioridad <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedPrioridad}
                onValueChange={(value) => setValue("prioridad", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <DatePicker
                date={fechaVencimiento}
                onDateChange={(date) => {
                  setFechaVencimiento(date);
                  setValue("fechaVencimiento", date);
                }}
                placeholder="Selecciona fecha"
                minDate={new Date()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tareaToEdit ? "Actualizar" : "Crear"} Tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
