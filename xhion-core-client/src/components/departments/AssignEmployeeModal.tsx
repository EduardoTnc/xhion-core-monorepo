import { useState, useEffect, useMemo } from "react";
import { UserPlus, Search, Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import apiClient from "@/api/axios";

// Predefined department roles
const DEPARTMENT_ROLES = [
  { value: "Miembro", label: "Miembro", description: "Colaborador general del departamento" },
  { value: "Coordinador", label: "Coordinador", description: "Coordina actividades y proyectos" },
  { value: "Especialista", label: "Especialista", description: "Experto en área específica" },
  { value: "Analista", label: "Analista", description: "Análisis y reportes" },
  { value: "Desarrollador", label: "Desarrollador", description: "Desarrollo e implementación" },
  { value: "Diseñador", label: "Diseñador", description: "Diseño y creatividad" },
  { value: "Consultor", label: "Consultor", description: "Asesoría y consultoría" },
  { value: "Asistente", label: "Asistente", description: "Apoyo administrativo" },
];

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string;
  rol?: {
    nombre: string;
    color?: string;
  };
}

interface AssignEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentoId: string;
  departamentoNombre: string;
  onSuccess?: () => void;
}

export function AssignEmployeeModal({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  onSuccess,
}: AssignEmployeeModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Cargar todos los usuarios
  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      setSelectedUsers({});
      setSearchTerm("");
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await apiClient.get("/usuarios");
      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev[userId]) {
        const { [userId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [userId]: "Miembro" };
    });
  };

  const updateUserRole = (userId: string, role: string) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm.trim()) return availableUsers;
    const term = searchTerm.toLowerCase();
    return availableUsers.filter(
      (usuario) =>
        usuario.nombreCompleto.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
    );
  }, [availableUsers, searchTerm]);

  const selectedCount = Object.keys(selectedUsers).length;

  const onSubmit = async () => {
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un empleado");
      return;
    }

    setIsLoading(true);
    try {
      for (const [usuarioId, rolDepartamento] of Object.entries(selectedUsers)) {
        await apiClient.post(`/departamentos/${departamentoId}/asignar-usuario`, {
          usuarioId,
          rolDepartamento,
        });
      }

      toast.success(`${selectedCount} empleado(s) asignado(s) exitosamente al departamento`);
      setSelectedUsers({});
      setSearchTerm("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error assigning employees:", error);
      toast.error(error.response?.data?.message || "Error al asignar empleados");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setSelectedUsers({});
          setSearchTerm("");
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="w-[95vw] max-w-[780px] max-h-[90vh] flex flex-col sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Asignar empleados a {departamentoNombre}
          </DialogTitle>
          <DialogDescription>
            Selecciona varios usuarios y define sus roles en una sola vista
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Disponibles: {availableUsers.length}</span>
              </div>
              <div>Seleccionados: {selectedCount}</div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o correo"
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/70 flex-1 min-h-0">
            {isFetchingUsers || availableUsers.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                {isFetchingUsers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando usuarios disponibles...
                  </>
                ) : (
                  "No hay usuarios disponibles"
                )}
              </div>
            ) : (
              <ScrollArea className="m-4 h-full max-h-[55vh] sm:max-h-[60vh] lg:max-h-[520px]">
                <div className="divide-y divide-border/30">
                  {filteredUsuarios.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                      No se encontraron usuarios con ese criterio
                    </div>
                  ) : (
                    filteredUsuarios.map((usuario) => {
                      const isSelected = Boolean(selectedUsers[usuario.id]);
                      return (
                        <div
                          key={usuario.id}
                          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div className="flex items-start gap-3 sm:flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleUserSelection(usuario.id)}
                              className="mt-1"
                            />
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={usuario.avatarUrl} alt={usuario.nombreCompleto} />
                              <AvatarFallback className="text-[11px]">
                                {getInitials(usuario.nombreCompleto)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {usuario.nombreCompleto}
                              </p>
                              <p className="text-xs text-muted-foreground break-all sm:truncate">
                                {usuario.email}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedUsers[usuario.id] === "Coordinador" && "Coordina actividades y proyectos"}
                                {selectedUsers[usuario.id] === "Miembro" && "Colaborador general del departamento"}
                                {selectedUsers[usuario.id] === "Especialista" && "Experto en área específica"}
                                {selectedUsers[usuario.id] === "Analista" && "Análisis y reportes"}
                                {selectedUsers[usuario.id] === "Desarrollador" && "Desarrollo e implementación"}
                                {selectedUsers[usuario.id] === "Diseñador" && "Diseño y creatividad"}
                                {selectedUsers[usuario.id] === "Consultor" && "Asesoría y consultoría"}
                                {selectedUsers[usuario.id] === "Asistente" && "Apoyo administrativo"}
                              </p>
                            </div>
                          </div>
                          <div className="flex w-full items-center gap-2 sm:w-40 sm:justify-end">
                            <Select
                              value={selectedUsers[usuario.id] || "Miembro"}
                              onValueChange={(value) => updateUserRole(usuario.id, value)}
                              disabled={!isSelected}
                            >
                              <SelectTrigger className="w-full sm:w-36">
                                <SelectValue placeholder="Rol" />
                              </SelectTrigger>
                              <SelectContent>
                                {DEPARTMENT_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || isFetchingUsers || availableUsers.length === 0 || selectedCount === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar {selectedCount > 0 ? `${selectedCount} empleado(s)` : "empleados"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
