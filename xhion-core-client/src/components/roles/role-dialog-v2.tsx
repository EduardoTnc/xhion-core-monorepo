import { useEffect, useState, useRef } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Check, Palette } from "lucide-react"
import { useRoleStore } from "../../store/roleStore"
import type { RolCompleto } from "../../types"

// Schema de validación
const roleSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50),
  descripcion: z.string().optional(),
  color: z.string().min(1, "Debes seleccionar un color"),
})

type RoleFormData = z.infer<typeof roleSchema>

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: RolCompleto | null
  onSubmit: (data: RoleFormData) => Promise<void>
}

// Paleta de colores predefinidos (6 colores como en la imagen de referencia)
const PRESET_COLORS = [
  { name: "Rojo", value: "bg-destructive", hex: "#ef4444" },
  { name: "Azul", value: "bg-primary", hex: "#3b82f6" },
  { name: "Morado", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Cian", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Índigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Gris", value: "bg-slate-600", hex: "#475569" },
]

export function RoleDialog({ open, onOpenChange, role, onSubmit }: RoleDialogProps) {
  const { rolesCompletos } = useRoleStore()
  const [customColor, setCustomColor] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      color: "bg-primary",
    },
  })

  const selectedColor = watch("color")
  const nombreValue = watch("nombre")

  // Resetear formulario cuando cambie el rol o se abra/cierre el diálogo
  useEffect(() => {
    if (open) {
      if (role) {
        reset({
          nombre: role.nombre,
          descripcion: role.descripcion || "",
          color: role.color || "bg-primary",
        })
        setCustomColor("")
      } else {
        reset({
          nombre: "",
          descripcion: "",
          color: "bg-primary",
        })
        setCustomColor("")
      }
      setNameError(null)
    }
  }, [open, role, reset])

  // Validación en tiempo real del nombre (duplicado)
  useEffect(() => {
    if (!nombreValue || nombreValue.length < 3) {
      setNameError(null)
      return
    }

    // Verificar si el nombre ya existe (excepto si estamos editando el mismo rol)
    const isDuplicate = rolesCompletos.some(
      r => r.nombre.toLowerCase() === nombreValue.toLowerCase() && r.id !== role?.id
    )

    if (isDuplicate) {
      setNameError(`Ya existe un rol con el nombre "${nombreValue}"`)
    } else {
      setNameError(null)
    }
  }, [nombreValue, rolesCompletos, role])

  const handleFormSubmit = async (data: RoleFormData) => {
    // Validar que no haya nombre duplicado antes de enviar
    if (nameError) {
      return
    }

    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // El error ya se maneja en el store
    }
  }

  // Manejar selección de color predefinido
  const handleColorSelect = (colorValue: string) => {
    setValue("color", colorValue, { shouldValidate: true })
    setCustomColor("")
  }

  // Manejar color personalizado del picker
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value
    setCustomColor(hexColor)
    setValue("color", hexColor, { shouldValidate: true })
  }

  // Abrir el color picker nativo
  const openColorPicker = () => {
    colorPickerRef.current?.click()
  }

  // Determinar si un color es personalizado (hex)
  const isCustomColor = selectedColor.startsWith("#")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{role ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Modifica los detalles del rol. Los cambios se aplicarán inmediatamente."
              : "Crea un nuevo rol personalizado para tu organización."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Rol *</Label>
            <Input
              id="nombre"
              placeholder="ej. Project Manager"
              {...register("nombre")}
              disabled={isSubmitting}
              onBlur={() => trigger("nombre")}
              className={nameError ? "border-destructive" : ""}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
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
          </div>

          {/* Color - RadioGroup Visual */}
          <div className="space-y-3">
            <Label>Color del Rol *</Label>
            <RadioGroup
              value={selectedColor}
              onValueChange={handleColorSelect}
              className="grid grid-cols-6 gap-3"
            >
              {PRESET_COLORS.map((color) => (
                <div key={color.value} className="relative">
                  <RadioGroupItem
                    value={color.value}
                    id={color.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={color.value}
                    className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-2 transition-all ${color.value} ${
                      selectedColor === color.value
                        ? "ring-2 ring-primary ring-offset-2 scale-105"
                        : "border-transparent hover:scale-105"
                    }`}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <Check className="h-5 w-5 text-white drop-shadow-lg" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Input de color personalizado */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="o ingresa un color personalizado (#FF5733)"
                  value={isCustomColor ? selectedColor : customColor}
                  onChange={(e) => {
                    const value = e.target.value
                    setCustomColor(value)
                    if (value.startsWith("#") && value.length === 7) {
                      setValue("color", value, { shouldValidate: true })
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Color Picker Button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={openColorPicker}
                disabled={isSubmitting}
                className="shrink-0"
              >
                <Palette className="h-4 w-4" />
              </Button>
              
              {/* Hidden native color picker */}
              <input
                ref={colorPickerRef}
                type="color"
                className="sr-only"
                value={isCustomColor ? selectedColor : "#3b82f6"}
                onChange={handleCustomColorChange}
              />
            </div>

            {/* Preview del color seleccionado */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={`h-6 w-6 rounded border ${isCustomColor ? '' : selectedColor}`}
                style={isCustomColor ? { backgroundColor: selectedColor } : undefined}
              />
              <span>Vista previa: {selectedColor}</span>
            </div>

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
            <Button type="submit" disabled={isSubmitting || !!nameError}>
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
