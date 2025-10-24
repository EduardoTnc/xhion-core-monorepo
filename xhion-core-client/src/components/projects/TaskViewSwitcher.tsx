import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Table2, GanttChart, Plus, Filter, SortAsc, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "table" | "timeline" | "docs";

interface TaskViewSwitcherProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onCreateTask: () => void;
}

const views = [
  { value: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
  { value: "list" as ViewMode, icon: List, label: "Lista" },
  { value: "table" as ViewMode, icon: Table2, label: "Tabla" },
  { value: "timeline" as ViewMode, icon: GanttChart, label: "Timeline" },
  { value: "docs" as ViewMode, icon: FileText, label: "Documentos" },
];

export function TaskViewSwitcher({
  viewMode,
  onViewChange,
  onCreateTask,
}: TaskViewSwitcherProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {/* View Toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewChange(value as ViewMode)}
        className="bg-muted/50 p-1 rounded-lg"
      >
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <ToggleGroupItem
              key={view.value}
              value={view.value}
              aria-label={view.label}
              className={cn(
                "data-[state=on]:bg-background data-[state=on]:shadow-sm",
                "transition-all"
              )}
            >
              <Icon className="h-4 w-4 sm:mr-2" />
              <span className="text-sm hidden sm:inline">{view.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {/* New Task Button */}
      <Button onClick={onCreateTask} size="sm" className="flex-shrink-0">
        <Plus className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Nueva Tarea</span>
      </Button>
    </div>
  );
}
