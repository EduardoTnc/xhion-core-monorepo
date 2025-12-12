"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Briefcase,
    Clock,
    Users,
    Building2,
    Home,
    Repeat,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

// Daily availability for each day of the week
interface DailyAvailability {
    enabled: boolean
    startTime: string
    endTime: string
}

interface ProfileWizardData {
    // Step 1: Experience
    yearsExperience: string | null
    professionalLevel: string | null
    // Step 2: Specializations
    specializations: string[]
    // Step 3: Availability
    workModality: string | null
    currentCapacity: string | null
    weeklySchedule: Record<string, DailyAvailability>
    // Step 4: Leadership & Languages
    leadershipExperience: string | null
    languages: Record<string, string>
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

const INITIAL_DATA: ProfileWizardData = {
    yearsExperience: null,
    professionalLevel: null,
    specializations: [],
    workModality: null,
    currentCapacity: null,
    weeklySchedule: DEFAULT_SCHEDULE,
    leadershipExperience: null,
    languages: {},
}

const YEARS_OPTIONS = [
    { value: "0-1", label: "< 1 año", description: "Recién iniciando" },
    { value: "1-3", label: "1-3 años", description: "En desarrollo" },
    { value: "3-5", label: "3-5 años", description: "Consolidado" },
    { value: "5-10", label: "5-10 años", description: "Experimentado" },
    { value: "10+", label: "10+ años", description: "Experto" },
]

// Changed from "seniority" to clearer professional level terminology
const PROFESSIONAL_LEVEL_OPTIONS = [
    { value: "aprendiz", label: "Aprendiz", description: "En formación, aprendiendo las bases" },
    { value: "operativo", label: "Operativo", description: "Ejecuta tareas con supervisión" },
    { value: "autonomo", label: "Autónomo", description: "Trabaja de forma independiente" },
    { value: "especialista", label: "Especialista", description: "Experto en su área" },
    { value: "estrategico", label: "Estratégico", description: "Define dirección y estrategia" },
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
    { value: "office", label: "Oficina", icon: Building2, description: "Trabajo presencial" },
    { value: "remote", label: "Remoto", icon: Home, description: "Trabajo desde casa" },
    { value: "hybrid", label: "Híbrido", icon: Repeat, description: "Combinación flexible" },
]

const CAPACITY_OPTIONS = [
    { value: "available", label: "Disponible", description: "Puedo tomar nuevos proyectos", emoji: "🟢" },
    { value: "partial", label: "Parcialmente", description: "Tengo algo de tiempo libre", emoji: "🟡" },
    { value: "busy", label: "Ocupado", description: "Mi carga actual es alta", emoji: "🟠" },
    { value: "unavailable", label: "No disponible", description: "Sin tiempo para nuevos proyectos", emoji: "🔴" },
]

const DAY_LABELS: Record<string, string> = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
}

const TIME_OPTIONS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
]

