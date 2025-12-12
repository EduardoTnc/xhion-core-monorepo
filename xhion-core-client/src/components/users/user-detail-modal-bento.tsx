import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import {
    Users, Briefcase, FolderKanban, ListTodo, Building, Star, Loader2, Phone, Globe, Linkedin, DollarSign,
    Languages, CheckCircle, User, ExternalLink, Sparkles, Shield, Clock, Calendar, GraduationCap, Award,
    MapPin, Lightbulb, Activity, Mail, BarChart3, TrendingUp, AlertCircle, Info, Zap, MessageSquare,
    ThumbsUp, Target, Timer
} from "lucide-react"
import { userService, obtenerProyectosUsuario, obtenerTareasHistorial, type UserFullProfile, type ProjectItem, type TaskHistoryItem } from "@/services/userService"
import { useSingleUserPresence } from "@/hooks/useUserPresence"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface UserDetailModalProps {
    userId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

// ===== UTILITY FUNCTIONS =====

const getInitials = (name: string): string => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try { return format(new Date(dateString), "d MMM yyyy", { locale: es }) }
    catch { return '-' }
}

const getTimeSince = (d1: string | null | undefined, d2?: string | null | undefined): string => {
    const ds = d1 || d2
    if (!ds) return 'Nuevo'
    try {
        const diff = Math.floor((Date.now() - new Date(ds).getTime()) / (1000 * 60 * 60 * 24))
        const y = Math.floor(diff / 365)
        if (y > 0) return `${y}a`
        if (diff > 30) return `${Math.floor(diff / 30)}m`
        return `${diff}d`
    } catch { return '-' }
}

