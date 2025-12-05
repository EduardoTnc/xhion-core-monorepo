import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from "@/store/projectStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { Loader2, Search, Users } from "lucide-react";

interface AddMiembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
}

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string;
}

export function AddMiembroModal({ open, onOpenChange, proyectoId }: AddMiembroModalProps) {
  const { addMiembro, miembros, isLoading } = useProjectStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadUsuarios();
    }
  }, [open]);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const allUsuarios = await userService.obtenerTodosLosUsuarios();
      // Filtrar usuarios que ya son miembros
      const miembrosIds = miembros.map((m) => m.usuarioId)
      const usuariosDisponibles = allUsuarios
        .filter((u) => !miembrosIds.includes(u.id))
        .map((usuario) => ({
          ...usuario,
          avatarUrl: usuario.avatarUrl ?? undefined,
        }));
      setUsuarios(usuariosDisponibles);
    } catch (error: any) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoadingUsuarios(false);
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
    if (!searchTerm.trim()) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.nombreCompleto.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const selectedCount = Object.keys(selectedUsers).length;

  const handleAddMembers = async () => {
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un usuario");
      return;
    }

    try {
      setIsSubmitting(true);
      for (const [usuarioId, rol] of Object.entries(selectedUsers)) {
        await addMiembro(proyectoId, {
          usuarioId,
          rol: rol as any,
        });
      }
      toast.success(`${selectedCount} miembro(s) agregados al proyecto`);
      setSelectedUsers({});
      setSearchTerm("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al agregar miembros");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emptyStateMessage = loadingUsuarios
    ? "Cargando usuarios disponibles..."
    : "No hay usuarios disponibles para agregar";

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        setSelectedUsers({});
        setSearchTerm("");
      }
      onOpenChange(value);
    }}>
      <DialogContent className="w-[95vw] max-w-[850px] max-h-[90vh] flex flex-col sm:w-full">
        <DialogHeader>
          <DialogTitle>Agregar miembros al proyecto</DialogTitle>
          <DialogDescription>
            Selecciona varios usuarios y define sus roles en una sola vista
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Disponibles: {usuarios.length}</span>
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
            {loadingUsuarios || usuarios.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                {loadingUsuarios ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando usuarios disponibles...
                  </>
                ) : (
                  emptyStateMessage
                )}
              </div>
            ) : (
              <ScrollArea className="m-4 project-members-scroll h-full max-h-[58vh] sm:max-h-[62vh] lg:max-h-[560px]">
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
                              <AvatarImage src={usuario.avatarUrl} />
                              <AvatarFallback className="text-[11px]">
                                {usuario.nombreCompleto
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {usuario.nombreCompleto}
                              </p>
                              <p className="text-xs text-muted-foreground break-all sm:truncate">{usuario.email}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedUsers[usuario.id] === "Responsable" && "Control total del proyecto"}
                                {selectedUsers[usuario.id] === "Miembro" && "Puede editar tareas y colaborar"}
                                {selectedUsers[usuario.id] === "Observador" && "Solo lectura"}
                              </p>
                            </div>
                          </div>
                          <div className="flex w-full items-center gap-2 sm:w-36 sm:justify-end">
                            <Select
                              value={selectedUsers[usuario.id] || "Miembro"}
                              onValueChange={(value) => updateUserRole(usuario.id, value)}
                              disabled={!isSelected}
                            >
                              <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="Rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Responsable">Responsable</SelectItem>
                                <SelectItem value="Miembro">Miembro</SelectItem>
                                <SelectItem value="Observador">Observador</SelectItem>
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
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={isSubmitting || isLoading || usuarios.length === 0 || selectedCount === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar {selectedCount > 0 ? `${selectedCount} miembro(s)` : "miembros"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
