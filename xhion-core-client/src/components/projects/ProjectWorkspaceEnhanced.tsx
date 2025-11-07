import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { ProjectSidebarShadcn } from "./ProjectSidebarShadcn";
import { ProjectHeader } from "./ProjectHeader";
import { StageTimeline } from "./StageTimeline";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskKanbanViewDnD } from "./TaskKanbanViewDnD";
import { TaskListView } from "./TaskListView";
import { TaskTableView } from "./TaskTableView";
import { TaskTimelineViewEnhanced } from "./TaskTimelineViewEnhanced";
import { ProjectDocumentsManager } from "./ProjectDocumentsManager";
import { ProjectInfoSection } from "./ProjectInfoSection";
import { TaskFilters, type TaskFiltersType, applyTaskFilters } from "./TaskFilters";
import { ExportMenu } from "./ExportMenu";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { CreateEtapaModal } from "./CreateEtapaModal";
import { AddMiembroModal } from "./AddMiembroModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PanelLeftClose, PanelLeftOpen, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "table" | "timeline" | "docs";

const initialFilters: TaskFiltersType = {
  search: "",
  estado: "all",
  prioridad: "all",
  asignadoId: "all",
  etapaId: "all",
  fechaDesde: "",
  fechaHasta: "",
};

interface ProjectWorkspaceEnhancedProps {
  proyectoId?: string;
  hideSidebar?: boolean;
}

