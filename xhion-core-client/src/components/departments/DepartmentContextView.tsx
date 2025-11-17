import {
  FileText,
  Plus,
  Edit,
  Target,
  CheckSquare,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { type ContextoDepartamento } from "@/services/conocimientoService";

interface DepartmentContextViewProps {
  contexto?: ContextoDepartamento;
  departamentoId: string;
  departamentoNombre: string;
  onEdit: () => void;
  onCreate: () => void;
  variant?: "default" | "condensed";
}

export function DepartmentContextView({
  contexto,
  departamentoId: _departamentoId,
  departamentoNombre,
  onEdit,
  onCreate,
  variant = "default",
}: DepartmentContextViewProps) {
  const sections = [
    {
      title: "Funciones",
      icon: Lightbulb,
      content: contexto?.funciones,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      description: "Actividades principales del departamento",
    },
    {
      title: "Responsabilidades",
      icon: CheckSquare,
      content: contexto?.responsabilidades,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
      description: "Obligaciones y compromisos del equipo",
    },
    {
      title: "Procesos Clave",
      icon: TrendingUp,
      content: contexto?.procesosClave,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      description: "Flujos de trabajo y procedimientos importantes",
    },
    {
      title: "Objetivos",
      icon: Target,
      content: contexto?.objetivos,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      description: "Metas y resultados esperados",
    },
    {
      title: "KPIs",
      icon: BarChart3,
      content: contexto?.kpis,
      color: "text-pink-500",
      bgColor: "bg-pink-100 dark:bg-pink-900",
      description: "Indicadores clave de rendimiento",
    },
  ];

  if (!contexto) {
    if (variant === "condensed") {
      return (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Contexto pendiente</span>
            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={onCreate}>
              Configurar
            </Button>
          </div>
          <p>
            Define funciones, objetivos y KPIs del departamento {departamentoNombre} para habilitar la
            asistencia contextual.
          </p>
        </div>
      );
    }

    return (
      <EmptyState
        icon={FileText}
        title="Base de Conocimiento no configurada"
        description={`Define el contexto organizacional del departamento ${departamentoNombre} para que la IA pueda proporcionar asistencia más precisa y personalizada.`}
        actionLabel="Configurar Contexto"
        onAction={onCreate}
        secondaryActionLabel="¿Qué es el contexto?"
        onSecondaryAction={() => {
          console.log("Mostrar ayuda");
        }}
      />
    );
  }

  if (variant === "condensed") {
    const filledSections = sections.filter((s) => s.content);
    const completionRate = (filledSections.length / sections.length) * 100;

    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Base de conocimiento</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{Math.round(completionRate)}%</span>
            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={onEdit}>
              Editar
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.title} className="flex items-start gap-3">
              <section.icon className={`h-3.5 w-3.5 ${section.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-[12px] uppercase tracking-wide">
                    {section.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {section.content ? "Definido" : "Pendiente"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {section.content || "Sin información capturada"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Última actualización: {new Date(contexto.fechaActualizacion).toLocaleDateString("es-ES")}
        </p>
      </div>
    );
  }

  const filledSections = sections.filter((s) => s.content);
  const emptySections = sections.filter((s) => !s.content);
  const completionRate = (filledSections.length / sections.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Base de Conocimiento</h2>
          <p className="text-sm text-muted-foreground">
            Contexto organizacional para asistencia de IA
          </p>
        </div>
        <Button onClick={onEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Contexto
        </Button>
      </div>

      {/* Progreso de Completitud */}
      <Card className="border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Completitud del Contexto</h3>
              <p className="text-sm text-muted-foreground">
                {filledSections.length} de {sections.length} secciones completadas
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{Math.round(completionRate)}%</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        {emptySections.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Secciones pendientes: {emptySections.map((s) => s.title).join(", ")}
          </p>
        )}
      </Card>

      {/* Secciones de Contexto */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const hasContent = !!section.content;

          return (
            <Card
              key={section.title}
              className={`border-border ${
                hasContent ? "bg-card" : "bg-muted/30 border-dashed"
              } p-6`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    {hasContent ? (
                      <Badge variant="outline" className="text-xs">
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
                  {hasContent ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{section.content}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      <span>Haz clic en "Editar Contexto" para agregar esta información</span>
                    </div>
                  )}
                </div>
              </div>
              {index < sections.length - 1 && <Separator className="mt-4" />}
            </Card>
          );
        })}
      </div>

      {/* Información adicional */}
      <Card className="border-border bg-muted/30 p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">¿Por qué es importante el contexto?</h4>
            <p className="text-sm text-muted-foreground">
              La Base de Conocimiento permite que la IA comprenda mejor las necesidades específicas de tu
              departamento. Con esta información, puede:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Generar sugerencias más relevantes y personalizadas</li>
              <li>Priorizar tareas según los objetivos del departamento</li>
              <li>Identificar riesgos y oportunidades de mejora</li>
              <li>Proporcionar análisis alineados con tus KPIs</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Metadatos */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Última actualización:{" "}
          {new Date(contexto.fechaActualizacion).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>ID: {contexto.id.slice(0, 8)}...</span>
      </div>
    </div>
  );
}
