import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { ProjectSidebarShadcn } from "./ProjectSidebarShadcn";
import { ProjectHeader } from "./ProjectHeader";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskKanbanViewDnD } from "./TaskKanbanViewDnD";
import { TaskListView } from "./TaskListView";
import { TaskTableView } from "./TaskTableView";
import { ProjectGanttTimeline } from "./ProjectGanttTimeline";
import { ProjectInfoSection } from "./ProjectInfoSection";
import { StageManagementPanel, type StageUpdateInput, type StageCreateInput } from "./StageManagementPanel";
import { TaskFilters, type TaskFiltersType, applyTaskFilters } from "./TaskFilters";
import { ExportMenu } from "./ExportMenu";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { AddMiembroModal } from "./AddMiembroModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PanelLeftClose, PanelLeftOpen, Keyboard, Plus } from "lucide-react";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { type Etapa, type ProyectoMiembro } from "@/services/projectService";
import { type Tarea } from "@/services/taskService";

type ViewMode = "kanban" | "list" | "table" | "timeline";

const DEFAULT_VIEW_STORAGE_KEY = "xhion:workspace-default-view";

const STAGE_GRADIENT_PRESETS = {
  aurora: {
    label: "Aurora",
    stops: ["#4f46e5", "#06b6d4"],
  },
  sunset: {
    label: "Atardecer",
    stops: ["#f97316", "#ec4899"],
  },
  jungle: {
    label: "Selva",
    stops: ["#22c55e", "#15803d"],
  },
} as const;

type StageGradientPresetKey = keyof typeof STAGE_GRADIENT_PRESETS;

const isValidViewMode = (value: string | null): value is ViewMode =>
  value === "kanban" || value === "list" || value === "table" || value === "timeline";

