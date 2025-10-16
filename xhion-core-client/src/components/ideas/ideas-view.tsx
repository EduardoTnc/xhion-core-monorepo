"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Sparkles, TrendingUp, Lightbulb, Target, Zap, Filter } from "lucide-react"
import { IdeaCard } from "./idea-card"
import { GenerateIdeaModal } from "./generate-idea-modal"

const ideas = [
  {
    id: 1,
    title: "Sistema de notificaciones en tiempo real",
    description:
      "Implementar un sistema de notificaciones push que permita a los usuarios recibir actualizaciones instantáneas sobre cambios en proyectos y tareas.",
    category: "feature",
    status: "evaluating",
    votes: 24,
    comments: 8,
    author: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    aiScore: 92,
    aiInsight: "Alta viabilidad técnica. Impacto positivo en engagement del usuario.",
    tags: ["UX", "Real-time", "Engagement"],
    createdAt: "Hace 2 días",
  },
  {
    id: 2,
    title: "Integración con herramientas de IA generativa",
    description:
      "Permitir que los usuarios generen contenido automáticamente usando modelos de lenguaje para descripciones de tareas y documentación.",
    category: "innovation",
    status: "approved",
    votes: 45,
    comments: 15,
    author: { name: "Carlos Ruiz", avatar: "/man.jpg" },
    aiScore: 88,
    aiInsight: "Diferenciador competitivo. Requiere inversión en infraestructura.",
    tags: ["IA", "Automatización", "Productividad"],
    createdAt: "Hace 5 días",
  },
  {
    id: 3,
    title: "Dashboard personalizable con widgets",
    description:
      "Permitir a cada usuario personalizar su dashboard arrastrando y soltando widgets según sus necesidades específicas.",
    category: "improvement",
    status: "in-development",
    votes: 38,
    comments: 12,
    author: { name: "María López", avatar: "/diverse-woman-portrait.png" },
    aiScore: 85,
    aiInsight: "Mejora significativa en UX. Complejidad técnica moderada.",
    tags: ["UX", "Personalización", "Dashboard"],
    createdAt: "Hace 1 semana",
  },
  {
    id: 4,
    title: "Modo offline con sincronización automática",
    description:
      "Permitir trabajar sin conexión y sincronizar automáticamente los cambios cuando se recupere la conectividad.",
    category: "feature",
    status: "evaluating",
    votes: 31,
    comments: 6,
    author: { name: "Juan Pérez", avatar: "/man.jpg" },
    aiScore: 78,
    aiInsight: "Útil para usuarios móviles. Requiere arquitectura de datos robusta.",
    tags: ["Mobile", "Sync", "Offline"],
    createdAt: "Hace 3 días",
  },
  {
    id: 5,
    title: "Análisis predictivo de riesgos en proyectos",
    description:
      "Usar machine learning para predecir posibles retrasos o problemas en proyectos basándose en datos históricos.",
    category: "innovation",
    status: "evaluating",
    votes: 52,
    comments: 20,
    author: { name: "Ana García", avatar: "/diverse-woman-portrait.png" },
    aiScore: 95,
    aiInsight: "Alto valor estratégico. Requiere datos históricos suficientes.",
    tags: ["IA", "Analytics", "Predicción"],
    createdAt: "Hace 4 días",
  },
]

export function IdeasView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ideas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Buzón inteligente de ideas con análisis de IA y votación colaborativa
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-4 w-4" />
              Generar con IA
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Idea
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="feature">Nueva funcionalidad</SelectItem>
              <SelectItem value="improvement">Mejora</SelectItem>
              <SelectItem value="innovation">Innovación</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="evaluating">En evaluación</SelectItem>
              <SelectItem value="approved">Aprobada</SelectItem>
              <SelectItem value="in-development">En desarrollo</SelectItem>
              <SelectItem value="implemented">Implementada</SelectItem>
              <SelectItem value="rejected">Rechazada</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">127</p>
              <p className="text-xs text-muted-foreground">Total de ideas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Target className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">23</p>
              <p className="text-xs text-muted-foreground">En evaluación</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <Zap className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">15</p>
              <p className="text-xs text-muted-foreground">En desarrollo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">89</p>
              <p className="text-xs text-muted-foreground">Implementadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>

      {/* Generate Idea Modal */}
      {showGenerateModal && <GenerateIdeaModal onClose={() => setShowGenerateModal(false)} />}
    </div>
  )
}
