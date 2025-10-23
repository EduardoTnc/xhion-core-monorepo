"use client"

import { useState, useEffect } from "react"
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Mail,
  Briefcase,
  Shield,
  MoreVertical,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useDepartmentStore } from "@/store/departmentStore"
import { toast } from "sonner"

interface DepartmentResourceAssignmentProps {
  departamentoId: string
  departamentoNombre: string
}

export function DepartmentResourceAssignment({
  departamentoId,
  departamentoNombre,
}: DepartmentResourceAssignmentProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [availableSearchQuery, setAvailableSearchQuery] = useState("")

  const {
    departamentoActual,
    usuariosDisponibles,
    isLoading,
    fetchDepartamentoById,
    fetchUsuariosDisponibles,
    asignarUsuariosDepartamento,
    removerUsuarioDepartamento,
  } = useDepartmentStore()

  useEffect(() => {
    fetchDepartamentoById(departamentoId)
  }, [departamentoId])

  useEffect(() => {
    if (showAssignModal) {
      fetchUsuariosDisponibles(departamentoId)
    }
  }, [showAssignModal, departamentoId])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRemoveUser = async (usuarioId: string, nombreUsuario: string) => {
    if (!confirm(`¿Estás seguro de remover a ${nombreUsuario} del departamento?`)) return
    try {
      await removerUsuarioDepartamento(departamentoId, usuarioId)
      toast.success("Usuario removido exitosamente")
    } catch (error) {
      console.error("Error al remover usuario:", error)
      toast.error("Error al remover usuario")
    }
  }

  const handleAssignUsers = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Selecciona al menos un usuario")
      return
    }

    try {
      await asignarUsuariosDepartamento(departamentoId, Array.from(selectedUsers))
      toast.success(`${selectedUsers.size} usuario(s) asignado(s) exitosamente`)
      setShowAssignModal(false)
      setSelectedUsers(new Set())
      setAvailableSearchQuery("")
    } catch (error) {
      console.error("Error al asignar usuarios:", error)
      toast.error("Error al asignar usuarios")
    }
  }

  const toggleUserSelection = (usuarioId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(usuarioId)) {
      newSelected.delete(usuarioId)
    } else {
      newSelected.add(usuarioId)
    }
    setSelectedUsers(newSelected)
  }

  // Filtrar miembros actuales
  const miembrosActuales = departamentoActual?.puestosTrabajo?.map((pt) => pt.usuario) || []
  const filteredMiembros = miembrosActuales.filter(
    (usuario) =>
      usuario.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.puestoTrabajo?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filtrar usuarios disponibles
  const filteredAvailableUsers = usuariosDisponibles.filter(
    (usuario) =>
      usuario.nombreCompleto.toLowerCase().includes(availableSearchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(availableSearchQuery.toLowerCase())
  )

  const esJefe = (usuarioId: string) => departamentoActual?.jefeId === usuarioId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recursos del Departamento</h2>
          <p className="text-sm text-muted-foreground mt-1">{departamentoNombre}</p>
        </div>
        <Button onClick={() => setShowAssignModal(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Asignar Usuarios
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar miembros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Miembros</p>
              <p className="text-2xl font-bold text-foreground">{miembrosActuales.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Crown className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jefe</p>
              <p className="text-lg font-semibold text-foreground">
                {departamentoActual?.jefe?.nombreCompleto || "Sin asignar"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Puestos</p>
              <p className="text-2xl font-bold text-foreground">
                {departamentoActual?.puestosTrabajo?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando miembros...</div>
      ) : filteredMiembros.length === 0 ? (
        <Card className="border-border bg-card p-12">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No se encontraron miembros con la búsqueda"
                : "No hay miembros asignados a este departamento"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAssignModal(true)} variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Asignar primer miembro
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMiembros.map((usuario) => (
            <Card key={usuario.id} className="border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={usuario.fotoPerfil || undefined} />
                    <AvatarFallback>{getInitials(usuario.nombreCompleto)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">
                        {usuario.nombreCompleto}
                      </p>
                      {esJefe(usuario.id) && (
                        <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {usuario.email}
                    </p>
                    {usuario.puestoTrabajo && (
                      <Badge variant="secondary" className="mt-2">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {usuario.puestoTrabajo.nombre}
                      </Badge>
                    )}
                  </div>
                </div>

                {!esJefe(usuario.id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRemoveUser(usuario.id, usuario.nombreCompleto)}
                        className="text-destructive"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remover del departamento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Users Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Asignar Usuarios al Departamento</DialogTitle>
            <DialogDescription>
              Selecciona los usuarios que deseas agregar a {departamentoNombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios disponibles..."
                value={availableSearchQuery}
                onChange={(e) => setAvailableSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Count */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.size} usuario(s) seleccionado(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Limpiar selección
                </Button>
              </div>
            )}

            {/* Users List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredAvailableUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {availableSearchQuery
                    ? "No se encontraron usuarios disponibles"
                    : "No hay usuarios disponibles para asignar"}
                </div>
              ) : (
                filteredAvailableUsers.map((usuario) => (
                  <div
                    key={usuario.id}
                    onClick={() => toggleUserSelection(usuario.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedUsers.has(usuario.id)}
                      onCheckedChange={() => toggleUserSelection(usuario.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={usuario.fotoPerfil || undefined} />
                      <AvatarFallback>{getInitials(usuario.nombreCompleto)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {usuario.nombreCompleto}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{usuario.email}</p>
                    </div>
                    {usuario.rol && (
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {usuario.rol.nombre}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignUsers} disabled={selectedUsers.size === 0}>
              Asignar {selectedUsers.size > 0 && `(${selectedUsers.size})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
