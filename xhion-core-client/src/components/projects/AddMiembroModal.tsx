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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from "@/store/projectStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddMiembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
}

interface MiembroFormData {
  usuarioId: string;
  rol: string;
}

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
}

export function AddMiembroModal({ open, onOpenChange, proyectoId }: AddMiembroModalProps) {
  const { addMiembro, miembros, isLoading } = useProjectStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MiembroFormData>({
    defaultValues: {
      rol: "Miembro",
    },
  });

  useEffect(() => {
    if (open) {
      loadUsuarios();
    }
  }, [open]);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const allUsuarios = await userService.obtenerTodosLosUsuarios();
      // Filtrar usuarios que ya son miembros
      const miembrosIds = miembros.map((m) => m.usuarioId);
      const usuariosDisponibles = allUsuarios.filter((u) => !miembrosIds.includes(u.id));
      setUsuarios(usuariosDisponibles);
    } catch (error: any) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const onSubmit = async (data: MiembroFormData) => {
    if (!data.usuarioId) {
      toast.error("Selecciona un usuario");
      return;
    }

    try {
      setIsSubmitting(true);
      await addMiembro(proyectoId, {
        usuarioId: data.usuarioId,
        rol: data.rol as any,
      });
      toast.success("Miembro agregado exitosamente");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al agregar miembro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUsuarioId = watch("usuarioId");
  const selectedRol = watch("rol");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Agregar Miembro al Proyecto</DialogTitle>
          <DialogDescription>
            Selecciona un usuario y asígnale un rol en el proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usuarioId">
              Usuario <span className="text-destructive">*</span>
            </Label>
            {loadingUsuarios ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No hay usuarios disponibles para agregar
              </p>
            ) : (
              <Select
                value={selectedUsuarioId}
                onValueChange={(value) => setValue("usuarioId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      <div className="flex flex-col">
                        <span>{usuario.nombreCompleto}</span>
                        <span className="text-xs text-muted-foreground">{usuario.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">
              Rol <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedRol} onValueChange={(value) => setValue("rol", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Responsable">Responsable</SelectItem>
                <SelectItem value="Miembro">Miembro</SelectItem>
                <SelectItem value="Observador">Observador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <strong>Responsable:</strong> Control total del proyecto<br />
              <strong>Miembro:</strong> Puede editar tareas y contenido<br />
              <strong>Observador:</strong> Solo puede ver el proyecto
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
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || usuarios.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar Miembro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
