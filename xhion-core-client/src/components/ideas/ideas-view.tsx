"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Sparkles, TrendingUp, Lightbulb, Target, Zap, Loader2, BookOpen, List } from "lucide-react"
import { IdeaCard } from "./idea-card"
import { GenerateIdeaModal } from "./generate-idea-modal"
import { CreateIdeaModal } from "./create-idea-modal"
import { IdeasTutorial } from "./ideas-tutorial"
import { useIdeasStore } from "@/store/ideasStore"


export function IdeasView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState("ideas")

  const { ideas, estadisticas, isLoading, fetchIdeas, fetchEstadisticas } = useIdeasStore()

  useEffect(() => { 
    loadIdeas()
    fetchEstadisticas()
  }, [])

  useEffect(() => {
    loadIdeas()
  }, [filterCategory, filterStatus, searchQuery])

  const loadIdeas = () => {
    const categoria = filterCategory !== "all" ? filterCategory : undefined
    const estado = filterStatus !== "all" ? filterStatus : undefined
    const busqueda = searchQuery || undefined
    fetchIdeas(categoria, estado, busqueda)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">Ideas y Recomendaciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Comparte ideas innovadoras y recomendaciones que impulsen el crecimiento de la empresa
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generar con IA</span>
              <span className="sm:hidden">IA</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Idea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card px-4 md:px-6">
          <TabsList className="h-12 bg-transparent p-0">
            <TabsTrigger 
              value="ideas" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 h-12"
            >
              <List className="h-4 w-4 mr-2" />
              Ideas
            </TabsTrigger>
            <TabsTrigger 
              value="guia" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 h-12"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Guía y Reconocimientos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ideas" className="flex-1 flex flex-col m-0">
          {/* Filters */}
          <div className="border-b border-border bg-card px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="Feature">Nueva funcionalidad</SelectItem>
              <SelectItem value="Improvement">Mejora</SelectItem>
              <SelectItem value="Innovation">Innovación</SelectItem>
              <SelectItem value="Recommendation">Recomendación</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Evaluating">En evaluación</SelectItem>
              <SelectItem value="Approved">Aprobada</SelectItem>
              <SelectItem value="InDevelopment">En desarrollo</SelectItem>
              <SelectItem value="Implemented">Implementada</SelectItem>
              <SelectItem value="Rejected">Rechazada</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-border bg-card px-4 md:px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{estadisticas?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total de ideas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Target className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{estadisticas?.porEstado?.Evaluating || 0}</p>
              <p className="text-xs text-muted-foreground">En evaluación</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <Zap className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{estadisticas?.porEstado?.InDevelopment || 0}</p>
              <p className="text-xs text-muted-foreground">En desarrollo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{estadisticas?.porEstado?.Implemented || 0}</p>
              <p className="text-xs text-muted-foreground">Implementadas</p>
            </div>
          </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay ideas aún</h3>
            <p className="text-sm text-muted-foreground mb-4">Sé el primero en compartir una idea innovadora</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Idea
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUpdate={loadIdeas} />
            ))}
          </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="guia" className="flex-1 overflow-y-auto m-0">
        <div className="p-4 md:p-6">
          <IdeasTutorial />
        </div>
      </TabsContent>
    </Tabs>

    {/* Modals */}
    {showGenerateModal && <GenerateIdeaModal onClose={() => setShowGenerateModal(false)} onSuccess={loadIdeas} />}
    {showCreateModal && <CreateIdeaModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={loadIdeas} />}
  </div>
  )
}
