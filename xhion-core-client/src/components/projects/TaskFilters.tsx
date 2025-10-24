import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Calendar } from "lucide-react";
import { type ProyectoMiembro } from "@/services/projectService";

export interface TaskFiltersType {
  search: string;
  estado: string;
  prioridad: string;
  asignadoId: string;
  etapaId: string;
  fechaDesde: string;
  fechaHasta: string;
}

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  miembros: ProyectoMiembro[];
  etapas: Array<{ id: string; nombre: string }>;
}

const initialFilters: TaskFiltersType = {
  search: "",
  estado: "all",
  prioridad: "all",
  asignadoId: "all",
  etapaId: "all",
  fechaDesde: "",
  fechaHasta: "",
};

export function TaskFilters({ filters, onFiltersChange, miembros, etapas }: TaskFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.fechaDesde && filters.fechaHasta
      ? { from: new Date(filters.fechaDesde), to: new Date(filters.fechaHasta) }
      : undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange(initialFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== "";
    return value !== "all" && value !== "";
  }).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avanzados</SheetTitle>
          <SheetDescription>
            Filtra las tareas según tus criterios
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Buscar por título o descripción..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filters.estado}
              onValueChange={(value) => onFiltersChange({ ...filters, estado: value })}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Por_Hacer">Por Hacer</SelectItem>
                <SelectItem value="En_Progreso">En Progreso</SelectItem>
                <SelectItem value="Hecho">Hecho</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={filters.prioridad}
              onValueChange={(value) => onFiltersChange({ ...filters, prioridad: value })}
            >
              <SelectTrigger id="prioridad">
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asignado */}
          <div className="space-y-2">
            <Label htmlFor="asignado">Asignado a</Label>
            <Select
              value={filters.asignadoId}
              onValueChange={(value) => onFiltersChange({ ...filters, asignadoId: value })}
            >
              <SelectTrigger id="asignado">
                <SelectValue placeholder="Selecciona un miembro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los miembros</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                {miembros.map((miembro) => (
                  <SelectItem key={miembro.usuarioId} value={miembro.usuarioId}>
                    {miembro.usuario.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Etapa */}
          <div className="space-y-2">
            <Label htmlFor="etapa">Etapa</Label>
            <Select
              value={filters.etapaId}
              onValueChange={(value) => onFiltersChange({ ...filters, etapaId: value })}
            >
              <SelectTrigger id="etapa">
                <SelectValue placeholder="Selecciona una etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                <SelectItem value="none">Sin etapa</SelectItem>
                {etapas.map((etapa) => (
                  <SelectItem key={etapa.id} value={etapa.id}>
                    {etapa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="space-y-2">
            <Label htmlFor="fechas">
              <Calendar className="inline h-4 w-4 mr-1" />
              Rango de Fecha de Vencimiento
            </Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                onFiltersChange({
                  ...filters,
                  fechaDesde: range?.from?.toISOString().split("T")[0] || "",
                  fechaHasta: range?.to?.toISOString().split("T")[0] || "",
                });
              }}
              placeholder="Selecciona rango de fechas"
              numberOfMonths={2}
            />
            <p className="text-xs text-muted-foreground">
              Filtra tareas por rango de fecha de vencimiento
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to apply filters
export function applyTaskFilters(tareas: any[], filters: TaskFiltersType) {
  return tareas.filter((tarea) => {
    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        tarea.titulo.toLowerCase().includes(searchLower) ||
        tarea.descripcion?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Estado
    if (filters.estado !== "all" && tarea.estado !== filters.estado) {
      return false;
    }

    // Prioridad
    if (filters.prioridad !== "all" && tarea.prioridad !== filters.prioridad) {
      return false;
    }

    // Asignado
    if (filters.asignadoId !== "all") {
      if (filters.asignadoId === "unassigned" && tarea.asignadoId) {
        return false;
      }
      if (filters.asignadoId !== "unassigned" && tarea.asignadoId !== filters.asignadoId) {
        return false;
      }
    }

    // Etapa
    if (filters.etapaId !== "all") {
      if (filters.etapaId === "none" && tarea.etapaId) {
        return false;
      }
      if (filters.etapaId !== "none" && tarea.etapaId !== filters.etapaId) {
        return false;
      }
    }

    // Fecha Desde
    if (filters.fechaDesde && tarea.fechaVencimiento) {
      const fechaVencimiento = new Date(tarea.fechaVencimiento);
      const fechaDesde = new Date(filters.fechaDesde);
      if (fechaVencimiento < fechaDesde) return false;
    }

    // Fecha Hasta
    if (filters.fechaHasta && tarea.fechaVencimiento) {
      const fechaVencimiento = new Date(tarea.fechaVencimiento);
      const fechaHasta = new Date(filters.fechaHasta);
      if (fechaVencimiento > fechaHasta) return false;
    }

    return true;
  });
}
