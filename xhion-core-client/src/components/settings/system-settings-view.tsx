"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Building2,
    Palette,
    Upload,
    Loader2,
    Save,
    RotateCcw,
    Image as ImageIcon,
    MapPin,
    Sparkles,
    Info,
    AlertCircle,
    Check,
    Settings,
} from "lucide-react"
// TanStack Query hooks - replacing useSystemSettingsStore
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/queries"
import { systemSettingsService } from "@/services/systemSettingsService"
import { toast } from "sonner"
import { PRESET_THEMES, getContrastColor } from "@/hooks/useThemeCustomization"
import { PageHeaderSimple } from "@/components/layout/PageHeader"

export function SystemSettingsView() {
    // ==================== TanStack Query Hooks ====================
    const { data: settings, isLoading } = useSystemSettings()
    const updateSettingsMutation = useUpdateSystemSettings()

    const [localSettings, setLocalSettings] = useState({
        nombreEmpresa: "",
        logoUrl: "",
        faviconUrl: "",
        colorPrimario: "",
        colorSecundario: "",
        ubicacion: "",
        descripcionEmpresa: "",
    })

    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                nombreEmpresa: settings.nombreEmpresa || "",
                logoUrl: settings.logoUrl || "",
                faviconUrl: settings.faviconUrl || "",
                colorPrimario: settings.colorPrimario || "#3b82f6",
                colorSecundario: settings.colorSecundario || "#6366f1",
                ubicacion: settings.ubicacion || "",
                descripcionEmpresa: settings.descripcionEmpresa || "",
            })
        }
    }, [settings])

    const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
        const setUploading = type === 'logo' ? setIsUploadingLogo : setIsUploadingFavicon

        setUploading(true)
        try {
            const result = await systemSettingsService.uploadFile(file, 'company')
            const field = type === 'logo' ? 'logoUrl' : 'faviconUrl'
            setLocalSettings(prev => ({ ...prev, [field]: result.url }))
            toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} cargado exitosamente`)
        } catch (error) {
            console.error(`Error uploading ${type}:`, error)
            toast.error(`Error al cargar ${type === 'logo' ? 'el logo' : 'el favicon'}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        try {
            await updateSettingsMutation.mutateAsync({
                nombreEmpresa: localSettings.nombreEmpresa,
                logoUrl: localSettings.logoUrl,
                faviconUrl: localSettings.faviconUrl,
                colorPrimario: localSettings.colorPrimario,
                colorSecundario: localSettings.colorSecundario,
                ubicacion: localSettings.ubicacion,
                descripcionEmpresa: localSettings.descripcionEmpresa,
            })
            // Success toast handled by mutation
        } catch (error) {
            // Error toast handled by mutation
            console.error("Error saving settings:", error)
        }
    }

    const handleReset = () => {
        if (settings) {
            setLocalSettings({
                nombreEmpresa: settings.nombreEmpresa || "",
                logoUrl: settings.logoUrl || "",
                faviconUrl: settings.faviconUrl || "",
                colorPrimario: settings.colorPrimario || "#3b82f6",
                colorSecundario: settings.colorSecundario || "#6366f1",
                ubicacion: settings.ubicacion || "",
                descripcionEmpresa: settings.descripcionEmpresa || "",
            })
            toast.info("Cambios descartados")
        }
    }

    const hasChanges = settings && (
        localSettings.nombreEmpresa !== (settings.nombreEmpresa || "") ||
        localSettings.logoUrl !== (settings.logoUrl || "") ||
        localSettings.faviconUrl !== (settings.faviconUrl || "") ||
        localSettings.colorPrimario !== (settings.colorPrimario || "#3b82f6") ||
        localSettings.colorSecundario !== (settings.colorSecundario || "#6366f1") ||
        localSettings.ubicacion !== (settings.ubicacion || "") ||
        localSettings.descripcionEmpresa !== (settings.descripcionEmpresa || "")
    )

    const getLogoUrl = (url: string) => {
        if (!url) return ""
        if (url.startsWith('http')) return url
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`
    }

    if (isLoading && !settings) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <PageHeaderSimple
                icon={Settings}
                title="Config. Sistema"
                subtitle="Personaliza la apariencia y datos de tu empresa"
            />

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
                <div className="space-y-3">
                    {/* Identidad de la Empresa */}
                    <Card>
                        <CardHeader className="py-2 px-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">Identidad de la Empresa</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Nombre, ubicación y branding corporativo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-3 pt-0 space-y-3">
                            {/* Row 1: Name + Location (2 columns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="nombreEmpresa" className="text-sm">Nombre de la Empresa</Label>
                                    <Input
                                        id="nombreEmpresa"
                                        value={localSettings.nombreEmpresa}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
                                        placeholder="Mi Empresa S.A."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Aparece en el título del navegador y encabezados
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ubicacion" className="text-sm flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Ubicación
                                    </Label>
                                    <Input
                                        id="ubicacion"
                                        value={localSettings.ubicacion}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, ubicacion: e.target.value }))}
                                        placeholder="Ciudad, País"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Usado por Magnus IA para contexto geográfico
                                    </p>
                                </div>
                            </div>

                            {/* Row 2: Logo + Favicon (2 columns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Logo */}
                                <div className="space-y-1">
                                    <Label className="text-sm">Logo de la Empresa</Label>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 rounded-lg border">
                                            <AvatarImage src={getLogoUrl(localSettings.logoUrl)} />
                                            <AvatarFallback className="rounded-lg bg-muted">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={isUploadingLogo}
                                            >
                                                {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
                                                Subir Logo
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG. Máx 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Favicon */}
                                <div className="space-y-1">
                                    <Label className="text-sm">Favicon</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center">
                                            {localSettings.faviconUrl ? (
                                                <img src={getLogoUrl(localSettings.faviconUrl)} alt="Favicon" className="h-6 w-6 object-contain" />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                ref={faviconInputRef}
                                                type="file"
                                                accept="image/*,.ico"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => faviconInputRef.current?.click()}
                                                disabled={isUploadingFavicon}
                                            >
                                                {isUploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
                                                Subir Favicon
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-1">ICO, PNG. 32x32px</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personalización de Tema */}
                    <Card>
                        <CardHeader className="py-2 px-4">
                            <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">Personalización del Tema</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Elige un tema predefinido o personaliza los colores de la interfaz
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0 space-y-4">
                            {/* Preset Themes */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Temas Predefinidos</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {Object.entries(PRESET_THEMES).map(([key, theme]) => {
                                        const isSelected =
                                            localSettings.colorPrimario === theme.primary &&
                                            localSettings.colorSecundario === theme.secondary
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setLocalSettings(prev => ({
                                                    ...prev,
                                                    colorPrimario: theme.primary,
                                                    colorSecundario: theme.secondary,
                                                }))}
                                                className={`relative group p-2 rounded-lg border-2 transition-all hover:scale-105 ${isSelected
                                                    ? 'border-primary ring-2 ring-primary/20'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <div
                                                        className="h-5 w-5 rounded-full border shadow-sm"
                                                        style={{ backgroundColor: theme.primary }}
                                                    />
                                                    <div
                                                        className="h-5 w-5 rounded-full border shadow-sm"
                                                        style={{ backgroundColor: theme.secondary }}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-medium text-foreground truncate">{theme.name}</p>
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Custom Colors */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Colores Personalizados</Label>

                                        {/* Primary Color */}
                                        <div className="space-y-1">
                                            <Label htmlFor="colorPrimario" className="text-xs text-muted-foreground">Color Primario</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-10 w-10 rounded-lg border-2 cursor-pointer flex-shrink-0 shadow-sm transition-transform hover:scale-110"
                                                    style={{ backgroundColor: localSettings.colorPrimario }}
                                                    onClick={() => document.getElementById('colorPrimarioInput')?.click()}
                                                />
                                                <input
                                                    id="colorPrimarioInput"
                                                    type="color"
                                                    value={localSettings.colorPrimario}
                                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, colorPrimario: e.target.value }))}
                                                    className="sr-only"
                                                />
                                                <Input
                                                    id="colorPrimario"
                                                    value={localSettings.colorPrimario}
                                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, colorPrimario: e.target.value }))}
                                                    placeholder="#FFBF00"
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Secondary Color */}
                                        <div className="space-y-1">
                                            <Label htmlFor="colorSecundario" className="text-xs text-muted-foreground">Color Secundario</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-10 w-10 rounded-lg border-2 cursor-pointer flex-shrink-0 shadow-sm transition-transform hover:scale-110"
                                                    style={{ backgroundColor: localSettings.colorSecundario }}
                                                    onClick={() => document.getElementById('colorSecundarioInput')?.click()}
                                                />
                                                <input
                                                    id="colorSecundarioInput"
                                                    type="color"
                                                    value={localSettings.colorSecundario}
                                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, colorSecundario: e.target.value }))}
                                                    className="sr-only"
                                                />
                                                <Input
                                                    id="colorSecundario"
                                                    value={localSettings.colorSecundario}
                                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, colorSecundario: e.target.value }))}
                                                    placeholder="#1a1a2e"
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Vista Previa</Label>
                                        <div
                                            className="rounded-lg border-2 p-3 space-y-3"
                                            style={{ backgroundColor: localSettings.colorSecundario + '15' }}
                                        >
                                            {/* Preview Header */}
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: localSettings.colorPrimario }}
                                                >
                                                    <Sparkles className="h-4 w-4" style={{ color: getContrastColor(localSettings.colorPrimario) }} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold">Tu Empresa</p>
                                                    <p className="text-[10px] text-muted-foreground">Dashboard</p>
                                                </div>
                                            </div>

                                            {/* Preview Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-90"
                                                    style={{
                                                        backgroundColor: localSettings.colorPrimario,
                                                        color: getContrastColor(localSettings.colorPrimario)
                                                    }}
                                                >
                                                    Botón Primario
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-md text-xs font-medium border transition-opacity hover:opacity-90"
                                                    style={{
                                                        backgroundColor: localSettings.colorSecundario,
                                                        color: getContrastColor(localSettings.colorSecundario),
                                                        borderColor: localSettings.colorPrimario + '40'
                                                    }}
                                                >
                                                    Secundario
                                                </button>
                                            </div>

                                            {/* Preview Progress */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Progreso</span>
                                                    <span className="font-medium">75%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: '75%',
                                                            backgroundColor: localSettings.colorPrimario
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Preview Card */}
                                            <div
                                                className="rounded-md p-2 border"
                                                style={{ borderColor: localSettings.colorPrimario + '30' }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                        style={{
                                                            backgroundColor: localSettings.colorPrimario + '20',
                                                            color: localSettings.colorPrimario
                                                        }}
                                                    >
                                                        JD
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-medium truncate">Proyecto Ejemplo</p>
                                                        <p className="text-[9px] text-muted-foreground">3 tareas pendientes</p>
                                                    </div>
                                                    <div
                                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                                                        style={{
                                                            backgroundColor: localSettings.colorPrimario + '20',
                                                            color: localSettings.colorPrimario
                                                        }}
                                                    >
                                                        Activo
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contexto para Magnus IA */}
                    <Card className="border-primary/20">
                        <CardHeader className="py-2 px-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">Contexto para Magnus IA</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Información que Magnus usará para dar respuestas más precisas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-3 pt-0 space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/10">
                                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                    Esta información ayuda a Magnus a entender mejor tu negocio para dar consejos más relevantes sobre mercado, competencia y estrategia.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="descripcionEmpresa" className="text-sm">Descripción de la Empresa</Label>
                                <Textarea
                                    id="descripcionEmpresa"
                                    value={localSettings.descripcionEmpresa}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, descripcionEmpresa: e.target.value }))}
                                    placeholder="Describe brevemente a qué se dedica tu empresa, industria, productos/servicios principales, clientes objetivo..."
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Industria, productos/servicios, mercado objetivo, diferenciadores
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 md:px-6">
                <div className="flex items-center justify-between">
                    {hasChanges && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Tienes cambios sin guardar</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 ${hasChanges ? '' : 'ml-auto'}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={!hasChanges || updateSettingsMutation.isPending}
                            className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Descartar
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={!hasChanges || updateSettingsMutation.isPending} className="gap-1.5">
                            {updateSettingsMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
