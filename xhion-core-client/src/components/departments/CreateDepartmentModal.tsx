import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2 } from "lucide-react";
import { useDepartmentStore } from "@/store/departmentStore";
import type { Departamento } from "@/services/departmentService";
import { DEPARTMENT_ICONS } from "@/lib/department-icons";

const departmentSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  descripcion: z.string().optional(),
  objetivos: z.string().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
  jefeId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface CreateDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamento?: Departamento | null;
}

const PRESET_COLORS = [
  { name: "Azul", value: "bg-blue-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Morado", value: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Naranja", value: "bg-orange-500" },
  { name: "Amarillo", value: "bg-yellow-500" },
  { name: "Rojo", value: "bg-red-500" },
  { name: "Cyan", value: "bg-cyan-500" },
];

export function CreateDepartmentModal({
  open,
  onOpenChange,
  departamento,
}: CreateDepartmentModalProps) {
  const { createDepartamento, updateDepartamento, isLoading } = useDepartmentStore();
  const [selectedColor, setSelectedColor] = useState(departamento?.color || "bg-blue-500");
  const [selectedIcon, setSelectedIcon] = useState(departamento?.icono || "Building2");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      nombre: departamento?.nombre || "",
      descripcion: departamento?.descripcion || "",
      objetivos: departamento?.objetivos || "",
      icono: departamento?.icono || "Building2",
      color: departamento?.color || "bg-blue-500",
      jefeId: departamento?.jefeId || "",
    },
  });

  useEffect(() => {
    if (departamento) {
      reset({
        nombre: departamento.nombre,
        descripcion: departamento.descripcion || "",
        objetivos: departamento.objetivos || "",
        icono: departamento.icono || "Building2",
        color: departamento.color || "bg-blue-500",
        jefeId: departamento.jefeId || "",
      });
      setSelectedColor(departamento.color || "bg-blue-500");
      setSelectedIcon(departamento.icono || "Building2");
    } else {
      reset({
        nombre: "",
        descripcion: "",
        objetivos: "",
        icono: "Building2",
        color: "bg-blue-500",
        jefeId: "",
      });
      setSelectedColor("bg-blue-500");
      setSelectedIcon("Building2");
    }
  }, [departamento, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      // Limpiar campos vacíos para evitar errores de validación
      const payload: any = {
        nombre: data.nombre,
        icono: selectedIcon,
        color: selectedColor,
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.descripcion && data.descripcion.trim()) {
        payload.descripcion = data.descripcion.trim();
      }

      if (data.objetivos && data.objetivos.trim()) {
        payload.objetivos = data.objetivos.trim();
      }
      
      if (data.jefeId && data.jefeId.trim()) {
        payload.jefeId = data.jefeId.trim();
      }

      if (departamento) {
        await updateDepartamento(departamento.id, payload);
      } else {
        await createDepartamento(payload);
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      // Error manejado por el store
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {departamento ? "Editar Departamento" : "Nuevo Departamento"}
          </DialogTitle>
          <DialogDescription>
            {departamento
              ? "Actualiza la información del departamento"
              : "Crea un nuevo departamento para tu organización"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Desarrollo de Software"
              {...register("nombre")}
              disabled={isLoading}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe las funciones y responsabilidades del departamento..."
              rows={2}
              {...register("descripcion")}
              disabled={isLoading}
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Objetivos */}
          <div className="space-y-2">
            <Label htmlFor="objetivos">Objetivos</Label>
            <Textarea
              id="objetivos"
              placeholder="Define los objetivos del departamento..."
              rows={2}
              {...register("objetivos")}
              disabled={isLoading}
            />
            {errors.objetivos && (
              <p className="text-sm text-destructive">{errors.objetivos.message}</p>
            )}
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label>Icono del Departamento</Label>
            <div className="grid grid-cols-7 gap-2 max-h-[120px] overflow-y-auto p-2 border rounded-md">
              {DEPARTMENT_ICONS.map((iconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(iconOption.name);
                      setValue("icono", iconOption.name);
                    }}
                    className={`h-12 w-12 rounded-md border-2 flex items-center justify-center transition-all hover:bg-muted ${
                      selectedIcon === iconOption.name
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    title={iconOption.label}
                    disabled={isLoading}
                  >
                    <IconComponent className={`h-5 w-5 ${iconOption.color}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color del Departamento</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color.value);
                    setValue("color", color.value);
                  }}
                  className={`h-10 w-10 rounded-lg transition-all ${color.value} ${
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:scale-110"
                  }`}
                  title={color.name}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border-2 border-border bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Vista previa:</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md border bg-background flex items-center justify-center">
                {(() => {
                  const selectedIconData = DEPARTMENT_ICONS.find(i => i.name === selectedIcon);
                  if (selectedIconData) {
                    const IconComponent = selectedIconData.icon;
                    return <IconComponent className={`h-6 w-6 ${selectedIconData.color}`} />;
                  }
                  return null;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {register("nombre").name || "Nombre del Departamento"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {register("descripcion").name || "Descripción del departamento"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {departamento ? "Actualizar" : "Crear"} Departamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
