import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Table2, GanttChart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "table" | "timeline";

interface TaskViewSwitcherProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  defaultView: ViewMode;
  onSetDefaultView: (mode: ViewMode) => void;
  className?: string;
}

const views = [
  { value: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
  { value: "list" as ViewMode, icon: List, label: "Lista" },
  { value: "table" as ViewMode, icon: Table2, label: "Tabla" },
  { value: "timeline" as ViewMode, icon: GanttChart, label: "Timeline" },
];

export function TaskViewSwitcher({ viewMode, onViewChange, defaultView, onSetDefaultView, className }: TaskViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => value && onViewChange(value as ViewMode)}
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:grid-cols-4",
        "md:flex md:flex-wrap",
        className
      )}
    >
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = viewMode === view.value;
        const isDefault = defaultView === view.value;
        const handleDefaultClick = (event: React.MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          onSetDefaultView(view.value);
        };
        return (
          <ToggleGroupItem
            key={view.value}
            value={view.value}
            aria-label={view.label}
            className={cn(
              "flex min-w-[120px] flex-1 items-center gap-2 rounded-xl border border-border/40 bg-background/70 px-2.5 py-1.5 text-left",
              "transition-all hover:border-border",
              "data-[state=on]:border-primary/60 data-[state=on]:bg-primary/5 data-[state=on]:shadow-sm"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-semibold leading-tight text-foreground">{view.label}</span>
            <button
              type="button"
              onClick={handleDefaultClick}
              aria-label={`Establecer ${view.label} como vista predeterminada`}
              className={cn(
                "ml-auto rounded-full p-1 transition",
                isDefault
                  ? "text-amber-500 hover:text-amber-400"
                  : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              <Star className={cn("h-3.5 w-3.5", isDefault && "fill-current")} />
            </button>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