const formatMemberSince = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'recientemente'
    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays < 7) return 'hace menos de una semana'
        if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30)
            return `hace ${months} mes${months > 1 ? 'es' : ''}`
        }
        const years = Math.floor(diffDays / 365)
        const remainingMonths = Math.floor((diffDays % 365) / 30)
        if (remainingMonths > 0) {
            return `hace ${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
        }
        return `hace ${years} año${years > 1 ? 's' : ''}`
    } catch {
        return 'fecha desconocida'
    }
}

const translateProfLevel = (lvl?: string): string => {
    const map: Record<string, string> = { junior: 'Junior', mid: 'Mid', mid_senior: 'Mid-Senior', senior: 'Senior', lead: 'Lead', expert: 'Experto' }
    return map[lvl || ''] || 'N/A'
}

const translateWorkMode = (mode?: string): string => {
    const map: Record<string, string> = { remote: 'Remoto', hybrid: 'Híbrido', office: 'Presencial' }
    return map[mode || ''] || 'N/A'
}

const translateCapacity = (cap?: string): string => {
    const map: Record<string, string> = { available: 'Disponible', partial: 'Parcial', busy: 'Ocupado' }
    return map[cap || ''] || 'N/A'
}

const priorityColors: Record<string, string> = {
    'Alta': 'text-red-400 bg-red-500/10',
    'Media': 'text-yellow-400 bg-yellow-500/10',
    'Baja': 'text-green-400 bg-green-500/10'
}

const statusColors: Record<string, string> = {
    'Activo': 'bg-emerald-500',
    'En_Progreso': 'bg-blue-500',
    'EN_PROGRESO': 'bg-blue-500',
    'Por_Hacer': 'bg-yellow-500',
    'PENDIENTE': 'bg-yellow-500',
    'Completado': 'bg-emerald-500',
    'COMPLETADA': 'bg-emerald-500',
    'Hecho': 'bg-emerald-500',
    'Bloqueado': 'bg-red-500'
}

// ===== INTERFACES =====

interface UserIdeas {
    creadas: any[]
    votadas: any[]
    totalCreadas: number
    totalVotadas: number
    estadisticas: {
        pendientes: number
        aprobadas: number
        enDesarrollo: number
        implementadas: number
        rechazadas: number
    }
}

interface UserActivity {
    actividad: { id: string; accion: string; detalles: any; timestamp: string; direccionIp: string }[]
    ultimoLogin: string | null
    totalAcciones: number
}

interface UserAnalytics {
    productividad: { tareasCompletadasSemana: number; tareasCompletadasSemanaAnterior: number; tareasCompletadasMes: number; tendencia: number }
    estadoActual: { tareasEnProgreso: number; tareasPendientes: number; tareasVencidas: number; proyectosActivos: number }
    colaboracion: { comentariosSemana: number }
    cargaTrabajo: { total: number; nivel: string }
    perfil: { antiguedadMeses: number; rol: string; departamento: string }
    insights: { tipo: 'success' | 'warning' | 'info' | 'tip'; texto: string }[]
}

// ===== MAIN COMPONENT =====

export function UserDetailModalBento({ userId, open, onOpenChange }: UserDetailModalProps) {
    const [profile, setProfile] = useState<UserFullProfile | null>(null)
    const [projects, setProjects] = useState<ProjectItem[]>([])
    const [tasks, setTasks] = useState<TaskHistoryItem[]>([])
    const [ideas, setIdeas] = useState<UserIdeas | null>(null)
    const [activity, setActivity] = useState<UserActivity | null>(null)
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("resumen")

    // Real-time presence tracking
    const { isOnline: isUserOnline } = useSingleUserPresence(userId)

    useEffect(() => {
        if (open && userId) loadData()
        else { setProfile(null); setProjects([]); setTasks([]); setIdeas(null); setActivity(null); setAnalytics(null); setActiveTab("resumen") }
    }, [open, userId])

    const loadData = async () => {
        if (!userId) return
        setLoading(true)
        try {
            const [profileData, projectsData, tasksData] = await Promise.all([
                userService.obtenerPerfilCompleto(userId),
                obtenerProyectosUsuario(userId, 1, 50, 'todos'),
                obtenerTareasHistorial(userId, 1, 50, 'todos')
            ])
            setProfile(profileData)
            setProjects(projectsData.data)
            setTasks(tasksData.data)

            // Load additional data in background
            Promise.all([
                fetch(`/api/v1/usuarios/${userId}/ideas`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`/api/v1/usuarios/${userId}/actividad?limit=30`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`/api/v1/usuarios/${userId}/analytics`).then(r => r.ok ? r.json() : null).catch(() => null),
            ]).then(([ideasData, activityData, analyticsData]) => {
                if (ideasData) setIdeas(ideasData)
                if (activityData) setActivity(activityData)
                if (analyticsData) setAnalytics(analyticsData)
            })
        } catch (error) {
            console.error("Error loading user data:", error)
            toast.error("Error al cargar datos del usuario")
        } finally {
            setLoading(false)
        }
    }

    if (!userId) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 gap-0 overflow-hidden bg-[#0a0a0b] border-white/10 flex flex-col rounded-lg"
                style={{ width: '90vw', maxWidth: '900px', height: '85vh', maxHeight: '800px' }}
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">Perfil de Usuario</DialogTitle>

                {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Cargando...</p>
                    </div>
                ) : profile ? (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

                        {/* ===== HEADER - User Identity ===== */}
                        <div className="flex-shrink-0 border-b border-white/5 px-5 py-3">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <Avatar className="w-12 h-12 border border-white/10">
                                        <AvatarImage src={profile.avatarUrl || undefined} />
                                        <AvatarFallback className="text-base font-semibold bg-primary/20 text-primary">
                                            {getInitials(profile.nombreCompleto)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0b]",
                                        isUserOnline ? 'bg-emerald-500' : 'bg-gray-500'
                                    )} />
                                </div>

                                {/* Name and Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-foreground truncate">{profile.nombreCompleto}</h2>
                                        {isUserOnline ? (
                                            <Badge className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/15 text-emerald-500 border-emerald-500/30 gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                En línea
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground">
                                                Desconectado
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {profile.puestoTrabajo?.titulo || profile.rol?.nombre || profile.email}
                                    </p>
                                    {(profile.fechaIngreso || profile.fechaCreacion) && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                            Miembro desde {formatMemberSince(profile.fechaIngreso || profile.fechaCreacion)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ===== TABS ===== */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-shrink-0 border-b border-white/5 px-4">
                                <TabsList className="h-10 bg-transparent p-0 gap-1">
                                    <TabsTrigger value="resumen" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        Resumen
                                    </TabsTrigger>
                                    <TabsTrigger value="proyectos" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        Proyectos <span className="ml-1 text-muted-foreground">{projects.length}</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="tareas" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        Tareas <span className="ml-1 text-muted-foreground">{tasks.length}</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="ideas" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        Ideas {ideas && <span className="ml-1 text-muted-foreground">{ideas.totalCreadas}</span>}
                                    </TabsTrigger>
                                    <TabsTrigger value="actividad" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        Actividad
                                    </TabsTrigger>
                                    <TabsTrigger value="magnus" className="text-xs data-[state=active]:bg-white/5 rounded px-3 h-8">
                                        <Sparkles className="w-3 h-3 mr-1" /> Magnus
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* ===== TAB CONTENTS ===== */}
                            <div className="flex-1 min-h-0 overflow-hidden">

                                {/* TAB: RESUMEN */}
                                <TabsContent value="resumen" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {/* Left Column - Personal Info */}
                                            <div className="space-y-4">
                                                <InfoSection title="Información Laboral" icon={Briefcase}>
                                                    <InfoRow icon={Briefcase} label="Cargo" value={profile.puestoTrabajo?.titulo || 'Sin asignar'} />
                                                    <InfoRow icon={Building} label="Departamento" value={profile.puestoTrabajo?.departamento?.nombre || '-'} />
                                                    {profile.telefono && <InfoRow icon={Phone} label="Teléfono" value={profile.telefono} />}
                                                    {profile.supervisor && <InfoRow icon={User} label="Supervisor" value={profile.supervisor.nombreCompleto} />}
                                                    {(profile as any).direccionResidencia && <InfoRow icon={MapPin} label="Ubicación" value={(profile as any).direccionResidencia} />}
                                                </InfoSection>

                                                <InfoSection title="Perfil Profesional" icon={Star}>
                                                    <InfoRow icon={Star} label="Nivel" value={translateProfLevel(profile.perfilProfesional?.professionalLevel)} />
                                                    <InfoRow icon={Briefcase} label="Experiencia" value={profile.perfilProfesional?.yearsExperience ? `${profile.perfilProfesional.yearsExperience} años` : 'N/A'} />
                                                    <InfoRow icon={MapPin} label="Modalidad" value={translateWorkMode((profile.perfilProfesional as any)?.workModality || profile.perfilProfesional?.workMode)} />
                                                    <InfoRow icon={Clock} label="Capacidad" value={translateCapacity(profile.perfilProfesional?.currentCapacity)} />
                                                    <InfoRow icon={CheckCircle} label="Liderazgo" value={
                                                        (profile.perfilProfesional as any)?.leadershipExperience === 'large' ? 'Equipos grandes' :
                                                            (profile.perfilProfesional as any)?.leadershipExperience === 'medium' ? 'Equipos medianos' :
                                                                (profile.perfilProfesional as any)?.leadershipExperience === 'small' ? 'Equipos pequeños' :
                                                                    profile.perfilProfesional?.hasLeadershipExperience ? 'Sí' : 'Sin experiencia'
                                                    } />
                                                </InfoSection>

                                                {profile.biografia && (
                                                    <InfoSection title="Biografía" icon={User}>
                                                        <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                                                            "{profile.biografia}"
                                                        </p>
                                                    </InfoSection>
                                                )}
                                            </div>

                                            {/* Right Column - Professional Details */}
                                            <div className="space-y-4">
                                                {/* Weekly Schedule */}
                                                {(profile.perfilProfesional as any)?.weeklySchedule && (
                                                    <InfoSection title="Disponibilidad Semanal" icon={Calendar}>
                                                        <WeeklyScheduleGrid schedule={(profile.perfilProfesional as any).weeklySchedule} />
                                                    </InfoSection>
                                                )}

                                                {/* Languages */}
                                                {(() => {
                                                    const perfilProf = profile.perfilProfesional as any
                                                    const langs = perfilProf?.languages
                                                    if (langs && (Array.isArray(langs) ? langs.length > 0 : Object.keys(langs).length > 0)) {
                                                        return (
                                                            <InfoSection title="Idiomas" icon={Languages}>
                                                                <LanguagesList languages={langs} />
                                                            </InfoSection>
                                                        )
                                                    }
                                                    return null
                                                })()}

                                                {/* Specializations */}
                                                {profile.perfilProfesional?.specializations && profile.perfilProfesional.specializations.length > 0 && (
                                                    <InfoSection title="Especializaciones" icon={Award}>
                                                        <div className="flex flex-wrap gap-2">
                                                            {profile.perfilProfesional.specializations.map(spec => (
                                                                <Badge key={spec} className="text-xs px-2.5 py-1 bg-primary/10 text-primary border-primary/20">
                                                                    {spec}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </InfoSection>
                                                )}

                                                {/* Academic Formation */}
                                                {(() => {
                                                    const perfilProf = profile.perfilProfesional as any
                                                    if (perfilProf?.tituloAcademico || perfilProf?.institucionEducativa) {
                                                        return (
                                                            <InfoSection title="Formación Académica" icon={GraduationCap}>
                                                                {perfilProf?.tituloAcademico && <InfoRow icon={GraduationCap} label="Título" value={perfilProf.tituloAcademico} />}
                                                                {perfilProf?.institucionEducativa && <InfoRow icon={Building} label="Institución" value={perfilProf.institucionEducativa} />}
                                                                {perfilProf?.certificaciones && perfilProf.certificaciones.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {perfilProf.certificaciones.map((cert: string, idx: number) => (
                                                                            <Badge key={idx} variant="outline" className="text-xs px-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                                                                                {cert}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </InfoSection>
                                                        )
                                                    }
                                                    return null
                                                })()}

                                                {/* Professional Links */}
                                                {(profile.perfilProfesional?.linkedin || profile.perfilProfesional?.portfolio) && (
                                                    <InfoSection title="Enlaces Profesionales" icon={Globe}>
                                                        <div className="flex flex-wrap gap-2">
                                                            {profile.perfilProfesional?.linkedin && (
                                                                <a href={profile.perfilProfesional.linkedin} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors">
                                                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                                                </a>
                                                            )}
                                                            {profile.perfilProfesional?.portfolio && (
                                                                <a href={profile.perfilProfesional.portfolio} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs hover:bg-purple-500/20 transition-colors">
                                                                    <Globe className="w-4 h-4" /> Portfolio
                                                                </a>
                                                            )}
                                                            {profile.perfilProfesional?.hourlyRate && (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                                                                    <DollarSign className="w-4 h-4" /> ${profile.perfilProfesional.hourlyRate}/h
                                                                </div>
                                                            )}
                                                        </div>
                                                    </InfoSection>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* TAB: PROYECTOS */}
                                <TabsContent value="proyectos" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <ProjectsTab projects={projects} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* TAB: TAREAS */}
                                <TabsContent value="tareas" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <TasksTab tasks={tasks} profile={profile} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* TAB: IDEAS */}
                                <TabsContent value="ideas" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <IdeasTab ideas={ideas} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* TAB: ACTIVIDAD */}
                                <TabsContent value="actividad" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <ActivityTab activity={activity} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* TAB: MAGNUS IA */}
                                <TabsContent value="magnus" className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            <MagnusIATab analytics={analytics} profile={profile} projects={projects} tasks={tasks} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

// ===== SUBCOMPONENTS =====

function QuickStat({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-lg font-bold text-foreground">{value}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{label}</span>
        </div>
    )
}

function InfoSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/5 bg-white/[0.015] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm font-semibold text-foreground/80">{title}</span>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <Icon className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <span className="text-muted-foreground/60">{label}: </span>
                <span className="text-foreground/90">{value}</span>
            </div>
        </div>
    )
}

const DAY_NAMES: Record<string, string> = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom'
}

function WeeklyScheduleGrid({ schedule }: { schedule: Record<string, { enabled?: boolean; available?: boolean; startTime?: string; endTime?: string; timeRange?: string }> }) {
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

    return (
        <div className="grid grid-cols-7 gap-1.5">
            {days.map(day => {
                const dayData = schedule[day]
                const isAvailable = dayData?.enabled || dayData?.available
                const timeRange = dayData?.timeRange || (dayData?.startTime && dayData?.endTime ? `${dayData.startTime}-${dayData.endTime}` : null)

                return (
                    <div key={day} className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all",
                        isAvailable ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-white/[0.02] border border-white/5 opacity-50"
                    )}>
                        <span className={cn("text-[11px] font-medium", isAvailable ? "text-emerald-400" : "text-muted-foreground/50")}>
                            {DAY_NAMES[day] || day}
                        </span>
                        {isAvailable && timeRange && (
                            <span className="text-[9px] text-emerald-400/70 mt-0.5">{timeRange}</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function LanguagesList({ languages }: { languages: any[] | Record<string, string> }) {
    const langArray = Array.isArray(languages) ? languages : Object.entries(languages).map(([lang, level]) => ({ language: lang, level }))

    const levelColors: Record<string, string> = { nativo: 'bg-emerald-500', avanzado: 'bg-blue-500', intermedio: 'bg-yellow-500', basico: 'bg-orange-500' }
    const levelLabels: Record<string, string> = { nativo: 'Nativo', avanzado: 'Avanzado', intermedio: 'Intermedio', basico: 'Básico' }

    return (
        <div className="flex flex-wrap gap-2">
            {langArray.map((lang, idx) => {
                const langName = typeof lang === 'string' ? lang : lang.language || lang.idioma
                const level = typeof lang === 'string' ? 'intermedio' : (lang.level || lang.nivel || 'intermedio')
                return (
                    <Badge key={idx} className="text-xs px-2 py-1 bg-white/5 border-white/10 gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", levelColors[level] || 'bg-gray-500')} />
                        {langName} <span className="text-muted-foreground/60">• {levelLabels[level] || level}</span>
                    </Badge>
                )
            })}
        </div>
    )
}

function ProjectsTab({ projects }: { projects: ProjectItem[] }) {
    if (projects.length === 0) {
        return <EmptyState icon={FolderKanban} text="Sin proyectos asignados" />
    }

    const byStatus = {
        activo: projects.filter(p => p.estado === 'Activo' || p.estado === 'EN_PROGRESO'),
        completado: projects.filter(p => p.estado === 'Completado' || p.estado === 'Hecho'),
        otros: projects.filter(p => !['Activo', 'EN_PROGRESO', 'Completado', 'Hecho'].includes(p.estado))
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total" value={projects.length} icon={FolderKanban} />
                <StatCard label="Activos" value={byStatus.activo.length} icon={Activity} color="text-blue-400" />
                <StatCard label="Completados" value={byStatus.completado.length} icon={CheckCircle} color="text-emerald-400" />
            </div>

            <Accordion type="single" collapsible className="space-y-2">
                {projects.map((project, idx) => (
                    <AccordionItem key={project.id} value={`project-${idx}`} className="border border-white/5 rounded-lg bg-white/[0.01] px-0">
                        <AccordionTrigger className="py-3 px-4 hover:bg-white/[0.02] rounded-lg hover:no-underline">
                            <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", statusColors[project.estado] || 'bg-neutral-500')} />
                                <span className="text-sm font-medium text-foreground/90 truncate">{project.nombre}</span>
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 ml-auto mr-2 flex-shrink-0">{project.rolEnProyecto}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground/60">Estado:</span> <span className="text-foreground/80">{project.estado}</span></div>
                                    <div><span className="text-muted-foreground/60">Rol:</span> <span className="text-foreground/80">{project.rolEnProyecto}</span></div>
                                    <div><span className="text-muted-foreground/60">Inicio:</span> <span className="text-foreground/80">{formatDate(project.fechaInicio)}</span></div>
                                    <div><span className="text-muted-foreground/60">Fin:</span> <span className="text-foreground/80">{formatDate(project.fechaFin)}</span></div>
                                </div>
                                {project.descripcion && (
                                    <p className="text-sm text-muted-foreground/70 pt-2 border-t border-white/5">{project.descripcion}</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

function TasksTab({ tasks, profile }: { tasks: TaskHistoryItem[]; profile: UserFullProfile }) {
    if (tasks.length === 0) {
        return <EmptyState icon={ListTodo} text="Sin tareas asignadas" />
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Pendientes" value={profile.tareas.pendientes} icon={Clock} color="text-yellow-400" />
                <StatCard label="En Progreso" value={profile.tareas.enProgreso} icon={Activity} color="text-blue-400" />
                <StatCard label="Completadas" value={profile.tareas.completadas} icon={CheckCircle} color="text-emerald-400" />
                <StatCard label="Total" value={profile.tareas.total} icon={ListTodo} />
            </div>

            <Accordion type="single" collapsible className="space-y-2">
                {tasks.map((task, idx) => (
                    <AccordionItem key={task.id} value={`task-${idx}`} className="border border-white/5 rounded-lg bg-white/[0.01] px-0">
                        <AccordionTrigger className="py-3 px-4 hover:bg-white/[0.02] rounded-lg hover:no-underline">
                            <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", statusColors[task.estado] || 'bg-neutral-500')} />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium text-foreground/90 truncate">{task.titulo}</span>
                                    <span className="text-xs text-muted-foreground/60 truncate">{task.proyecto?.nombre || 'Sin proyecto'}</span>
                                </div>
                                <Badge className={cn("text-[10px] px-2 py-0.5 ml-auto mr-2 flex-shrink-0", priorityColors[task.prioridad] || 'bg-neutral-500/10 text-neutral-400')}>
                                    {task.prioridad}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground/60">Estado:</span> <span className="text-foreground/80">{task.estado.replace('_', ' ')}</span></div>
                                    <div><span className="text-muted-foreground/60">Prioridad:</span> <span className="text-foreground/80">{task.prioridad}</span></div>
                                    <div><span className="text-muted-foreground/60">Vencimiento:</span> <span className="text-foreground/80">{formatDate(task.fechaVencimiento)}</span></div>
                                    <div><span className="text-muted-foreground/60">Proyecto:</span> <span className="text-foreground/80">{task.proyecto?.nombre || '-'}</span></div>
                                </div>
                                {task.descripcion && (
                                    <p className="text-sm text-muted-foreground/70 pt-2 border-t border-white/5">{task.descripcion}</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

function IdeasTab({ ideas }: { ideas: UserIdeas | null }) {
    if (!ideas || ideas.totalCreadas === 0) {
        return <EmptyState icon={Lightbulb} text="Sin ideas registradas" />
    }

    const estadoColors: Record<string, string> = {
        PENDIENTE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        APROBADA: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        EN_DESARROLLO: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        IMPLEMENTADA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        RECHAZADA: 'bg-red-500/10 text-red-400 border-red-500/30',
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-5 gap-3">
                <StatCard label="Pendientes" value={ideas.estadisticas.pendientes} icon={Clock} color="text-yellow-400" small />
                <StatCard label="Aprobadas" value={ideas.estadisticas.aprobadas} icon={CheckCircle} color="text-blue-400" small />
                <StatCard label="En Desarrollo" value={ideas.estadisticas.enDesarrollo} icon={Activity} color="text-purple-400" small />
                <StatCard label="Implementadas" value={ideas.estadisticas.implementadas} icon={Zap} color="text-emerald-400" small />
                <StatCard label="Votadas" value={ideas.totalVotadas} icon={ThumbsUp} color="text-pink-400" small />
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Ideas Creadas
                </h3>
                <div className="grid gap-3">
                    {ideas.creadas.map((idea: any) => (
                        <div key={idea.id} className="p-4 rounded-lg border border-white/5 bg-white/[0.01] space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <h4 className="text-sm font-medium text-foreground/90">{idea.titulo}</h4>
                                <Badge className={cn("text-[10px] px-2 py-0.5 flex-shrink-0 border", estadoColors[idea.estado] || 'bg-neutral-500/10')}>
                                    {idea.estado.replace('_', ' ')}
                                </Badge>
                            </div>
                            {idea.descripcion && <p className="text-xs text-muted-foreground/70 line-clamp-2">{idea.descripcion}</p>}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
                                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {idea._count?.votos || 0}</span>
                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {idea._count?.comentarios || 0}</span>
                                <span>{formatDate(idea.fechaCreacion)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ActivityTab({ activity }: { activity: UserActivity | null }) {
    if (!activity || activity.actividad.length === 0) {
        return <EmptyState icon={Activity} text="Sin actividad reciente" />
    }

    const getActionIcon = (action: string) => {
        if (action.toLowerCase().includes('login')) return <User className="w-4 h-4 text-blue-400" />
        if (action.toLowerCase().includes('create') || action.toLowerCase().includes('crear')) return <Zap className="w-4 h-4 text-emerald-400" />
        if (action.toLowerCase().includes('update') || action.toLowerCase().includes('actualizar')) return <Activity className="w-4 h-4 text-yellow-400" />
        if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('eliminar')) return <AlertCircle className="w-4 h-4 text-red-400" />
        return <Info className="w-4 h-4 text-muted-foreground" />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground/80">Historial de Actividad</h3>
                {activity.ultimoLogin && (
                    <span className="text-xs text-muted-foreground/60">
                        Último login: {formatDistanceToNow(new Date(activity.ultimoLogin), { addSuffix: true, locale: es })}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {activity.actividad.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                        <div className="flex-shrink-0 mt-0.5">{getActionIcon(item.accion)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80">{item.accion}</p>
                            <p className="text-xs text-muted-foreground/50 mt-0.5">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}
                                {item.direccionIp && <span className="ml-2">• IP: {item.direccionIp}</span>}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MagnusIATab({ analytics, profile, projects, tasks }: { analytics: UserAnalytics | null; profile: UserFullProfile; projects: ProjectItem[]; tasks: TaskHistoryItem[] }) {
    const insightIcons: Record<string, React.ReactNode> = {
        success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        warning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
        info: <Info className="w-4 h-4 text-blue-400" />,
        tip: <Lightbulb className="w-4 h-4 text-purple-400" />,
    }

    const insightBgs: Record<string, string> = {
        success: 'bg-emerald-500/5 border-emerald-500/20',
        warning: 'bg-yellow-500/5 border-yellow-500/20',
        info: 'bg-blue-500/5 border-blue-500/20',
        tip: 'bg-purple-500/5 border-purple-500/20',
    }

    // Generate basic insights if analytics not loaded
    const basicInsights: { tipo: 'success' | 'warning' | 'info' | 'tip'; texto: string }[] = []

    if (projects.length > 0) {
        basicInsights.push({ tipo: 'info', texto: `Lidera ${projects.length} proyectos. Monitorea carga de responsabilidades.` })
    }

    const specs = profile.perfilProfesional?.specializations || []
    if (specs.length > 0) {
        basicInsights.push({ tipo: 'info', texto: `Especialista en: ${specs.join(', ')}` })
    }

    const perfilProf = profile.perfilProfesional as any
    if (perfilProf?.tituloAcademico) {
        basicInsights.push({ tipo: 'info', texto: `Formación: ${perfilProf.tituloAcademico}` })
    }

    const displayInsights = analytics?.insights?.length ? analytics.insights : basicInsights

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Magnus IA - Análisis de Usuario</h3>
                    <p className="text-xs text-muted-foreground/70">Insights y recomendaciones inteligentes</p>
                </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
                {displayInsights.map((insight, idx) => (
                    <div key={idx} className={cn("flex items-start gap-3 p-4 rounded-lg border", insightBgs[insight.tipo] || 'bg-white/[0.02] border-white/5')}>
                        <div className="flex-shrink-0 mt-0.5">{insightIcons[insight.tipo]}</div>
                        <p className="text-sm text-foreground/80">{insight.texto}</p>
                    </div>
                ))}
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsCard
                        title="Tareas Semana"
                        value={analytics.productividad.tareasCompletadasSemana}
                        trend={analytics.productividad.tendencia}
                        icon={Target}
                    />
                    <AnalyticsCard
                        title="Tareas Mes"
                        value={analytics.productividad.tareasCompletadasMes}
                        icon={BarChart3}
                    />
                    <AnalyticsCard
                        title="Carga Actual"
                        value={analytics.cargaTrabajo.total}
                        subtitle={analytics.cargaTrabajo.nivel}
                        icon={Timer}
                    />
                    <AnalyticsCard
                        title="Colaboración"
                        value={analytics.colaboracion.comentariosSemana}
                        subtitle="comentarios/sem"
                        icon={MessageSquare}
                    />
                </div>
            )}

            {/* Warnings */}
            {analytics?.estadoActual.tareasVencidas && analytics.estadoActual.tareasVencidas > 0 && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-sm font-medium text-red-400">Atención: {analytics.estadoActual.tareasVencidas} tarea(s) vencida(s)</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">Requieren acción inmediata</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AnalyticsCard({ title, value, trend, subtitle, icon: Icon }: { title: string; value: number; trend?: number; subtitle?: string; icon: React.ElementType }) {
    return (
        <div className="p-4 rounded-lg border border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/60">{title}</span>
                <Icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                {trend !== undefined && (
                    <span className={cn("text-xs flex items-center gap-0.5", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
                        <TrendingUp className="w-3 h-3" /> {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
                {subtitle && <span className="text-xs text-muted-foreground/50">{subtitle}</span>}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, small }: { label: string; value: number; icon: React.ElementType; color?: string; small?: boolean }) {
    return (
        <div className={cn("rounded-lg border border-white/5 bg-white/[0.015] flex items-center gap-3", small ? "p-3" : "p-4")}>
            <div className={cn("flex items-center justify-center rounded-lg bg-white/[0.05]", small ? "w-8 h-8" : "w-10 h-10")}>
                <Icon className={cn(small ? "w-4 h-4" : "w-5 h-5", color || "text-muted-foreground/60")} />
            </div>
            <div>
                <p className={cn("font-bold", color || "text-foreground", small ? "text-lg" : "text-xl")}>{value}</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <Icon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{text}</p>
        </div>
    )
}
