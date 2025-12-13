"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Loader2, Sparkles, Tag } from "lucide-react"
import { useCreateIdea, useUpdateIdea } from "@/hooks/mutations/useIdeaMutations"
import type { CrearIdeaDto } from "@/services/ideasService"

interface InlineIdeaEditorProps {
    onClose: () => void
    onSuccess?: () => void
    // Para edición
    ideaId?: string
    initialData?: {
        titulo: string
        descripcion: string
        categoria: string
        tags: string[]
    }
}

export function InlineIdeaEditor({ onClose, onSuccess, ideaId, initialData }: InlineIdeaEditorProps) {
    // TanStack Query mutations
    const createIdeaMutation = useCreateIdea()
    const updateIdeaMutation = useUpdateIdea()
    const isLoading = createIdeaMutation.isPending || updateIdeaMutation.isPending

    const [titulo, setTitulo] = useState(initialData?.titulo || "")
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || "")
    // Define the allowed category types
    type Category = "Feature" | "Improvement" | "Innovation" | "Recommendation"
    const [categoria, setCategoria] = useState<Category>(initialData?.categoria as Category || "Feature")
    // Handler to satisfy Select onValueChange expecting a string
    const handleCategoryChange = (value: string) => {
        setCategoria(value as Category);
    };
    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState("")

    const isEditing = !!ideaId

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTag()
        }
    }

    const handleSubmit = async () => {
        if (!titulo.trim() || !descripcion.trim()) return

        const ideaData = {
            titulo,
            descripcion,
            categoria,
            tags,
        }

        const handleSuccessCallback = () => {
            onSuccess?.()
            onClose()
        }

        if (isEditing) {
            updateIdeaMutation.mutate(
                { id: ideaId, data: ideaData },
                { onSuccess: handleSuccessCallback }
            )
        } else {
            createIdeaMutation.mutate(
                ideaData as CrearIdeaDto,
                { onSuccess: handleSuccessCallback }
            )
        }
    }

    return (
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-lg animate-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                        {isEditing ? "Editar Idea" : "Nueva Idea"}
                    </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Título */}
                <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-sm font-medium">Título</Label>
                    <Input
                        id="titulo"
                        placeholder="Un título claro y conciso para tu idea..."
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="bg-background/50"
                    />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium">Descripción</Label>
                    <Textarea
                        id="descripcion"
                        placeholder="Describe tu idea en detalle: qué problema resuelve, cómo funciona, qué beneficios aporta..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={4}
                        className="resize-none bg-background/50"
                    />
                </div>

                {/* Categoría y Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Categoría */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Categoría</Label>
                        <Select value={categoria} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="bg-background/50">
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
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Agregar tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background/50 flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                            >
                                <Tag className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tags Display */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                                onClick={() => handleRemoveTag(tag)}
                            >
                                {tag}
                                <X className="h-3 w-3" />
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!titulo.trim() || !descripcion.trim() || isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEditing ? "Guardando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                {isEditing ? "Guardar Cambios" : "Crear Idea"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
