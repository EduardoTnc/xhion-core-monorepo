import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ChevronRight,
  Archive,
  Copy,
  ClipboardCopy,
  CornerRightUp,
  Edit3,
  Trash2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { type Departamento } from "@/services/departmentService";
import { cn } from "@/lib/utils";
import { getDepartmentIcon } from "@/lib/department-icons";
import { useDepartmentStore } from "@/store/departmentStore";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { EditProjectModal } from "./EditProjectModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateDepartmentModal } from "@/components/departments/CreateDepartmentModal";
import { DepartmentContextModal } from "@/components/departments/DepartmentContextModal";
import { Restricted } from "../auth/Restricted";

interface ProjectSidebarShadcnProps {
  proyectos: Proyecto[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

interface DepartmentGroup {
  id: string;
  nombre: string;
  proyectos: Proyecto[];
  color?: string | null;
  icono?: string | null;
}

const isHexColor = (value?: string | null) => {
  if (!value || typeof value !== "string") return false;
  return /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value.trim());
};

const hexToRgba = (hex: string, alpha = 0.18) => {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (sanitized.length === 4) {
    const [r, g, b] = sanitized.split("");
    sanitized = `${r}${r}${g}${g}${b}${b}`;
  } else if (sanitized.length === 8) {
    sanitized = sanitized.slice(0, 6);
  }

  const parsed = parseInt(sanitized, 16);
  if (Number.isNaN(parsed)) return `rgba(42, 43, 48, ${alpha})`;

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function ProjectSidebarShadcn({
  proyectos,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
}: ProjectSidebarShadcnProps) {
  const { departamentos, deleteDepartamento: deleteDepartment, restoreDepartamento } = useDepartmentStore();
  const { duplicateProyecto, deleteProyecto, updateProyecto } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(new Set());
  const [userToggledDepartments, setUserToggledDepartments] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Proyecto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Proyecto | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Departamento | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForContext, setDepartmentForContext] = useState<Departamento | null>(null);
  const [showDepartmentContextModal, setShowDepartmentContextModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Departamento | null>(null);
  const [showDeleteDepartmentDialog, setShowDeleteDepartmentDialog] = useState(false);
  const [departmentIdForNewProject, setDepartmentIdForNewProject] = useState<string | null>(null);
  const [showQuickCreateProjectModal, setShowQuickCreateProjectModal] = useState(false);

  // Separar proyectos activos y archivados
  const proyectosActivos = useMemo(() => proyectos.filter((p) => p.estado !== "Archivado"), [proyectos]);
  const proyectosArchivados = useMemo(() => proyectos.filter((p) => p.estado === "Archivado"), [proyectos]);

  // Filtrar proyectos por búsqueda
  const filteredProyectos = useMemo(() => {
    return (showArchived ? proyectosArchivados : proyectosActivos).filter((proyecto) =>
      proyecto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [proyectosActivos, proyectosArchivados, searchQuery, showArchived]);

  // Agrupar proyectos por departamento
  const departmentMetaMap = useMemo(() => {
    return (departamentos || []).reduce<Record<string, { color?: string | null; icono?: string | null }>>(
      (acc, dept) => {
        acc[dept.id] = { color: dept.color, icono: dept.icono };
        return acc;
      },
      {}
    );
  }, [departamentos]);

  const groupedByDepartment = useMemo(() => {
    const groupsMap = new Map<string, DepartmentGroup>();

    filteredProyectos.forEach((proyecto) => {
      const departamentoMeta = proyecto.departamento as (typeof proyecto.departamento & {
        color?: string | null;
        icono?: string | null;
      }) | null | undefined;
      const deptId = departamentoMeta?.id || "sin-departamento";
      const deptNombre = departamentoMeta?.nombre || "Sin Departamento";
      const fallbackMeta = departmentMetaMap[deptId];
      const deptColor = departamentoMeta?.color ?? fallbackMeta?.color ?? null;
      const deptIcono = departamentoMeta?.icono ?? fallbackMeta?.icono ?? null;

      if (!groupsMap.has(deptId)) {
        groupsMap.set(deptId, {
          id: deptId,
          nombre: deptNombre,
          proyectos: [],
          color: deptColor,
          icono: deptIcono,
        });
      }

      const group = groupsMap.get(deptId)!;
      if (!group.color && deptColor) {
        group.color = deptColor;
      }
      if (!group.icono && deptIcono) {
        group.icono = deptIcono;
      }
      group.proyectos.push(proyecto);
    });

    (departamentos || []).forEach((dept) => {
      if (!groupsMap.has(dept.id)) {
        groupsMap.set(dept.id, {
          id: dept.id,
          nombre: dept.nombre,
          proyectos: [],
          color: dept.color,
          icono: dept.icono,
        });
      }
    });

    const groups = Array.from(groupsMap.values());
    groups.sort((a, b) => {
      if (a.id === "sin-departamento") return 1;
      if (b.id === "sin-departamento") return -1;
      return a.nombre.localeCompare(b.nombre);
    });

    return groups;
  }, [filteredProyectos, departmentMetaMap, departamentos]);

  const departmentIds = useMemo(() => groupedByDepartment.map((dept) => dept.id), [groupedByDepartment]);

  const allDepartmentsExpanded = useMemo(
    () => departmentIds.length > 0 && departmentIds.every((id) => openDepartments.has(id)),
    [departmentIds, openDepartments]
  );

  const departmentDataMap = useMemo(() => {
    return (departamentos || []).reduce<Record<string, Departamento>>((acc, dept) => {
      acc[dept.id] = dept;
      return acc;
    }, {});
  }, [departamentos]);

  // Auto-abrir departamento del proyecto seleccionado
  const selectedProject = proyectos.find((p) => p.id === selectedProjectId);
  const selectedDeptId = selectedProject?.departamento?.id || "sin-departamento";

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });

    // Marcar que el usuario interactuó manualmente
    setUserToggledDepartments((prev) => {
      const newSet = new Set(prev);
      newSet.add(deptId);
      return newSet;
    });
  };

  const handleToggleAllDepartments = () => {
    if (departmentIds.length === 0) return;

    if (allDepartmentsExpanded) {
      setOpenDepartments(new Set());
      setUserToggledDepartments(new Set(departmentIds));
    } else {
      const newOpen = new Set(departmentIds);
      setOpenDepartments(newOpen);
      setUserToggledDepartments(new Set(departmentIds));
    }
  };

  const handleOpenEditProject = (project: Proyecto) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  const handleDuplicateProject = async (project: Proyecto) => {
    try {
      await duplicateProyecto(project.id);
      toast.success(`Proyecto "${project.nombre}" duplicado`);
    } catch (error: any) {
      toast.error(error.message || "Error al duplicar proyecto");
    }
  };

  const handleToggleArchiveProject = async (project: Proyecto) => {
    const nextEstado = project.estado === "Archivado" ? "Activo" : "Archivado";
    try {
      await updateProyecto(project.id, { estado: nextEstado });
      toast.success(
        nextEstado === "Archivado"
          ? `Proyecto "${project.nombre}" archivado`
          : `Proyecto "${project.nombre}" reactivado`
      );
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar proyecto");
    }
  };

  const handleCopyProjectId = async (project: Proyecto) => {
    try {
      await navigator.clipboard?.writeText(project.id);
      toast.success("ID del proyecto copiado");
    } catch {
      toast.error("No se pudo copiar el ID del proyecto");
    }
  };

  const handleRequestDeleteProject = (project: Proyecto) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProyecto(projectToDelete.id);
      toast.success(`Proyecto "${projectToDelete.nombre}" eliminado`);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar proyecto");
    } finally {
      setProjectToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const calculateProgress = (proyecto: Proyecto) => {
    if (!proyecto._count?.tareas) return 0;
    if (proyecto.estado === "Completado") return 100;
    return Math.min(proyecto._count.tareas * 8, 92);
  };

  const formatDateLabel = (value?: string | null) => {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleOpenDepartmentEdit = (department?: Departamento) => {
    if (!department) return;
    setDepartmentToEdit(department);
    setShowDepartmentModal(true);
  };

  const handleOpenDepartmentContext = (department?: Departamento) => {
    if (!department) return;
    setDepartmentForContext(department);
    setShowDepartmentContextModal(true);
  };

  const handleCopyDepartmentId = async (departmentId: string) => {
    try {
      await navigator.clipboard?.writeText(departmentId);
      toast.success("ID del departamento copiado");
    } catch {
      toast.error("No se pudo copiar el ID del departamento");
    }
  };

  const handleOpenCreateProjectForDepartment = (departmentId?: string | null) => {
    setDepartmentIdForNewProject(departmentId ?? null);
    setShowQuickCreateProjectModal(true);
  };

  const handleOpenDepartmentDetail = (departmentId: string) => {
    window.open(`/departamentos/${departmentId}`, "_blank", "noopener,noreferrer");
  };

  const handleRequestDeleteDepartment = (department?: Departamento) => {
    if (!department) return;
    setDepartmentToDelete(department);
    setShowDeleteDepartmentDialog(true);
  };

  const handleConfirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteDepartment(departmentToDelete.id);
      toast.success(`Departamento "${departmentToDelete.nombre}" eliminado`);
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar departamento");
    } finally {
      setDepartmentToDelete(null);
      setShowDeleteDepartmentDialog(false);
    }
  };

