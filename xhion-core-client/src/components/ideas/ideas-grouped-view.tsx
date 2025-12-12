"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ThumbsUp,
    MessageSquare,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Clock,
    CheckCircle,
    Rocket,
    ShieldCheck,
    XCircle,
} from "lucide-react"
// TanStack Query hooks - replacing useIdeasStore
import { useVoteIdea } from "@/hooks/queries"
import type { Idea } from "@/services/ideasService"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

interface CompactIdeaCardProps {
    idea: Idea
    onSelect: () => void
    isSelected: boolean
}

export function CompactIdeaCard({ idea, onSelect, isSelected }: CompactIdeaCardProps) {
    const voteIdeaMutation = useVoteIdea()
    const [localIdea, setLocalIdea] = useState(idea)

    const handleVote = async (e: React.MouseEvent) => {
        e.stopPropagation()

        const wasVoted = localIdea.hasVoted
        setLocalIdea(prev => ({
            ...prev,
            hasVoted: !prev.hasVoted,
            _count: {
                ...prev._count,
                votos: prev.hasVoted ? prev._count.votos - 1 : prev._count.votos + 1
            }
        }))

        try {
            await voteIdeaMutation.mutateAsync(localIdea.id)
        } catch {
            setLocalIdea(prev => ({
                ...prev,
                hasVoted: wasVoted,
                _count: {
                    ...prev._count,
                    votos: wasVoted ? prev._count.votos + 1 : prev._count.votos - 1
                }
            }))
            toast.error("Error al votar")
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Feature": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "Improvement": return "bg-green-500/10 text-green-600 border-green-500/20"
            case "Innovation": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
            case "Recommendation": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            Feature: "Funcionalidad",
            Improvement: "Mejora",
            Innovation: "Innovación",
            Recommendation: "Recomendación",
        }
        return labels[category] || category
    }

    const formatDate = (date: string) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
    }

    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <div
            onClick={onSelect}
            className={`
                p-3 rounded-lg border transition-all cursor-pointer
                ${isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                }
            `}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={localIdea.autor.avatarUrl} />
                    <AvatarFallback className="text-xs">{getInitials(localIdea.autor.nombreCompleto)}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">{localIdea.titulo}</h4>
                        {localIdea.aiScore && (
                            <Badge variant="secondary" className="text-[10px] gap-0.5 flex-shrink-0 px-1.5">
                                <Sparkles className="h-2.5 w-2.5" />
                                {localIdea.aiScore}
                            </Badge>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {localIdea.descripcion}
                    </p>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${getCategoryColor(localIdea.categoria)} text-[10px] px-1.5 py-0`}>
                                {getCategoryLabel(localIdea.categoria)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{formatDate(localIdea.fechaCreacion)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleVote}
                                className={`flex items-center gap-1 text-xs transition-colors ${localIdea.hasVoted ? "text-primary" : "text-muted-foreground hover:text-primary"
                                    }`}
                            >
                                <ThumbsUp className="h-3 w-3" />
                                <span>{localIdea._count.votos}</span>
                            </button>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span>{localIdea._count.comentarios}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expand indicator */}
                <ChevronRight className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
            </div>
        </div>
    )
}

// Status group component
interface StatusGroupConfig {
    status: string
    label: string
    icon: React.ReactNode
    color: string
    bgColor: string
}

const STATUS_GROUPS: StatusGroupConfig[] = [
    { status: "Evaluating", label: "En Evaluación", icon: <Clock className="h-4 w-4" />, color: "text-amber-600", bgColor: "bg-amber-500" },
    { status: "Approved", label: "Aprobadas", icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-500" },
    { status: "InDevelopment", label: "En Desarrollo", icon: <Rocket className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-500" },
    { status: "Implemented", label: "Implementadas", icon: <ShieldCheck className="h-4 w-4" />, color: "text-emerald-600", bgColor: "bg-emerald-500" },
    { status: "Rejected", label: "Rechazadas", icon: <XCircle className="h-4 w-4" />, color: "text-red-600", bgColor: "bg-red-500" },
]

interface IdeasGroupedViewProps {
    ideas: Idea[]
    onSelectIdea: (ideaId: string) => void
    selectedIdeaId: string | null
    searchQuery: string
    filterCategory: string
}

export function IdeasGroupedView({ ideas, onSelectIdea, selectedIdeaId, searchQuery, filterCategory }: IdeasGroupedViewProps) {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

    const toggleGroup = (status: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(status)) {
                newSet.delete(status)
            } else {
                newSet.add(status)
            }
            return newSet
        })
    }

    // Filter and group ideas
    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = !searchQuery ||
            idea.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === "all" || idea.categoria === filterCategory
        return matchesSearch && matchesCategory
    })

    const groupedIdeas = STATUS_GROUPS.map(group => ({
        ...group,
        ideas: filteredIdeas.filter(idea => idea.estado === group.status)
    })).filter(group => group.ideas.length > 0)

    if (filteredIdeas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No hay ideas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron ideas con los filtros aplicados</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {groupedIdeas.map(group => (
                <div key={group.status} className="rounded-lg border border-border overflow-hidden">
                    {/* Group Header - clickable to collapse/expand */}
                    <button
                        onClick={() => toggleGroup(group.status)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`flex h-6 w-6 items-center justify-center rounded ${group.bgColor} text-white`}>
                                {group.icon}
                            </div>
                            <span className={`font-medium text-sm ${group.color}`}>{group.label}</span>
                            <Badge variant="secondary" className="text-xs px-1.5">
                                {group.ideas.length}
                            </Badge>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${collapsedGroups.has(group.status) ? "-rotate-90" : ""
                                }`}
                        />
                    </button>

                    {/* Group Content */}
                    {!collapsedGroups.has(group.status) && (
                        <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                            {group.ideas.map(idea => (
                                <CompactIdeaCard
                                    key={idea.id}
                                    idea={idea}
                                    isSelected={selectedIdeaId === idea.id}
                                    onSelect={() => onSelectIdea(idea.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
