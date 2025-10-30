import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { useIdeasStore } from "@/store/ideasStore"

interface CreateIdeaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateIdeaModal({ open, onOpenChange, onSuccess }: CreateIdeaModalProps) {
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState<"Feature" | "Improvement" | "Innovation">("Feature")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { crearIdea } = useIdeasStore()

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!titulo.trim() || !descripcion.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await crearIdea({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        tags,
      })
      
      // Reset form
      setTitulo("")
      setDescripcion("")
      setCategoria("Feature")
      setTags([])
      setNewTag("")
      
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error al crear idea:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Idea</DialogTitle>
          <DialogDescription>
            Comparte tu idea innovadora con el equipo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Ej: Sistema de notificaciones en tiempo real"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">{titulo.length}/200 caracteres</p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe tu idea en detalle..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select value={categoria} onValueChange={(value: any) => setCategoria(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Feature">Nueva funcionalidad</SelectItem>
                <SelectItem value="Improvement">Mejora</SelectItem>
                <SelectItem value="Innovation">Innovación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Agregar tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !titulo.trim() || !descripcion.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Idea"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
