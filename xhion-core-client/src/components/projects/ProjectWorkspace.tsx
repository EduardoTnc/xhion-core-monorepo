import { useState, useEffect, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskKanbanView } from "./TaskKanbanView";
import { TaskListView } from "./TaskListView";
import { TaskTableView } from "./TaskTableView";
import { TaskTimelineView } from "./TaskTimelineView";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { AddMiembroModal } from "./AddMiembroModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { StageManagementPanel, type StageCreateInput, type StageUpdateInput } from "./StageManagementPanel";
import { STAGE_GRADIENT_PRESETS, buildStageColorMap, type StageGradientPresetKey } from "./stageGradients";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2 } from "lucide-react";
import { type Etapa } from "@/services/projectService";
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
    createEtapa,
    updateEtapa,
    deleteEtapa,
    updateStagesEnabled,
    isLoading,
  } = useProjectStore();

  const { tareas, fetchTareas } = useTaskStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [etapaToDelete, setEtapaToDelete] = useState<Etapa | null>(null);
  const [showDeleteEtapaConfirm, setShowDeleteEtapaConfirm] = useState(false);
  const [stageGradientPreset, setStageGradientPreset] = useState<StageGradientPresetKey>("aurora");

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
  const stageColorMap = useMemo(() => buildStageColorMap(etapas, stageGradientPreset), [etapas, stageGradientPreset]);

  const handleInlineCreateStage = async (data: StageCreateInput) => {
    if (!selectedProjectId) return;
    try {
      await createEtapa(selectedProjectId, {
        nombre: data.nombre,
        descripcion: data.descripcion ?? undefined,
        orden: data.orden,
        fechaInicio: data.fechaInicio ?? undefined,
        fechaFin: data.fechaFin ?? undefined,
      });
      toast.success("Etapa creada");
      await Promise.all([
        fetchEtapas(selectedProjectId),
        fetchTareas({ proyectoId: selectedProjectId }),
      ]);
    } catch (error: any) {
      const message = error?.message || "Error al crear etapa";
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleInlineUpdateStage = async (etapaId: string, data: StageUpdateInput) => {
    if (!selectedProjectId) return;
    try {
      await updateEtapa(selectedProjectId, etapaId, data);
      await Promise.all([
        fetchEtapas(selectedProjectId),
        fetchTareas({ proyectoId: selectedProjectId }),
      ]);
      toast.success("Etapa actualizada");
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar etapa");
    }
  };

  const handleDeleteStage = (etapa: Etapa) => {
    setEtapaToDelete(etapa);
    setShowDeleteEtapaConfirm(true);
  };

  const confirmDeleteStage = async () => {
    if (!etapaToDelete || !selectedProjectId) return;
    try {
      await deleteEtapa(selectedProjectId, etapaToDelete.id);
      toast.success("Etapa eliminada");
      setEtapaToDelete(null);
      setShowDeleteEtapaConfirm(false);
      await Promise.all([
        fetchEtapas(selectedProjectId),
        fetchTareas({ proyectoId: selectedProjectId }),
      ]);
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar etapa");
    }
  };

  const handleToggleStagesSetting = async (enabled: boolean) => {
    if (!selectedProjectId) return;
    try {
      await updateStagesEnabled(selectedProjectId, enabled);
      toast.success(enabled ? "Gestión de etapas activada" : "Gestión de etapas desactivada");
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar la configuración de etapas");
    }
  };

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

            {/* Stage Management */}
            <div className="p-4">
              <StageManagementPanel
                etapas={etapas}
                tareas={tareas}
                stageColorMap={stageColorMap}
                gradientPresetKey={stageGradientPreset}
                gradientPresets={STAGE_GRADIENT_PRESETS}
                onGradientPresetChange={(preset) => setStageGradientPreset(preset as StageGradientPresetKey)}
                onCreateStage={handleInlineCreateStage}
                onUpdateStage={handleInlineUpdateStage}
                onDeleteStage={handleDeleteStage}
                stagesEnabled={stagesEnabled}
                onToggleStages={handleToggleStagesSetting}
              />
            </div>

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

      <ConfirmDialog
        open={showDeleteEtapaConfirm}
        onOpenChange={setShowDeleteEtapaConfirm}
        onConfirm={confirmDeleteStage}
        title="¿Eliminar etapa?"
        description="Esta acción no se puede deshacer. Las tareas asociadas perderán esta etapa."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
