"use client"

import { useState } from "react"
import { Sparkles, FolderKanban, Calendar, Users, Target, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<{
    tasks: string[]
    timeline: string
    team: string[]
  } | null>(null)

  const handleGenerateWithAI = async () => {
    if (!projectName) return

    setIsGenerating(true)
    setUseAI(true)

    // Simulate AI generation
    setTimeout(() => {
      setAiSuggestions({
        tasks: [
          "Investigación de mercado y análisis competitivo",
          "Definición de objetivos y KPIs",
          "Diseño de wireframes y mockups",
          "Desarrollo de MVP",
          "Testing y QA",
          "Lanzamiento y monitoreo",
        ],
        timeline: "8 semanas",
        team: ["Product Manager", "UI/UX Designer", "Frontend Developer", "Backend Developer", "QA Engineer"],
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleCreate = () => {
    // Handle project creation
    onOpenChange(false)
    // Reset form
    setProjectName("")
    setDescription("")
    setAiSuggestions(null)
    setUseAI(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FolderKanban className="h-6 w-6 text-primary" />
            Crear Nuevo Proyecto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del Proyecto</Label>
            <Input
              id="project-name"
              placeholder="Ej: Rediseño de plataforma web"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente el objetivo del proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* AI Generation Button */}
          {!useAI && (
            <Button
              onClick={handleGenerateWithAI}
              disabled={!projectName || isGenerating}
              className="w-full gap-2 bg-transparent"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar estructura con IA
                </>
              )}
            </Button>
          )}

          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Sugerencias de IA</h3>
              </div>

              {/* Suggested Tasks */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Tareas Sugeridas</span>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-lg bg-background/50 p-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Timeline Estimado</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {aiSuggestions.timeline}
                </Badge>
              </div>

              {/* Team Suggestions */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Equipo Recomendado</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.team.map((role, index) => (
                    <Badge key={index} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manual Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Diseño Gráfico</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="dev">Desarrollo</SelectItem>
                  <SelectItem value="hr">Recursos Humanos</SelectItem>
                  <SelectItem value="ops">Operaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!projectName}>
              Crear Proyecto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
