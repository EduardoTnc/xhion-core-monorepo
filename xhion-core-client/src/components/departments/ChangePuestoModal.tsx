import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import apiClient from "@/api/axios";

const changePuestoSchema = z.object({
  puestoTrabajoId: z.string().min(1, "Selecciona un puesto"),
});

type ChangePuestoFormData = z.infer<typeof changePuestoSchema>;

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string;
  puestoTrabajo?: {
    id: string;
    titulo: string;
  };
}

interface PuestoTrabajo {
  id: string;
  titulo: string;
  descripcion?: string;
}

interface ChangePuestoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: Usuario | null;
  puestosTrabajo: PuestoTrabajo[];
  onSuccess?: () => void;
}

export function ChangePuestoModal({
  open,
  onOpenChange,
  empleado,
  puestosTrabajo,
  onSuccess,
}: ChangePuestoModalProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ChangePuestoFormData>({
    resolver: zodResolver(changePuestoSchema),
    defaultValues: {
      puestoTrabajoId: empleado?.puestoTrabajo?.id || "",
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const onSubmit = async (data: ChangePuestoFormData) => {
    if (!empleado) return;

    try {
      await apiClient.post(`/usuarios/${empleado.id}/asignar-puesto`, {
        puestoTrabajoId: data.puestoTrabajoId,
      });

      toast.success("Puesto actualizado exitosamente");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error changing puesto:", error);
      toast.error("Error al cambiar puesto");
    }
  };

  if (!empleado) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Cambiar Puesto de Trabajo
          </DialogTitle>
          <DialogDescription>
            Actualiza el puesto de trabajo del empleado en este departamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Información del Empleado */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label>Empleado</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={empleado.avatarUrl} alt={empleado.nombreCompleto} />
                <AvatarFallback>{getInitials(empleado.nombreCompleto)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{empleado.nombreCompleto}</p>
                <p className="text-sm text-muted-foreground">{empleado.email}</p>
              </div>
            </div>
          </div>

          {/* Puesto Actual */}
          {empleado.puestoTrabajo && (
            <div className="space-y-2">
              <Label>Puesto Actual</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">{empleado.puestoTrabajo.titulo}</p>
              </div>
            </div>
          )}

          {/* Nuevo Puesto */}
          <div className="space-y-2">
            <Label htmlFor="puestoTrabajoId">
              Nuevo Puesto <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("puestoTrabajoId", value)}
              defaultValue={empleado.puestoTrabajo?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un puesto" />
              </SelectTrigger>
              <SelectContent>
                {puestosTrabajo.map((puesto) => (
                  <SelectItem key={puesto.id} value={puesto.id}>
                    <div>
                      <p className="font-medium">{puesto.titulo}</p>
                      {puesto.descripcion && (
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {puesto.descripcion}
                        </p>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.puestoTrabajoId && (
              <p className="text-sm text-destructive">{errors.puestoTrabajoId.message}</p>
            )}
          </div>

          {/* Buttons */}
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
              {isSubmitting ? "Actualizando..." : "Actualizar Puesto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
