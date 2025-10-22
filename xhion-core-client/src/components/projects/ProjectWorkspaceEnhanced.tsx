import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { StageTimeline } from "./StageTimeline";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskKanbanViewDnD } from "./TaskKanbanViewDnD";
import { TaskListView } from "./TaskListView";
import { TaskTableView } from "./TaskTableView";
import { TaskTimelineViewEnhanced } from "./TaskTimelineViewEnhanced";
import { TaskFilters, type TaskFiltersType, applyTaskFilters } from "./TaskFilters";
import { ExportMenu } from "./ExportMenu";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { CreateEtapaModal } from "./CreateEtapaModal";
import { AddMiembroModal } from "./AddMiembroModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Loader2, PanelLeftClose, PanelLeftOpen, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "table" | "timeline";

const initialFilters: TaskFiltersType = {
  search: "",
  estado: "all",
  prioridad: "all",
  asignadoId: "all",
  etapaId: "all",
  fechaDesde: "",
  fechaHasta: "",
};

export function ProjectWorkspaceEnhanced() {
  const {
    proyectos,
    proyectoActual,
    etapas,
    miembros,
    fetchProyectos,
    fetchProyectoById,
    fetchEtapas,
    fetchMiembros,
    isLoading,
  } = useProjectStore();

  const { tareas, fetchTareas } = useTaskStore();

  // UI State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>(initialFilters);

  // Modals State
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showCreateEtapaModal, setShowCreateEtapaModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [etapaToEdit, setEtapaToEdit] = useState<any>(null);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load projects on mount
  useEffect(() => {
    loadProyectos();
  }, []);

  // Load project data when selected
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Auto-select first project
  useEffect(() => {
    if (!selectedProjectId && proyectos.length > 0) {
      setSelectedProjectId(proyectos[0].id);
    }
  }, [proyectos, selectedProjectId]);

  const loadProyectos = async () => {
    try {
      await fetchProyectos();
    } catch (error: any) {
      toast.error(error.message || "Error al cargar proyectos");
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      await Promise.all([
        fetchProyectoById(projectId),
        fetchEtapas(projectId),
        fetchMiembros(projectId),
        fetchTareas({ proyectoId: projectId }),
      ]);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar datos del proyecto");
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsMobileSidebarOpen(false);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  // Apply filters to tasks
  const filteredTareas = applyTaskFilters(tareas, filters);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setShowCreateTaskModal(true),
    onNewProject: () => setShowCreateProjectModal(true),
    onSearch: () => searchInputRef.current?.focus(),
    onToggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
    onViewKanban: () => setViewMode("kanban"),
    onViewList: () => setViewMode("list"),
    onViewTable: () => setViewMode("table"),
    onViewTimeline: () => setViewMode("timeline"),
    onHelp: () => setShowKeyboardShortcuts(true),
  });

  // Loading state
  if (isLoading && proyectos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-card transition-all duration-300 ease-in-out",
          "hidden lg:block",
          isSidebarCollapsed ? "w-0" : "w-80"
        )}
      >
        {!isSidebarCollapsed && (
          <ProjectSidebar
            proyectos={proyectos}
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
            onCreateProject={() => setShowCreateProjectModal(true)}
          />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transition-transform duration-300 lg:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ProjectSidebar
          proyectos={proyectos}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
          onCreateProject={() => setShowCreateProjectModal(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {proyectoActual ? (
          <>
            {/* Header with Toggle Button */}
            <div className="relative">
              {/* Sidebar Toggle Button */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex shadow-md bg-background"
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden shadow-md bg-background"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </div>

              <ProjectHeader
                proyecto={proyectoActual}
                miembros={miembros}
                onEdit={() => setShowEditProjectModal(true)}
                onInvite={() => setShowAddMiembroModal(true)}
              />
            </div>

            {/* Stage Timeline */}
            <StageTimeline
              etapas={etapas}
              onCreateEtapa={() => setShowCreateEtapaModal(true)}
              onEditEtapa={(etapa) => {
                setEtapaToEdit(etapa);
                setShowCreateEtapaModal(true);
              }}
            />

            {/* View Switcher with Filters and Export */}
            <div className="border-b bg-card">
              <div className="px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <TaskViewSwitcher
                  viewMode={viewMode}
                  onViewChange={setViewMode}
                  onCreateTask={() => setShowCreateTaskModal(true)}
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <TaskFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    miembros={miembros}
                    etapas={etapas}
                  />
                  <ExportMenu tareas={filteredTareas} proyecto={proyectoActual} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKeyboardShortcuts(true)}
                    className="hidden sm:flex"
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Task Views */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "kanban" && (
                <TaskKanbanViewDnD
                  tareas={filteredTareas}
                  etapas={etapas}
                  onTaskClick={handleTaskClick}
                  proyectoId={selectedProjectId || ""}
                />
              )}
              {viewMode === "list" && (
                <TaskListView tareas={filteredTareas} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "table" && (
                <TaskTableView tareas={filteredTareas} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "timeline" && (
                <TaskTimelineViewEnhanced tareas={filteredTareas} etapas={etapas} onTaskClick={handleTaskClick} />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
            <p className="text-muted-foreground text-lg text-center">
              No hay proyectos disponibles
            </p>
            <Button onClick={() => setShowCreateProjectModal(true)}>
              Crear tu primer proyecto
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateProjectModal
        open={showCreateProjectModal}
        onOpenChange={(open) => {
          setShowCreateProjectModal(open);
          if (!open) loadProyectos();
        }}
      />

      <EditProjectModal
        open={showEditProjectModal}
        onOpenChange={(open) => {
          setShowEditProjectModal(open);
          if (!open && selectedProjectId) loadProjectData(selectedProjectId);
        }}
        proyecto={proyectoActual}
      />

      <CreateEtapaModal
        open={showCreateEtapaModal}
        onOpenChange={(open) => {
          setShowCreateEtapaModal(open);
          if (!open) {
            setEtapaToEdit(null);
            if (selectedProjectId) fetchEtapas(selectedProjectId);
          }
        }}
        proyectoId={selectedProjectId || ""}
        etapaToEdit={etapaToEdit}
      />

      <AddMiembroModal
        open={showAddMiembroModal}
        onOpenChange={(open) => {
          setShowAddMiembroModal(open);
          if (!open && selectedProjectId) fetchMiembros(selectedProjectId);
        }}
        proyectoId={selectedProjectId || ""}
      />

      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={(open) => {
          setShowCreateTaskModal(open);
          if (!open && selectedProjectId) {
            fetchTareas({ proyectoId: selectedProjectId });
          }
        }}
        proyectoId={selectedProjectId}
      />

      <TaskDetailModal
        tareaId={selectedTaskId}
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
      />

      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
    </div>
  );
}
