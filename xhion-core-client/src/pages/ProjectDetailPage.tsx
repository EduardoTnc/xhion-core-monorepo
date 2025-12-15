import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useProject,
  useProjectStages,
  useProjectMembers,
  useTasks,
  useDeleteTask,
  useRemoveProjectMember,
  useCreateProjectStage,
  useUpdateProjectStage,
  useDeleteProjectStage,
  useUpdateProject,
} from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { AddMiembroModal } from "@/components/projects/AddMiembroModal";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { StageManagementPanel, type StageCreateInput, type StageUpdateInput } from "@/components/projects/StageManagementPanel";
import { STAGE_GRADIENT_PRESETS, buildStageColorMap, type StageGradientPresetKey } from "@/components/projects/stageGradients";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ArrowLeft,
  Users,
  ListTodo,
  Calendar,
  Settings,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { type Etapa } from "@/services/projectService";

const estadoColors = {
  Activo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  En_Pausa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Archivado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // TanStack Query hooks for project data
  const { data: proyectoActual, isLoading, refetch: refetchProyecto } = useProject(id);
  const { data: etapas = [], refetch: refetchEtapas } = useProjectStages(id);
  const { data: miembros = [] } = useProjectMembers(id);
  const { data: tareas = [], refetch: refetchTareas } = useTasks({ proyectoId: id });

  // TanStack Query mutations
  const deleteTaskMutation = useDeleteTask();
  const removeProjectMemberMutation = useRemoveProjectMember();
  const createStageMutation = useCreateProjectStage();
  const updateStageMutation = useUpdateProjectStage();
  const deleteStageMutation = useDeleteProjectStage();
  const updateProjectMutation = useUpdateProject();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [etapaToDelete, setEtapaToDelete] = useState<Etapa | null>(null);
  const [showDeleteEtapaConfirm, setShowDeleteEtapaConfirm] = useState(false);
  const [stageGradientPreset, setStageGradientPreset] = useState<StageGradientPresetKey>("aurora");
  const stagesEnabled = proyectoActual?.usaEtapas ?? true;
  const stageColorMap = useMemo(() => buildStageColorMap(etapas, stageGradientPreset), [etapas, stageGradientPreset]);

  // Open task modal if arrived with state.openTaskId from Gantt
  useEffect(() => {
    const state = location.state as any
    if (state?.openTaskId) {
      setSelectedTaskId(state.openTaskId)
      setShowTaskModal(true)
    }
  }, [location.state])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTaskClick = (tareaId: string) => {
    setSelectedTaskId(tareaId);
    setShowTaskModal(true);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setShowCreateTaskModal(true);
  };

  const handleEditTask = (tarea: any) => {
    setTaskToEdit(tarea);
    setShowCreateTaskModal(true);
  };

  const handleDeleteTask = async (tareaId: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar la tarea "${titulo}"?`)) return;

    try {
      await deleteTaskMutation.mutateAsync(tareaId);
      // TanStack Query auto-invalidates
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  const handleInlineCreateStage = async (data: StageCreateInput) => {
    if (!id) return;
    try {
      await createStageMutation.mutateAsync({
        projectId: id,
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion ?? undefined,
          orden: data.orden,
          fechaInicio: data.fechaInicio ?? undefined,
          fechaFin: data.fechaFin ?? undefined,
        },
      });
      toast.success("Etapa creada");
      // TanStack Query auto-invalidates
    } catch (error: any) {
      const message = error?.message || "Error al crear etapa";
      throw new Error(message);
    }
  };

  const handleInlineUpdateStage = async (etapaId: string, data: StageUpdateInput) => {
    if (!id) return;
    try {
      await updateStageMutation.mutateAsync({
        projectId: id,
        stageId: etapaId,
        data: {
          ...data,
          // Convert null to undefined for fields that don't accept null in UpdateEtapaDto
          descripcion: data.descripcion ?? undefined,
          fechaInicio: data.fechaInicio ?? undefined,
          fechaFin: data.fechaFin ?? undefined,
        },
      });
      toast.success("Etapa actualizada");
      // TanStack Query auto-invalidates
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  const handleDeleteStage = (etapa: Etapa) => {
    setEtapaToDelete(etapa);
    setShowDeleteEtapaConfirm(true);
  };

  const confirmDeleteEtapa = async () => {
    if (!etapaToDelete || !id) return;
    try {
      await deleteStageMutation.mutateAsync({ projectId: id, stageId: etapaToDelete.id });
      toast.success("Etapa eliminada exitosamente");
      setEtapaToDelete(null);
      setShowDeleteEtapaConfirm(false);
      // TanStack Query auto-invalidates
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  const handleToggleStagesSetting = async (enabled: boolean) => {
    if (!id) return;
    try {
      await updateProjectMutation.mutateAsync({ id, data: { usaEtapas: enabled } });
      toast.success(enabled ? "Gestión de etapas activada" : "Gestión de etapas desactivada");
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  const handleRemoveMiembro = async (usuarioId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de remover a ${nombre} del proyecto?`)) return;

    try {
      if (!id) return;
      await removeProjectMemberMutation.mutateAsync({ projectId: id, userId: usuarioId });
      // Mutation handles success toast and auto-invalidates
    } catch (error: any) {
      // Mutation handles errors
    }
  };

  if (isLoading && !proyectoActual) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!proyectoActual) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <p className="text-muted-foreground">Proyecto no encontrado</p>
          <Button onClick={() => navigate("/proyectos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
        </div>
      </div>
    );
  }

  const tareasPorEstado = {
    Por_Hacer: tareas.filter((t) => t.estado === "Por_Hacer"),
    En_Progreso: tareas.filter((t) => t.estado === "En_Progreso"),
    Hecho: tareas.filter((t) => t.estado === "Hecho"),
    Bloqueado: tareas.filter((t) => t.estado === "Bloqueado"),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/proyectos")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{proyectoActual.nombre}</h1>
            <Badge className={estadoColors[proyectoActual.estado]}>
              {proyectoActual.estado.replace("_", " ")}
            </Badge>
          </div>
          {proyectoActual.descripcion && (
            <p className="text-muted-foreground max-w-3xl">{proyectoActual.descripcion}</p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowEditProjectModal(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tareas.length}</div>
            <p className="text-xs text-muted-foreground">
              {tareasPorEstado.Hecho.length} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{miembros.length}</div>
            <div className="flex -space-x-2 mt-2">
              {miembros.slice(0, 5).map((miembro) => (
                <Avatar key={miembro.usuarioId} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={miembro.usuario.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(miembro.usuario.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {miembros.length > 5 && (
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">+{miembros.length - 5}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stagesEnabled ? etapas.length : "—"}</div>
            <p className="text-xs text-muted-foreground">
              {stagesEnabled ? `${etapas.filter((e) => e.estado === "Completada").length} completadas` : "Gestión desactivada"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tareas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="miembros">Miembros</TabsTrigger>
        </TabsList>

        {/* Tareas Tab */}
        <TabsContent value="tareas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tareas del Proyecto</h2>
            <Button size="sm" onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>

          {tareas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay tareas en este proyecto</p>
                <Button onClick={handleCreateTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera tarea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-4">
              {/* Por Hacer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Por Hacer</h3>
                  <Badge variant="secondary">{tareasPorEstado.Por_Hacer.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tareasPorEstado.Por_Hacer.map((tarea) => (
                    <TaskCard
                      key={tarea.id}
                      tarea={tarea}
                      onClick={() => handleTaskClick(tarea.id)}
                      onEdit={() => handleEditTask(tarea)}
                      onDelete={() => handleDeleteTask(tarea.id, tarea.titulo)}
                    />
                  ))}
                </div>
              </div>

              {/* En Progreso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">En Progreso</h3>
                  <Badge variant="secondary">{tareasPorEstado.En_Progreso.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tareasPorEstado.En_Progreso.map((tarea) => (
                    <TaskCard
                      key={tarea.id}
                      tarea={tarea}
                      onClick={() => handleTaskClick(tarea.id)}
                      onEdit={() => handleEditTask(tarea)}
                      onDelete={() => handleDeleteTask(tarea.id, tarea.titulo)}
                    />
                  ))}
                </div>
              </div>

              {/* Hecho */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Hecho</h3>
                  <Badge variant="secondary">{tareasPorEstado.Hecho.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tareasPorEstado.Hecho.map((tarea) => (
                    <TaskCard
                      key={tarea.id}
                      tarea={tarea}
                      onClick={() => handleTaskClick(tarea.id)}
                      onEdit={() => handleEditTask(tarea)}
                      onDelete={() => handleDeleteTask(tarea.id, tarea.titulo)}
                    />
                  ))}
                </div>
              </div>

              {/* Bloqueado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Bloqueado</h3>
                  <Badge variant="secondary">{tareasPorEstado.Bloqueado.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tareasPorEstado.Bloqueado.map((tarea) => (
                    <TaskCard
                      key={tarea.id}
                      tarea={tarea}
                      onClick={() => handleTaskClick(tarea.id)}
                      onEdit={() => handleEditTask(tarea)}
                      onDelete={() => handleDeleteTask(tarea.id, tarea.titulo)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Etapas Tab */}
        <TabsContent value="etapas" className="space-y-4">
          <Card>
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Miembros Tab */}
        <TabsContent value="miembros" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Miembros del Proyecto</h2>
            <Button size="sm" onClick={() => setShowAddMiembroModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Miembro
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {miembros.map((miembro) => (
              <Card key={miembro.usuarioId}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={miembro.usuario.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(miembro.usuario.nombreCompleto)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{miembro.usuario.nombreCompleto}</h3>
                      <p className="text-sm text-muted-foreground">{miembro.usuario.email}</p>
                      {miembro.usuario.puestoTrabajo && (
                        <p className="text-xs text-muted-foreground">
                          {miembro.usuario.puestoTrabajo.titulo}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{miembro.rol}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveMiembro(miembro.usuarioId, miembro.usuario.nombreCompleto)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TaskDetailModal
        tareaId={selectedTaskId}
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
      />

      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={(open) => {
          setShowCreateTaskModal(open);
          if (!open) {
            setTaskToEdit(null);
            refetchTareas();
          }
        }}
        proyectoId={id || ""}
        tareaToEdit={taskToEdit}
        stagesEnabled={stagesEnabled}
      />

      <AddMiembroModal
        open={showAddMiembroModal}
        onOpenChange={setShowAddMiembroModal}
        proyectoId={id || ""}
      />

      <EditProjectModal
        open={showEditProjectModal}
        onOpenChange={(open) => {
          setShowEditProjectModal(open);
          if (!open && id) refetchProyecto();
        }}
        proyecto={proyectoActual}
      />

      <ConfirmDialog
        open={showDeleteEtapaConfirm}
        onOpenChange={setShowDeleteEtapaConfirm}
        onConfirm={confirmDeleteEtapa}
        title="¿Eliminar etapa?"
        description="Esta acción no se puede deshacer. Las tareas asociadas perderán esta etapa."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
