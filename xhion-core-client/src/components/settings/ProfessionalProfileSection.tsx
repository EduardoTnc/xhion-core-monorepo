"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Check,
    Briefcase,
    Clock,
    Users,
    Globe,
    Building2,
    Home,
    Repeat,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Pencil,
    GraduationCap,
    Plus,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

// ============================================================================
// TYPES & CONSTANTS (same as ProfileWizard)
// ============================================================================

interface DailyAvailability {
    enabled: boolean
    startTime: string
    endTime: string
}

interface ProfessionalProfileData {
    yearsExperience: string | null
    professionalLevel: string | null
    specializations: string[]
    workModality: string | null
    currentCapacity: string | null
    weeklySchedule: Record<string, DailyAvailability>
    leadershipExperience: string | null
    languages: Record<string, string>
    // Academic/Professional Extension Fields (optional to match API response)
    tituloAcademico?: string | null
    institucionEducativa?: string | null
    certificaciones?: string[]
}

const DEFAULT_SCHEDULE: Record<string, DailyAvailability> = {
    lunes: { enabled: true, startTime: "09:00", endTime: "18:00" },
    martes: { enabled: true, startTime: "09:00", endTime: "18:00" },
    miercoles: { enabled: true, startTime: "09:00", endTime: "18:00" },
    jueves: { enabled: true, startTime: "09:00", endTime: "18:00" },
    viernes: { enabled: true, startTime: "09:00", endTime: "18:00" },
    sabado: { enabled: false, startTime: "09:00", endTime: "13:00" },
    domingo: { enabled: false, startTime: "09:00", endTime: "13:00" },
}

const INITIAL_DATA: ProfessionalProfileData = {
    yearsExperience: null,
    professionalLevel: null,
    specializations: [],
    workModality: null,
    currentCapacity: null,
    weeklySchedule: DEFAULT_SCHEDULE,
    leadershipExperience: null,
    languages: {},
    tituloAcademico: null,
    institucionEducativa: null,
    certificaciones: [],
}

const YEARS_OPTIONS = [
    { value: "0-1", label: "< 1 año" },
    { value: "1-3", label: "1-3 años" },
    { value: "3-5", label: "3-5 años" },
    { value: "5-10", label: "5-10 años" },
    { value: "10+", label: "10+ años" },
]

const PROFESSIONAL_LEVEL_OPTIONS = [
    { value: "aprendiz", label: "Aprendiz", description: "En formación" },
    { value: "operativo", label: "Operativo", description: "Con supervisión" },
    { value: "autonomo", label: "Autónomo", description: "Independiente" },
    { value: "especialista", label: "Especialista", description: "Experto" },
    { value: "estrategico", label: "Estratégico", description: "Dirección" },
]

const SPECIALIZATIONS = [
    { value: "frontend", label: "Desarrollo Frontend", icon: "🎨" },
    { value: "backend", label: "Desarrollo Backend", icon: "⚙️" },
    { value: "fullstack", label: "Desarrollo Full Stack", icon: "🔄" },
    { value: "devops", label: "DevOps / Infraestructura", icon: "🚀" },
    { value: "data", label: "Data Science / IA", icon: "📊" },
    { value: "mobile", label: "Desarrollo Mobile", icon: "📱" },
    { value: "ux-ui", label: "Diseño UX/UI", icon: "✨" },
    { value: "qa", label: "QA / Testing", icon: "🧪" },
    { value: "architecture", label: "Arquitectura de Software", icon: "🏗️" },
    { value: "pm", label: "Gestión de Proyectos", icon: "📋" },
    { value: "analytics", label: "Análisis de Datos", icon: "📈" },
    { value: "security", label: "Ciberseguridad", icon: "🔒" },
    { value: "admin", label: "Administración", icon: "🏢" },
    { value: "finance", label: "Finanzas y Contabilidad", icon: "💰" },
    { value: "marketing", label: "Marketing Digital", icon: "📣" },
    { value: "sales", label: "Ventas Comerciales", icon: "🤝" },
    { value: "hr", label: "Recursos Humanos", icon: "👥" },
    { value: "operations", label: "Operaciones", icon: "⚡" },
    { value: "legal", label: "Legal y Compliance", icon: "⚖️" },
    { value: "support", label: "Soporte al Cliente", icon: "🎧" },
]

const WORK_MODALITY = [
    { value: "office", label: "Oficina", icon: Building2 },
    { value: "remote", label: "Remoto", icon: Home },
    { value: "hybrid", label: "Híbrido", icon: Repeat },
]

const CAPACITY_OPTIONS = [
    { value: "available", label: "Disponible", emoji: "🟢" },
    { value: "partial", label: "Parcialmente", emoji: "🟡" },
    { value: "busy", label: "Ocupado", emoji: "🟠" },
    { value: "unavailable", label: "No disponible", emoji: "🔴" },
]

const DAY_LABELS: Record<string, string> = {
    lunes: "Lun", martes: "Mar", miercoles: "Mié",
    jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
}

const TIME_OPTIONS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
]

