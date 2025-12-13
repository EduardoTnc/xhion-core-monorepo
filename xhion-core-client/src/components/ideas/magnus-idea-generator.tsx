"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Sparkles, Loader2, Bot, Wand2, Check, RefreshCw } from "lucide-react"
import { useCreateIdea } from "@/hooks/mutations/useIdeaMutations"
import { aiService } from "@/services/aiService"
import { toast } from "sonner"
import type { CrearIdeaDto } from "@/services/ideasService"

interface MagnusIdeaGeneratorProps {
    onClose: () => void
    onSuccess?: () => void
}

interface GeneratedIdea {
    titulo: string
    descripcion: string
    categoria: string
    tags: string[]
    aiScore: number
    aiInsight: string
}

export function MagnusIdeaGenerator({ onClose, onSuccess }: MagnusIdeaGeneratorProps) {
    // TanStack Query mutation
    const createIdeaMutation = useCreateIdea()

    const [prompt, setPrompt] = useState("")
    const [categoria, setCategoria] = useState("Feature")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null)
    const [step, setStep] = useState<"input" | "result">("input")

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case "Feature": return "Nueva funcionalidad"
            case "Improvement": return "Mejora"
            case "Innovation": return "Innovación"
            case "Recommendation": return "Recomendación"
            default: return cat
        }
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        try {
            const magnusPrompt = `Genera una idea innovadora para una empresa basándote en esta descripción del usuario:

"${prompt}"

Categoría preferida: ${getCategoryLabel(categoria)}

Responde EXACTAMENTE en este formato JSON (sin markdown, sin texto extra):
{
  "titulo": "Título conciso y atractivo de la idea",
  "descripcion": "Descripción detallada de la idea, cómo funciona, qué problema resuelve y qué beneficios aporta. Mínimo 2-3 párrafos.",
  "tags": ["tag1", "tag2", "tag3"],
  "aiScore": 85,
  "aiInsight": "Análisis de viabilidad y potencial de la idea. Por qué es buena idea. Posibles desafíos y recomendaciones."
}`

            const response = await aiService.search({ query: magnusPrompt })

            try {
                let cleanResponse = response.summary
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim()

                const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0])
                    setGeneratedIdea({
                        titulo: parsed.titulo || "Idea generada por Magnus",
                        descripcion: parsed.descripcion || prompt,
                        categoria: categoria,
                        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                        aiScore: parsed.aiScore || 75,
                        aiInsight: parsed.aiInsight || "Idea generada con IA"
                    })
                    setStep("result")
                } else {
                    throw new Error("No JSON found")
                }
            } catch (parseError) {
                setGeneratedIdea({
                    titulo: `Idea: ${prompt.slice(0, 50)}...`,
                    descripcion: response.summary || prompt,
                    categoria: categoria,
                    tags: ["IA", "Generado"],
                    aiScore: 70,
                    aiInsight: "Esta idea fue generada con asistencia de IA basada en tu descripción."
                })
                setStep("result")
            }
        } catch (error) {
            console.error("Error generating idea:", error)
            toast.error("Error al generar la idea con Magnus IA")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRegenerate = () => {
        setGeneratedIdea(null)
        setStep("input")
    }

    const handleCreateIdea = async () => {
        if (!generatedIdea) return

        createIdeaMutation.mutate(
            {
                titulo: generatedIdea.titulo,
                descripcion: generatedIdea.descripcion,
                categoria: generatedIdea.categoria,
                tags: generatedIdea.tags,
                aiScore: generatedIdea.aiScore,
                aiInsight: generatedIdea.aiInsight,
            } as CrearIdeaDto,
            {
                onSuccess: () => {
                    onSuccess?.()
                    onClose()
                },
            }
        )
    }

    return (
        <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-5 shadow-xl animate-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            Generar con Magnus IA
                            <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                            </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Describe tu idea y Magnus la transformará en una propuesta completa
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {step === "input" ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="prompt" className="text-sm font-medium">
                            ¿Qué idea tienes en mente?
                        </Label>
                        <Textarea
                            id="prompt"
                            placeholder="Describe tu idea, problema o necesidad. Por ejemplo: 'Necesitamos una forma de que los clientes puedan ver el estado de sus pedidos en tiempo real...'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className="resize-none bg-background/50 border-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Categoría sugerida</Label>
                        <Select value={categoria} onValueChange={setCategoria}>
                            <SelectTrigger className="bg-background/50 border-primary/20">
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

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-start gap-2">
                            <Wand2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                                Magnus analizará tu descripción y generará: título, descripción detallada,
                                tags relevantes, score de viabilidad y análisis estratégico.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Magnus está pensando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generar Idea
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {generatedIdea && (
                        <>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Título generado</Label>
                                <h4 className="text-lg font-semibold text-foreground">{generatedIdea.titulo}</h4>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Descripción</Label>
                                <div className="rounded-lg bg-background/50 p-3 border border-border/50">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {generatedIdea.descripcion}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Tags sugeridos</Label>
                                <div className="flex flex-wrap gap-2">
                                    {generatedIdea.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-sm font-semibold text-primary">Análisis de Magnus</span>
                                            <Badge className="bg-primary/20 text-primary border-primary/30">
                                                Score: {generatedIdea.aiScore}/100
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {generatedIdea.aiInsight}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Button variant="ghost" onClick={handleRegenerate} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Regenerar
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={onClose}>
                                        Descartar
                                    </Button>
                                    <Button
                                        onClick={handleCreateIdea}
                                        disabled={createIdeaMutation.isPending}
                                        className="gap-2 bg-gradient-to-r from-green-600 to-green-500"
                                    >
                                        {createIdeaMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Crear Idea
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
