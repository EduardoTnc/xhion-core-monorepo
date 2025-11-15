import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { CreateEtapaModal } from "@/components/projects/CreateEtapaModal";
import { AddMiembroModal } from "@/components/projects/AddMiembroModal";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import {
  ArrowLeft,
  Users,
  ListTodo,
  Calendar,
  Settings,
  Plus,
  Loader2,
  Trash2,
  Edit,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const { proyectoActual, etapas, miembros, fetchProyectoById, fetchEtapas, fetchMiembros, deleteEtapa, removeMiembro, isLoading } = useProjectStore();
  const { tareas, fetchTareas, deleteTarea } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateEtapaModal, setShowCreateEtapaModal] = useState(false);
  const [showAddMiembroModal, setShowAddMiembroModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [etapaToEdit, setEtapaToEdit] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  // Abrir modal de tarea si se llega con state.openTaskId desde el Gantt
  useEffect(() => {
    const state = location.state as any
    if (state?.openTaskId) {
      setSelectedTaskId(state.openTaskId)
      setShowTaskModal(true)
    }
    // No limpiar el state aquí para permitir back/forward mantener contexto
  }, [location.state])

  const loadProjectData = async (projectId: string) => {
    try {
      await Promise.all([
        fetchProyectoById(projectId),
        fetchEtapas(projectId),
        fetchMiembros(projectId),
        fetchTareas({ proyectoId: projectId }),
      ]);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar proyecto");
      navigate("/proyectos");
    }
  };

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
      await deleteTarea(tareaId);
      toast.success("Tarea eliminada exitosamente");
      if (id) await fetchTareas({ proyectoId: id });
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar tarea");
    }
  };

  const handleCreateEtapa = () => {
    setEtapaToEdit(null);
    setShowCreateEtapaModal(true);
  };

  const handleEditEtapa = (etapa: any) => {
    setEtapaToEdit(etapa);
    setShowCreateEtapaModal(true);
  };

  const handleDeleteEtapa = async (etapaId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la etapa "${nombre}"?`)) return;
    
    try {
      if (!id) return;
      await deleteEtapa(id, etapaId);
      toast.success("Etapa eliminada exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar etapa");
    }
  };

  const handleRemoveMiembro = async (usuarioId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de remover a ${nombre} del proyecto?`)) return;
    
    try {
      if (!id) return;
      await removeMiembro(id, usuarioId);
      toast.success("Miembro removido exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al remover miembro");
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
            <div className="text-2xl font-bold">{etapas.length}</div>
            <p className="text-xs text-muted-foreground">
              {etapas.filter((e) => e.estado === "Completada").length} completadas
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Etapas del Proyecto</h2>
            <Button size="sm" onClick={handleCreateEtapa}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Etapa
            </Button>
          </div>

          {etapas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay etapas definidas</p>
                <Button onClick={handleCreateEtapa}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera etapa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {etapas.map((etapa, index) => (
                <Card key={etapa.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{etapa.nombre}</h3>
                          {etapa.descripcion && (
                            <p className="text-sm text-muted-foreground">{etapa.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={etapa.estado === "Completada" ? "default" : "secondary"}
                        >
                          {etapa.estado.replace("_", " ")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEtapa(etapa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteEtapa(etapa.id, etapa.nombre)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
            if (id) fetchTareas({ proyectoId: id });
          }
        }}
        proyectoId={id || ""}
        tareaToEdit={taskToEdit}
      />

      <CreateEtapaModal
        open={showCreateEtapaModal}
        onOpenChange={(open) => {
          setShowCreateEtapaModal(open);
          if (!open) setEtapaToEdit(null);
        }}
        proyectoId={id || ""}
        etapaToEdit={etapaToEdit}
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
          if (!open && id) fetchProyectoById(id);
        }}
        proyecto={proyectoActual}
      />
    </div>
  );
}
