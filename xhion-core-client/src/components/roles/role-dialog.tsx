import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { RolConConteo } from "../../types"

// Schema de validación
const roleSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50),
  descripcion: z.string().optional(),
  color: z.string().regex(/^(bg-|#)/, "Debe ser una clase Tailwind (bg-*) o código hex (#)").optional(),
})

type RoleFormData = z.infer<typeof roleSchema>

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: RolConConteo | null
  onSubmit: (data: RoleFormData) => Promise<void>
}

// Colores predefinidos para selección rápida
const PRESET_COLORS = [
  { name: "Rojo", value: "bg-destructive" },
  { name: "Azul", value: "bg-primary" },
  { name: "Verde", value: "bg-chart-2" },
  { name: "Morado", value: "bg-chart-3" },
  { name: "Naranja", value: "bg-chart-4" },
  { name: "Gris", value: "bg-muted" },
]

export function RoleDialog({ open, onOpenChange, role, onSubmit }: RoleDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      color: "bg-primary",
    },
  })

  const selectedColor = watch("color")

  // Resetear formulario cuando cambie el rol o se abra/cierre el diálogo
  useEffect(() => {
    if (open) {
      if (role) {
        reset({
          nombre: role.nombre,
          descripcion: role.descripcion || "",
          color: role.color || "bg-primary",
        })
      } else {
        reset({
          nombre: "",
          descripcion: "",
          color: "bg-primary",
        })
      }
    }
  }, [open, role, reset])

  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // El error ya se maneja en el store
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{role ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Modifica los detalles del rol. Los cambios se aplicarán inmediatamente."
              : "Crea un nuevo rol personalizado para tu organización."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Rol *</Label>
            <Input
              id="nombre"
              placeholder="ej. Project Manager"
              {...register("nombre")}
              disabled={isSubmitting}
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
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
              {...register("descripcion")}
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color del Rol</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value, { shouldValidate: true })}
                  className={`h-10 rounded-lg transition-all ${color.value} ${
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:scale-105"
                  }`}
                  title={color.name}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <Input
              placeholder="o ingresa una clase Tailwind (bg-*) o hex (#FF5733)"
              {...register("color")}
              disabled={isSubmitting}
              className="mt-2"
            />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {role ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{role ? "Actualizar Rol" : "Crear Rol"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
