"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertTriangle, Target, Zap, RefreshCw, Brain } from "lucide-react"
import { PageHeaderSimple } from "@/components/layout/PageHeader"

export function AIInsightsView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeaderSimple
        icon={Sparkles}
        title="IA Insights"
        subtitle="Análisis predictivo y recomendaciones inteligentes para tus proyectos"
        actions={
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar análisis
          </Button>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main insight */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">Resumen Ejecutivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Basado en el análisis de los últimos 30 días, tu equipo está operando al 87% de eficiencia. Se
                detectaron 3 proyectos con riesgo de retraso y 5 oportunidades de optimización. La IA recomienda
                redistribuir 2 tareas del proyecto "Rediseño Web" para equilibrar la carga de trabajo.
              </p>
            </div>
          </div>
        </div>

        {/* Insights grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risk prediction */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Predicción de Riesgos</h4>
                <p className="text-xs text-muted-foreground mt-1">Proyectos con posibles retrasos</p>
              </div>
              <Badge variant="destructive">3 alertas</Badge>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Rediseño Web Corporativo</p>
                  <Badge variant="destructive" className="text-xs">
                    Alto riesgo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Probabilidad de retraso: 78%. Recomendación: Reasignar 2 tareas de María López a Carlos Ruiz.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">App Móvil iOS</p>
                  <Badge variant="outline" className="text-xs border-amber-500/20 bg-amber-500/10 text-amber-600">
                    Riesgo medio
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Probabilidad de retraso: 45%. Recomendación: Adelantar reunión de revisión 2 días.
                </p>
              </div>
            </div>
          </div>

          {/* Performance optimization */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <Zap className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Optimización de Rendimiento</h4>
                <p className="text-xs text-muted-foreground mt-1">Oportunidades de mejora detectadas</p>
              </div>
              <Badge variant="default">5 sugerencias</Badge>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Redistribución de carga</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ana García tiene 12 tareas activas vs 6 del promedio. Redistribuir 3 tareas podría mejorar la
                  eficiencia en 15%.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Automatización de tareas</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Se detectaron 8 tareas repetitivas que podrían automatizarse, ahorrando 4.5 horas semanales.
                </p>
              </div>
            </div>
          </div>

          {/* Team productivity */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Productividad del Equipo</h4>
                <p className="text-xs text-muted-foreground mt-1">Análisis de rendimiento</p>
              </div>
              <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
                +12% vs mes anterior
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Velocidad de completado</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El equipo completó 47 tareas esta semana, 12% más que el promedio. Mejor día: Miércoles con 15 tareas.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Tiempo de respuesta</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tiempo promedio de respuesta a tareas: 2.3 horas. 18% mejor que el mes anterior.
                </p>
              </div>
            </div>
          </div>

          {/* Strategic recommendations */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Target className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Recomendaciones Estratégicas</h4>
                <p className="text-xs text-muted-foreground mt-1">Acciones sugeridas por IA</p>
              </div>
              <Badge variant="secondary">4 acciones</Badge>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Contratar desarrollador frontend</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  El análisis de carga de trabajo sugiere que un desarrollador frontend adicional reduciría los tiempos
                  de entrega en 25%.
                </p>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Ver análisis completo
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground mb-2">Implementar sprints de 1 semana</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Los datos históricos sugieren que sprints más cortos podrían mejorar la agilidad del equipo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI powered actions */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">Acciones Automáticas Disponibles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La IA puede ejecutar estas acciones automáticamente para optimizar tu flujo de trabajo
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Redistribuir tareas automáticamente
                </Button>
                <Button variant="outline" size="sm">
                  Reprogramar reuniones conflictivas
                </Button>
                <Button variant="outline" size="sm">
                  Generar reporte de riesgos
                </Button>
                <Button variant="outline" size="sm">
                  Sugerir prioridades para mañana
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