  const handleRestoreDepartmentAction = async (department?: Departamento) => {
    if (!department) return;
    try {
      await restoreDepartamento(department.id);
      toast.success(`Departamento "${department.nombre}" restaurado`);
    } catch (error: any) {
      toast.error(error?.message || "Error al restaurar departamento");
    }
  };

  const renderProjectRow = (
    proyecto: Proyecto,
    isSelected: boolean,
    colorOptions: { hasHexColor: boolean; accentHex?: string; accentClass?: string },
    projectIndex: number
  ) => {
    const { hasHexColor, accentHex, accentClass } = colorOptions;
    const progress = calculateProgress(proyecto);
    const estadoLabel = proyecto.estado.replace(/_/g, " ");
    const zebraBackground = hasHexColor && accentHex
      ? isSelected
        ? hexToRgba(accentHex, 0.22)
        : projectIndex % 2 === 0
          ? hexToRgba(accentHex, 0.08)
          : hexToRgba(accentHex, 0.04)
      : undefined;
    const borderTone = hasHexColor && accentHex ? hexToRgba(accentHex, 0.25) : undefined;
    return (
      <ContextMenu key={proyecto.id}>
        <HoverCard openDelay={200} closeDelay={100}>
          <ContextMenuTrigger asChild>
            <HoverCardTrigger asChild>
              <button
                type="button"
                onClick={() => onProjectSelect(proyecto.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-sm px-3 py-1.5 text-left text-sm transition",
                  isSelected
                    ? "bg-foreground/15 text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                style={{
                  backgroundColor: isSelected ? zebraBackground ?? undefined : zebraBackground,
                  borderLeft: hasHexColor || borderTone ? `2px solid ${accentHex ?? borderTone ?? "var(--border)"}` : undefined,
                }}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    !hasHexColor && accentClass
                  )}
                  style={hasHexColor ? { backgroundColor: accentHex } : undefined}
                />
                <p className="flex-1 truncate font-medium tracking-tight">{proyecto.nombre}</p>
              </button>
            </HoverCardTrigger>
          </ContextMenuTrigger>
          <HoverCardContent align="start" side="right" className="w-80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{proyecto.nombre}</p>
              <Badge variant="outline" className="text-[10px] uppercase">
                {estadoLabel}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground/80">Responsable</p>
                <p className="font-medium text-foreground">
                  {proyecto.responsable?.nombreCompleto || "Sin asignar"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground/80">Departamento</p>
                <p className="font-medium text-foreground">
                  {proyecto.departamento?.nombre || "Sin departamento"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground/80">Inicio</p>
                <p className="font-medium text-foreground">{formatDateLabel(proyecto.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground/80">Fin</p>
                <p className="font-medium text-foreground">{formatDateLabel(proyecto.fechaFin)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div>
                <p className="text-xs font-semibold text-foreground">{proyecto._count?.tareas ?? 0}</p>
                Tareas
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{proyecto._count?.miembros ?? 0}</p>
                Miembros
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{proyecto._count?.etapas ?? 0}</p>
                Etapas
              </div>
            </div>
            <div>
              <div className="h-1.5 rounded-full bg-border/70">
                <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{progress}% de avance</p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="w-48">
          <ContextMenuItem className="gap-2" onClick={() => onProjectSelect(proyecto.id)}>
            <CornerRightUp className="h-4 w-4" /> Abrir proyecto
          </ContextMenuItem>
          <ContextMenuItem className="gap-2" onClick={() => handleOpenEditProject(proyecto)}>
            <Edit3 className="h-4 w-4" /> Editar
          </ContextMenuItem>
          <ContextMenuItem className="gap-2" onClick={() => handleDuplicateProject(proyecto)}>
            <Copy className="h-4 w-4" /> Duplicar
          </ContextMenuItem>
          <ContextMenuItem className="gap-2" onClick={() => handleToggleArchiveProject(proyecto)}>
            <Archive className="h-4 w-4" />
            {proyecto.estado === "Archivado" ? "Reactivar" : "Archivar"}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="gap-2" onClick={() => handleCopyProjectId(proyecto)}>
            <ClipboardCopy className="h-4 w-4" /> Copiar ID
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={() => handleRequestDeleteProject(proyecto)}
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <>
      <div className="flex h-full w-full flex-col border-r border-border bg-background text-foreground">
        <div className="border-b border-border px-3 py-3 text-xs md:px-4">
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-border bg-transparent px-10 py-2 text-xs focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <Restricted to="proyectos.crear">
              <Button onClick={onCreateProject} size="sm" className="w-full rounded-md bg-foreground text-background hover:bg-foreground/90">
                <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
              </Button>
            </Restricted>
            <Button
              onClick={() => setShowArchived(!showArchived)}
              variant="outline"
              size="sm"
              className="w-full justify-between rounded-md border border-border bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Archive className="h-4 w-4" /> {showArchived ? "Ver proyectos activos" : "Ver proyectos archivados"}
              </span>
              {proyectosArchivados.length > 0 && (
                <Badge variant="secondary" className="rounded-md text-[10px]">
                  {proyectosArchivados.length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={handleToggleAllDepartments}
              variant="secondary"
              size="sm"
              disabled={groupedByDepartment.length === 0}
              className="w-full rounded-md border border-border/70 bg-transparent text-muted-foreground hover:text-foreground"
            >
              {allDepartmentsExpanded ? "Contraer todos" : "Expandir todos"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto project-sidebar-scroll">
          {groupedByDepartment.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {searchQuery ? "No se encontraron proyectos" : "No hay proyectos registrados"}
            </div>
          ) : (
            groupedByDepartment.map((department) => {
              const wasUserToggled = userToggledDepartments.has(department.id);
              const isOpen = wasUserToggled
                ? openDepartments.has(department.id)
                : openDepartments.has(department.id) || department.id === selectedDeptId;
              const departmentSource = department.proyectos[0]?.departamento as (typeof department.proyectos[0]["departamento"] & {
                color?: string | null;
                icono?: string | null;
              }) | undefined;
              const rawColor = department.color ?? departmentSource?.color;
              const hasHexColor = isHexColor(rawColor);
              const accentHex = hasHexColor ? rawColor! : undefined;
              const accentClass = !hasHexColor && rawColor ? rawColor : !hasHexColor ? "bg-muted/40" : undefined;
              const { icon: DepartmentIcon } = getDepartmentIcon(department.icono ?? departmentSource?.icono ?? undefined);
              const isDeptSelected = department.id === selectedDeptId;
              const hasProjects = department.proyectos.length > 0;

              return (
                <section
                  key={department.id}
                  className="border-b border-border/70 last:border-b-0"
                  style={
                    hasHexColor && accentHex
                      ? {
                        borderColor: hexToRgba(accentHex, 0.35),
                      }
                      : undefined
                  }
                >
                  <ContextMenu>
                    <HoverCard openDelay={150} closeDelay={100}>
                      <ContextMenuTrigger asChild>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleDepartment(department.id)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                              isDeptSelected ? "bg-muted/50" : "hover:bg-muted/40",
                              "border-l-2"
                            )}
                            style={
                              hasHexColor && accentHex
                                ? {
                                  borderColor: hexToRgba(accentHex, 0.8),
                                  backgroundColor: isDeptSelected ? hexToRgba(accentHex, 0.14) : undefined,
                                }
                                : { borderColor: "var(--border)" }
                            }
                          >
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isOpen && "rotate-90"
                              )}
                            />
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md border",
                                !hasHexColor && accentClass,
                                !hasHexColor && rawColor && "text-white"
                              )}
                              style={
                                hasHexColor && accentHex
                                  ? {
                                    backgroundColor: hexToRgba(accentHex, 0.15),
                                    borderColor: hexToRgba(accentHex, 0.4),
                                  }
                                  : undefined
                              }
                            >
                              <DepartmentIcon
                                className="h-4 w-4"
                                style={hasHexColor && accentHex ? { color: accentHex } : undefined}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold tracking-tight text-foreground">{department.nombre}</p>
                              <p
                                className={cn(
                                  "text-[11px]",
                                  hasProjects ? "text-muted-foreground" : "font-medium text-amber-600 dark:text-amber-400"
                                )}
                              >
                                {hasProjects ? (
                                  `${department.proyectos.length} proyectos`
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Sin proyectos
                                  </span>
                                )}
                              </p>
                            </div>
                          </button>
                        </HoverCardTrigger>
                      </ContextMenuTrigger>
                      <HoverCardContent align="start" side="right" className="w-80 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{department.nombre}</p>
                            {departmentDataMap[department.id]?.descripcion && (
                              <p className="text-xs text-muted-foreground">
                                {departmentDataMap[department.id]?.descripcion}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {departmentDataMap[department.id]?._count?.proyectos ?? department.proyectos.length} proyectos
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground/70">Líder</p>
                            <p className="font-medium text-foreground">
                              {departmentDataMap[department.id]?.jefe?.nombreCompleto || "Sin asignar"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground/70">Puestos</p>
                            <p className="font-medium text-foreground">
                              {departmentDataMap[department.id]?._count?.puestosTrabajo ?? 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground/70">Contexto</p>
                            <p className="font-medium text-foreground">
                              {departmentDataMap[department.id]?.contextoDepartamento ? "Documentado" : "Pendiente"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground/70">Creado</p>
                            <p className="font-medium text-foreground">
                              {departmentDataMap[department.id]?.fechaCreacion
                                ? formatDateLabel(departmentDataMap[department.id]?.fechaCreacion)
                                : "Sin fecha"}
                            </p>
                          </div>
                        </div>
                        {departmentDataMap[department.id]?.objetivos && (
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground/70">Objetivos</p>
                            <p className="text-[11px] text-foreground line-clamp-2">
                              {departmentDataMap[department.id]?.objetivos}
                            </p>
                          </div>
                        )}
                      </HoverCardContent>
                    </HoverCard>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem onClick={() => toggleDepartment(department.id)}>
                        {isOpen ? "Contraer" : "Expandir"}
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="gap-2"
                        onClick={() => handleOpenDepartmentDetail(department.id)}
                      >
                        <CornerRightUp className="h-4 w-4" /> Abrir en departamentos
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="gap-2"
                        disabled={!departmentDataMap[department.id]}
                        onClick={() => handleOpenDepartmentEdit(departmentDataMap[department.id])}
                      >
                        <Edit3 className="h-4 w-4" /> Editar departamento
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="gap-2"
                        disabled={!departmentDataMap[department.id]}
                        onClick={() => handleOpenDepartmentContext(departmentDataMap[department.id])}
                      >
                        <FileText className="h-4 w-4" /> Gestionar contexto
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="gap-2"
                        onClick={() => handleCopyDepartmentId(department.id)}
                      >
                        <ClipboardCopy className="h-4 w-4" /> Copiar ID
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      {departmentDataMap[department.id]?.fechaEliminacion ? (
                        <ContextMenuItem
                          className="gap-2"
                          onClick={() => handleRestoreDepartmentAction(departmentDataMap[department.id])}
                        >
                          <RotateCcw className="h-4 w-4" /> Restaurar
                        </ContextMenuItem>
                      ) : (
                        <ContextMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          disabled={!departmentDataMap[department.id]}
                          onClick={() => handleRequestDeleteDepartment(departmentDataMap[department.id])}
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>

                  {isOpen && (
                    <div
                      className="pl-10 pr-4 pb-3"
                      style={
                        hasHexColor && accentHex
                          ? {
                            background:
                              "linear-gradient(90deg, " +
                              hexToRgba(accentHex, 0.12) +
                              " 0%, rgba(0,0,0,0) 60%)",
                          }
                          : undefined
                      }
                    >
                      {hasProjects ? (
                        <div className="space-y-1 border-l border-dashed border-border/70 pl-4">
                          {department.proyectos.map((proyecto, index) =>
                            renderProjectRow(
                              proyecto,
                              proyecto.id === selectedProjectId,
                              { hasHexColor, accentHex, accentClass },
                              index
                            )
                          )}
                          <Restricted to="proyectos.crear">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenCreateProjectForDepartment(
                                  department.id === "sin-departamento" ? null : department.id
                                )
                              }
                              className="mt-1 flex items-center gap-1.5 rounded-full border border-dashed border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-border hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                              Nuevo proyecto
                            </button>
                          </Restricted>
                        </div>
                      ) : (
                        <div className="ml-1 rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                          <p className="text-xs font-medium text-foreground">Aún no hay proyectos</p>
                          <p className="text-[10px] leading-tight text-muted-foreground">
                            Empieza creando el primero para {department.nombre}.
                          </p>
                          <Restricted to="proyectos.crear">
                            <button
                              type="button"
                              onClick={() => handleOpenCreateProjectForDepartment(department.id)}
                              className="mt-2 inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                              Nuevo proyecto
                            </button>
                          </Restricted>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-2">
          <div className="grid grid-cols-3 gap-1 text-center text-[12px] text-muted-foreground">
            <div className="rounded-lg border border-border/70 px-2 py-1">
              <div className="text-sm font-semibold  text-foreground">{proyectos.length}</div>
              Total
            </div>
            <div className="rounded-lg border border-border/70 px-2 py-1">
              <div className="text-sm font-semibold  text-blue-500">
                {proyectosActivos.length}
              </div>
              Activos
            </div>
            <div className="rounded-lg border border-border/70 px-2 py-1">
              <div className="text-sm font-semibold  text-green-500">
                {proyectos.filter((p) => p.estado === "Completado").length}
              </div>
              Completos
            </div>
          </div>
        </div>
      </div>

      <EditProjectModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setProjectToEdit(null);
        }}
        proyecto={projectToEdit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDeleteProject}
        title="¿Eliminar proyecto?"
        description="Esta acción no se puede deshacer. El proyecto y todos sus datos relacionados serán eliminados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      <CreateDepartmentModal
        open={showDepartmentModal}
        onOpenChange={(open) => {
          setShowDepartmentModal(open);
          if (!open) setDepartmentToEdit(null);
        }}
        departamento={departmentToEdit}
      />

      <CreateProjectModal
        open={showQuickCreateProjectModal}
        onOpenChange={(open) => {
          setShowQuickCreateProjectModal(open);
          if (!open) setDepartmentIdForNewProject(null);
        }}
        departamentoIdPredeterminado={departmentIdForNewProject ?? undefined}
      />

      {departmentForContext ? (
        <DepartmentContextModal
          open={showDepartmentContextModal}
          onOpenChange={(open) => {
            setShowDepartmentContextModal(open);
            if (!open) setDepartmentForContext(null);
          }}
          departamentoId={departmentForContext.id}
          departamentoNombre={departmentForContext.nombre}
          contextoExistente={departmentForContext.contextoDepartamento as any}
        />
      ) : null}

      <ConfirmDialog
        open={showDeleteDepartmentDialog}
        onOpenChange={(open) => {
          setShowDeleteDepartmentDialog(open);
          if (!open) setDepartmentToDelete(null);
        }}
        onConfirm={handleConfirmDeleteDepartment}
        title="¿Eliminar departamento?"
        description="Esta acción no se puede deshacer. El departamento y su configuración serán eliminados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
