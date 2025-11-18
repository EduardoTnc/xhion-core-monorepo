"use client"

import { type FormEvent, useEffect, useMemo } from "react"
import {
  Search,
  Sparkles,
  Clock,
  FileText,
  FolderKanban,
  Users,
  Calendar,
  Lightbulb,
  Loader2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useAiSearchStore } from "@/store/aiSearchStore"
import type { AiActionSuggestion } from "@/services/aiService"
import { toast } from "sonner"

interface AISearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const quickActions = [
  { icon: FolderKanban, label: "Crear Proyecto", color: "oklch(0.7 0.15 270)" },
  { icon: FileText, label: "Nueva Tarea", color: "oklch(0.7 0.15 210)" },
  { icon: Calendar, label: "Agendar Reunión", color: "oklch(0.7 0.15 140)" },
  { icon: Lightbulb, label: "Generar Idea con IA", color: "oklch(0.7 0.15 330)" },
]

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
  const { query, setQuery, results, isLoading, error, recentQueries, search, clearResults } = useAiSearchStore()
  const navigate = useNavigate()

  const resultsByEntity = results?.resultsByEntity || {}
  const totalItems = useMemo(() => Object.values(resultsByEntity).reduce((acc, arr) => acc + arr.length, 0), [resultsByEntity])
  const hasResults = Boolean(results && totalItems > 0)

  const entitySections = [
    { key: 'projects', label: 'Proyectos', icon: FolderKanban },
    { key: 'tasks', label: 'Tareas', icon: FileText },
    { key: 'users', label: 'Usuarios', icon: Users },
    { key: 'documents', label: 'Documentos', icon: Calendar },
  ]

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

  useEffect(() => {
    if (!open) {
      clearResults()
    }
  }, [open, clearResults])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    search({ query })
  }

  const handleQuickQuery = (value: string) => {
    setQuery(value)
    search({ query: value })
  }

  const closeModal = () => onOpenChange(false)

  const navigateWithState = (path: string, state?: Record<string, any>) => {
    closeModal()
    navigate(path, state ? { state } : undefined)
  }

  const handleResultNavigation = (sectionKey: string, item: any) => {
    switch (sectionKey) {
      case 'projects':
        if (item.id) {
          navigateWithState(`/proyectos/${item.id}`)
        } else {
          navigateWithState('/proyectos')
        }
        break
      case 'tasks': {
        if (item.proyecto?.id) {
          navigateWithState(`/proyectos/${item.proyecto.id}`, { openTaskId: item.id })
        } else if (item.id) {
          navigateWithState('/tareas', { openTaskId: item.id })
        } else {
          toast.info('No se pudo determinar el proyecto de la tarea seleccionada')
        }
        break
      }
      case 'users':
        navigateWithState('/usuarios', {
          aiUserQuery: item.nombreCompleto || item.email || query,
        })
        break
      case 'documents':
        toast.info('Documentos aún no soportan navegación directa, por favor usa el módulo de Conocimiento')
        break
      default:
        toast.info('Acción no disponible para este resultado todavía')
        break
    }
  }

  const handleActionSuggestion = (suggestion: AiActionSuggestion) => {
    switch (suggestion.entityType) {
      case 'PROJECT':
        navigateWithState('/proyectos', { aiProjectSuggestion: suggestion })
        toast.success('Sugerencia enviada al módulo de proyectos')
        break
      case 'TASK':
        navigateWithState('/tareas', { aiTaskSuggestion: suggestion })
        toast.success('Sugerencia enviada al módulo de tareas')
        break
      case 'IDEA':
        navigateWithState('/ideas', { aiIdeaSuggestion: suggestion })
        toast.success('Sugerencia enviada al módulo de ideas')
        break
      default:
        toast.info('Pronto podrás ejecutar esta sugerencia directamente')
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-border p-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar o preguntar a la IA..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent p-0 text-base focus-visible:ring-0"
            autoFocus
          />
          <Button type="submit" size="sm" className="gap-1" disabled={!query.trim() || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Buscar
          </Button>
        </form>

        <ScrollArea className="max-h-[500px]">
          <div className="p-4">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

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
                          onClick={() => handleQuickQuery(action.label)}
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

                {recentQueries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Búsquedas Recientes
                    </h3>
                    <div className="space-y-1">
                      {recentQueries.map((recent) => (
                        <button
                          key={recent}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
                          onClick={() => handleQuickQuery(recent)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{recent}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {results && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">Análisis IA</p>
                            <span className="text-xs text-muted-foreground">
                              {results.processingTimeMs} ms • Intención: {results.intent}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{results.summary}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {entitySections.map(({ key, label, icon: Icon }) => {
                    const items = resultsByEntity[key] || []
                    if (!items.length) return null

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Icon className="h-4 w-4 text-primary" />
                          {label} ({items.length})
                        </div>
                        <div className="space-y-2">
                          {items.map((item: any) => (
                            <div key={item.id || item.title} className="rounded-xl border border-border/60 bg-card/80 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{item.nombre || item.titulo || item.email}</p>
                                  {item.descripcion && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.descripcion}</p>
                                  )}
                                  {item.estado && (
                                    <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                                      {item.estado}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Ver detalle"
                                  type="button"
                                  onClick={() => handleResultNavigation(key, item)}
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </div>
                              {item.proyecto && (
                                <p className="mt-1 text-[11px] text-muted-foreground">Proyecto: {item.proyecto?.nombre}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {results?.actionSuggestions && results.actionSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Sugerencias de acción
                      </div>
                      <div className="space-y-2">
                        {results.actionSuggestions.map((suggestion, index) => (
                          <div
                            key={`${suggestion.entityType}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {suggestion.entityType} • {(suggestion.confidence * 100).toFixed(0)}% confianza
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Object.keys(suggestion.payload)
                                  .map((key) => `${key}: ${suggestion.payload[key]}`)
                                  .join(" • ")}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" type="button" onClick={() => handleActionSuggestion(suggestion)}>
                              Usar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
                      <p className="mt-1 text-xs text-muted-foreground">Intenta con otros términos de búsqueda</p>
                    </div>
                  )}
                </div>
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
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
