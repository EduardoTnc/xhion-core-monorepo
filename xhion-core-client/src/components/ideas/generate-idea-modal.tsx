"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Sparkles, Loader2 } from "lucide-react"

interface GenerateIdeaModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function GenerateIdeaModal({ onClose }: GenerateIdeaModalProps) {
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("feature")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdea, setGeneratedIdea] = useState<{
    title: string
    description: string
    tags: string[]
    aiScore: number
    aiInsight: string
  } | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedIdea({
        title: "Sistema de colaboración en tiempo real con IA",
        description:
          "Implementar un sistema de colaboración que permita a múltiples usuarios trabajar simultáneamente en tareas y proyectos, con sugerencias inteligentes de IA para optimizar la distribución de trabajo y detectar conflictos potenciales antes de que ocurran.",
        tags: ["IA", "Colaboración", "Real-time", "Productividad"],
        aiScore: 94,
        aiInsight:
          "Propuesta altamente viable con gran potencial de impacto. La combinación de colaboración en tiempo real con IA predictiva puede reducir significativamente los tiempos de coordinación y mejorar la eficiencia del equipo en un 35-40%.",
      })
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Generar Idea con IA</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!generatedIdea ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe tu idea o problema</Label>
                <Textarea
                  id="prompt"
                  placeholder="Ej: Necesitamos una forma de que los equipos puedan colaborar mejor en proyectos complejos..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  La IA analizará tu descripción y generará una propuesta detallada con análisis de viabilidad.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Nueva funcionalidad</SelectItem>
                    <SelectItem value="improvement">Mejora</SelectItem>
                    <SelectItem value="innovation">Innovación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-1">Generación inteligente</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Gemini AI analizará tu descripción y generará una propuesta completa incluyendo título,
                      descripción detallada, tags relevantes, score de viabilidad y análisis estratégico.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título generado</Label>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium text-foreground">{generatedIdea.title}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm text-foreground leading-relaxed">{generatedIdea.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags sugeridos</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-foreground">Análisis de viabilidad</h4>
                      <span className="text-sm font-semibold text-primary">Score: {generatedIdea.aiScore}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{generatedIdea.aiInsight}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {!generatedIdea ? (
            <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Idea
                </>
              )}
            </Button>
          ) : (
            <Button className="gap-2">Crear Idea</Button>
          )}
        </div>
      </div>
    </div>
  )
}
