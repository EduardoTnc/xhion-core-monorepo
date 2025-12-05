import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Save, Upload, Loader2, Building2, Palette, Image as ImageIcon, MapPin, Bot, Sparkles
} from "lucide-react"
import { toast } from "sonner"

import { useSystemSettingsStore } from "@/store/systemSettingsStore"
import { systemSettingsService } from "@/services/systemSettingsService"
import { useEffect } from "react"

export function SystemSettingsView() {
    const { settings, isLoading, updateSettings, fetchSettings } = useSystemSettingsStore()
    const logoInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    const [localSettings, setLocalSettings] = useState({
        nombreEmpresa: "",
        logoUrl: "",
        faviconUrl: "",
        colorPrimario: "#FFBF00",
        colorSecundario: "#1a1a2e",
        ubicacion: "",
        descripcionEmpresa: "",
    })

    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

    // Helper para construir URLs completas de imágenes
    const getFullUrl = (url: string | null | undefined): string => {
        if (!url) return ""
        if (url.startsWith('http') || url.startsWith('data:')) return url
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        return `${baseUrl}${url}`
    }

    // Cargar settings del store al estado local
    useEffect(() => {
        if (settings) {
            setLocalSettings({
                nombreEmpresa: settings.nombreEmpresa,
                logoUrl: settings.logoUrl || "",
                faviconUrl: settings.faviconUrl || "",
                colorPrimario: settings.colorPrimario,
                colorSecundario: settings.colorSecundario,
                ubicacion: (settings as any).ubicacion || "",
                descripcionEmpresa: (settings as any).descripcionEmpresa || "",
            })
            // Limpiar previews cuando se cargan settings del servidor
            setLogoPreview(null)
            setFaviconPreview(null)
        } else {
            fetchSettings()
        }
    }, [settings, fetchSettings])

    const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error("El logo no debe superar los 2MB")
            return
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Solo se permiten archivos de imagen")
            return
        }

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setLogoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Subir al servidor
        try {
            const { url } = await systemSettingsService.uploadFile(file, 'company')
            setLocalSettings(prev => ({ ...prev, logoUrl: url }))
            toast.success("Logo subido correctamente")
        } catch (error) {
            console.error("Error al subir logo:", error)
            toast.error("Error al subir el logo")
        }
    }

    const handleFaviconChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.size > 512 * 1024) {
            toast.error("El favicon no debe superar los 512KB")
            return
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Solo se permiten archivos de imagen")
            return
        }

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setFaviconPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Subir al servidor
        try {
            const { url } = await systemSettingsService.uploadFile(file, 'company')
            setLocalSettings(prev => ({ ...prev, faviconUrl: url }))
            toast.success("Favicon subido correctamente")
        } catch (error) {
            console.error("Error al subir favicon:", error)
            toast.error("Error al subir el favicon")
        }
    }

    const handleSave = async () => {
        try {
            await updateSettings({
                nombreEmpresa: localSettings.nombreEmpresa,
                logoUrl: localSettings.logoUrl,
                faviconUrl: localSettings.faviconUrl,
                colorPrimario: localSettings.colorPrimario,
                colorSecundario: localSettings.colorSecundario,
                ubicacion: localSettings.ubicacion,
                descripcionEmpresa: localSettings.descripcionEmpresa,
            })
        } catch (error) {
            console.error("Error al guardar:", error)
        }
    }


    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Configuración del Sistema</h1>
                        <p className="text-sm text-muted-foreground">Gestiona la información y branding de la empresa</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Información General */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        Información de la Empresa
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                            <Input
                                id="nombreEmpresa"
                                value={localSettings.nombreEmpresa}
                                onChange={(e) => setLocalSettings({ ...localSettings, nombreEmpresa: e.target.value })}
                                placeholder="Ej: Mi Empresa S.A."
                            />
                            <p className="text-xs text-muted-foreground">
                                Este nombre se mostrará en el sidebar y en los reportes del sistema
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ubicacion" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Ubicación
                            </Label>
                            <Input
                                id="ubicacion"
                                value={localSettings.ubicacion}
                                onChange={(e) => setLocalSettings({ ...localSettings, ubicacion: e.target.value })}
                                placeholder="Ej: Lima, Perú"
                            />
                            <p className="text-xs text-muted-foreground">
                                Magnus AI usará esta información para análisis de mercado local
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contexto para Magnus AI */}
                <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        Contexto para Magnus AI
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA Estratégica
                        </span>
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="descripcionEmpresa">Descripción de la Empresa</Label>
                            <Textarea
                                id="descripcionEmpresa"
                                value={localSettings.descripcionEmpresa}
                                onChange={(e) => setLocalSettings({ ...localSettings, descripcionEmpresa: e.target.value })}
                                placeholder="Describe brevemente a qué se dedica tu empresa, qué productos o servicios ofrece, y cuál es tu mercado objetivo..."
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Esta descripción ayuda a Magnus AI a entender mejor tu negocio para darte recomendaciones estratégicas personalizadas, análisis de competencia y sugerencias de mejora.
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <p className="text-xs text-muted-foreground">
                                <strong className="text-foreground">💡 Tip:</strong> Mientras más detallada sea la descripción, mejores serán las sugerencias de Magnus.
                                Incluye información sobre: industria, productos/servicios, clientes objetivo, y diferenciadores clave.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Branding - Logo y Favicon */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        Logo y Favicon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo */}
                        <div className="space-y-4">
                            <Label>Logo de la Empresa</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                                    {logoPreview || localSettings.logoUrl ? (
                                        <img
                                            src={logoPreview || getFullUrl(localSettings.logoUrl)}
                                            alt="Logo"
                                            className="h-full w-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Subir Logo
                                    </Button>
                                    <p className="text-xs text-muted-foreground">PNG, JPG o SVG. Máx 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Favicon */}
                        <div className="space-y-4">
                            <Label>Favicon</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                                    {faviconPreview || localSettings.faviconUrl ? (
                                        <img
                                            src={faviconPreview || getFullUrl(localSettings.faviconUrl)}
                                            alt="Favicon"
                                            className="h-full w-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        ref={faviconInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFaviconChange}
                                    />
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => faviconInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Subir Favicon
                                    </Button>
                                    <p className="text-xs text-muted-foreground">ICO, PNG. Máx 512KB. Recomendado: 32x32px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colores Corporativos */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        Colores Corporativos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Color Primario */}
                        <div className="space-y-2">
                            <Label htmlFor="colorPrimario">Color Primario</Label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg border border-border cursor-pointer shadow-sm"
                                    style={{ backgroundColor: localSettings.colorPrimario }}
                                    onClick={() => document.getElementById("colorPrimarioInput")?.click()}
                                />
                                <input
                                    id="colorPrimarioInput"
                                    type="color"
                                    value={localSettings.colorPrimario}
                                    onChange={(e) => setLocalSettings({ ...localSettings, colorPrimario: e.target.value })}
                                    className="sr-only"
                                />
                                <Input
                                    id="colorPrimario"
                                    value={localSettings.colorPrimario}
                                    onChange={(e) => setLocalSettings({ ...localSettings, colorPrimario: e.target.value })}
                                    placeholder="#FFBF00"
                                    className="font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Color principal de la marca. Se usa en botones y acentos.
                            </p>
                        </div>

                        {/* Color Secundario */}
                        <div className="space-y-2">
                            <Label htmlFor="colorSecundario">Color Secundario</Label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg border border-border cursor-pointer shadow-sm"
                                    style={{ backgroundColor: localSettings.colorSecundario }}
                                    onClick={() => document.getElementById("colorSecundarioInput")?.click()}
                                />
                                <input
                                    id="colorSecundarioInput"
                                    type="color"
                                    value={localSettings.colorSecundario}
                                    onChange={(e) => setLocalSettings({ ...localSettings, colorSecundario: e.target.value })}
                                    className="sr-only"
                                />
                                <Input
                                    id="colorSecundario"
                                    value={localSettings.colorSecundario}
                                    onChange={(e) => setLocalSettings({ ...localSettings, colorSecundario: e.target.value })}
                                    placeholder="#1a1a2e"
                                    className="font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Color secundario. Se usa en fondos y elementos de contraste.
                            </p>
                        </div>
                    </div>

                    {/* Preview de Colores */}
                    <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
                        <p className="text-sm font-medium text-foreground mb-3">Vista Previa</p>
                        <div className="flex items-center gap-4">
                            <div
                                className="px-4 py-2 rounded-md text-sm font-medium"
                                style={{
                                    backgroundColor: localSettings.colorPrimario,
                                    color: '#000'
                                }}
                            >
                                Botón Primario
                            </div>
                            <div
                                className="px-4 py-2 rounded-md text-sm font-medium border"
                                style={{
                                    backgroundColor: localSettings.colorSecundario,
                                    color: '#fff',
                                    borderColor: localSettings.colorPrimario
                                }}
                            >
                                Botón Secundario
                            </div>
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: localSettings.colorPrimario }}
                            >
                                <Building2 className="h-5 w-5" style={{ color: localSettings.colorSecundario }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setLocalSettings({
                                nombreEmpresa: "Xhion Core",
                                logoUrl: "",
                                faviconUrl: "",
                                colorPrimario: "#FFBF00",
                                colorSecundario: "#1a1a2e",
                                ubicacion: "",
                                descripcionEmpresa: "",
                            })
                            setLogoPreview(null)
                            setFaviconPreview(null)
                        }}
                    >
                        Restablecer
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </div>
    )
}
