import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { StageTimeline } from "./StageTimeline";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskKanbanView } from "./TaskKanbanView";
import { TaskListView } from "./TaskListView";
import { TaskTableView } from "./TaskTableView";
import { TaskTimelineView } from "./TaskTimelineView";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { CreateEtapaModal } from "./CreateEtapaModal";
import { AddMiembroModal } from "./AddMiembroModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ViewMode = "kanban" | "list" | "table" | "timeline";

export function ProjectWorkspace() {
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

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showCreateEtapaModal, setShowCreateEtapaModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [etapaToEdit, setEtapaToEdit] = useState<any>(null);

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData(selectedProjectId);
    }
  }, [selectedProjectId]);

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
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProjectId && proyectos.length > 0) {
      setSelectedProjectId(proyectos[0].id);
    }
  }, [proyectos, selectedProjectId]);

  const stagesEnabled = proyectoActual?.usaEtapas ?? true;

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
      <ProjectSidebar
        proyectos={proyectos}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onCreateProject={() => setShowCreateProjectModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {proyectoActual ? (
          <>
            {/* Header */}
            <ProjectHeader
              proyecto={proyectoActual}
              miembros={miembros}
              onEdit={() => setShowEditProjectModal(true)}
              onInvite={() => setShowAddMiembroModal(true)}
            />

            {/* Stage Timeline */}
            <StageTimeline
              etapas={etapas}
              onCreateEtapa={() => setShowCreateEtapaModal(true)}
              onEditEtapa={(etapa) => {
                setEtapaToEdit(etapa);
                setShowCreateEtapaModal(true);
              }}
              stagesEnabled={stagesEnabled}
            />

            {/* View Switcher */}
            <TaskViewSwitcher
              viewMode={viewMode}
              onViewChange={setViewMode}
              defaultView={viewMode}
              onSetDefaultView={setViewMode}
            />

            {/* Task Views */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "kanban" && (
                <TaskKanbanView tareas={tareas} etapas={etapas} onTaskClick={handleTaskClick} stagesEnabled={stagesEnabled} />
              )}
              {viewMode === "list" && (
                <TaskListView tareas={tareas} onTaskClick={handleTaskClick} etapas={etapas} stagesEnabled={stagesEnabled} />
              )}
              {viewMode === "table" && (
                <TaskTableView tareas={tareas} etapas={etapas} onTaskClick={handleTaskClick} stagesEnabled={stagesEnabled} />
              )}
              {viewMode === "timeline" && (
                <TaskTimelineView tareas={tareas} etapas={etapas} onTaskClick={handleTaskClick} stagesEnabled={stagesEnabled} />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-muted-foreground text-lg">
              No hay proyectos disponibles
            </p>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Crear tu primer proyecto
            </button>
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
        proyectoId={selectedProjectId || ""}
        stagesEnabled={stagesEnabled}
      />

      <TaskDetailModal
        tareaId={selectedTaskId}
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
      />
    </div>
  );
}
