"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  TrendingUp, 
  Sparkles, 
  MessageSquare, 
  Award,
  Target,
  Zap,
  Gift,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function IdeasTutorial() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Lightbulb className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Panel de Ideas y Recomendaciones</CardTitle>
              <CardDescription className="text-base mt-1">
                Tu voz importa. Comparte ideas innovadoras y recomendaciones que impulsen el crecimiento de la empresa.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">¿Por qué es importante?</h4>
                <p className="text-sm text-muted-foreground">
                  Las mejores innovaciones provienen de quienes trabajan día a día en los procesos. 
                  Tu experiencia es invaluable para mejorar nuestra empresa.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Gift className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Sistema de Reconocimientos</h4>
                <p className="text-sm text-muted-foreground">
                  Las ideas implementadas que generen impacto positivo son reconocidas con certificados, 
                  días de vacaciones, capacitaciones premium y oportunidades de crecimiento profesional.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tipos de Contribuciones
          </CardTitle>
          <CardDescription>
            Elige la categoría que mejor describa tu aportación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feature */}
            <div className="p-4 rounded-lg border border-chart-1/20 bg-chart-1/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                  Nueva Funcionalidad
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Propuestas de nuevas características o herramientas que no existen actualmente.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Ejemplos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Sistema de notificaciones push en tiempo real</li>
                  <li>• App móvil para gestión de tareas</li>
                  <li>• Dashboard personalizable por usuario</li>
                  <li>• Integración con herramientas externas (Slack, Teams)</li>
                </ul>
              </div>
            </div>

            {/* Improvement */}
            <div className="p-4 rounded-lg border border-chart-2/20 bg-chart-2/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                  Mejora
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optimizaciones de funcionalidades existentes para hacerlas más eficientes o fáciles de usar.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Ejemplos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Simplificar el proceso de creación de proyectos</li>
                  <li>• Mejorar la velocidad de carga de reportes</li>
                  <li>• Rediseñar interfaz de filtros para mayor claridad</li>
                  <li>• Agregar atajos de teclado para acciones comunes</li>
                </ul>
              </div>
            </div>

            {/* Innovation */}
            <div className="p-4 rounded-lg border border-chart-3/20 bg-chart-3/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                  Innovación
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ideas disruptivas que pueden cambiar significativamente cómo trabajamos o competimos.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Ejemplos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• IA para predicción de riesgos en proyectos</li>
                  <li>• Asistente virtual con procesamiento de lenguaje natural</li>
                  <li>• Análisis predictivo de tendencias del mercado</li>
                  <li>• Automatización completa de reportes con IA</li>
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Recomendación
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sugerencias sobre procesos, políticas, cultura organizacional o mejores prácticas.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Ejemplos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Implementar metodología ágil en departamento X</li>
                  <li>• Programa de mentoría entre equipos</li>
                  <li>• Política de trabajo remoto flexible</li>
                  <li>• Capacitaciones mensuales en nuevas tecnologías</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proceso y Recompensas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Proceso de Evaluación y Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Cómo funciona */}
            <AccordionItem value="proceso">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  ¿Cómo funciona el proceso?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">Envío de Idea</p>
                      <p className="text-xs text-muted-foreground">
                        Completa el formulario con título, descripción, categoría y tags relevantes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Evaluación Inicial</p>
                      <p className="text-xs text-muted-foreground">
                        Un comité revisa la viabilidad técnica, impacto potencial y alineación estratégica.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-600 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Votación Colaborativa</p>
                      <p className="text-xs text-muted-foreground">
                        Los empleados votan por las ideas que consideran más valiosas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium">Aprobación e Implementación</p>
                      <p className="text-xs text-muted-foreground">
                        Las ideas aprobadas pasan a desarrollo y se asignan recursos.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reconocimientos */}
            <AccordionItem value="reconocimientos">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-500" />
                  ¿Qué reconocimientos puedo recibir?
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Impacto Alto (Mejora significativa &gt; 30% eficiencia)
                      </p>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• 🏆 Reconocimiento en reunión general de empresa</li>
                      <li>• 📜 Certificado de "Innovador del Año"</li>
                      <li>• 🌴 Días adicionales de vacaciones (3-5 días)</li>
                      <li>• 🎓 Acceso prioritario a conferencias y capacitaciones premium</li>
                      <li>• 🎯 Participación en proyectos estratégicos de alto impacto</li>
                      <li>• 📸 Entrevista destacada en blog/redes de la empresa</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        Impacto Medio (Mejora notable 10-30%)
                      </p>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• 📰 Mención destacada en newsletter interna</li>
                      <li>• 🏅 Badge digital de "Innovador" en perfil</li>
                      <li>• 📚 Prioridad en capacitaciones y cursos</li>
                      <li>• 🎤 Oportunidad de presentar la idea en reuniones de equipo</li>
                      <li>• 🌟 Puntos para programa de beneficios corporativos</li>
                      <li>• 🎁 Gift card de tecnología o libros ($100-200)</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        Toda Contribución (Mejoras incrementales)
                      </p>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• 👏 Reconocimiento público en Slack/Teams</li>
                      <li>• ⭐ Puntos acumulables para programa de beneficios</li>
                      <li>• 📝 Mención en perfil de empleado</li>
                      <li>• 🎯 Participación en comité de innovación</li>
                      <li>• 🤝 Networking con líderes de la empresa</li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground italic">
                      💡 <span className="font-semibold text-foreground">Recuerda:</span> El mayor reconocimiento es ver tu idea implementada 
                      y saber que contribuiste a mejorar la empresa. Todas las ideas son valoradas y revisadas con atención.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Consejos */}
            <AccordionItem value="consejos">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  Consejos para una buena idea
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Sé específico:</span> Describe claramente el problema y la solución propuesta.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Cuantifica el impacto:</span> Menciona ahorros estimados, tiempo reducido o mejoras en productividad.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Usa ejemplos:</span> Referencia casos similares o empresas que lo hayan implementado.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Agrega tags:</span> Facilita que otros encuentren y apoyen tu idea.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Sé realista:</span> Considera recursos, tiempo y viabilidad técnica.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">¿Tienes una idea?</h3>
              <p className="text-sm text-muted-foreground">
                No esperes más. Comparte tu visión y ayúdanos a construir una mejor empresa juntos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
