
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { MagnusAvatar } from "@/components/ai/magnus-avatar"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import {
  FileText,
  FolderKanban,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  Activity,
  Search,
  Sparkles,
  History,
  LayoutGrid,
  Settings,
  DollarSign,
  BookOpen,
  Package,
  TrendingUp,
  Mail,
  Lightbulb,
  Shield,
  CheckSquare,
  Building2,
  Trash2,
  Minimize2,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Target,
  Zap,
  BarChart3,
  UserCheck,
  CalendarClock,
  type LucideIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useAiSearchStore } from "@/store/aiSearchStore"
import type { AiActionSuggestion } from "@/services/aiService"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"
import { MODULOS_PERMISOS, type PermisoDefinicion } from "@/constants/permissions"
import { formatDistanceToNow, format, isToday, isTomorrow, isThisWeek, getHours } from "date-fns"
import { es } from "date-fns/locale"

// Map icons from string to component
const ICON_MAP: Record<string, any> = {
  FolderKanban,
  CheckSquare,
  Building2,
  DollarSign,
  BookOpen,
  Users,
  Shield,
  FileText,
  Settings,
  Mail,
  Lightbulb,
  Package,
  TrendingUp,
  Sparkles,
}

interface AISearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Suggestion interface
interface DynamicSuggestion {
  label: string
  icon: LucideIcon
  category: 'time' | 'productivity' | 'team' | 'projects' | 'analytics'
  priority: number
}

// Generate dynamic suggestions based on context
const generateDynamicSuggestions = (): DynamicSuggestion[] => {
  const now = new Date()
  const hour = getHours(now)
  const dayOfWeek = now.getDay()
  const suggestions: DynamicSuggestion[] = []

  // Time-based suggestions
  if (hour >= 8 && hour < 12) {
    // Morning suggestions
    suggestions.push(
      { label: "¿Cuáles son mis tareas prioritarias para hoy?", icon: Target, category: 'time', priority: 10 },
      { label: "¿Hay reuniones programadas para hoy?", icon: CalendarClock, category: 'time', priority: 9 }
    )
  } else if (hour >= 12 && hour < 14) {
    // Midday suggestions
    suggestions.push(
      { label: "Dame un resumen del progreso de hoy", icon: BarChart3, category: 'analytics', priority: 10 },
      { label: "¿Qué tareas urgentes quedan pendientes?", icon: AlertCircle, category: 'productivity', priority: 9 }
    )
  } else if (hour >= 14 && hour < 18) {
    // Afternoon suggestions
    suggestions.push(
      { label: "¿Qué tareas puedo completar antes de terminar el día?", icon: CheckSquare, category: 'productivity', priority: 10 },
      { label: "¿Cómo va el avance de los proyectos activos?", icon: Activity, category: 'projects', priority: 9 }
    )
  } else {
    // Evening/Night suggestions
    suggestions.push(
      { label: "¿Qué quedó pendiente para mañana?", icon: Clock, category: 'time', priority: 10 },
      { label: "Genera un resumen del trabajo de esta semana", icon: FileText, category: 'analytics', priority: 9 }
    )
  }

  // Day of week suggestions
  if (dayOfWeek === 1) { // Monday
    suggestions.push(
      { label: "¿Cuáles son los objetivos de esta semana?", icon: Target, category: 'productivity', priority: 8 },
      { label: "¿Qué proyectos necesitan atención urgente?", icon: AlertCircle, category: 'projects', priority: 7 }
    )
  } else if (dayOfWeek === 5) { // Friday
    suggestions.push(
      { label: "Dame un resumen semanal de productividad", icon: TrendingUp, category: 'analytics', priority: 8 },
      { label: "¿Qué tareas debo cerrar antes del fin de semana?", icon: CheckSquare, category: 'productivity', priority: 7 }
    )
  }

  // Always available suggestions (context-independent)
  const alwaysAvailable: DynamicSuggestion[] = [
    { label: "¿Quién tiene la mayor carga de trabajo?", icon: Users, category: 'team', priority: 6 },
    { label: "¿Cuáles son los proyectos más retrasados?", icon: FolderKanban, category: 'projects', priority: 6 },
    { label: "¿Hay tareas bloqueadas que requieran atención?", icon: AlertCircle, category: 'productivity', priority: 5 },
    { label: "Muéstrame las métricas de productividad del equipo", icon: BarChart3, category: 'analytics', priority: 5 },
    { label: "¿Qué departamento tiene más tareas pendientes?", icon: Building2, category: 'team', priority: 4 },
    { label: "¿Cuál es el estado general de los proyectos activos?", icon: Activity, category: 'projects', priority: 4 },
    { label: "¿Hay nuevos usuarios que necesiten asignación?", icon: UserCheck, category: 'team', priority: 3 },
    { label: "¿Cuáles son las tareas con fecha límite próxima?", icon: CalendarClock, category: 'productivity', priority: 3 },
  ]

  suggestions.push(...alwaysAvailable)

  // Sort by priority and take top suggestions
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
}

