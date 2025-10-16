"use client"

import { useState, useEffect } from "react"
import { Search, Sparkles, Clock, FileText, FolderKanban, Users, Calendar, Lightbulb, ArrowRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AISearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const recentSearches = [
  { query: "Tareas pendientes de Marketing", type: "search" },
  { query: "Reuniones de esta semana", type: "search" },
  { query: "Proyectos con alta prioridad", type: "search" },
]

const quickActions = [
  { icon: FolderKanban, label: "Crear Proyecto", color: "oklch(0.7 0.15 270)" },
  { icon: FileText, label: "Nueva Tarea", color: "oklch(0.7 0.15 210)" },
  { icon: Calendar, label: "Agendar Reunión", color: "oklch(0.7 0.15 140)" },
  { icon: Lightbulb, label: "Generar Idea con IA", color: "oklch(0.7 0.15 330)" },
]

const aiSuggestions = [
  {
    type: "task",
    title: "Diseño de landing page",
    subtitle: "Marketing • Vence mañana",
    icon: FileText,
    priority: "high",
  },
  {
    type: "project",
    title: "Campaña Q1 2025",
    subtitle: "8 tareas activas • 67% completado",
    icon: FolderKanban,
    priority: "medium",
  },
  {
    type: "meeting",
    title: "Reunión de equipo",
    subtitle: "Hoy a las 15:00 • 6 asistentes",
    icon: Calendar,
    priority: "high",
  },
  {
    type: "user",
    title: "Ana García",
    subtitle: "Marketing Director • 12 tareas asignadas",
    icon: Users,
    priority: "low",
  },
]

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<typeof aiSuggestions>([])

  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true)
      // Simulate AI search
      const timer = setTimeout(() => {
        setResults(aiSuggestions.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())))
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar o preguntar a la IA..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent p-0 text-base focus-visible:ring-0"
            autoFocus
          />
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span>Buscando...</span>
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[500px]">
          <div className="p-4">
            {query.length === 0 ? (
              <>
                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={index}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: action.color }}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{action.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Búsquedas Recientes
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
                        onClick={() => setQuery(search.query)}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{search.query}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sugerencias de IA
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {aiSuggestions.map((suggestion, index) => {
                      const Icon = suggestion.icon
                      return (
                        <button
                          key={index}
                          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.subtitle}</p>
                          </div>
                          {suggestion.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Alta
                            </Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search Results */}
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Resultados ({results.length})
                  </h3>
                  {results.length > 0 ? (
                    <div className="space-y-1">
                      {results.map((result, index) => {
                        const Icon = result.icon
                        return (
                          <button
                            key={index}
                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{result.title}</p>
                              <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                            </div>
                            {result.priority === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                Alta
                              </Badge>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
                      <p className="mt-1 text-xs text-muted-foreground">Intenta con otros términos de búsqueda</p>
                    </div>
                  )}
                </div>

                {/* AI Insights for Query */}
                {results.length > 0 && (
                  <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Análisis de IA</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Encontré {results.length} resultados relacionados con "{query}". Los elementos con alta
                          prioridad requieren atención inmediata.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5">↑</kbd>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5">↓</kbd>
              <span>Navegar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5">↵</kbd>
              <span>Seleccionar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5">Esc</kbd>
              <span>Cerrar</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
