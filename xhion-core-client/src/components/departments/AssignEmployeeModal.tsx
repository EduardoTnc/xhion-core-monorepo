"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const assignEmployeeSchema = z.object({
  usuarioId: z.string().min(1, "Selecciona un empleado"),
  puestoTrabajoId: z.string().min(1, "Selecciona un puesto"),
});

type AssignEmployeeFormData = z.infer<typeof assignEmployeeSchema>;

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

interface PuestoTrabajo {
  id: string;
  titulo: string;
  descripcion?: string;
}

interface AssignEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentoId: string;
  departamentoNombre: string;
  puestosTrabajo: PuestoTrabajo[];
  onSuccess?: () => void;
}

export function AssignEmployeeModal({
  open,
  onOpenChange,
  departamentoId,
  departamentoNombre,
  puestosTrabajo,
  onSuccess,
}: AssignEmployeeModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssignEmployeeFormData>({
    resolver: zodResolver(assignEmployeeSchema),
  });

  const selectedUserId = watch("usuarioId");
  const selectedUser = availableUsers.find((u) => u.id === selectedUserId);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Cargar usuarios disponibles (sin puesto asignado)
  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await fetch("/api/v1/usuarios/sin-puesto/disponibles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar usuarios disponibles");
      }

      const data = await response.json();
      setAvailableUsers(data);
    } catch (error) {
      console.error("Error fetching available users:", error);
      toast.error("Error al cargar usuarios disponibles");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const onSubmit = async (data: AssignEmployeeFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/usuarios/${data.usuarioId}/asignar-puesto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            puestoTrabajoId: data.puestoTrabajoId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al asignar empleado");
      }

      toast.success("Empleado asignado exitosamente");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast.error("Error al asignar empleado");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Asignar Empleado a {departamentoNombre}
          </DialogTitle>
          <DialogDescription>
            Selecciona un empleado disponible y asígnale un puesto en este departamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Búsqueda de Empleados */}
          <div className="space-y-3">
            <Label>Buscar Empleado</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Empleados Disponibles */}
          <div className="space-y-2">
            <Label>
              Empleados Disponibles ({filteredUsers.length})
            </Label>
            {isFetchingUsers ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando empleados...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "No se encontraron empleados con ese criterio"
                  : "No hay empleados disponibles sin puesto asignado"}
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg p-2">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setValue("usuarioId", user.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "hover:bg-muted border-2 border-transparent"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.nombreCompleto} />
                        <AvatarFallback>{getInitials(user.nombreCompleto)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.nombreCompleto}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.rol && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: user.rol.color
                              ? `${user.rol.color}20`
                              : undefined,
                            borderColor: user.rol.color || undefined,
                            color: user.rol.color || undefined,
                          }}
                        >
                          {user.rol.nombre}
                        </Badge>
                      )}
                      {selectedUserId === user.id && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {errors.usuarioId && (
              <p className="text-sm text-destructive">{errors.usuarioId.message}</p>
            )}
          </div>

          {/* Selección de Puesto */}
          {selectedUser && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label>Empleado Seleccionado</Label>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.nombreCompleto} />
                  <AvatarFallback>{getInitials(selectedUser.nombreCompleto)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.nombreCompleto}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="puestoTrabajoId">
              Puesto de Trabajo <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("puestoTrabajoId", value)}
              disabled={!selectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un puesto" />
              </SelectTrigger>
              <SelectContent>
                {puestosTrabajo.map((puesto) => (
                  <SelectItem key={puesto.id} value={puesto.id}>
                    <div>
                      <p className="font-medium">{puesto.titulo}</p>
                      {puesto.descripcion && (
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {puesto.descripcion}
                        </p>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.puestoTrabajoId && (
              <p className="text-sm text-destructive">{errors.puestoTrabajoId.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !selectedUserId}>
              {isLoading ? "Asignando..." : "Asignar Empleado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