const LEADERSHIP_OPTIONS = [
    { value: "none", label: "Sin experiencia en liderazgo" },
    { value: "small", label: "Equipos pequeños (1-3)" },
    { value: "medium", label: "Equipos medianos (4-10)" },
    { value: "large", label: "Equipos grandes (10+)" },
]

const LANGUAGES = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
]

const LANGUAGE_LEVELS = [
    { value: "native", label: "Nativo" },
    { value: "advanced", label: "Avanzado" },
    { value: "intermediate", label: "Intermedio" },
    { value: "basic", label: "Básico" },
]

// ============================================================================
// COMPONENT
// ============================================================================

interface ProfessionalProfileSectionProps {
    initialData?: Partial<ProfessionalProfileData>
    onSave?: (data: ProfessionalProfileData) => void
}

export function ProfessionalProfileSection({ initialData, onSave }: ProfessionalProfileSectionProps) {
    const [data, setData] = useState<ProfessionalProfileData>({ ...INITIAL_DATA, ...initialData })
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        experience: true,
        specializations: false,
        availability: false,
        leadership: false,
        education: false,
    })

    // Track if data has been modified by user (not initial load)
    const [hasUserModified, setHasUserModified] = useState(false)

    // Sync with initialData when it changes (e.g., when parent loads from API)
    useEffect(() => {
        if (initialData) {
            setData(prev => ({ ...prev, ...initialData }))
        }
    }, [initialData])

    // Call onSave after data changes (not during render)
    useEffect(() => {
        if (hasUserModified && onSave) {
            onSave(data)
        }
    }, [data, hasUserModified, onSave])

    const updateData = useCallback((updates: Partial<ProfessionalProfileData>) => {
        setHasUserModified(true)
        setData(prev => ({ ...prev, ...updates }))
    }, [])

    const toggleArrayItem = useCallback((field: keyof ProfessionalProfileData, value: string, maxItems?: number) => {
        setHasUserModified(true)
        setData(prev => {
            const current = prev[field] as string[]
            let newArray: string[]
            if (current.includes(value)) {
                newArray = current.filter(v => v !== value)
            } else {
                if (maxItems && current.length >= maxItems) {
                    toast.info(`Máximo ${maxItems} opciones permitidas`)
                    return prev
                }
                newArray = [...current, value]
            }
            return { ...prev, [field]: newArray }
        })
    }, [])

    const updateDaySchedule = useCallback((day: string, updates: Partial<DailyAvailability>) => {
        setHasUserModified(true)
        setData(prev => ({
            ...prev,
            weeklySchedule: {
                ...prev.weeklySchedule,
                [day]: { ...prev.weeklySchedule[day], ...updates }
            }
        }))
    }, [])

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const getYearsLabel = () => YEARS_OPTIONS.find(o => o.value === data.yearsExperience)?.label || "Sin definir"
    const getLevelLabel = () => PROFESSIONAL_LEVEL_OPTIONS.find(o => o.value === data.professionalLevel)?.label || "Sin definir"
    const getModalityLabel = () => WORK_MODALITY.find(o => o.value === data.workModality)?.label || "Sin definir"
    const getCapacityOption = () => CAPACITY_OPTIONS.find(o => o.value === data.currentCapacity)
    const getLeadershipLabel = () => LEADERSHIP_OPTIONS.find(o => o.value === data.leadershipExperience)?.label || "Sin definir"

    return (
        <div className="rounded-lg border border-border bg-card">

            {/* Education & Certifications Section */}
            <Collapsible open={expandedSections.education} onOpenChange={() => toggleSection("education")}>
                <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Formación Académica</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {data.tituloAcademico || "Sin definir"}
                                {(data.certificaciones?.length ?? 0) > 0 && ` • ${data.certificaciones?.length} certificación(es)`}
                            </Badge>
                            {expandedSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-4">
                        {/* Academic Title */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Título Académico</p>
                            <Input
                                placeholder="Ej: Ingeniero de Sistemas, Licenciado en Administración"
                                value={data.tituloAcademico || ""}
                                onChange={(e) => updateData({ tituloAcademico: e.target.value || null })}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Educational Institution */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Universidad o Instituto</p>
                            <Input
                                placeholder="Ej: UTP, UNSA, UCSM, etc."
                                value={data.institucionEducativa || ""}
                                onChange={(e) => updateData({ institucionEducativa: e.target.value || null })}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Certifications */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Certificaciones Profesionales</p>

                            {/* Existing certifications */}
                            {(data.certificaciones?.length ?? 0) > 0 && (
                                <div className="space-y-1.5">
                                    {(data.certificaciones ?? []).map((cert, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={cert}
                                                onChange={(e) => {
                                                    const newCerts = [...(data.certificaciones ?? [])]
                                                    newCerts[index] = e.target.value
                                                    updateData({ certificaciones: newCerts })
                                                }}
                                                className="h-8 text-sm flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                                onClick={() => {
                                                    const newCerts = (data.certificaciones ?? []).filter((_, i) => i !== index)
                                                    updateData({ certificaciones: newCerts })
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add certification button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 w-full border-dashed"
                                onClick={() => updateData({ certificaciones: [...(data.certificaciones ?? []), ""] })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Agregar certificación
                            </Button>

                            <p className="text-[10px] text-muted-foreground">
                                Incluye certificaciones como Gestión de Proyectos, Idiomas, Primeros Auxilios, Ciberseguridad, etc.
                            </p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>


            {/* Experience Section */}
            <Collapsible open={expandedSections.experience} onOpenChange={() => toggleSection("experience")}>
                <CollapsibleTrigger className="w-full border-t">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Experiencia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{getYearsLabel()} • {getLevelLabel()}</Badge>
                            {expandedSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-4">
                        {/* Years */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Años de experiencia</p>
                            <div className="flex flex-wrap gap-1.5">
                                {YEARS_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateData({ yearsExperience: option.value })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                            data.yearsExperience === option.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Level */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Nivel profesional</p>
                            <div className="flex flex-wrap gap-1.5">
                                {PROFESSIONAL_LEVEL_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateData({ professionalLevel: option.value })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                            data.professionalLevel === option.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Specializations Section */}
            <Collapsible open={expandedSections.specializations} onOpenChange={() => toggleSection("specializations")}>
                <CollapsibleTrigger className="w-full border-t border-border">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Especializaciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{data.specializations.length} áreas</Badge>
                            {expandedSections.specializations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {SPECIALIZATIONS.map(spec => (
                                <button
                                    key={spec.value}
                                    onClick={() => toggleArrayItem("specializations", spec.value, 5)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all text-left",
                                        data.specializations.includes(spec.value)
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <span>{spec.icon}</span>
                                    <span className="flex-1">{spec.label}</span>
                                    {data.specializations.includes(spec.value) && (
                                        <Check className="h-3 w-3" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">Máximo 5 especializaciones</p>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Availability Section */}
            <Collapsible open={expandedSections.availability} onOpenChange={() => toggleSection("availability")}>
                <CollapsibleTrigger className="w-full border-t border-border">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Disponibilidad</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getCapacityOption() && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                    <span>{getCapacityOption()?.emoji}</span>
                                    {getCapacityOption()?.label}
                                </Badge>
                            )}
                            {expandedSections.availability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-4">
                        {/* Modality */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Modalidad de trabajo</p>
                            <div className="flex gap-2">
                                {WORK_MODALITY.map(option => {
                                    const Icon = option.icon
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => updateData({ workModality: option.value })}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                                data.workModality === option.value
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs font-medium">{option.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Capacidad actual</p>
                            <div className="flex flex-wrap gap-1.5">
                                {CAPACITY_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateData({ currentCapacity: option.value })}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                            data.currentCapacity === option.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{option.emoji}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Horario semanal</p>
                            <div className="space-y-1">
                                {Object.entries(data.weeklySchedule).map(([day, schedule]) => (
                                    <div key={day} className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
                                        <button
                                            onClick={() => updateDaySchedule(day, { enabled: !schedule.enabled })}
                                            className={cn(
                                                "w-10 py-1 rounded text-[10px] font-medium transition-all",
                                                schedule.enabled
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {DAY_LABELS[day]}
                                        </button>
                                        {schedule.enabled ? (
                                            <div className="flex items-center gap-1 flex-1">
                                                <select
                                                    value={schedule.startTime}
                                                    onChange={(e) => updateDaySchedule(day, { startTime: e.target.value })}
                                                    className="bg-background border rounded px-1.5 py-0.5 text-[10px]"
                                                >
                                                    {TIME_OPTIONS.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-muted-foreground">a</span>
                                                <select
                                                    value={schedule.endTime}
                                                    onChange={(e) => updateDaySchedule(day, { endTime: e.target.value })}
                                                    className="bg-background border rounded px-1.5 py-0.5 text-[10px]"
                                                >
                                                    {TIME_OPTIONS.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground italic">No disponible</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Leadership & Languages Section */}
            <Collapsible open={expandedSections.leadership} onOpenChange={() => toggleSection("leadership")}>
                <CollapsibleTrigger className="w-full border-t border-border">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Liderazgo e Idiomas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {Object.keys(data.languages).length} idiomas
                            </Badge>
                            {expandedSections.leadership ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-4">
                        {/* Leadership */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Experiencia liderando equipos</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {LEADERSHIP_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateData({ leadershipExperience: option.value })}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                                            data.leadershipExperience === option.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Idiomas</p>
                            <div className="space-y-1">
                                {LANGUAGES.map(lang => (
                                    <div key={lang.code} className="flex items-center gap-2">
                                        <span className="w-16 text-xs font-medium">{lang.label}</span>
                                        <div className="flex flex-1 gap-0.5">
                                            {LANGUAGE_LEVELS.map(level => (
                                                <button
                                                    key={level.value}
                                                    onClick={() => updateData({
                                                        languages: { ...data.languages, [lang.code]: level.value }
                                                    })}
                                                    className={cn(
                                                        "flex-1 py-1 rounded text-[10px] font-medium transition-all",
                                                        data.languages[lang.code] === level.value
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted hover:bg-muted/80"
                                                    )}
                                                >
                                                    {level.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export type { ProfessionalProfileData, DailyAvailability }
