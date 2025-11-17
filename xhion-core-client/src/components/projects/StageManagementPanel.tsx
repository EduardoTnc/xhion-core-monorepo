import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, CheckCircle2, Edit3, ListChecks, PlusCircle, Trash2 } from "lucide-react";
import { type Etapa } from "@/services/projectService";
import { type Tarea } from "@/services/taskService";
import { cn } from "@/lib/utils";

interface StageManagementPanelProps {
  etapas: Etapa[];
  tareas: Tarea[];
  onCreateStage: () => void;
  onEditStage: (etapa: Etapa) => void;
  onDeleteStage: (etapa: Etapa) => void;
}

const isHexColor = (value?: string | null) => {
  if (!value || typeof value !== "string") return false;
  return /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value.trim());
};

const hexToRgba = (hex: string, alpha = 0.15) => {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (sanitized.length === 4) {
    const [r, g, b] = sanitized.split("");
    sanitized = `${r}${r}${g}${g}${b}${b}`;
  } else if (sanitized.length === 8) {
    sanitized = sanitized.slice(0, 6);
  }

  const parsed = parseInt(sanitized, 16);
  if (Number.isNaN(parsed)) return `rgba(42, 43, 48, ${alpha})`;

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function StageManagementPanel({ etapas, tareas, onCreateStage, onEditStage, onDeleteStage }: StageManagementPanelProps) {
  const stageStats = useMemo(() => {
    return etapas.map((etapa) => {
      const tareasCount = tareas.filter((tarea) => tarea.etapa?.id === etapa.id).length;
      return {
        ...etapa,
        tareasCount,
      };
    });
  }, [etapas, tareas]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Gestión de etapas</p>
          <p className="text-xs text-muted-foreground">
            {etapas.length === 0 ? "Sin etapas registradas" : `${etapas.length} etapas activas`}
          </p>
        </div>
        <Button size="sm" onClick={onCreateStage} className="inline-flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Nueva etapa
        </Button>
      </div>

      {stageStats.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/50 bg-background/70 px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no hay etapas registradas. Crea la primera para organizar tu flujo.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stageStats.map((stage) => {
            const hasHexColor = isHexColor(stage.color);
            const accentHex = hasHexColor ? stage.color! : undefined;
            const accentClass = !hasHexColor && stage.color ? stage.color : undefined;
            return (
              <div
                key={stage.id}
                className={cn(
                  "rounded-2xl border border-border/60 bg-background/70 p-3",
                  accentClass && "text-white"
                )}
                style={
                  hasHexColor && accentHex
                    ? {
                        borderColor: hexToRgba(accentHex, 0.4),
                        backgroundColor: hexToRgba(accentHex, 0.12),
                      }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stage.nombre}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Orden {stage.orden}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditStage(stage)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteStage(stage)}
                        >
                          Eliminar etapa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5" />
                    {stage.tareasCount} {stage.tareasCount === 1 ? "tarea" : "tareas"}
                  </span>
                  {stage.fechaInicio && stage.fechaFin && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(stage.fechaInicio).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      &nbsp;→&nbsp;
                      {new Date(stage.fechaFin).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                  {stage.estado && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> {stage.estado.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
