import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Table2, GanttChart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "table" | "timeline";

interface TaskViewSwitcherProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onCreateTask: () => void;
}

const views = [
  { value: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban", hint: "Columnas por estado" },
  { value: "list" as ViewMode, icon: List, label: "Lista", hint: "Detalle por etapa" },
  { value: "table" as ViewMode, icon: Table2, label: "Tabla", hint: "Vista matricial" },
  { value: "timeline" as ViewMode, icon: GanttChart, label: "Timeline", hint: "Cronograma" },
];

export function TaskViewSwitcher({
  viewMode,
  onViewChange,
  onCreateTask,
}: TaskViewSwitcherProps) {
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="block">Vistas de tareas</span>
            <span className="text-[10px] normal-case tracking-normal text-muted-foreground/80">
              Selecciona la perspectiva ideal y crea nuevas tareas sobre la marcha
            </span>
          </div>
          <Button
            onClick={onCreateTask}
            size="sm"
            className="w-full gap-2 self-start text-sm sm:w-auto sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva tarea</span>
          </Button>
        </div>

        <div className="mt-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && onViewChange(value as ViewMode)}
            className="flex w-full flex-wrap gap-2"
          >
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = viewMode === view.value;
              return (
                <ToggleGroupItem
                  key={view.value}
                  value={view.value}
                  aria-label={view.label}
                  className={cn(
                    "flex min-w-[140px] flex-1 items-start gap-2 rounded-xl border border-border/40 bg-background/70 px-3 py-2 text-left",
                    "transition-all hover:border-border",
                    "data-[state=on]:border-primary/60 data-[state=on]:bg-primary/5 data-[state=on]:shadow-sm"
                  )}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold leading-tight text-foreground">
                      {view.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground tracking-normal">
                      {view.hint}
                    </span>
                  </div>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
