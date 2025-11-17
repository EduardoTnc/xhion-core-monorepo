import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronRight, Archive } from "lucide-react";
import { type Proyecto } from "@/services/projectService";
import { cn } from "@/lib/utils";
import { getDepartmentIcon } from "@/lib/department-icons";
import { useDepartmentStore } from "@/store/departmentStore";

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
  const { departamentos } = useDepartmentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(new Set());
  const [userToggledDepartments, setUserToggledDepartments] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);

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
    const groups = filteredProyectos.reduce<DepartmentGroup[]>((acc, proyecto) => {
      const departamentoMeta = proyecto.departamento as (typeof proyecto.departamento & {
        color?: string | null;
        icono?: string | null;
      }) | null | undefined;
      const deptId = departamentoMeta?.id || "sin-departamento";
      const deptNombre = departamentoMeta?.nombre || "Sin Departamento";
      const fallbackMeta = departmentMetaMap[deptId];
      const deptColor = departamentoMeta?.color ?? fallbackMeta?.color ?? null;
      const deptIcono = departamentoMeta?.icono ?? fallbackMeta?.icono ?? null;

      let group = acc.find((g) => g.id === deptId);
      if (!group) {
        group = { id: deptId, nombre: deptNombre, proyectos: [], color: deptColor, icono: deptIcono };
        acc.push(group);
      }
      if (!group.color && deptColor) {
        group.color = deptColor;
      }
      if (!group.icono && deptIcono) {
        group.icono = deptIcono;
      }
      group.proyectos.push(proyecto);
      return acc;
    }, []);

    groups.sort((a, b) => {
      if (a.id === "sin-departamento") return 1;
      if (b.id === "sin-departamento") return -1;
      return a.nombre.localeCompare(b.nombre);
    });

    return groups;
  }, [filteredProyectos, departmentMetaMap]);

  const departmentIds = useMemo(() => groupedByDepartment.map((dept) => dept.id), [groupedByDepartment]);

  const allDepartmentsExpanded = useMemo(
    () => departmentIds.length > 0 && departmentIds.every((id) => openDepartments.has(id)),
    [departmentIds, openDepartments]
  );

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

  const renderProjectRow = (
    proyecto: Proyecto,
    isSelected: boolean,
    colorOptions: { hasHexColor: boolean; accentHex?: string; accentClass?: string },
    projectIndex: number
  ) => {
    const { hasHexColor, accentHex, accentClass } = colorOptions;
    const progress = calculateProgress(proyecto);
    const estadoLabel = proyecto.estado.replace(/_/g, " ");
    const projectCode = (proyecto as { codigo?: string | null }).codigo;
    const zebraBackground = hasHexColor && accentHex
      ? isSelected
        ? hexToRgba(accentHex, 0.22)
        : projectIndex % 2 === 0
          ? hexToRgba(accentHex, 0.08)
          : hexToRgba(accentHex, 0.04)
      : undefined;
    const borderTone = hasHexColor && accentHex ? hexToRgba(accentHex, 0.3) : undefined;
    return (
      <button
        key={proyecto.id}
        onClick={() => onProjectSelect(proyecto.id)}
        className={cn(
          "w-full rounded-lg border px-4 py-3 text-left text-xs text-muted-foreground transition",
          isSelected ? "text-foreground shadow" : "hover:border-foreground/40 hover:text-foreground"
        )}
        style={{
          borderColor: borderTone,
          borderLeftColor: hasHexColor ? accentHex : undefined,
          borderLeftWidth: 6,
          backgroundColor: zebraBackground,
        }}
      >
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", !hasHexColor && accentClass)}
              style={hasHexColor ? { backgroundColor: accentHex } : undefined}
            />
            {proyecto.departamento?.nombre || "Sin departamento"}
          </span>
          <span>{estadoLabel}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-foreground">{proyecto.nombre}</span>
          <span className="text-[11px] text-muted-foreground">#{projectCode?.slice(-4) ?? proyecto.id.slice(-4)}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] leading-snug">
          <div>
            Responsable
            <span className="block font-medium text-foreground normal-case">
              {proyecto.responsable?.nombreCompleto || "Sin asignar"}
            </span>
          </div>
          <div>
            Inicio
            <span className="block font-medium text-foreground normal-case">{formatDateLabel(proyecto.fechaInicio)}</span>
          </div>
          <div>
            Fin
            <span className="block font-medium text-foreground normal-case">{formatDateLabel(proyecto.fechaFin)}</span>
          </div>
          <div>
            Miembros
            <span className="block font-medium text-foreground normal-case">
              {proyecto._count?.miembros ?? 0} personas
            </span>
          </div>
          <div>
            Tareas
            <span className="block font-medium text-foreground normal-case">
              {proyecto._count?.tareas ?? 0} abiertas
            </span>
          </div>
          <div>
            Etapas
            <span className="block font-medium text-foreground normal-case">
              {proyecto._count?.etapas ?? 0} activas
            </span>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] tracking-wide text-muted-foreground">
          {progress}% de avance · {proyecto._count?.tareas ?? 0} tareas · {proyecto._count?.miembros ?? 0} miembros
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-background text-foreground">
      <div className="border-b border-border p-4 text-xs">

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
          <Button onClick={onCreateProject} size="sm" className="w-full rounded-md bg-foreground text-background hover:bg-foreground/90">
            <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
          </Button>
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
            const accentSoftBg = hasHexColor && accentHex ? hexToRgba(accentHex, 0.08) : undefined;
            const accentSoftBorder = hasHexColor && accentHex ? hexToRgba(accentHex, 0.3) : undefined;

            return (
              <section key={department.id} className="px-3 py-2">
                <div
                  className={cn(
                    "rounded-2xl border border-border/60 bg-card/40 transition-colors",
                    !hasHexColor && "bg-muted/30"
                  )}
                  style={
                    hasHexColor && accentHex
                      ? {
                          borderColor: hexToRgba(accentHex, 0.25),
                          backgroundColor: hexToRgba(accentHex, 0.05),
                        }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleDepartment(department.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                      isDeptSelected ? "shadow-inner" : "opacity-95"
                    )}
                    style={
                      hasHexColor && accentHex
                        ? {
                            backgroundColor: hexToRgba(accentHex, 0.12),
                            borderColor: hexToRgba(accentHex, 0.35),
                            borderWidth: 1,
                            borderStyle: "solid",
                          }
                        : undefined
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
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        !hasHexColor && accentClass,
                        !hasHexColor && rawColor && "text-white"
                      )}
                      style={
                        hasHexColor && accentHex
                          ? {
                              backgroundColor: hexToRgba(accentHex, 0.18),
                              borderColor: hexToRgba(accentHex, 0.45),
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
                      <p className="text-[11px] text-muted-foreground">
                        {department.proyectos.length} proyectos
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className={cn(
                        "space-y-3 border-t px-4 pb-4 pt-3",
                        !hasHexColor && "bg-muted/20"
                      )}
                      style={
                        hasHexColor && accentHex
                          ? {
                              borderColor: accentSoftBorder,
                              backgroundColor: accentSoftBg,
                            }
                          : undefined
                      }
                    >
                      {department.proyectos.map((proyecto, index) =>
                        renderProjectRow(
                          proyecto,
                          proyecto.id === selectedProjectId,
                          { hasHexColor, accentHex, accentClass },
                          index
                        )
                      )}
                    </div>
                  )}
                </div>
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
  );
}
