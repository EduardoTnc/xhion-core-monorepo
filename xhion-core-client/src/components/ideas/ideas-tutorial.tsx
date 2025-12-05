"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Lightbulb,
  TrendingUp,
  Sparkles,
  ThumbsUp,
  Award,
  Target,
  Zap,
  Gift,
  CheckCircle,
  Clock,
  Rocket,
  Bot,
  ArrowRight,
} from "lucide-react"

export function IdeasTutorial() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-4">
          <Lightbulb className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ideas y Recomendaciones</h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Tu voz importa. Comparte ideas innovadoras y recomendaciones que impulsen el crecimiento de la empresa.
        </p>
      </div>

      {/* Process Flow Infographic */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
            <h2 className="text-lg font-semibold text-center mb-6">¿Cómo funciona?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                  1
                </div>
                <Lightbulb className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Comparte tu idea</h3>
                <p className="text-xs text-muted-foreground mt-1">Describe el problema y tu solución</p>
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-lg mb-3">
                  2
                </div>
                <Clock className="h-8 w-8 text-amber-500 mb-2" />
                <h3 className="font-semibold text-sm">Evaluación</h3>
                <p className="text-xs text-muted-foreground mt-1">El comité revisa viabilidad e impacto</p>
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg mb-3">
                  3
                </div>
                <Rocket className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-sm">Desarrollo</h3>
                <p className="text-xs text-muted-foreground mt-1">Tu idea se implementa</p>
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg mb-3">
                  4
                </div>
                <Award className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-sm">Reconocimiento</h3>
                <p className="text-xs text-muted-foreground mt-1">Recibes recompensas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <CardContent className="p-4 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm">Nueva Funcionalidad</h3>
            <p className="text-xs text-muted-foreground mt-1">Características que no existen</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="p-4 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-sm">Mejora</h3>
            <p className="text-xs text-muted-foreground mt-1">Optimizar lo existente</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardContent className="p-4 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-semibold text-sm">Innovación</h3>
            <p className="text-xs text-muted-foreground mt-1">Ideas disruptivas</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 mb-2">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-sm">Recomendación</h3>
            <p className="text-xs text-muted-foreground mt-1">Procesos y políticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Recompensas por Impacto</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High Impact */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-sm text-green-600">Alto Impacto</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>🏆 Reconocimiento público</li>
                <li>🌴 Días de vacaciones extra</li>
                <li>🎓 Capacitaciones premium</li>
              </ul>
            </div>

            {/* Medium Impact */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-sm text-blue-600">Impacto Medio</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>📰 Mención en newsletter</li>
                <li>🏅 Badge digital</li>
                <li>🎁 Gift cards</li>
              </ul>
            </div>

            {/* All Contributions */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-sm text-amber-600">Toda Contribución</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>⭐ Puntos acumulables</li>
                <li>👏 Reconocimiento</li>
                <li>🤝 Networking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Consejos Pro</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium">Sé específico</span>
                <p className="text-xs text-muted-foreground">Describe problema y solución con claridad</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium">Cuantifica el impacto</span>
                <p className="text-xs text-muted-foreground">Menciona ahorros o mejoras estimadas</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium">Usa Magnus IA</span>
                <p className="text-xs text-muted-foreground">Genera ideas con ayuda de la inteligencia artificial</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium">Agrega tags</span>
                <p className="text-xs text-muted-foreground">Facilita que otros encuentren tu idea</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