export function ProjectWorkspaceEnhanced({ 
  proyectoId: proyectoIdProp,
  hideSidebar = false 
}: ProjectWorkspaceEnhancedProps = {}) {
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
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [etapaToEdit, setEtapaToEdit] = useState<any>(null);
  const [tareaToEdit, setTareaToEdit] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tareaToDelete, setTareaToDelete] = useState<string | null>(null);

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

  // Auto-select first project or use provided proyectoId
  useEffect(() => {
    if (proyectoIdProp) {
      setSelectedProjectId(proyectoIdProp);
    } else if (!selectedProjectId && proyectos.length > 0) {
      setSelectedProjectId(proyectos[0].id);
    }
  }, [proyectos, selectedProjectId, proyectoIdProp]);

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

  const handleEditTask = (task: any) => {
    setTareaToEdit(task);
    setShowEditTaskModal(true);
    setShowTaskDetailModal(false);
  };

  const handleEditTaskDirect = (tareaId: string) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (tarea) {
      setTareaToEdit(tarea);
      setShowEditTaskModal(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTareaToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!tareaToDelete) return;
    
    try {
      await useTaskStore.getState().deleteTarea(tareaToDelete);
      toast.success('Tarea eliminada exitosamente');
      if (selectedProjectId) {
        fetchTareas({ proyectoId: selectedProjectId });
      }
      setShowTaskDetailModal(false);
      setTareaToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar tarea');
    }
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
    <div className="flex h-full bg-background overflow-hidden">
      {/* Sidebar - Oculto cuando hideSidebar es true */}
      {!hideSidebar && (
        <>
          <div
            className={cn(
              "border-r bg-card transition-all duration-300 ease-in-out h-full overflow-hidden",
              "hidden lg:block",
              isSidebarCollapsed ? "w-0" : "w-80"
            )}
          >
            {!isSidebarCollapsed && (
              <ProjectSidebarShadcn
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
              "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transition-transform duration-300 lg:hidden h-full overflow-hidden",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <ProjectSidebarShadcn
              proyectos={proyectos}
              selectedProjectId={selectedProjectId}
              onProjectSelect={handleProjectSelect}
              onCreateProject={() => setShowCreateProjectModal(true)}
            />
          </div>
        </>
      )}

      {/* Main Content - Scroll Global */}
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">
        {proyectoActual ? (
          <>
            {/* Header with Toggle Button - Sticky */}
            <div className="sticky top-0 z-20 bg-background border-b">
              {/* Sidebar Toggle Button - Oculto cuando hideSidebar es true */}
              {!hideSidebar && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex shadow-md bg-background hover:bg-accent"
                  >
                    {isSidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="lg:hidden shadow-md bg-background hover:bg-accent"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <ProjectHeader
                proyecto={proyectoActual}
                miembros={miembros}
                onEdit={() => setShowEditProjectModal(true)}
                onInvite={() => setShowAddMiembroModal(true)}
              />
            </div>

            {/* Project Info Section - 3 Widgets */}
            <ProjectInfoSection
              etapas={etapas}
              miembros={miembros?.map((m) => ({
                usuarioId: m.usuarioId,
                usuario: {
                  id: m.usuario?.id || '',
                  nombre: m.usuario?.nombreCompleto || '',
                  email: m.usuario?.email || '',
                  avatar: m.usuario?.avatarUrl,
                },
                rol: m.rol.toLowerCase() as "responsable" | "miembro" | "observador",
              })) || []}
              archivos={[]} // TODO: Implementar store de archivos
              onCreateEtapa={() => setShowCreateEtapaModal(true)}
              onEditEtapa={(etapa) => {
                setEtapaToEdit(etapa);
                setShowCreateEtapaModal(true);
              }}
              onDeleteEtapa={(_etapaId) => {
                // TODO: Implementar eliminación de etapa
                toast.success("Etapa eliminada");
              }}
              onAddMiembro={() => setShowAddMiembroModal(true)}
              onRemoveMiembro={(_usuarioId) => {
                // TODO: Implementar eliminación de miembro
                toast.success("Miembro removido del proyecto");
              }}
              onUploadFile={(files) => {
                // TODO: Implementar subida de archivos
                toast.success(`${files.length} archivo(s) subido(s)`);
              }}
              onDownloadFile={(archivo) => {
                // TODO: Implementar descarga de archivo
                toast.success(`Descargando ${archivo.nombre}`);
              }}
              onDeleteFile={(_archivoId) => {
                // TODO: Implementar eliminación de archivo
                toast.success("Archivo eliminado");
              }}
              onViewFile={(archivo) => {
                // TODO: Implementar vista previa de archivo
                toast.info(`Abriendo ${archivo.nombre}`);
              }}
            />

            {/* View Switcher with Filters and Export - Sticky */}
            <div className="sticky top-[72px] sm:top-[80px] z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <TaskViewSwitcher
                  viewMode={viewMode}
                  onViewChange={setViewMode}
                  onCreateTask={() => setShowCreateTaskModal(true)}
                />

                <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto flex-wrap">
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

            {/* Task Views - Con padding responsive */}
            <div className="flex-1 min-h-0">
              {viewMode === "kanban" && (
                <TaskKanbanViewDnD
                  tareas={filteredTareas}
                  etapas={etapas}
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTaskDirect}
                  onDeleteTask={handleDeleteTask}
                  proyectoId={selectedProjectId || ""}
                />
              )}
              {viewMode === "list" && (
                <TaskListView 
                  tareas={filteredTareas} 
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTaskDirect}
                  onDeleteTask={handleDeleteTask}
                />
              )}
              {viewMode === "table" && (
                <TaskTableView 
                  tareas={filteredTareas} 
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTaskDirect}
                  onDeleteTask={handleDeleteTask}
                />
              )}
              {viewMode === "timeline" && (
                <TaskTimelineViewEnhanced 
                  tareas={filteredTareas} 
                  etapas={etapas} 
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTaskDirect}
                  onDeleteTask={handleDeleteTask}
                />
              )}
              {viewMode === "docs" && proyectoActual && (
                <div className="h-full overflow-auto p-6">
                  <ProjectDocumentsManager
                    proyectoId={proyectoActual.id}
                    proyectoNombre={proyectoActual.nombre}
                  />
                </div>
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
        proyectoId={selectedProjectId || ""}
      />

      <CreateTaskModal
        open={showEditTaskModal}
        onOpenChange={(open) => {
          setShowEditTaskModal(open);
          if (!open) {
            setTareaToEdit(null);
            if (selectedProjectId) {
              fetchTareas({ proyectoId: selectedProjectId });
            }
          }
        }}
        proyectoId={selectedProjectId || ""}
        tareaToEdit={tareaToEdit}
      />

      <TaskDetailModal
        tareaId={selectedTaskId}
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDeleteTask}
        title="¿Eliminar tarea?"
        description="Esta acción no se puede deshacer. La tarea será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