const LEADERSHIP_OPTIONS = [
    { value: "none", label: "No he liderado equipos", description: "Contribuidor individual" },
    { value: "small", label: "Equipos pequeños (1-3)", description: "Mentoría y guía" },
    { value: "medium", label: "Equipos medianos (4-10)", description: "Gestión directa" },
    { value: "large", label: "Equipos grandes (10+)", description: "Liderazgo estratégico" },
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

interface ProfileWizardProps {
    onComplete: (data: ProfileWizardData) => void
    onCancel?: () => void
    initialData?: Partial<ProfileWizardData>
}

export function ProfileWizard({ onComplete, onCancel, initialData }: ProfileWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [data, setData] = useState<ProfileWizardData>({ ...INITIAL_DATA, ...initialData })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Now only 4 steps (removed Skills step)
    const STEPS = [
        { title: "Experiencia", icon: Briefcase, description: "Tu trayectoria profesional" },
        { title: "Especialización", icon: Sparkles, description: "Áreas de expertise" },
        { title: "Disponibilidad", icon: Clock, description: "Horarios y modalidad" },
        { title: "Liderazgo", icon: Users, description: "Equipos e idiomas" },
    ]

    const totalSteps = STEPS.length
    const progress = ((currentStep + 1) / totalSteps) * 100

    const updateData = useCallback((updates: Partial<ProfileWizardData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }, [])

    const toggleArrayItem = useCallback((field: keyof ProfileWizardData, value: string, maxItems?: number) => {
        setData(prev => {
            const current = prev[field] as string[]
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) }
            }
            if (maxItems && current.length >= maxItems) {
                toast.info(`Máximo ${maxItems} opciones permitidas`)
                return prev
            }
            return { ...prev, [field]: [...current, value] }
        })
    }, [])

    const updateDaySchedule = useCallback((day: string, updates: Partial<DailyAvailability>) => {
        setData(prev => ({
            ...prev,
            weeklySchedule: {
                ...prev.weeklySchedule,
                [day]: { ...prev.weeklySchedule[day], ...updates }
            }
        }))
    }, [])

    const canProceed = useCallback(() => {
        switch (currentStep) {
            case 0: return data.yearsExperience && data.professionalLevel
            case 1: return data.specializations.length > 0
            case 2: return data.workModality && data.currentCapacity
            case 3: return data.leadershipExperience && Object.keys(data.languages).length > 0
            default: return false
        }
    }, [currentStep, data])

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = async () => {
        setIsSubmitting(true)
        try {
            await onComplete(data)
            toast.success("¡Perfil actualizado exitosamente!")
        } catch (error) {
            toast.error("Error al guardar el perfil")
        } finally {
            setIsSubmitting(false)
        }
    }

    // ============================================================================
    // RENDER STEPS
    // ============================================================================

    const renderStep1 = () => (
        <div className="space-y-6">
            {/* Years of Experience */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">¿Cuántos años de experiencia profesional tienes?</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {YEARS_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ yearsExperience: option.value })}
                            className={cn(
                                "relative p-3 rounded-xl border-2 transition-all hover:scale-[1.02]",
                                data.yearsExperience === option.value
                                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <p className="font-semibold text-sm">{option.label}</p>
                            <p className="text-[10px] text-muted-foreground">{option.description}</p>
                            {data.yearsExperience === option.value && (
                                <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Professional Level - Changed from "seniority" */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">¿Cuál es tu nivel profesional actual?</h4>
                <p className="text-xs text-muted-foreground">Selecciona el que mejor describa tu rol y responsabilidades</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {PROFESSIONAL_LEVEL_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ professionalLevel: option.value })}
                            className={cn(
                                "relative p-3 rounded-xl border-2 transition-all hover:scale-[1.02] text-left",
                                data.professionalLevel === option.value
                                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <p className="font-semibold text-sm">{option.label}</p>
                            <p className="text-[10px] text-muted-foreground">{option.description}</p>
                            {data.professionalLevel === option.value && (
                                <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    // Step 2: Specializations - Fixed text truncation, now uses 3 columns max
    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Selecciona tus áreas de experiencia</h4>
                <Badge variant="outline" className="text-xs">
                    {data.specializations.length}/5 seleccionadas
                </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SPECIALIZATIONS.map(spec => (
                    <button
                        key={spec.value}
                        onClick={() => toggleArrayItem("specializations", spec.value, 5)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                            data.specializations.includes(spec.value)
                                ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                : "border-border hover:border-primary/50"
                        )}
                    >
                        <span className="text-xl flex-shrink-0">{spec.icon}</span>
                        <span className="text-sm font-medium">{spec.label}</span>
                        {data.specializations.includes(spec.value) && (
                            <Check className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )

    // Step 3: Availability with daily schedule
    const renderStep3 = () => (
        <div className="space-y-6">
            {/* Work Modality */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">¿Cuál es tu modalidad de trabajo preferida?</h4>
                <div className="grid grid-cols-3 gap-3">
                    {WORK_MODALITY.map(option => {
                        const Icon = option.icon
                        return (
                            <button
                                key={option.value}
                                onClick={() => updateData({ workModality: option.value })}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.02]",
                                    data.workModality === option.value
                                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "p-2.5 rounded-full",
                                    data.workModality === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-xs">{option.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{option.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Current Capacity */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">¿Cuál es tu capacidad actual para nuevos proyectos?</h4>
                <div className="grid grid-cols-2 gap-2">
                    {CAPACITY_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ currentCapacity: option.value })}
                            className={cn(
                                "flex items-start gap-2 p-3 rounded-lg border-2 transition-all text-left",
                                data.currentCapacity === option.value
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <span className="text-lg">{option.emoji}</span>
                            <div>
                                <p className="text-xs font-medium">{option.label}</p>
                                <p className="text-[10px] text-muted-foreground">{option.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Daily Schedule */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Horario disponible por día</h4>
                <p className="text-xs text-muted-foreground">Configura en qué días y horarios puedes trabajar en proyectos</p>
                <div className="space-y-2">
                    {Object.entries(data.weeklySchedule).map(([day, schedule]) => (
                        <div key={day} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                            {/* Day toggle */}
                            <button
                                onClick={() => updateDaySchedule(day, { enabled: !schedule.enabled })}
                                className={cn(
                                    "w-24 py-1.5 px-2 rounded-md text-xs font-medium transition-all text-left",
                                    schedule.enabled
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {DAY_LABELS[day]}
                            </button>

                            {schedule.enabled ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <select
                                        value={schedule.startTime}
                                        onChange={(e) => updateDaySchedule(day, { startTime: e.target.value })}
                                        className="bg-background border rounded px-2 py-1 text-xs"
                                    >
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-muted-foreground">a</span>
                                    <select
                                        value={schedule.endTime}
                                        onChange={(e) => updateDaySchedule(day, { endTime: e.target.value })}
                                        className="bg-background border rounded px-2 py-1 text-xs"
                                    >
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {(() => {
                                            const start = parseInt(schedule.startTime.split(':')[0])
                                            const end = parseInt(schedule.endTime.split(':')[0])
                                            const hours = end - start
                                            return hours > 0 ? `${hours}h` : ''
                                        })()}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">No disponible</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    // Step 4: Leadership & Languages (was Step 5)
    const renderStep4 = () => (
        <div className="space-y-6">
            {/* Leadership Experience */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">¿Has liderado equipos de trabajo?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {LEADERSHIP_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateData({ leadershipExperience: option.value })}
                            className={cn(
                                "relative p-3 rounded-lg border-2 transition-all text-left",
                                data.leadershipExperience === option.value
                                    ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <p className="font-medium text-sm">{option.label}</p>
                            <p className="text-[10px] text-muted-foreground">{option.description}</p>
                            {data.leadershipExperience === option.value && (
                                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium">Idiomas que hablas (selecciona tu nivel)</h4>
                <div className="space-y-2">
                    {LANGUAGES.map(lang => (
                        <div key={lang.code} className="flex items-center gap-2">
                            <span className="w-20 text-sm font-medium">{lang.label}</span>
                            <div className="flex flex-1 gap-1">
                                {LANGUAGE_LEVELS.map(level => (
                                    <button
                                        key={level.value}
                                        onClick={() => updateData({
                                            languages: { ...data.languages, [lang.code]: level.value }
                                        })}
                                        className={cn(
                                            "flex-1 py-1.5 rounded text-[10px] font-medium transition-all",
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
    )

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0: return renderStep1()
            case 1: return renderStep2()
            case 2: return renderStep3()
            case 3: return renderStep4()
            default: return null
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {(() => {
                            const StepIcon = STEPS[currentStep].icon
                            return <StepIcon className="h-5 w-5 text-primary" />
                        })()}
                        <CardTitle className="text-lg">{STEPS[currentStep].title}</CardTitle>
                    </div>
                    <Badge variant="outline">
                        Paso {currentStep + 1} de {totalSteps}
                    </Badge>
                </div>
                <CardDescription>{STEPS[currentStep].description}</CardDescription>
                <Progress value={progress} className="h-1.5 mt-3" />
            </CardHeader>

            <CardContent className="pb-4">
                <div className="min-h-[320px]">
                    {renderCurrentStep()}
                </div>
            </CardContent>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
                <Button
                    variant="ghost"
                    onClick={currentStep === 0 ? onCancel : handlePrev}
                    className="gap-1.5"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {currentStep === 0 ? "Cancelar" : "Anterior"}
                </Button>

                {currentStep < totalSteps - 1 ? (
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="gap-1.5"
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleComplete}
                        disabled={!canProceed() || isSubmitting}
                        className="gap-1.5"
                    >
                        {isSubmitting ? (
                            <>Guardando...</>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Completar Perfil
                            </>
                        )}
                    </Button>
                )}
            </div>
        </Card>
    )
}

export type { ProfileWizardData, DailyAvailability }
export { SPECIALIZATIONS, PROFESSIONAL_LEVEL_OPTIONS, YEARS_OPTIONS, LANGUAGES, LANGUAGE_LEVELS, LEADERSHIP_OPTIONS, CAPACITY_OPTIONS, WORK_MODALITY, DAY_LABELS }
