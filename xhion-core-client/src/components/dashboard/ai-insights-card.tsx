import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertTriangle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const insights = [
  {
    id: 1,
    type: "warning",
    icon: AlertTriangle,
    text: 'El proyecto "Mobile App" tiene 3 tareas bloqueadas que requieren atención.',
    priority: "high",
  },
  {
    id: 2,
    type: "success",
    icon: TrendingUp,
    text: "Tu productividad aumentó un 23% esta semana comparado con la anterior.",
    priority: "medium",
  },
  {
    id: 3,
    type: "info",
    icon: Sparkles,
    text: "Sugerencia: Considera reprogramar 2 reuniones para optimizar tu tiempo de desarrollo.",
    priority: "low",
  },
]

export function AIInsightsCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">IA Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <div key={insight.id} className="flex gap-3 rounded-lg border border-border p-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    insight.type === "warning"
                      ? "bg-destructive/10 text-destructive"
                      : insight.type === "success"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed">{insight.text}</p>
                  <Badge
                    variant={
                      insight.priority === "high"
                        ? "destructive"
                        : insight.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
