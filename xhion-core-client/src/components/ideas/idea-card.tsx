"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, MessageSquare, Sparkles, MoreVertical } from "lucide-react"

interface IdeaCardProps {
  idea: {
    id: number
    title: string
    description: string
    category: string
    status: string
    votes: number
    comments: number
    author: { name: string; avatar: string }
    aiScore: number
    aiInsight: string
    tags: string[]
    createdAt: string
  }
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "feature":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "improvement":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "innovation":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "evaluating":
        return "border-amber-500/20 bg-amber-500/10 text-amber-600"
      case "approved":
        return "border-green-500/20 bg-green-500/10 text-green-600"
      case "in-development":
        return "border-blue-500/20 bg-blue-500/10 text-blue-600"
      case "implemented":
        return "border-green-500/20 bg-green-500/10 text-green-600"
      case "rejected":
        return "border-red-500/20 bg-red-500/10 text-red-600"
      default:
        return "border-border bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "evaluating":
        return "En evaluación"
      case "approved":
        return "Aprobada"
      case "in-development":
        return "En desarrollo"
      case "implemented":
        return "Implementada"
      case "rejected":
        return "Rechazada"
      default:
        return status
    }
  }

  return (
    <div className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground leading-tight">{idea.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{idea.description}</p>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={getCategoryColor(idea.category)}>
          {idea.category === "feature"
            ? "Nueva funcionalidad"
            : idea.category === "improvement"
              ? "Mejora"
              : "Innovación"}
        </Badge>
        <Badge variant="outline" className={getStatusColor(idea.status)}>
          {getStatusLabel(idea.status)}
        </Badge>
        {idea.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* AI Insight */}
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-medium text-primary">Análisis IA</span>
              <Badge variant="secondary" className="text-xs">
                Score: {idea.aiScore}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{idea.aiInsight}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={idea.author.avatar || "/placeholder.svg"} alt={idea.author.name} />
            <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{idea.author.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{idea.createdAt}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">{idea.votes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs">{idea.comments}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
