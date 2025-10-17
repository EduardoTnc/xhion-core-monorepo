import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, User } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida")
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB")
      return
    }

    try {
      setIsUploading(true)

      // Crear preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)

      // TODO: Aquí iría la lógica de subida real a un servicio como S3, Cloudinary, etc.
      // Por ahora usamos data URL para el preview
      
      toast.success("Imagen cargada correctamente")
    } catch (error) {
      toast.error("Error al cargar la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <Label>Foto de Perfil</Label>
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview} />
          <AvatarFallback>
            <User className="h-12 w-12 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* Botones */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {preview ? "Cambiar Foto" : "Subir Foto"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Eliminar
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
      </p>
    </div>
  )
}
