import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle2, Edit3, ListChecks, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { type Etapa } from "@/services/projectService";
import { type Tarea } from "@/services/taskService";
import { cn } from "@/lib/utils";

export type StageUpdateInput = {
  nombre?: string;
  descripcion?: string | null;
  color?: string | null;
  orden?: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado?: Etapa["estado"];
};

type GradientPresetMap = Record<string, { label: string; stops: readonly string[] }>;

interface StageManagementPanelProps {
  etapas: Etapa[];
  tareas: Tarea[];
  stageColorMap?: Record<string, string>;
  onCreateStage: () => void;
  onUpdateStage: (etapaId: string, data: StageUpdateInput) => Promise<void> | void;
  onDeleteStage: (etapa: Etapa) => void;
  gradientPresetKey: string;
  gradientPresets: GradientPresetMap;
  onGradientPresetChange: (preset: string) => void;
  stagesEnabled: boolean;
  onToggleStages: (enabled: boolean) => Promise<void> | void;
}

const STATUS_OPTIONS: { value: Etapa["estado"]; label: string }[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En_Progreso", label: "En progreso" },
  { value: "Completada", label: "Completada" },
];

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

type InlineStageForm = {
  nombre: string;
  descripcion: string;
  color: string;
  orden: number | string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: Etapa["estado"];
};

const buildFormFromStage = (stage: Etapa): InlineStageForm => ({
  nombre: stage.nombre,
  descripcion: stage.descripcion ?? "",
  color: stage.color ?? "#4f46e5",
  orden: stage.orden,
  fechaInicio: stage.fechaInicio ? stage.fechaInicio.slice(0, 10) : undefined,
  fechaFin: stage.fechaFin ? stage.fechaFin.slice(0, 10) : undefined,
  estado: stage.estado,
});

