"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, TrendingUp, Lightbulb, Target, Zap, Loader2, BookOpen, List, Bot, ShieldCheck, X } from "lucide-react"
import { PageHeader, type PageHeaderTab } from "@/components/layout/PageHeader"
import { ExpandableIdeaCard } from "./expandable-idea-card"
import { InlineIdeaEditor } from "./inline-idea-editor"
import { MagnusIdeaGenerator } from "./magnus-idea-generator"
import { IdeasTutorial } from "./ideas-tutorial"
import { IdeasAdminPanel } from "./ideas-admin-panel"
import { IdeasGroupedView } from "./ideas-grouped-view"
// TanStack Query hooks - replacing useIdeasStore
import { useIdeas, useIdeasStats, useIdeaFilters } from "@/hooks/queries"
import { useAuthStore } from "@/store/authStore"


export function IdeasView() {
  const [activeTab, setActiveTab] = useState("ideas")

  // Panel states
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [showMagnusPanel, setShowMagnusPanel] = useState(false)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  // Use URL-based filters from TanStack Query hooks
  const { filters, setFilter } = useIdeaFilters()
  const searchQuery = filters.busqueda || ""
  const filterCategory = filters.categoria || "all"

  // TanStack Query hooks
  const { data: ideas = [], isLoading, refetch: refetchIdeas } = useIdeas({
    categoria: filterCategory !== "all" ? filterCategory : undefined,
    busqueda: searchQuery || undefined
  })
  const { data: estadisticas, refetch: refetchStats } = useIdeasStats()

  const { user } = useAuthStore()

  // Check if user has admin permissions
  const canAdminIdeas = user?.permisos?.includes("ideas.moderar") ||
    user?.permisos?.includes("ideas.cambiar_estado")

  // Get selected idea
  const selectedIdea = ideas.find(i => i.id === selectedIdeaId)

  const handleSelectIdea = (ideaId: string) => {
    setSelectedIdeaId(prev => prev === ideaId ? null : ideaId)
    setShowCreatePanel(false)
    setShowMagnusPanel(false)
  }

  const handleCloseDetail = () => {
    setSelectedIdeaId(null)
  }

  const handleOpenCreatePanel = () => {
    setShowCreatePanel(true)
    setShowMagnusPanel(false)
    setSelectedIdeaId(null)
  }

  const handleOpenMagnusPanel = () => {
    setShowMagnusPanel(true)
    setShowCreatePanel(false)
    setSelectedIdeaId(null)
  }

  const handlePanelSuccess = () => {
    refetchIdeas()
    refetchStats()
  }

  const handleSilentStatsRefresh = useCallback(() => {
    refetchStats()
  }, [refetchStats])

  const handleSetSearchQuery = (query: string) => {
    setFilter('q', query || null)
  }

  const handleSetFilterCategory = (category: string) => {
    setFilter('categoria', category !== 'all' ? category : null)
  }

  // Build tabs array dynamically
  const headerTabs: PageHeaderTab[] = useMemo(() => {
    const tabs: PageHeaderTab[] = [
      { id: "ideas", label: "Ideas", icon: List },
    ]
    if (canAdminIdeas) {
      tabs.push({ id: "admin", label: "Administración", icon: ShieldCheck })
    }
    tabs.push({ id: "guia", label: "Guía", icon: BookOpen })
    return tabs
  }, [canAdminIdeas])

  return (
    <div className="flex h-full flex-col">
      {/* Header with integrated tabs */}
      <PageHeader
        icon={Lightbulb}
        title="Ideas y Recomendaciones"
        subtitle="Comparte ideas innovadoras y recomendaciones que impulsen el crecimiento de la empresa"
        tabs={headerTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showMagnusPanel ? "default" : "outline"}
              size="sm"
              className={`gap-2 ${showMagnusPanel ? "bg-gradient-to-r from-primary to-primary/80" : "bg-transparent"}`}
              onClick={handleOpenMagnusPanel}
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Generar con Magnus IA</span>
              <span className="sm:hidden">Magnus</span>
            </Button>
            <Button
              size="sm"
              className="gap-2"
              variant={showCreatePanel ? "secondary" : "default"}
              onClick={handleOpenCreatePanel}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Idea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
        }
      />

      {/* Tab Content */}
      {activeTab === "ideas" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Bar - Compact */}
          <div className="border-b border-border bg-card px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{estadisticas?.total || 0}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">{estadisticas?.porEstado?.Evaluating || 0}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">evaluando</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{estadisticas?.porEstado?.InDevelopment || 0}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">desarrollo</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{estadisticas?.porEstado?.Implemented || 0}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">implementadas</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => handleSetSearchQuery(e.target.value)}
                    className="pl-8 h-8 w-40 md:w-56 text-sm"
                  />
                </div>
                <Select value={filterCategory} onValueChange={handleSetFilterCategory}>
                  <SelectTrigger className="h-8 w-32 md:w-40 text-sm">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Feature">Funcionalidad</SelectItem>
                    <SelectItem value="Improvement">Mejora</SelectItem>
                    <SelectItem value="Innovation">Innovación</SelectItem>
                    <SelectItem value="Recommendation">Recomendación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Split Panel Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Ideas List */}
            <div className={`flex-1 overflow-y-auto p-4 ${selectedIdeaId ? "hidden md:block md:w-1/2 lg:w-2/5 md:border-r md:border-border" : ""}`}>
              {/* Top Panels */}
              {showMagnusPanel && (
                <div className="mb-4">
                  <MagnusIdeaGenerator
                    onClose={() => setShowMagnusPanel(false)}
                    onSuccess={handlePanelSuccess}
                  />
                </div>
              )}

              {showCreatePanel && (
                <div className="mb-4">
                  <InlineIdeaEditor
                    onClose={() => setShowCreatePanel(false)}
                    onSuccess={handlePanelSuccess}
                  />
                </div>
              )}

              {/* Ideas List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <IdeasGroupedView
                  ideas={ideas}
                  onSelectIdea={handleSelectIdea}
                  selectedIdeaId={selectedIdeaId}
                  searchQuery={searchQuery}
                  filterCategory={filterCategory}
                />
              )}
            </div>

            {/* Right Panel - Detail View */}
            {selectedIdeaId && selectedIdea && (
              <div className="flex-1 md:w-1/2 lg:w-3/5 overflow-y-auto bg-muted/30">
                {/* Mobile back button */}
                <div className="md:hidden sticky top-0 bg-card border-b border-border p-3 z-10">
                  <Button variant="ghost" size="sm" onClick={handleCloseDetail} className="gap-2">
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                </div>

                <div className="p-4">
                  <ExpandableIdeaCard
                    idea={selectedIdea}
                    isExpanded={true}
                    onToggleExpand={handleCloseDetail}
                    onUpdate={handleSilentStatsRefresh}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === "admin" && canAdminIdeas && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <IdeasAdminPanel onUpdate={handlePanelSuccess} />
          </div>
        </div>
      )}

      {/* Guía Tab */}
      {activeTab === "guia" && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <IdeasTutorial />
          </div>
        </div>
      )}
    </div>
  )
}

