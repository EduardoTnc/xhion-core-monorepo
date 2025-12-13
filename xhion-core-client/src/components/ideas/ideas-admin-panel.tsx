"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Sparkles,
    ThumbsUp,
    MessageSquare,
    Rocket,
    ShieldCheck,
} from "lucide-react"
import { useIdeas } from "@/hooks/queries"
import { useUpdateIdea } from "@/hooks/mutations/useIdeaMutations"
import { useAuthStore } from "@/store/authStore"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

interface IdeasAdminPanelProps {
    onUpdate?: () => void
}

type IdeaStatus = 'Evaluating' | 'Approved' | 'InDevelopment' | 'Implemented' | 'Rejected'

export function IdeasAdminPanel({ onUpdate }: IdeasAdminPanelProps) {
    const { user } = useAuthStore()

    // TanStack Query
    const { data: ideas = [], isLoading, refetch } = useIdeas()
    const updateIdeaMutation = useUpdateIdea()

    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    // Check permissions
    const canModerate = user?.permisos?.includes("ideas.moderar") ||
        user?.permisos?.includes("ideas.cambiar_estado")

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.autor.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === "all" || idea.estado === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleStatusChange = async (ideaId: string, newStatus: IdeaStatus) => {
        setIsUpdating(ideaId)
        updateIdeaMutation.mutate(
            { id: ideaId, data: { estado: newStatus } },
            {
                onSuccess: () => {
                    toast.success(`Estado actualizado a "${getStatusLabel(newStatus)}"`)
                    onUpdate?.()
                    setIsUpdating(null)
                },
                onError: () => {
                    toast.error("Error al actualizar el estado")
                    setIsUpdating(null)
                },
            }
        )
    }

    const handleBulkStatusChange = async (newStatus: IdeaStatus) => {
        if (selectedIds.length === 0) return

        setIsUpdating("bulk")
        try {
            await Promise.all(
                selectedIds.map(id =>
                    updateIdeaMutation.mutateAsync({ id, data: { estado: newStatus } })
                )
            )
            toast.success(`${selectedIds.length} ideas actualizadas`)
            setSelectedIds([])
            refetch()
            onUpdate?.()
        } catch (error) {
            console.error("Error in bulk update:", error)
            toast.error("Error al actualizar las ideas")
        } finally {
            setIsUpdating(null)
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredIdeas.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredIdeas.map(i => i.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Evaluating": return "bg-amber-500/10 text-amber-600 border-amber-500/30"
            case "Approved": return "bg-green-500/10 text-green-600 border-green-500/30"
            case "InDevelopment": return "bg-blue-500/10 text-blue-600 border-blue-500/30"
            case "Implemented": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
            case "Rejected": return "bg-red-500/10 text-red-600 border-red-500/30"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            Evaluating: "En evaluación",
            Approved: "Aprobada",
            InDevelopment: "En desarrollo",
            Implemented: "Implementada",
            Rejected: "Rechazada",
        }
        return labels[status] || status
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Evaluating": return <Clock className="h-3 w-3" />
            case "Approved": return <CheckCircle className="h-3 w-3" />
            case "InDevelopment": return <Rocket className="h-3 w-3" />
            case "Implemented": return <ShieldCheck className="h-3 w-3" />
            case "Rejected": return <XCircle className="h-3 w-3" />
            default: return null
        }
    }

    const formatDate = (date: string) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
    }

    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    if (!canModerate) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Acceso Restringido</h3>
                <p className="text-sm text-muted-foreground">
                    No tienes permisos para administrar ideas.<br />
                    Necesitas el permiso "ideas.moderar" o "ideas.cambiar_estado".
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Administración de Ideas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gestiona el estado de las ideas enviadas por los usuarios
                    </p>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.length} seleccionadas
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isUpdating === "bulk"}>
                                    {isUpdating === "bulk" ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Cambiar estado
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleBulkStatusChange("Approved")}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange("InDevelopment")}>
                                    <Rocket className="h-4 w-4 mr-2 text-blue-600" />
                                    En desarrollo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange("Implemented")}>
                                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" />
                                    Implementada
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleBulkStatusChange("Rejected")}>
                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    Rechazar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título, descripción o autor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Evaluating">En evaluación</SelectItem>
                        <SelectItem value="Approved">Aprobada</SelectItem>
                        <SelectItem value="InDevelopment">En desarrollo</SelectItem>
                        <SelectItem value="Implemented">Implementada</SelectItem>
                        <SelectItem value="Rejected">Rechazada</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Idea</TableHead>
                            <TableHead className="hidden md:table-cell">Autor</TableHead>
                            <TableHead className="hidden lg:table-cell">Estadísticas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredIdeas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No se encontraron ideas
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredIdeas.map((idea) => (
                                <TableRow key={idea.id} className="group">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(idea.id)}
                                            onCheckedChange={() => toggleSelect(idea.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground line-clamp-1">{idea.titulo}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{idea.descripcion}</p>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {idea.aiScore && (
                                                    <Badge variant="secondary" className="text-[10px] gap-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        {idea.aiScore}
                                                    </Badge>
                                                )}
                                                {idea.tags.slice(0, 2).map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-[10px]">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={idea.autor.avatarUrl} />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(idea.autor.nombreCompleto)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{idea.autor.nombreCompleto}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(idea.fechaCreacion)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                <span className="text-xs">{idea._count.votos}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                <span className="text-xs">{idea._count.comentarios}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={idea.estado}
                                            onValueChange={(value) => handleStatusChange(idea.id, value as IdeaStatus)}
                                            disabled={isUpdating === idea.id}
                                        >
                                            <SelectTrigger className={`h-8 text-xs gap-1 ${getStatusColor(idea.estado)}`}>
                                                {isUpdating === idea.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    getStatusIcon(idea.estado)
                                                )}
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Evaluating">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-amber-600" />
                                                        En evaluación
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Approved">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        Aprobada
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="InDevelopment">
                                                    <div className="flex items-center gap-2">
                                                        <Rocket className="h-4 w-4 text-blue-600" />
                                                        En desarrollo
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Implemented">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                        Implementada
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Rejected">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                        Rechazada
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusChange(idea.id, "Approved")}>
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                    Aprobar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(idea.id, "InDevelopment")}>
                                                    <Rocket className="h-4 w-4 mr-2 text-blue-600" />
                                                    En desarrollo
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(idea.id, "Implemented")}>
                                                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" />
                                                    Implementada
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusChange(idea.id, "Rejected")}>
                                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                    Rechazar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Stats Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <span>
                    Mostrando {filteredIdeas.length} de {ideas.length} ideas
                </span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        {ideas.filter(i => i.estado === "Evaluating").length} en evaluación
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {ideas.filter(i => i.estado === "Approved").length} aprobadas
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {ideas.filter(i => i.estado === "InDevelopment").length} en desarrollo
                    </span>
                </div>
            </div>
        </div>
    )
}