export function StageManagementPanel({
  etapas,
  tareas,
  stageColorMap,
  onCreateStage,
  onUpdateStage,
  onDeleteStage,
  gradientPresetKey,
  gradientPresets,
  onGradientPresetChange,
  stagesEnabled,
  onToggleStages,
}: StageManagementPanelProps) {
  const stageStats = useMemo(() => {
    return etapas.map((etapa) => {
      const tareasCount = tareas.filter((tarea) => tarea.etapa?.id === etapa.id).length;
      return {
        ...etapa,
        tareasCount,
      };
    });
  }, [etapas, tareas]);

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, InlineStageForm>>({});
  const [savingStageId, setSavingStageId] = useState<string | null>(null);
  const [togglingStages, setTogglingStages] = useState(false);

  const ensureForm = (stage: Etapa) => {
    if (!forms[stage.id]) {
      setForms((prev) => ({ ...prev, [stage.id]: buildFormFromStage(stage) }));
      return buildFormFromStage(stage);
    }
    return forms[stage.id];
  };

  const handleFieldChange = (stage: Etapa, field: keyof InlineStageForm, value: string | number) => {
    setForms((prev) => ({
      ...prev,
      [stage.id]: {
        ...(prev[stage.id] ?? buildFormFromStage(stage)),
        [field]: value,
      },
    }));
  };

  const handleSaveStage = async (stage: Etapa) => {
    const form = forms[stage.id] ?? buildFormFromStage(stage);
    const payload: StageUpdateInput = {
      nombre: form.nombre.trim() || stage.nombre,
      descripcion: form.descripcion.trim() || null,
      color: form.color || null,
      orden: Number(form.orden) || stage.orden,
      fechaInicio: form.fechaInicio ? new Date(form.fechaInicio).toISOString() : null,
      fechaFin: form.fechaFin ? new Date(form.fechaFin).toISOString() : null,
      estado: form.estado,
    };

    try {
      setSavingStageId(stage.id);
      await onUpdateStage(stage.id, payload);
      setEditingStageId(null);
    } finally {
      setSavingStageId(null);
    }
  };

  const handleToggleStages = async (enabled: boolean) => {
    try {
      setTogglingStages(true);
      await onToggleStages(enabled);
    } finally {
      setTogglingStages(false);
    }
  };

  const renderGradientSelector = () => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Degradado</span>
      <div className="flex flex-wrap items-center gap-1">
        {Object.entries(gradientPresets).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            className={cn(
              "relative inline-flex h-7 min-w-[58px] items-center justify-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white",
              gradientPresetKey === key ? "ring-2 ring-offset-2 ring-offset-background ring-primary/60" : "opacity-70 hover:opacity-100"
            )}
            style={{
              backgroundImage: `linear-gradient(120deg, ${preset.stops[0]}, ${preset.stops[preset.stops.length - 1]})`,
              filter: !stagesEnabled ? "grayscale(0.6)" : undefined,
            }}
            disabled={!stagesEnabled || togglingStages}
            onClick={() => onGradientPresetChange(key)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Gestión de etapas</p>
          <p className="text-xs text-muted-foreground">
            {stagesEnabled ? (etapas.length === 0 ? "Sin etapas registradas" : `${etapas.length} etapas activas`) : "Desactivadas para este proyecto"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-[0.2em]">Etapas</span>
            <Switch
              checked={stagesEnabled}
              onCheckedChange={handleToggleStages}
              aria-label="Activar etapas"
              disabled={togglingStages}
            />
          </div>
          {renderGradientSelector()}
          <Button size="sm" onClick={onCreateStage} className="inline-flex items-center gap-2" disabled={!stagesEnabled}>
            <PlusCircle className="h-4 w-4" /> Nueva etapa
          </Button>
        </div>
      </div>

      {!stagesEnabled ? (
        <div className="mt-3 rounded-xl border border-dashed border-border/50 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Gestión desactivada</p>
          <p className="text-xs">Activa las etapas para planificar fases, colores y seguimiento del flujo de trabajo.</p>
        </div>
      ) : stageStats.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border/50 bg-background/70 px-4 py-4 text-center text-sm text-muted-foreground">
          Aún no hay etapas registradas. Crea la primera para organizar tu flujo.
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {stageStats.map((stage) => {
            const gradientHex = stageColorMap?.[stage.id];
            const fallbackHex = isHexColor(stage.color) ? stage.color! : undefined;
            const accentHex = gradientHex || fallbackHex;
            const accentClass = !accentHex && stage.color ? stage.color : undefined;
            const isEditing = editingStageId === stage.id;
            const formValues = forms[stage.id] ?? buildFormFromStage(stage);

            return (
              <div
                key={stage.id}
                className={cn(
                  "rounded-xl border border-border/60 bg-background/80 p-3",
                  accentClass && "text-white",
                  isEditing && "ring-2 ring-primary/40"
                )}
                style={
                  accentHex
                    ? {
                        borderColor: hexToRgba(accentHex, 0.4),
                        backgroundColor: hexToRgba(accentHex, 0.08),
                      }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stage.nombre}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Orden {stage.orden}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingStageId(stage.id);
                        ensureForm(stage);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onDeleteStage(stage)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5" />
                      {stage.tareasCount} {stage.tareasCount === 1 ? "tarea" : "tareas"}
                    </div>
                    {(stage.fechaInicio || stage.fechaFin) && (
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {stage.fechaInicio
                          ? new Date(stage.fechaInicio).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
                          : "—"}
                        &nbsp;→&nbsp;
                        {stage.fechaFin
                          ? new Date(stage.fechaFin).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
                          : "—"}
                      </div>
                    )}
                    {stage.estado && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> {stage.estado.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="grid grid-cols-1 gap-2">
                      <Label className="text-[11px] uppercase tracking-[0.2em]">Nombre</Label>
                      <Input
                        value={formValues.nombre}
                        onChange={(event) => handleFieldChange(stage, "nombre", event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[11px] uppercase tracking-[0.2em]">Descripción</Label>
                      <Textarea
                        rows={2}
                        value={formValues.descripcion}
                        onChange={(event) => handleFieldChange(stage, "descripcion", event.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] uppercase tracking-[0.2em]">Orden</Label>
                        <Input
                          type="number"
                          min={1}
                          value={formValues.orden}
                          onChange={(event) => handleFieldChange(stage, "orden", Number(event.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] uppercase tracking-[0.2em]">Color</Label>
                        <Input
                          type="color"
                          value={formValues.color}
                          onChange={(event) => handleFieldChange(stage, "color", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] uppercase tracking-[0.2em]">Inicio</Label>
                        <Input
                          type="date"
                          value={formValues.fechaInicio ?? ""}
                          onChange={(event) => handleFieldChange(stage, "fechaInicio", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] uppercase tracking-[0.2em]">Fin</Label>
                        <Input
                          type="date"
                          value={formValues.fechaFin ?? ""}
                          onChange={(event) => handleFieldChange(stage, "fechaFin", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] uppercase tracking-[0.2em]">Estado</Label>
                      <Select
                        value={formValues.estado}
                        onValueChange={(value) => handleFieldChange(stage, "estado", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingStageId(null);
                          setForms((prev) => ({ ...prev, [stage.id]: buildFormFromStage(stage) }));
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveStage(stage)}
                        disabled={savingStageId === stage.id}
                      >
                        {savingStageId === stage.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
