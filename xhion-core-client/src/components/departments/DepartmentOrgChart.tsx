import { useState, useEffect } from "react"
import { Users, Plus, Edit, Trash2, UserPlus, Building2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import puestosTrabajoService from "@/services/puestosTrabajoService"
import type { PuestoTrabajo, CreatePuestoTrabajoDto, UpdatePuestoTrabajoDto } from "@/services/puestosTrabajoService"
import { userService } from "@/services/userService"
import { cn } from "@/lib/utils"
import type { Usuario } from "@/types"
import { toast } from "sonner"

interface DepartmentOrgChartProps {
  departamentoId: string
  departamentoNombre: string
}

interface OrgNode {
  id: string
  nombre: string
  descripcion?: string
  responsabilidades?: string
  nivel: number
  parentId?: string
  empleados: Array<{
    id: string
    nombreCompleto: string
    email: string
  }>
  children: OrgNode[]
}

export function DepartmentOrgChart({ departamentoId, departamentoNombre }: DepartmentOrgChartProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPuesto, setSelectedPuesto] = useState<any>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    responsabilidades: "",
    nivel: 1,
    puestoSuperiorId: "",
  })

  // Local state for data (replacing stores)
  const [puestos, setPuestos] = useState<PuestoTrabajo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch puestos and usuarios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [puestosData, usuariosData] = await Promise.all([
          puestosTrabajoService.getPuestosByDepartamento(departamentoId),
          userService.obtenerTodosLosUsuarios(),
        ])
        setPuestos(puestosData)
        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar datos del organigrama")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [departamentoId])

  // Construir árbol jerárquico
  const buildTree = (): OrgNode[] => {
    const puestosDepartamento = puestos // Now it's a direct array
    const nodeMap = new Map<string, OrgNode>()

    // Crear nodos
    puestosDepartamento.forEach((puesto) => {
      nodeMap.set(puesto.id, {
        id: puesto.id,
        nombre: puesto.nombre,
        descripcion: puesto.descripcion,
        responsabilidades: puesto.responsabilidades,
        nivel: puesto.nivel,
        parentId: puesto.puestoSuperiorId,
        empleados: puesto.empleados || [],
        children: [],
      })
    })

    // Construir jerarquía
    const roots: OrgNode[] = []
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })

    // Ordenar por nivel
    const sortByLevel = (nodes: OrgNode[]) => {
      nodes.sort((a, b) => a.nivel - b.nivel)
      nodes.forEach((node) => sortByLevel(node.children))
    }
    sortByLevel(roots)

    return roots
  }

  const orgTree = buildTree()

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const handleCreate = async () => {
    try {
      const newPuesto = await puestosTrabajoService.createPuesto({
        ...formData,
        departamentoId,
        puestoSuperiorId: formData.puestoSuperiorId || undefined,
      })
      setPuestos(prev => [...prev, newPuesto])
      setShowCreateModal(false)
      resetForm()
      toast.success("Puesto creado exitosamente")
    } catch (error) {
      console.error("Error al crear puesto:", error)
      toast.error("Error al crear puesto")
    }
  }

  const handleEdit = async () => {
    if (!selectedPuesto) return
    try {
      const updatedPuesto = await puestosTrabajoService.updatePuesto(selectedPuesto.id, formData)
      setPuestos(prev => prev.map(p => p.id === selectedPuesto.id ? updatedPuesto : p))
      setShowEditModal(false)
      setSelectedPuesto(null)
      resetForm()
      toast.success("Puesto actualizado exitosamente")
    } catch (error) {
      console.error("Error al actualizar puesto:", error)
      toast.error("Error al actualizar puesto")
    }
  }

  const handleDelete = async (puestoId: string) => {
    if (!confirm("¿Eliminar este puesto? Los empleados asignados serán desasignados.")) return
    try {
      await puestosTrabajoService.deletePuesto(puestoId)
      setPuestos(prev => prev.filter(p => p.id !== puestoId))
      toast.success("Puesto eliminado exitosamente")
    } catch (error) {
      console.error("Error al eliminar puesto:", error)
      toast.error("Error al eliminar puesto")
    }
  }

  const handleAssignEmployee = async (empleadoId: string) => {
    if (!selectedPuesto) return
    try {
      const updatedPuesto = await puestosTrabajoService.asignarEmpleado(selectedPuesto.id, empleadoId)
      setPuestos(prev => prev.map(p => p.id === selectedPuesto.id ? updatedPuesto : p))
      setShowAssignModal(false)
      setSelectedPuesto(null)
      toast.success("Empleado asignado exitosamente")
    } catch (error) {
      console.error("Error al asignar empleado:", error)
      toast.error("Error al asignar empleado")
    }
  }

  const handleUnassignEmployee = async (puestoId: string, empleadoId: string) => {
    if (!confirm("¿Desasignar este empleado del puesto?")) return
    try {
      const updatedPuesto = await puestosTrabajoService.desasignarEmpleado(puestoId, empleadoId)
      setPuestos(prev => prev.map(p => p.id === puestoId ? updatedPuesto : p))
      toast.success("Empleado desasignado exitosamente")
    } catch (error) {
      console.error("Error al desasignar empleado:", error)
      toast.error("Error al desasignar empleado")
    }
  }

  const openEditModal = (puesto: any) => {
    setSelectedPuesto(puesto)
    setFormData({
      nombre: puesto.nombre,
      descripcion: puesto.descripcion || "",
      responsabilidades: puesto.responsabilidades || "",
      nivel: puesto.nivel,
      puestoSuperiorId: puesto.puestoSuperiorId || "",
    })
    setShowEditModal(true)
  }

  const openAssignModal = (puesto: any) => {
    setSelectedPuesto(puesto)
    setShowAssignModal(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      responsabilidades: "",
      nivel: 1,
      puestoSuperiorId: "",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getLevelColor = (nivel: number) => {
    const colors = [
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ]
    return colors[(nivel - 1) % colors.length]
  }

  // Renderizar nodo del organigrama
  const renderNode = (node: OrgNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id} className="relative">
        {/* Línea vertical conectora */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 w-px h-6 bg-border -translate-y-6 ml-6" />
        )}

        <Card
          className={cn(
            "border-border bg-card p-4 hover:shadow-md transition-all",
            depth > 0 && "ml-12"
          )}
        >
          <div className="flex items-start gap-4">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 mt-1"
                onClick={() => toggleNode(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">{node.nombre}</h3>
                    <Badge className={getLevelColor(node.nivel)} variant="secondary">
                      Nivel {node.nivel}
                    </Badge>
                  </div>
                  {node.descripcion && (
                    <p className="text-sm text-muted-foreground">{node.descripcion}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openAssignModal(node)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditModal(node)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(node.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Responsabilidades */}
              {node.responsabilidades && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <strong>Responsabilidades:</strong> {node.responsabilidades}
                </div>
              )}

              {/* Empleados Asignados */}
              {node.empleados.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Empleados ({node.empleados.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {node.empleados.map((empleado) => (
                      <div
                        key={empleado.id}
                        className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(empleado.nombreCompleto)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{empleado.nombreCompleto}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full hover:bg-destructive/20"
                          onClick={() => handleUnassignEmployee(node.id, empleado.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-4 space-y-4 relative">
            {/* Línea horizontal conectora */}
            <div className="absolute left-6 top-0 w-px h-full bg-border" />
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Organigrama del Departamento</h2>
          <p className="text-sm text-muted-foreground mt-1">{departamentoNombre}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Puesto
        </Button>
      </div>

      {/* Org Chart */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando organigrama...</div>
      ) : orgTree.length === 0 ? (
        <Card className="border-border bg-card p-12">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No hay puestos de trabajo definidos</p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primer puesto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orgTree.map((node) => renderNode(node))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Puesto</DialogTitle>
            <DialogDescription>Define un puesto de trabajo en el departamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>
                Nombre del Puesto <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Ej: Gerente de Proyecto"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción del puesto..."
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsabilidades</Label>
              <Textarea
                placeholder="Responsabilidades principales..."
                rows={3}
                value={formData.responsabilidades}
                onChange={(e) => setFormData({ ...formData, responsabilidades: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Nivel Jerárquico <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.nivel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((nivel) => (
                      <SelectItem key={nivel} value={nivel.toString()}>
                        Nivel {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Puesto Superior (Opcional)</Label>
                <Select
                  value={formData.puestoSuperiorId}
                  onValueChange={(value) => setFormData({ ...formData, puestoSuperiorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin puesto superior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin puesto superior</SelectItem>
                    {puestos.map((puesto) => (
                      <SelectItem key={puesto.id} value={puesto.id}>
                        {puesto.nombre} (Nivel {puesto.nivel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Puesto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Puesto</DialogTitle>
            <DialogDescription>Actualiza la información del puesto</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>
                Nombre del Puesto <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Ej: Gerente de Proyecto"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción del puesto..."
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsabilidades</Label>
              <Textarea
                placeholder="Responsabilidades principales..."
                rows={3}
                value={formData.responsabilidades}
                onChange={(e) => setFormData({ ...formData, responsabilidades: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Nivel Jerárquico <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.nivel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((nivel) => (
                      <SelectItem key={nivel} value={nivel.toString()}>
                        Nivel {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Puesto Superior (Opcional)</Label>
                <Select
                  value={formData.puestoSuperiorId}
                  onValueChange={(value) => setFormData({ ...formData, puestoSuperiorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin puesto superior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin puesto superior</SelectItem>
                    {puestos
                      .filter((p) => p.id !== selectedPuesto?.id)
                      .map((puesto) => (
                        <SelectItem key={puesto.id} value={puesto.id}>
                          {puesto.nombre} (Nivel {puesto.nivel})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit}>Actualizar Puesto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Empleado</DialogTitle>
            <DialogDescription>
              Selecciona un empleado para asignar al puesto: {selectedPuesto?.nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select onValueChange={handleAssignEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios
                    .filter(
                      (u: Usuario) =>
                        !selectedPuesto?.empleados?.some((e: any) => e.id === u.id) &&
                        u.rol.nombre !== "Administrador"
                    )
                    .map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(usuario.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{usuario.nombreCompleto}</div>
                            <div className="text-xs text-muted-foreground">{usuario.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