// Category colors and labels
const categoryStyles: Record<string, { bg: string, text: string, label: string }> = {
  time: { bg: 'bg-blue-500/10 hover:bg-blue-500/20', text: 'text-blue-500', label: 'Tiempo' },
  productivity: { bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', text: 'text-emerald-500', label: 'Productividad' },
  team: { bg: 'bg-violet-500/10 hover:bg-violet-500/20', text: 'text-violet-500', label: 'Equipo' },
  projects: { bg: 'bg-orange-500/10 hover:bg-orange-500/20', text: 'text-orange-500', label: 'Proyectos' },
  analytics: { bg: 'bg-pink-500/10 hover:bg-pink-500/20', text: 'text-pink-500', label: 'Análisis' },
}

const thinkingMessages = [
  "Analizando registros históricos...",
  "Cruzando datos de proyectos...",
  "Evaluando métricas de rendimiento...",
  "Consultando la base de conocimiento...",
  "Estructurando respuesta estratégica...",
]

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
  // Check if user has permission to use AI
  const user = useAuthStore((state) => state.user)
  const hasAiPermission = user?.permisos?.includes('ai.search') ?? false

  const {
    query,
    setQuery,
    results,
    isLoading,
    search,
    clearResults,
    submitFeedback,
    feedbackStatus,
    queryHistory,
    activeQueryId,
    toggleQueryExpansion,
    setActiveQuery,
    clearHistory,
    removeFromHistory,
    submitHistoryFeedback,
    loadHistoryItem,
    backgroundQuery,
    clearBackgroundQuery,
  } = useAiSearchStore()
  const navigate = useNavigate()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null)
  const [thinkingMsg, setThinkingMsg] = useState(thinkingMessages[0])
  const [isActiveResponseExpanded, setIsActiveResponseExpanded] = useState(true)
  const [dynamicSuggestions, setDynamicSuggestions] = useState<DynamicSuggestion[]>([])

  // Generate dynamic suggestions on mount and when modal opens
  useEffect(() => {
    if (open) {
      setDynamicSuggestions(generateDynamicSuggestions())
    }
  }, [open])

  // Rotate thinking messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setThinkingMsg(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Reset feedback when results change
  useEffect(() => {
    if (results) {
      setFeedbackGiven(null)
      setIsActiveResponseExpanded(true)
    }
  }, [results])

  // State Determination
  const isMagnusMode = query.length > 10 || query.includes("?")
  const isFilteringMode = query.length > 0 && !isMagnusMode && !results && !isLoading
  const showMagnusTrigger = isMagnusMode && !results && !isLoading

  // Filtering Logic
  const filteredActions = useMemo(() => {
    if (!isFilteringMode) return {}

    const lowerQuery = query.toLowerCase()
    // Filter modules instead of actions
    const matches = MODULOS_PERMISOS.filter(m =>
      m.nombre.toLowerCase().includes(lowerQuery) ||
      m.descripcion.toLowerCase().includes(lowerQuery)
    )

    const grouped: Record<string, typeof matches> = { 'Módulos': matches }
    return grouped
  }, [query, isFilteringMode])

  // Flatten items for keyboard navigation
  const flatItems = useMemo(() => {
    const items: any[] = []

    if (showMagnusTrigger) {
      items.push({ type: 'magnus-trigger', label: `Preguntar a Magnus: "${query}"` })
    }

    if (isFilteringMode) {
      Object.entries(filteredActions).forEach(([category, modules]) => {
        modules.forEach(mod => items.push({ type: 'module', data: mod }))
      })
    }

    // Add results navigation
    if (results) {
      if (results.actionSuggestions) {
        results.actionSuggestions.forEach(s => items.push({ type: 'suggestion', data: s }))
      }
      const resultsByEntity = results.resultsByEntity || {}
      Object.keys(resultsByEntity).forEach(key => {
        resultsByEntity[key].forEach((item: any) => items.push({ type: 'result', data: item, section: key }))
      })
    }

    // Quick nav modules
    MODULOS_PERMISOS.forEach(module => items.push({ type: 'module', data: module }))

    return items
  }, [showMagnusTrigger, isFilteringMode, results, filteredActions, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, results])

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      // Only open if user has AI permission
      if (!hasAiPermission) {
        toast.error('No tienes permiso para acceder a Magnus IA')
        return
      }
      onOpenChange(!open)
      return
    }

    if (!open) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (showMagnusTrigger) {
        handleSubmit({ preventDefault: () => { } } as any)
        return
      }

      const item = flatItems[selectedIndex]
      if (item) {
        handleItemSelect(item)
      }
    } else if (e.key === "Escape" && results) {
      handleMinimizeResponse()
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [flatItems, selectedIndex, showMagnusTrigger, results, open, onOpenChange])


  // Handle modal open/close while preserving state
  useEffect(() => {
    if (!open) {
      // Only clear query text when modal closes
      setQuery("")

      // If NOT loading (no pending request), preserve results for viewing later
      // If IS loading, keep everything as-is so processing continues
      if (!isLoading && !results && backgroundQuery?.status !== "success") {
        clearResults()
      }

      // Don't clear background query here - let it complete
    } else {
      // When modal opens:
      // 1. If there's a successful background query, expand the response
      if (results && backgroundQuery?.status === "success") {
        setIsActiveResponseExpanded(true)
        clearBackgroundQuery()
      }

      // 2. If still loading from before minimize, response will show when ready
      // The loading UI will automatically render because isLoading is true
    }
  }, [open, isLoading])

  const handleItemSelect = (item: any) => {
    if (item.type === 'module') {
      const moduleRoutes: Record<string, string> = {
        'proyectos': '/proyectos',
        'tareas': '/tareas',
        'departamentos': '/departamentos',
        'conocimiento': '/conocimiento',
        'usuarios': '/usuarios',
        'roles': '/roles',
        'auditoria': '/auditoria',
        'sistema': '/configuraciones',
        'invitaciones': '/usuarios',
        'ideas': '/ideas',
        'finanzas': '/finanzas',
      }

      const route = moduleRoutes[item.data.id]
      if (route) {
        if (item.data.id === 'invitaciones') {
          navigateWithState(route, { showInvitations: true })
          toast.success('Navegando a Usuarios Invitados')
        } else {
          navigateWithState(route)
          toast.success(`Navegando a ${item.data.nombre}`)
        }
      } else {
        toast.info(`Módulo ${item.data.nombre} en desarrollo`)
        onOpenChange(false)
      }
    } else if (item.type === 'magnus-trigger') {
      search({ query })
    } else if (item.type === 'result') {
      handleResultNavigation(item.section, item.data)
    } else if (item.type === 'suggestion') {
      handleActionSuggestion(item.data)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (query.trim()) {
      search({ query })
    }
  }

  const handleQuickQuery = (value: string) => {
    setQuery(value)
    search({ query: value })
  }

  const navigateWithState = (path: string, state?: Record<string, any>) => {
    onOpenChange(false)
    navigate(path, state ? { state } : undefined)
  }

  const handleResultNavigation = (sectionKey: string, item: any) => {
    switch (sectionKey) {
      case 'projects':
        navigateWithState(item.id ? `/proyectos/${item.id}` : '/proyectos')
        break
      case 'tasks':
        if (item.proyecto?.id) navigateWithState(`/proyectos/${item.proyecto.id}`, { openTaskId: item.id })
        else if (item.id) navigateWithState('/tareas', { openTaskId: item.id })
        break
      case 'users':
        navigateWithState('/usuarios', { aiUserQuery: item.nombreCompleto || item.email || query })
        break
      default:
        toast.info('Navegación no implementada para este tipo')
    }
  }

  const handleActionSuggestion = (suggestion: AiActionSuggestion) => {
    const label = suggestion.payload.title || suggestion.payload.name || suggestion.entityType
    toast.info('Sugerencia seleccionada: ' + label)
  }

  const handleFeedback = async (type: 'up' | 'down') => {
    if (!results?.queryId || feedbackStatus === 'submitting') return
    setFeedbackGiven(type)
    try {
      await submitFeedback({ queryId: results.queryId, useful: type === 'up' })
      toast.success(type === 'up' ? '¡Gracias por tu feedback!' : 'Gracias por ayudarnos a mejorar')
    } catch (err) {
      toast.error('Error al enviar feedback')
      setFeedbackGiven(null)
    }
  }

  const handleMinimizeResponse = () => {
    clearResults()
    setQuery("")
    toast.success("Respuesta minimizada al historial")
  }

  const handleExpandHistoryItem = (id: string) => {
    const item = queryHistory.find(h => h.id === id)
    if (!item) return

    // If already expanded, just collapse it
    if (item.isExpanded) {
      toggleQueryExpansion(id)
    } else {
      // If collapsed, load and expand it
      loadHistoryItem(id)
    }
  }

  const avatarState = isLoading ? "processing" : (results ? "idle" : "listening")

  // Get greeting based on time
  const getGreeting = () => {
    const hour = getHours(new Date())
    if (hour >= 5 && hour < 12) return "Buenos días"
    if (hour >= 12 && hour < 19) return "Buenas tardes"
    return "Buenas noches"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex flex-col gap-0 p-0 overflow-hidden border-[#FFBF00]/20 shadow-2xl shadow-[#FFBF00]/5 max-w-3xl sm:max-w-3xl h-[650px] max-h-[85vh]">
        <DialogTitle className="sr-only">Magnus AI Search</DialogTitle>
        <DialogDescription className="sr-only">Search and interact with Magnus AI assistant</DialogDescription>
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="relative flex flex-col border-b border-border bg-background/95 backdrop-blur z-10 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-4 p-4">
              <MagnusAvatar state={avatarState} size="md" />
              <div className="flex-1">
                <Input
                  placeholder={isMagnusMode ? "Preguntar a Magnus..." : "Escribe un comando o pregunta..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 border-0 bg-transparent p-0 text-lg font-medium focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                {isMagnusMode && (
                  <span className="text-xs text-[#FFBF00] font-medium animate-pulse">AI Mode</span>
                )}
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full transition-all",
                    isMagnusMode ? "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  disabled={!query.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpRight className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 pb-20 space-y-6">

              {/* LOADING STATE */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in">
                  <MagnusAvatar state="processing" size="lg" />
                  <p className="text-sm font-medium text-[#FFBF00] animate-pulse">{thinkingMsg}</p>
                </div>
              )}

              {/* ACTIVE RESPONSE - Shows as expandable section */}
              {results && !isLoading && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative overflow-hidden rounded-xl border border-[#FFBF00]/30 bg-gradient-to-br from-[#FFBF00]/10 via-[#FFBF00]/5 to-transparent">
                    {/* Response Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#FFBF00]/20 bg-[#FFBF00]/5">
                      <div className="flex items-center gap-3">
                        <MagnusAvatar state="speaking" size="sm" />
                        <div>
                          <p className="text-sm font-bold text-[#FFBF00]">Respuesta de Magnus</p>
                          <p className="text-[10px] text-muted-foreground">
                            Pregunta: "{query}" • {results.processingTimeMs}ms
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-7 w-7 hover:text-green-500", feedbackGiven === 'up' && "text-green-500 bg-green-500/10")}
                          onClick={() => handleFeedback('up')}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-7 w-7 hover:text-red-500", feedbackGiven === 'down' && "text-red-500 bg-red-500/10")}
                          onClick={() => handleFeedback('down')}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setIsActiveResponseExpanded(!isActiveResponseExpanded)}
                        >
                          {isActiveResponseExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-[#FFBF00]"
                          onClick={handleMinimizeResponse}
                          title="Minimizar al historial"
                        >
                          <Minimize2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Response Content */}
                    {isActiveResponseExpanded && (
                      <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <MarkdownRenderer content={results.summary} className="text-sm leading-relaxed text-foreground/90" />

                        {results.resultsByEntity && Object.entries(results.resultsByEntity).map(([key, items]: [string, any[]]) => {
                          if (!items.length) return null
                          return (
                            <div key={key} className="space-y-2 pt-2 border-t border-[#FFBF00]/10">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{key}</h4>
                              <div className="grid gap-1">
                                {items.slice(0, 3).map((item: any) => (
                                  <div
                                    key={item.id}
                                    onClick={() => handleResultNavigation(key, item)}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#FFBF00]/10 cursor-pointer group transition-colors"
                                  >
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-[#FFBF00]" />
                                    <span className="text-foreground/80 group-hover:text-foreground">{item.nombre || item.titulo || item.email}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MAGNUS MODE TRIGGER */}
              {showMagnusTrigger && (
                <div
                  onClick={() => handleSubmit({ preventDefault: () => { } } as any)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-[#FFBF00] bg-[#FFBF00]/10 p-4 cursor-pointer transition-all hover:bg-[#FFBF00]/20",
                    selectedIndex === 0 && "ring-2 ring-[#FFBF00] ring-offset-2 ring-offset-background"
                  )}
                >
                  <MagnusAvatar state="listening" size="sm" />
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[#FFBF00]">Preguntar a Magnus</span>
                    <span className="text-sm text-muted-foreground">"{query}"</span>
                  </div>
                  <Sparkles className="ml-auto h-5 w-5 text-[#FFBF00] animate-pulse" />
                </div>
              )}

              {/* FILTERING RESULTS */}
              {isFilteringMode && Object.keys(filteredActions).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-2">
                    Resultados para "{query}"
                  </h3>
                  {Object.entries(filteredActions).map(([category, modules]) => (
                    <div key={category} className="grid grid-cols-2 gap-2">
                      {modules.map((modulo) => {
                        const Icon = ICON_MAP[modulo.icon] || LayoutGrid
                        const isSelected = flatItems.findIndex(item => item.type === 'module' && item.data === modulo) === selectedIndex
                        return (
                          <div
                            key={modulo.id}
                            onClick={() => handleItemSelect({ type: 'module', data: modulo })}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 hover:bg-accent/50 hover:border-accent cursor-pointer transition-all",
                              isSelected && "border-[#FFBF00]/50 bg-[#FFBF00]/5"
                            )}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{modulo.nombre}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">{modulo.descripcion}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}

              {isFilteringMode && Object.keys(filteredActions).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron resultados para "{query}"</p>
                  <p className="text-xs mt-1">Prueba con una pregunta para Magnus</p>
                </div>
              )}

              {/* ALWAYS VISIBLE SECTIONS */}
              {!isLoading && (
                <div className="space-y-6">
                  {/* Divider if there's active content above */}
                  {(results || showMagnusTrigger || isFilteringMode) && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                          Navegación Rápida
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dynamic AI Suggestions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-[#FFBF00]" />
                        Sugerencias Inteligentes
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {getGreeting()} • {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dynamicSuggestions.map((suggestion, i) => {
                        const style = categoryStyles[suggestion.category]
                        const Icon = suggestion.icon
                        return (
                          <button
                            key={i}
                            onClick={() => handleQuickQuery(suggestion.label)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5 text-left transition-all hover:border-transparent",
                              style.bg
                            )}
                          >
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-background/50", style.text)}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground/90 truncate">{suggestion.label}</p>
                              <p className={cn("text-[10px] font-medium", style.text)}>{style.label}</p>
                            </div>
                            <Zap className={cn("h-3 w-3 shrink-0", style.text)} />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Query History - Now after suggestions */}
                  {queryHistory.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Historial de Consultas ({queryHistory.length})
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-destructive"
                          onClick={clearHistory}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Limpiar
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {queryHistory.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "rounded-lg border transition-all",
                              item.isExpanded
                                ? "border-[#FFBF00]/30 bg-[#FFBF00]/5"
                                : "border-border/50 bg-card/30 hover:border-border"
                            )}
                          >
                            <div
                              className="flex items-center justify-between px-3 py-2 cursor-pointer"
                              onClick={() => handleExpandHistoryItem(item.id)}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <History className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium truncate">{item.query}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: es })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {item.feedbackGiven && (
                                  <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded",
                                    item.feedbackGiven === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                  )}>
                                    {item.feedbackGiven === 'up' ? '👍' : '👎'}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFromHistory(item.id)
                                  }}
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                                {item.isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </div>
                            </div>

                            {item.isExpanded && (
                              <div className="px-3 pb-3 pt-1 border-t border-border/50 animate-in fade-in slide-in-from-top-1">
                                <MarkdownRenderer content={item.response} className="text-sm leading-relaxed text-foreground/80" />
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                                  <span className="text-[10px] text-muted-foreground">¿Fue útil?</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6", item.feedbackGiven === 'up' && "text-green-500")}
                                    onClick={() => submitHistoryFeedback(item.id, true)}
                                    disabled={!!item.feedbackGiven}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6", item.feedbackGiven === 'down' && "text-red-500")}
                                    onClick={() => submitHistoryFeedback(item.id, false)}
                                    disabled={!!item.feedbackGiven}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navegación Rápida - Modules */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-2">Módulos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULOS_PERMISOS.map((modulo) => {
                        const Icon = ICON_MAP[modulo.icon] || LayoutGrid
                        return (
                          <div
                            key={modulo.id}
                            onClick={() => handleItemSelect({ type: 'module', data: modulo })}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 hover:bg-accent/50 hover:border-accent cursor-pointer transition-all",
                              flatItems.findIndex(item => item.type === 'module' && item.data === modulo) === selectedIndex && "border-[#FFBF00]/50 bg-[#FFBF00]/5"
                            )}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{modulo.nombre}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">{modulo.descripcion}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
            <div className="flex gap-3">
              <span>Enter: Seleccionar</span>
              <span>Esc: {results ? 'Minimizar' : 'Cerrar'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FFBF00] animate-pulse" />
              <span>Magnus System Online</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
