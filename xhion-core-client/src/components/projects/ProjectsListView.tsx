import { useEffect, useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ProjectsListView() {
  const navigate = useNavigate();
  const { proyectos, isLoading, error, fetchProyectos, deleteProyecto } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      await fetchProyectos();
    } catch (error: any) {
      toast.error(error.message || "Error al cargar proyectos");
    }
  };

  const handleDeleteProyecto = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proyecto "${nombre}"?`)) {
      return;
    }

    try {
      await deleteProyecto(id);
      toast.success("Proyecto eliminado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar proyecto");
    }
  };

  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesSearch =
      proyecto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proyecto.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado = estadoFilter === "all" || proyecto.estado === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  if (isLoading && proyectos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadProyectos}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">
            Gestiona y visualiza todos tus proyectos
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
            <SelectItem value="En_Pausa">En Pausa</SelectItem>
            <SelectItem value="Archivado">Archivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Proyectos */}
      {filteredProyectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <p className="text-muted-foreground">
            {searchQuery || estadoFilter !== "all"
              ? "No se encontraron proyectos con los filtros aplicados"
              : "No tienes proyectos aún"}
          </p>
          {!searchQuery && estadoFilter === "all" && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear tu primer proyecto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProyectos.map((proyecto) => (
            <ProjectCard
              key={proyecto.id}
              proyecto={proyecto}
              onClick={() => navigate(`/proyectos/${proyecto.id}`)}
              onDelete={() => handleDeleteProyecto(proyecto.id, proyecto.nombre)}
            />
          ))}
        </div>
      )}

      {/* Modal de Crear Proyecto */}
      <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
