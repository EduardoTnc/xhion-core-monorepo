import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users, Shield, Briefcase, Clock, FolderKanban, ListTodo, Calendar,
    Building, Star, Languages, Laptop, Globe, ExternalLink, Loader2,
    CheckCircle2, X, FileText, Hash, Mail, Phone
} from "lucide-react"
import { userService, type UserFullProfile, type PaginatedResponse, type TaskHistoryItem, type ProjectItem, obtenerTareasHistorial, obtenerProyectosUsuario } from "@/services/userService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserDetailModalProps {
    userId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Helper function to get initials
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Helper function to format dates
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return format(date, "dd MMM yyyy", { locale: es })
}

const formatDateLong = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
}

// Helper function for tenure
const getTimeSince = (primaryDate: string | null | undefined, fallbackDate?: string | null | undefined): string => {
    const dateString = primaryDate || fallbackDate
    if (!dateString) return 'Nuevo'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)

    if (years > 0 && months > 0) return `${years}a ${months}m`
    if (years > 0) return `${years} año${years > 1 ? 's' : ''}`
    if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`
    if (diffDays > 0) return `${diffDays}d`
    return 'Hoy'
}

// Label mappings
const LEVEL_LABELS: Record<string, string> = {
    'junior': 'Junior',
    'mid': 'Mid-Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'principal': 'Principal',
}

const EXPERIENCE_LABELS: Record<string, string> = {
    '0-2': '0-2 años',
    '3-5': '3-5 años',
    '5-10': '5-10 años',
    '10+': 'Más de 10 años',
}

const WORK_MODE_LABELS: Record<string, string> = {
    'remote': 'Remoto',
    'hybrid': 'Híbrido',
    'onsite': 'Presencial',
}

export function UserDetailModal({ userId, open, onOpenChange }: UserDetailModalProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [profile, setProfile] = useState<UserFullProfile | null>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)

    // Projects state
    const [projects, setProjects] = useState<PaginatedResponse<ProjectItem> | null>(null)
    const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const [projectsPage, setProjectsPage] = useState(1)
    const [projectsRol, setProjectsRol] = useState<'responsable' | 'miembro' | 'todos'>('todos')

    // Tasks state
    const [tasks, setTasks] = useState<PaginatedResponse<TaskHistoryItem> | null>(null)
    const [isLoadingTasks, setIsLoadingTasks] = useState(false)
    const [tasksPage, setTasksPage] = useState(1)
    const [tasksEstado, setTasksEstado] = useState<string>('')

    // Task history state
    const [taskHistory, setTaskHistory] = useState<PaginatedResponse<TaskHistoryItem> | null>(null)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [historyPage, setHistoryPage] = useState(1)
    const [historyEstado, setHistoryEstado] = useState<string>('Hecho')

    // Load profile when modal opens
    useEffect(() => {
        if (open && userId) {
            loadProfile()
        } else {
            // Reset state when modal closes
            setProfile(null)
            setProjects(null)
            setTasks(null)
            setTaskHistory(null)
            setActiveTab("overview")
        }
    }, [open, userId])

    // Load projects when tab changes
    useEffect(() => {
        if (activeTab === "projects" && userId && !projects) {
            loadProjects()
        }
    }, [activeTab, userId])

    // Load tasks when tab changes
    useEffect(() => {
        if (activeTab === "tasks" && userId && !tasks) {
            loadTasks()
        }
    }, [activeTab, userId])

    // Load task history when tab changes
    useEffect(() => {
        if (activeTab === "history" && userId && !taskHistory) {
            loadTaskHistory()
        }
    }, [activeTab, userId])

    // Reload projects when filters change
    useEffect(() => {
        if (activeTab === "projects" && userId) {
            loadProjects()
        }
    }, [projectsPage, projectsRol])

    // Reload tasks when filters change
    useEffect(() => {
        if (activeTab === "tasks" && userId) {
            loadTasks()
        }
    }, [tasksPage, tasksEstado])

    // Reload history when filters change
    useEffect(() => {
        if (activeTab === "history" && userId) {
            loadTaskHistory()
        }
    }, [historyPage, historyEstado])

    const loadProfile = async () => {
        if (!userId) return
        setIsLoadingProfile(true)
        try {
            const data = await userService.obtenerPerfilCompleto(userId)
            setProfile(data)
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar el perfil')
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const loadProjects = async () => {
        if (!userId) return
        setIsLoadingProjects(true)
        try {
            const data = await obtenerProyectosUsuario(userId, projectsPage, 10, projectsRol)
            setProjects(data)
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar proyectos')
        } finally {
            setIsLoadingProjects(false)
        }
    }

    const loadTasks = async () => {
        if (!userId) return
        setIsLoadingTasks(true)
        try {
            const data = await obtenerTareasHistorial(userId, tasksPage, 10, tasksEstado || undefined)
            setTasks(data)
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar tareas')
        } finally {
            setIsLoadingTasks(false)
        }
    }

    const loadTaskHistory = async () => {
        if (!userId) return
        setIsLoadingHistory(true)
        try {
            const data = await obtenerTareasHistorial(userId, historyPage, 10, historyEstado || undefined)
            setTaskHistory(data)
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar historial')
        } finally {
            setIsLoadingHistory(false)
        }
    }

    if (!userId) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl">Detalles del Usuario</DialogTitle>
                </DialogHeader>

                {isLoadingProfile ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Cargando perfil...</p>
                        </div>
                    </div>
                ) : profile ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="mx-6 mt-4 grid w-full grid-cols-5">
                            <TabsTrigger value="overview">General</TabsTrigger>
                            <TabsTrigger value="projects">Proyectos</TabsTrigger>
                            <TabsTrigger value="tasks">Tareas Activas</TabsTrigger>
                            <TabsTrigger value="history">Historial</TabsTrigger>
                            <TabsTrigger value="professional">Perfil Prof.</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-auto px-6 py-4">
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-0 space-y-4">
                                {/* User Header */}
                                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                                    <Avatar className="h-20 w-20 ring-2 ring-border">
                                        <AvatarImage src={profile.avatarUrl || undefined} alt={profile.nombreCompleto} />
                                        <AvatarFallback className="text-2xl">{getInitials(profile.nombreCompleto)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold">{profile.nombreCompleto}</h2>
                                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">{profile.email}</span>
                                        </div>
                                        {profile.telefono && (
                                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span className="text-sm">{profile.telefono}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                                            <Badge
                                                className={cn(
                                                    "gap-1",
                                                    profile.estado === "ACTIVO"
                                                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                )}
                                            >
                                                {profile.estado === "ACTIVO" ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <X className="h-3 w-3" />
                                                )}
                                                {profile.estado}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                style={{
                                                    borderColor: profile.rol.color || undefined,
                                                    color: profile.rol.color || undefined,
                                                    backgroundColor: profile.rol.color ? `${profile.rol.color}15` : undefined
                                                }}
                                            >
                                                <Shield className="h-3 w-3 mr-1" />
                                                {profile.rol.nombre}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Completeness */}
                                {profile.puntajePerfilCompleto !== undefined && (
                                    <div className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Completitud del Perfil</span>
                                            <span className="text-sm font-semibold text-primary">{profile.puntajePerfilCompleto}%</span>
                                        </div>
                                        <Progress value={profile.puntajePerfilCompleto} className="h-2" />
                                    </div>
                                )}

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-lg border bg-card text-center">
                                        <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-lg font-semibold">{getTimeSince(profile.fechaIngreso, profile.fechaCreacion)}</p>
                                        <p className="text-xs text-muted-foreground">Antigüedad</p>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card text-center">
                                        <FolderKanban className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-lg font-semibold">{profile.proyectos.totalResponsable + profile.proyectos.totalMiembro}</p>
                                        <p className="text-xs text-muted-foreground">Proyectos</p>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card text-center">
                                        <ListTodo className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-lg font-semibold">{profile.tareas.totalAsignadas}</p>
                                        <p className="text-xs text-muted-foreground">Tareas</p>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card text-center">
                                        <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-lg font-semibold">{profile.rol.totalPermisos}</p>
                                        <p className="text-xs text-muted-foreground">Permisos</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Work Information */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Información Laboral
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem icon={Briefcase} label="Puesto" value={profile.puestoTrabajo?.titulo || 'Sin asignar'} />
                                        {profile.puestoTrabajo?.departamento && (
                                            <InfoItem icon={Building} label="Departamento" value={profile.puestoTrabajo.departamento.nombre} />
                                        )}
                                        {profile.supervisor && (
                                            <InfoItem icon={Users} label="Supervisor" value={profile.supervisor.nombreCompleto} />
                                        )}
                                        {profile.biografia && (
                                            <div className="md:col-span-2">
                                                <InfoItem icon={FileText} label="Biografía" value={profile.biografia} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Important Dates */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fechas Importantes
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem icon={Calendar} label="Fecha de Ingreso" value={formatDate(profile.fechaIngreso)} />
                                        <InfoItem icon={Clock} label="Última Actualización" value={formatDateLong(profile.fechaActualizacion)} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Projects Tab */}
                            <TabsContent value="projects" className="mt-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Proyectos del Usuario</h3>
                                    <Select value={projectsRol} onValueChange={(v) => { setProjectsRol(v as any); setProjectsPage(1); }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="responsable">Responsable</SelectItem>
                                            <SelectItem value="miembro">Miembro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isLoadingProjects ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : projects && projects.data.length > 0 ? (
                                    <>
                                        <div className="rounded-lg border">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead>Proyecto</TableHead>
                                                        <TableHead>Rol</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                        <TableHead>Departamento</TableHead>
                                                        <TableHead>Fecha Creación</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {projects.data.map((proyecto) => (
                                                        <TableRow key={proyecto.id}>
                                                            <TableCell className="font-medium">{proyecto.nombre}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{proyecto.rolEnProyecto}</Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{proyecto.estado}</Badge>
                                                            </TableCell>
                                                            <TableCell>{proyecto.departamento?.nombre || '-'}</TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{formatDate(proyecto.fechaCreacion)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <PaginationControls
                                            page={projectsPage}
                                            totalPages={projects.totalPages}
                                            onPageChange={setProjectsPage}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64 border rounded-lg">
                                        <p className="text-muted-foreground">No hay proyectos</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Active Tasks Tab */}
                            <TabsContent value="tasks" className="mt-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Tareas Activas</h3>
                                    <Select value={tasksEstado} onValueChange={(v) => { setTasksEstado(v); setTasksPage(1); }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="Por_Hacer">Por Hacer</SelectItem>
                                            <SelectItem value="En_Progreso">En Progreso</SelectItem>
                                            <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isLoadingTasks ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : tasks && tasks.data.length > 0 ? (
                                    <>
                                        <div className="rounded-lg border">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead>Tarea</TableHead>
                                                        <TableHead>Proyecto</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                        <TableHead>Prioridad</TableHead>
                                                        <TableHead>Vencimiento</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tasks.data.map((tarea) => (
                                                        <TableRow key={tarea.id}>
                                                            <TableCell className="font-medium">{tarea.titulo}</TableCell>
                                                            <TableCell>{tarea.proyecto?.nombre || '-'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{tarea.estado}</Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{tarea.prioridad}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{formatDate(tarea.fechaVencimiento)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <PaginationControls
                                            page={tasksPage}
                                            totalPages={tasks.totalPages}
                                            onPageChange={setTasksPage}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64 border rounded-lg">
                                        <p className="text-muted-foreground">No hay tareas activas</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Task History Tab */}
                            <TabsContent value="history" className="mt-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Historial de Tareas</h3>
                                    <Select value={historyEstado} onValueChange={(v) => { setHistoryEstado(v); setHistoryPage(1); }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todas</SelectItem>
                                            <SelectItem value="Hecho">Completadas</SelectItem>
                                            <SelectItem value="Por_Hacer">Por Hacer</SelectItem>
                                            <SelectItem value="En_Progreso">En Progreso</SelectItem>
                                            <SelectItem value="Bloqueado">Bloqueadas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isLoadingHistory ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : taskHistory && taskHistory.data.length > 0 ? (
                                    <>
                                        <div className="rounded-lg border">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead>Tarea</TableHead>
                                                        <TableHead>Proyecto</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                        <TableHead>Actualización</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {taskHistory.data.map((tarea) => (
                                                        <TableRow key={tarea.id}>
                                                            <TableCell className="font-medium">{tarea.titulo}</TableCell>
                                                            <TableCell>{tarea.proyecto?.nombre || '-'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{tarea.estado}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{formatDateLong(tarea.fechaActualizacion)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <PaginationControls
                                            page={historyPage}
                                            totalPages={taskHistory.totalPages}
                                            onPageChange={setHistoryPage}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64 border rounded-lg">
                                        <p className="text-muted-foreground">No hay historial de tareas</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Professional Profile Tab */}
                            <TabsContent value="professional" className="mt-0 space-y-4">
                                <h3 className="text-lg font-semibold">Perfil Profesional</h3>

                                {profile.perfilProfesional ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {profile.perfilProfesional.professionalLevel && (
                                                <InfoItem
                                                    icon={Star}
                                                    label="Nivel Profesional"
                                                    value={LEVEL_LABELS[profile.perfilProfesional.professionalLevel] || profile.perfilProfesional.professionalLevel}
                                                />
                                            )}
                                            {profile.perfilProfesional.yearsExperience && (
                                                <InfoItem
                                                    icon={Clock}
                                                    label="Años de Experiencia"
                                                    value={EXPERIENCE_LABELS[profile.perfilProfesional.yearsExperience] || profile.perfilProfesional.yearsExperience}
                                                />
                                            )}
                                            {profile.perfilProfesional.workMode && (
                                                <InfoItem
                                                    icon={Laptop}
                                                    label="Modo de Trabajo"
                                                    value={WORK_MODE_LABELS[profile.perfilProfesional.workMode] || profile.perfilProfesional.workMode}
                                                />
                                            )}
                                        </div>

                                        {profile.perfilProfesional.specializations && profile.perfilProfesional.specializations.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Especializaciones</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.perfilProfesional.specializations.map((spec) => (
                                                        <Badge key={spec} variant="secondary">{spec}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {profile.perfilProfesional.languages && profile.perfilProfesional.languages.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Idiomas</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.perfilProfesional.languages.map((lang) => (
                                                        <Badge key={lang} variant="secondary">
                                                            <Languages className="h-3 w-3 mr-1" />
                                                            {lang}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {profile.perfilProfesional.linkedin && (
                                            <div className="p-4 rounded-lg border bg-card">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">LinkedIn</span>
                                                </div>
                                                <a
                                                    href={profile.perfilProfesional.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                                >
                                                    Ver perfil <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 border rounded-lg">
                                        <p className="text-muted-foreground">No hay información de perfil profesional</p>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

// Helper component for info items
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
}

// Pagination component
function PaginationControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
    return (
        <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}
