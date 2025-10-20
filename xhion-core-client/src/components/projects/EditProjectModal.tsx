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
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { type Proyecto } from "@/services/projectService";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyecto: Proyecto | null;
}

interface ProjectFormData {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export function EditProjectModal({ open, onOpenChange, proyecto }: EditProjectModalProps) {
  const { updateProyecto, isLoading } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setValue("fechaInicio", proyecto.fechaInicio?.split("T")[0] || "");
      setValue("fechaFin", proyecto.fechaFin?.split("T")[0] || "");
      setValue("estado", proyecto.estado);
    }
  }, [proyecto, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!proyecto) return;

    try {
      setIsSubmitting(true);

      const projectData = {
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        fechaInicio: data.fechaInicio || undefined,
        fechaFin: data.fechaFin || undefined,
        estado: data.estado as any,
      };

      await updateProyecto(proyecto.id, projectData);
      toast.success("Proyecto actualizado exitosamente");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar proyecto");
    } finally {
      setIsSubmitting(false);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input id="fechaInicio" type="date" {...register("fechaInicio")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Input id="fechaFin" type="date" {...register("fechaFin")} />
            </div>
          </div>

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
              Actualizar Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