const getStoredDefaultView = (): ViewMode => {
  if (typeof window === "undefined") return "kanban";
  try {
    const stored = window.localStorage.getItem(DEFAULT_VIEW_STORAGE_KEY);
    if (isValidViewMode(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return "kanban";
};

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
    deleteEtapa,
    updateEtapa,
    createEtapa,
    setProyectoActual,
    isLoading,
    updateStagesEnabled,
  } = useProjectStore();

  const { tareas: taskStoreTareas, fetchTareas } = useTaskStore();

  type CachedProjectData = {
    etapas: Etapa[];
    miembros: ProyectoMiembro[];
    tareas: Tarea[];
  };

  // UI State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [defaultView, setDefaultView] = useState<ViewMode>(() => getStoredDefaultView());
  const [viewMode, setViewMode] = useState<ViewMode>(() => getStoredDefaultView());
  const [stageGradientPreset, setStageGradientPreset] = useState<StageGradientPresetKey>("aurora");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>(initialFilters);
  const [displayEtapas, setDisplayEtapas] = useState<Etapa[]>([]);
  const [displayMiembros, setDisplayMiembros] = useState<ProyectoMiembro[]>([]);
  const [displayTareas, setDisplayTareas] = useState<Tarea[]>([]);
  const [projectDataCache, setProjectDataCache] = useState<Record<string, CachedProjectData>>({});
  const [lastFetchedProjectId, setLastFetchedProjectId] = useState<string | null>(null);

  // Modals State
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [etapaToDelete, setEtapaToDelete] = useState<Etapa | null>(null);
  const [showDeleteEtapaConfirm, setShowDeleteEtapaConfirm] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tareaToDelete, setTareaToDelete] = useState<string | null>(null);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);

  const prefillProjectData = useCallback(
    (projectId: string) => {
      const cachedData = projectDataCache[projectId];
      if (cachedData) {
        setDisplayEtapas(cachedData.etapas);
        setDisplayMiembros(cachedData.miembros);
        setDisplayTareas(cachedData.tareas);
      } else {
        setDisplayEtapas([]);
        setDisplayMiembros([]);
        setDisplayTareas([]);
      }
    },
    [projectDataCache]
  );

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
    if (proyectoIdProp && proyectoIdProp !== selectedProjectId) {
      setSelectedProjectId(proyectoIdProp);
      prefillProjectData(proyectoIdProp);
      const targetProject = proyectos.find((p) => p.id === proyectoIdProp);
      if (targetProject) {
        setProyectoActual(targetProject);
      }
      return;
    }

    if (!proyectoIdProp && !selectedProjectId && proyectos.length > 0) {
      const firstProject = proyectos[0];
      setSelectedProjectId(firstProject.id);
      prefillProjectData(firstProject.id);
      setProyectoActual(firstProject);
    }
  }, [proyectos, selectedProjectId, proyectoIdProp, setProyectoActual, prefillProjectData]);

  const loadProyectos = async () => {
    try {
      await fetchProyectos();
    } catch (error: any) {
      toast.error(error.message || "Error al cargar proyectos");
    }
  };

  const handleDeleteStage = (etapa: Etapa) => {
    setEtapaToDelete(etapa);
    setShowDeleteEtapaConfirm(true);
  };

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
      await Promise.all([fetchEtapas(selectedProjectId), fetchTareas({ proyectoId: selectedProjectId })]);
      toast.success("Etapa actualizada");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar etapa");
    }
  };

  const confirmDeleteEtapa = async () => {
    if (!etapaToDelete || !selectedProjectId) return;
    try {
      await deleteEtapa(selectedProjectId, etapaToDelete.id);
      toast.success("Etapa eliminada exitosamente");
      setEtapaToDelete(null);
      setShowDeleteEtapaConfirm(false);
      await fetchEtapas(selectedProjectId);
      await fetchTareas({ proyectoId: selectedProjectId });
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar etapa");
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

      const { etapas: latestEtapas, miembros: latestMiembros } = useProjectStore.getState();
      const { tareas: latestTareas } = useTaskStore.getState();

      setLastFetchedProjectId(projectId);
      setDisplayEtapas(latestEtapas);
      setDisplayMiembros(latestMiembros);
      setDisplayTareas(latestTareas);
      setProjectDataCache((prev) => ({
        ...prev,
        [projectId]: {
          etapas: latestEtapas,
          miembros: latestMiembros,
          tareas: latestTareas,
        },
      }));
    } catch (error: any) {
      toast.error(error.message || "Error al cargar datos del proyecto");
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const cachedProject = proyectos.find((p) => p.id === projectId);
    if (cachedProject) {
      setProyectoActual(cachedProject);
    }
    prefillProjectData(projectId);
    setSelectedProjectId(projectId);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    if (lastFetchedProjectId !== selectedProjectId) return;

    setDisplayEtapas(etapas);
    setDisplayMiembros(miembros);
    setDisplayTareas(taskStoreTareas);
    setProjectDataCache((prev) => ({
      ...prev,
      [selectedProjectId]: {
        etapas,
        miembros,
        tareas: taskStoreTareas,
      },
    }));
  }, [selectedProjectId, lastFetchedProjectId, etapas, miembros, taskStoreTareas]);

  const stagesEnabled = proyectoActual?.usaEtapas ?? true;

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  const handleSetDefaultView = (mode: ViewMode) => {
    setDefaultView(mode);
    setViewMode(mode);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DEFAULT_VIEW_STORAGE_KEY, mode);
      } catch {
        // ignore storage errors
      }
    }
    toast.success(`Vista ${mode} guardada como predeterminada`);
  };

  const handleEditTask = (task: any) => {
    setTareaToEdit(task);
    setShowEditTaskModal(true);
    setShowTaskDetailModal(false);
  };

  const handleEditTaskDirect = (tareaId: string) => {
    const tarea = displayTareas.find((t) => t.id === tareaId);
    if (tarea) {
      setTareaToEdit(tarea);
      setShowEditTaskModal(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTareaToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const interpolateChannel = (start: number, end: number, factor: number) => Math.round(start + (end - start) * factor);

  const hexToRgb = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const bigint = Number.parseInt(sanitized.length === 3 ? sanitized.repeat(2) : sanitized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;

  const interpolateHex = (start: string, end: string, factor: number) => {
    const startRgb = hexToRgb(start);
    const endRgb = hexToRgb(end);
    return rgbToHex(
      interpolateChannel(startRgb.r, endRgb.r, factor),
      interpolateChannel(startRgb.g, endRgb.g, factor),
      interpolateChannel(startRgb.b, endRgb.b, factor)
    );
  };

  const getGradientColor = (stops: readonly string[], ratio: number) => {
    if (stops.length === 0) return "#6b7280";
    if (stops.length === 1) return stops[0];
    const segmentSize = 1 / (stops.length - 1);
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const segmentIndex = Math.min(Math.floor(clampedRatio / segmentSize), stops.length - 2);
    const localRatio = (clampedRatio - segmentIndex * segmentSize) / segmentSize;
    return interpolateHex(stops[segmentIndex], stops[segmentIndex + 1], Number.isFinite(localRatio) ? localRatio : 0);
  };

  const stageColorMap = useMemo(() => {
    const preset = STAGE_GRADIENT_PRESETS[stageGradientPreset];
    if (!preset || displayEtapas.length === 0) return {};
    const ordered = [...displayEtapas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    return ordered.reduce<Record<string, string>>((acc, etapa, index) => {
      const ratio = ordered.length === 1 ? 0 : index / (ordered.length - 1);
      acc[etapa.id] = getGradientColor(preset.stops, ratio);
      return acc;
    }, {});
  }, [displayEtapas, stageGradientPreset]);

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
  const filteredTareas = applyTaskFilters(displayTareas, filters);
  const stageFilterOptions = stagesEnabled
    ? displayEtapas.map((etapa) => ({ id: etapa.id, nombre: etapa.nombre }))
    : [];

  const handleToggleStagesSetting = async (enabled: boolean) => {
    if (!selectedProjectId) return;
    try {
      await updateStagesEnabled(selectedProjectId, enabled);
      if (!enabled) {
        setFilters((prev) => ({ ...prev, etapaId: "all" }));
      }
      toast.success(enabled ? "Gestión de etapas activada" : "Gestión de etapas desactivada");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la configuración de etapas");
    }
  };

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

      {/* Main Content - Scroll Global compacto */}
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden pb-20">
        {proyectoActual ? (
          <>
            {/* Header with Toggle Button - Sticky */}
            <div className="sticky top-0 z-20 bg-background/98 border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                miembros={displayMiembros}
                onEdit={() => setShowEditProjectModal(true)}
                onInvite={() => setShowAddMiembroModal(true)}
                etapasCount={displayEtapas.length}
                tareasCount={displayTareas.length}
              />
            </div>

            {/* Project Info Section - Equipo y Documentos */}
            <ProjectInfoSection
              miembros={displayMiembros?.map((m) => ({
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

            <section className="px-3 pt-4 sm:px-4 lg:px-6">
              <StageManagementPanel
                etapas={displayEtapas}
                tareas={displayTareas}
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
            </section>

            <section className="px-3 py-4 sm:px-4 lg:px-6">
              <div className="rounded-3xl border border-border/50 bg-card/80 shadow-lg">
                <div className="sticky top-[64px] sm:top-[68px] z-10 border-b border-border/40 bg-card/95/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
                  <div className="px-4 py-3 sm:px-6 space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="text-xs font-semibold tracking-[0.18em] text-foreground">Vistas de tareas</span>
                        <p className="text-[10px] normal-case tracking-[0.05em] text-muted-foreground/80">
                          Cambia entre Kanban, Lista o Tabla según tu flujo de trabajo.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto gap-2"
                          onClick={() => setShowCreateTaskModal(true)}
                        >
                          <Plus className="h-4 w-4" /> Nueva tarea
                        </Button>
                        <ExportMenu tareas={filteredTareas} proyecto={proyectoActual} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKeyboardShortcuts(true)}
                          className="hidden sm:flex"
                          aria-label="Atajos del teclado"
                        >
                          <Keyboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <TaskViewSwitcher
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                        defaultView={defaultView}
                        onSetDefaultView={handleSetDefaultView}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <TaskFilters
                          filters={filters}
                          onFiltersChange={setFilters}
                          miembros={displayMiembros}
                          etapas={stageFilterOptions}
                          stagesEnabled={stagesEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-6">
                  {viewMode === "kanban" && (
                    <TaskKanbanViewDnD
                      tareas={filteredTareas}
                      onTaskClick={handleTaskClick}
                      onEditTask={handleEditTaskDirect}
                      onDeleteTask={handleDeleteTask}
                      proyectoId={selectedProjectId || ""}
                      etapas={displayEtapas}
                      stageColorMap={stageColorMap}
                      stagesEnabled={stagesEnabled}
                    />
                  )}
                  {viewMode === "list" && (
                    <TaskListView
                      tareas={filteredTareas}
                      onTaskClick={handleTaskClick}
                      onEditTask={handleEditTaskDirect}
                      onDeleteTask={handleDeleteTask}
                      etapas={displayEtapas}
                      stageColorMap={stageColorMap}
                      stagesEnabled={stagesEnabled}
                    />
                  )}
                  {viewMode === "table" && (
                    <TaskTableView 
                      tareas={filteredTareas} 
                      onTaskClick={handleTaskClick}
                      onEditTask={handleEditTaskDirect}
                      onDeleteTask={handleDeleteTask}
                      etapas={displayEtapas}
                      stageColorMap={stageColorMap}
                      stagesEnabled={stagesEnabled}
                    />
                  )}
                  {viewMode === "timeline" && proyectoActual && (
                    <ProjectGanttTimeline
                      proyecto={proyectoActual}
                      etapas={etapas}
                      tareas={filteredTareas}
                      onTaskClick={handleTaskClick}
                    />
                  )}
                </div>
              </div>
            </section>
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
        stagesEnabled={stagesEnabled}
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

      <ConfirmDialog
        open={showDeleteEtapaConfirm}
        onOpenChange={setShowDeleteEtapaConfirm}
        onConfirm={confirmDeleteEtapa}
        title="¿Eliminar etapa?"
        description="Esta acción no se puede deshacer. La etapa y su relación con las tareas se actualizarán."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
