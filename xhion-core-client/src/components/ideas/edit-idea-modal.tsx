"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { useIdeasStore } from "@/store/ideasStore"
import { toast } from "sonner"
import type { Idea } from "@/services/ideasService"

interface EditIdeaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea: Idea
  onSuccess?: () => void
}

export function EditIdeaModal({ open, onOpenChange, idea, onSuccess }: EditIdeaModalProps) {
  const [titulo, setTitulo] = useState(idea.titulo)
  const [descripcion, setDescripcion] = useState(idea.descripcion)
  const [categoria, setCategoria] = useState<"Feature" | "Improvement" | "Innovation" | "Recommendation">(idea.categoria)
  const [tags, setTags] = useState<string[]>(idea.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { actualizarIdea } = useIdeasStore()

  // Actualizar estado cuando cambia la idea
  useEffect(() => {
    setTitulo(idea.titulo)
    setDescripcion(idea.descripcion)
    setCategoria(idea.categoria)
    setTags(idea.tags || [])
  }, [idea])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo.trim() || !descripcion.trim()) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSubmitting(true)

    try {
      await actualizarIdea(idea.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        tags,
      })

      toast.success("Idea actualizada correctamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error al actualizar idea:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la idea")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Idea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Título de tu idea..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
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
                <SelectItem value="Recommendation">Recomendación</SelectItem>
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
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
