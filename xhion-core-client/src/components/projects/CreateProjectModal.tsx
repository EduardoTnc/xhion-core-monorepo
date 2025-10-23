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
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore } from "@/store/departmentStore";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectFormData {
  nombre: string;
  descripcion: string;
  responsableId: string;
  departamentoId?: string;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { createProyecto, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  const { departamentos, fetchDepartamentos } = useDepartmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchDepartamentos();
    }
  }, [open, fetchDepartamentos]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      responsableId: user?.id || "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      await createProyecto({
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        responsableId: data.responsableId,
        departamentoId: selectedDepartamento || undefined,
      });

      toast.success("Proyecto creado exitosamente");
      reset();
      setSelectedDepartamento("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al crear proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Completa la información del proyecto. El responsable será agregado automáticamente como
            miembro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Rediseño de la plataforma web"
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
            <Label htmlFor="responsableId">
              Responsable <span className="text-destructive">*</span>
            </Label>
            <Input
              id="responsableId"
              value={user?.nombreCompleto || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Por defecto, tú serás el responsable del proyecto
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departamentoId">
              <Building2 className="inline h-4 w-4 mr-1" />
              Departamento (Opcional)
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
            <p className="text-xs text-muted-foreground">
              Asigna el proyecto a un departamento específico
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
              Crear Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
