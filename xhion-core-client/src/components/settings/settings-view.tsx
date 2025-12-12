import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerSingle } from "@/components/ui/date-picker-single"
import { Badge } from "@/components/ui/badge"
import {
  User, Bell, Shield, Globe, Save, Upload, Loader2,
  Eye, EyeOff, Download, Trash2, LogOut, Smartphone, Monitor, FileText,
  RotateCcw, AlertCircle, Briefcase, Key, Mail, Calendar,
  Clock, CheckCircle2, File, X, Sparkles, Phone
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import { settingsService } from "@/services/settingsService"
// TanStack Query hooks for data fetching
import { useUserSessions, useProfessionalProfile, useTerminateSession } from "@/hooks/queries"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProfileWizard, type ProfileWizardData } from "./ProfileWizard"
import { ProfessionalProfileSection, type ProfessionalProfileData } from "./ProfessionalProfileSection"
import { ContactInfoSection } from "./ContactInfoSection"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { PageHeader, type PageHeaderTab } from "@/components/layout/PageHeader"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Navigation sections with descriptions
const SECTIONS = [
  {
    id: "account",
    label: "Cuenta e Información",
    icon: User,
    description: "Datos personales, email y contraseña"
  },
  {
    id: "contact",
    label: "Información de Contacto",
    icon: Phone,
    description: "Teléfonos, email personal y enlaces profesionales"
  },
  {
    id: "professional",
    label: "Perfil Profesional",
    icon: Briefcase,
    description: "Experiencia, habilidades y disponibilidad"
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Bell,
    description: "Preferencias de alertas y avisos"
  },
  {
    id: "security",
    label: "Seguridad",
    icon: Shield,
    description: "Sesiones activas y autenticación"
  },
  {
    id: "data",
    label: "Datos y Privacidad",
    icon: Globe,
    description: "Exportar datos y gestionar cuenta"
  },
]

export function SettingsView() {
  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState("account")
  const { user, setUser } = useAuthStore()
  const { notifications, updateNotifications } = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // ==================== TanStack Query Hooks (data fetching only) ====================
  const { data: sessionsData = [], isLoading: isLoadingSessionsQuery, refetch: refetchSessions } = useUserSessions()
  const { data: professionalProfileData } = useProfessionalProfile()
  const terminateSessionMutation = useTerminateSession()

  // Profile form states
  const [profileData, setProfileData] = useState({
    nombreCompleto: user?.nombreCompleto || "",
    biografia: user?.biografia || "",
    fechaNacimiento: user?.fechaNacimiento || "",
    fechaIngreso: user?.fechaIngreso || "",
  })
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showProfileWizard, setShowProfileWizard] = useState(false)

  // Password states - inline form
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // CV states
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isDraggingCv, setIsDraggingCv] = useState(false)
  const [isUploadingCv, setIsUploadingCv] = useState(false)

  // Session states (now using TanStack Query data)
  const sessions = sessionsData
  const isLoadingSessions = isLoadingSessionsQuery
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null)

  // Delete account states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  // Original notification state for tracking changes
  const [originalNotifications, setOriginalNotifications] = useState(() => ({ ...notifications }))

  // Professional profile state for tracking changes
  const [professionalData, setProfessionalData] = useState<ProfessionalProfileData | null>(null)
  const [originalProfessionalData, setOriginalProfessionalData] = useState<ProfessionalProfileData | null>(null)

  // Sync professional profile from TanStack Query
  useEffect(() => {
    if (professionalProfileData) {
      setProfessionalData(professionalProfileData)
      setOriginalProfessionalData(professionalProfileData)
    }
  }, [professionalProfileData])

  // Detect profile changes
  const hasProfileChanges = useMemo(() => {
    if (!user) return false
    return (
      profileData.nombreCompleto !== (user.nombreCompleto || "") ||
      profileData.biografia !== (user.biografia || "") ||
      profileData.fechaNacimiento !== (user.fechaNacimiento || "") ||
      profileData.fechaIngreso !== (user.fechaIngreso || "")
    )
  }, [profileData, user])

  // Detect notification changes
  const hasNotificationChanges = useMemo(() => {
    return (
      notifications.email !== originalNotifications.email ||
      notifications.push !== originalNotifications.push ||
      notifications.taskAssigned !== originalNotifications.taskAssigned ||
      notifications.mentions !== originalNotifications.mentions ||
      notifications.projectUpdates !== originalNotifications.projectUpdates ||
      notifications.dailySummary !== originalNotifications.dailySummary
    )
  }, [notifications, originalNotifications])

  // Detect professional profile changes
  const hasProfessionalChanges = useMemo(() => {
    if (!professionalData || !originalProfessionalData) return false
    return JSON.stringify(professionalData) !== JSON.stringify(originalProfessionalData)
  }, [professionalData, originalProfessionalData])

  // Combined check for any changes
  const hasAnyChanges = hasProfileChanges || hasNotificationChanges || hasProfessionalChanges

  const handleDiscardAllChanges = useCallback(() => {
    // Reset profile data
    setProfileData({
      nombreCompleto: user?.nombreCompleto || "",
      biografia: user?.biografia || "",
      fechaNacimiento: user?.fechaNacimiento || "",
      fechaIngreso: user?.fechaIngreso || "",
    })
    // Reset notifications to original
    updateNotifications({ ...originalNotifications })
    // Reset professional data to original
    if (originalProfessionalData) {
      setProfessionalData({ ...originalProfessionalData })
    }
    setShowDiscardDialog(false)
    toast.info("Cambios descartados")
  }, [user, originalNotifications, originalProfessionalData, updateNotifications])

  useEffect(() => {
    // Load professional profile
    const loadProfessionalProfile = async () => {
      try {
        const data = await settingsService.getProfessionalProfile()
        setProfessionalData(data)
        setOriginalProfessionalData(data)
      } catch (error) {
        console.error("Error loading professional profile:", error)
      }
    }
    loadProfessionalProfile()
  }, [])

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = sectionRefs.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Track visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Sessions are now loaded automatically by TanStack Query
  // loadSessions is no longer needed - data comes from useUserSessions()

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB")
      return
    }

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o GIF")
      return
    }

    try {
      const { avatarUrl } = await settingsService.uploadAvatar(file)
      setUser({ ...user!, avatarUrl })
      toast.success("Avatar actualizado correctamente")
    } catch (error) {
      console.error("Error al subir avatar:", error)
      toast.error("Error al actualizar el avatar")
    }
  }

  const handleSaveProfile = async () => {
    setIsProfileLoading(true)
    try {
      const updatedUser = await settingsService.updateProfile({
        nombreCompleto: profileData.nombreCompleto,
        biografia: profileData.biografia,
        fechaNacimiento: profileData.fechaNacimiento || undefined,
        fechaIngreso: profileData.fechaIngreso || undefined,
      })

      setUser({
        ...user!,
        nombreCompleto: updatedUser.nombreCompleto,
        biografia: updatedUser.biografia,
        fechaNacimiento: updatedUser.fechaNacimiento,
        fechaIngreso: updatedUser.fechaIngreso,
      })
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error al guardar perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsPasswordLoading(true)
    try {
      await settingsService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordForm(false)
      toast.success("Contraseña actualizada correctamente")
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error al cambiar la contraseña")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSessionMutation.mutateAsync(sessionId)
      // Data is automatically refetched by TanStack Query invalidation
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Error toast handled by mutation
    } finally {
      setSessionToTerminate(null)
    }
  }



  // Unified save all changes
  const handleSaveAllChanges = async () => {
    setIsProfileLoading(true)
    try {
      // Save profile if changed
      if (hasProfileChanges) {
        const updatedUser = await settingsService.updateProfile({
          nombreCompleto: profileData.nombreCompleto,
          biografia: profileData.biografia,
          fechaNacimiento: profileData.fechaNacimiento || undefined,
          fechaIngreso: profileData.fechaIngreso || undefined,
        })
        setUser({
          ...user!,
          nombreCompleto: updatedUser.nombreCompleto,
          biografia: updatedUser.biografia,
          fechaNacimiento: updatedUser.fechaNacimiento,
          fechaIngreso: updatedUser.fechaIngreso,
        })
      }

      // Save notifications if changed
      if (hasNotificationChanges) {
        await settingsService.updateNotificationSettings(notifications)
        setOriginalNotifications({ ...notifications })
      }

      // Save professional profile if changed
      if (hasProfessionalChanges && professionalData) {
        await settingsService.updateProfessionalProfile(professionalData)
        setOriginalProfessionalData({ ...professionalData })
      }

      toast.success("Cambios guardados correctamente")
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast.error("Error al guardar los cambios")
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleDownloadData = async () => {
    try {
      const blob = await settingsService.downloadUserData()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mis-datos-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Datos descargados correctamente")
    } catch (error) {
      console.error("Error al descargar datos:", error)
      toast.error("Error al descargar los datos")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Ingresa tu contraseña para confirmar")
      return
    }
    try {
      await settingsService.deleteAccount(deletePassword)
      toast.success("Cuenta eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar cuenta:", error)
      toast.error("Error al eliminar la cuenta")
    }
  }

  // CV Drag & Drop handlers
  const handleCvDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingCv(true)
  }

  const handleCvDragLeave = () => {
    setIsDraggingCv(false)
  }

  const handleCvDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingCv(false)
    const file = e.dataTransfer.files[0]
    if (file) await uploadCv(file)
  }

  const handleCvChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await uploadCv(file)
  }

  const uploadCv = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El CV no puede superar 5MB")
      return
    }

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF")
      return
    }

    setIsUploadingCv(true)
    setCvFile(file)

    try {
      const { cvUrl } = await settingsService.uploadCv(file)
      setUser({ ...user!, archivoCvId: cvUrl })
      toast.success("CV actualizado correctamente")
    } catch (error) {
      console.error("Error al subir CV:", error)
      toast.error("Error al actualizar el CV")
      setCvFile(null)
    } finally {
      setIsUploadingCv(false)
    }
  }

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "No especificado"
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  // Get user role display
  const getUserRole = () => {
    // user.rol is already the role name string
    return user?.rol || "Usuario"
  }

  // Get account age (member since)
  const getAccountAge = () => {
    // Use fechaIngreso for member since calculation
    if (!user?.fechaIngreso) return "Desconocido"
    const joinDate = new Date(user.fechaIngreso)
    const now = new Date()
    const diffMs = now.getTime() - joinDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return diffDays <= 1 ? "Hoy" : `${diffDays} días`
    }
    const months = Math.floor(diffDays / 30)
    if (months < 12) {
      return months === 1 ? "1 mes" : `${months} meses`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
      return years === 1 ? "1 año" : `${years} años`
    }
    return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
  }

  // Convert SECTIONS to PageHeaderTabs
  const headerTabs: PageHeaderTab[] = SECTIONS.map(section => ({
    id: section.id,
    label: section.label,
    icon: section.icon,
  }))

  return (
    <div className="flex h-full flex-col">
      {/* Professional Page Header */}
      <PageHeader
        icon={User}
        title="Configuración de Cuenta"
        subtitle="Gestiona tu cuenta, seguridad y preferencias"
        tabs={headerTabs}
        activeTab={activeSection}
        onTabChange={scrollToSection}
      />

      {/* Scrollable Content - Full width now */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 pb-24 space-y-6 max-w-4xl mx-auto">

          {/* Section: Account & Personal Information */}
          <section
            id="account"
            ref={(el) => { sectionRefs.current.account = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Cuenta e Información Personal</h2>
                <p className="text-xs text-muted-foreground">Gestiona tu perfil y credenciales de acceso</p>
              </div>
            </div>

            {/* Avatar & Basic Info Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              {/* Avatar Section */}
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.nombreCompleto} />
                    <AvatarFallback className="text-xl">
                      {user?.nombreCompleto?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold">{user?.nombreCompleto || "Sin nombre"}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{getUserRole()}</Badge>
                    <span className="text-xs text-muted-foreground">• Miembro desde hace {getAccountAge()}</span>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Editable Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombreCompleto" className="text-xs font-medium">Nombre Completo</Label>
                    <Input
                      id="nombreCompleto"
                      value={profileData.nombreCompleto}
                      onChange={(e) => setProfileData({ ...profileData, nombreCompleto: e.target.value })}
                      placeholder="Tu nombre completo"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Correo Electrónico</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="h-9 pr-8"
                      />
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Email verificado</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="biografia" className="text-xs font-medium">Biografía</Label>
                  <Textarea
                    id="biografia"
                    value={profileData.biografia}
                    onChange={(e) => setProfileData({ ...profileData, biografia: e.target.value })}
                    placeholder="Cuéntanos sobre ti, tu experiencia y lo que te apasiona..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground">{(profileData.biografia || "").length}/500 caracteres</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Fecha de Nacimiento
                    </Label>
                    <DatePickerSingle
                      date={profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento) : undefined}
                      onSelect={(date) => setProfileData({ ...profileData, fechaNacimiento: date?.toISOString() || "" })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Fecha de Ingreso a la Empresa
                    </Label>
                    <DatePickerSingle
                      date={profileData.fechaIngreso ? new Date(profileData.fechaIngreso) : undefined}
                      onSelect={(date) => setProfileData({ ...profileData, fechaIngreso: date?.toISOString() || "" })}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* CV Upload - Enhanced Dropzone */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  Currículum Vitae
                </Label>

                <div
                  onDragOver={handleCvDragOver}
                  onDragLeave={handleCvDragLeave}
                  onDrop={handleCvDrop}
                  className={cn(
                    "relative rounded-lg border-2 border-dashed transition-all p-4",
                    isDraggingCv
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    user?.archivoCvId && "bg-muted/30"
                  )}
                >
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleCvChange}
                  />

                  {user?.archivoCvId ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">curriculum_vitae.pdf</p>
                        <p className="text-xs text-muted-foreground">Subido • PDF</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => window.open(user.archivoCvId!, '_blank')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => cvInputRef.current?.click()}
                          disabled={isUploadingCv}
                        >
                          {isUploadingCv ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center gap-2 py-4 cursor-pointer"
                      onClick={() => cvInputRef.current?.click()}
                    >
                      {isUploadingCv ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="p-3 rounded-full bg-muted">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {isDraggingCv ? "Suelta el archivo aquí" : "Arrastra tu CV o haz clic para seleccionar"}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF • Máximo 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              {/* Password Section - Inline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Contraseña</p>
                      <p className="text-xs text-muted-foreground">Última actualización: hace 3 meses</p>
                    </div>
                  </div>
                  <Button
                    variant={showPasswordForm ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? (
                      <>
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Key className="h-3.5 w-3.5" />
                        Cambiar contraseña
                      </>
                    )}
                  </Button>
                </div>

                {/* Inline Password Form */}
                <Collapsible open={showPasswordForm}>
                  <CollapsibleContent>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3 mt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword" className="text-xs">Contraseña actual</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="h-9 pr-10"
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="newPassword" className="text-xs">Nueva contraseña</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="h-9 pr-10"
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-9 w-9"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="confirmPassword" className="text-xs">Confirmar contraseña</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="h-9 pr-10"
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-9 w-9"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Password requirements */}
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          passwordData.newPassword.length >= 8 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}>
                          8+ caracteres
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          /[A-Z]/.test(passwordData.newPassword) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}>
                          1 mayúscula
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          /[0-9]/.test(passwordData.newPassword) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}>
                          1 número
                        </span>
                      </div>

                      <Button
                        className="w-full gap-2"
                        onClick={handleChangePassword}
                        disabled={isPasswordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                      >
                        {isPasswordLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        Actualizar contraseña
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </section>

          {/* Section: Contact Information */}
          <section
            id="contact"
            ref={(el) => { sectionRefs.current.contact = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Información de Contacto</h2>
                <p className="text-xs text-muted-foreground">Teléfonos, email personal y enlaces profesionales</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <ContactInfoSection />
            </div>
          </section>

          {/* Section: Professional Profile */}
          <section
            id="professional"
            ref={(el) => { sectionRefs.current.professional = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Perfil Profesional</h2>
                  <p className="text-xs text-muted-foreground">Experiencia, habilidades y disponibilidad para proyectos</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileWizard(true)}
                className="gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Llenado Guiado</span>
              </Button>
            </div>
            <ProfessionalProfileSection
              initialData={originalProfessionalData || undefined}
              onSave={(data) => {
                // First change: set original if not set
                if (!originalProfessionalData) {
                  setOriginalProfessionalData({ ...data })
                }
                // Always update current data
                setProfessionalData(data)
              }}
            />
          </section>

          {/* Section: Notifications */}
          <section
            id="notifications"
            ref={(el) => { sectionRefs.current.notifications = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Notificaciones</h2>
                <p className="text-xs text-muted-foreground">Configura cómo y cuándo recibir alertas</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {[
                { key: "email", title: "Notificaciones por email", desc: "Recibe actualizaciones en tu correo electrónico", icon: Mail },
                { key: "push", title: "Notificaciones push", desc: "Alertas en tiempo real en el navegador", icon: Bell },
                { key: "taskAssigned", title: "Tareas asignadas", desc: "Cuando te asignan una nueva tarea", icon: CheckCircle2 },
                { key: "mentions", title: "Menciones", desc: "Cuando alguien te menciona en un comentario", icon: User },
                { key: "projectUpdates", title: "Actualizaciones de proyectos", desc: "Cambios importantes en tus proyectos", icon: Briefcase },
                { key: "dailySummary", title: "Resumen diario", desc: "Recibe un resumen cada mañana", icon: Calendar },
              ].map(({ key, title, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(checked) => updateNotifications({ [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section: Security (without password - moved to account) */}
          <section
            id="security"
            ref={(el) => { sectionRefs.current.security = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Seguridad</h2>
                <p className="text-xs text-muted-foreground">Autenticación y dispositivos conectados</p>
              </div>
            </div>

            {/* 2FA */}
            <div className="rounded-xl border border-border bg-card p-5 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Autenticación de Dos Factores</p>
                    <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Próximamente</Badge>
                  <Switch disabled />
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-medium mb-4">Sesiones Activas</h3>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No hay sesiones activas</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3",
                        session.isCurrentSession ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn("p-2 rounded-lg", session.isCurrentSession ? "bg-primary/20" : "bg-muted")}>
                          {session.userAgent?.includes("Mobile") ? (
                            <Smartphone className={cn("h-4 w-4", session.isCurrentSession ? "text-primary" : "text-muted-foreground")} />
                          ) : (
                            <Monitor className={cn("h-4 w-4", session.isCurrentSession ? "text-primary" : "text-muted-foreground")} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {session.isCurrentSession && (
                            <Badge className="mb-1 text-[10px] h-4">Esta sesión</Badge>
                          )}
                          <p className="text-xs font-medium truncate">{session.userAgent || "Navegador"}</p>
                          <p className="text-[10px] text-muted-foreground">IP: {session.ip}</p>
                        </div>
                      </div>
                      {!session.isCurrentSession && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs h-7 text-destructive hover:text-destructive"
                          onClick={() => setSessionToTerminate(session.id)}
                        >
                          <LogOut className="h-3 w-3" />
                          Cerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section: Data & Privacy */}
          <section
            id="data"
            ref={(el) => { sectionRefs.current.data = el }}
            className="scroll-mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Datos y Privacidad</h2>
                <p className="text-xs text-muted-foreground">Exporta tus datos o elimina tu cuenta</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <button
                onClick={handleDownloadData}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Descargar mis datos</p>
                  <p className="text-xs text-muted-foreground">Exporta toda tu información en formato JSON</p>
                </div>
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-destructive/30 hover:bg-destructive/5 transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Eliminar mi cuenta</p>
                  <p className="text-xs text-muted-foreground">Esta acción es permanente e irreversible</p>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Footer - Save/Discard */}
      <div className={
        cn(
          "border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 md:px-6 flex-shrink-0 transition-all duration-300",
          hasAnyChanges
            ? "opacity-100"
            : "hidden"
        )
      }>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Tienes cambios sin guardar</span>
            <span className="sm:hidden">Cambios pendientes</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiscardDialog(true)}
              disabled={isProfileLoading}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Descartar</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAllChanges}
              disabled={isProfileLoading}
              className="gap-1.5"
            >
              {isProfileLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Guardar cambios</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Wizard Dialog */}
      <Dialog open={showProfileWizard} onOpenChange={setShowProfileWizard}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <ProfileWizard
            onComplete={(data: ProfileWizardData) => {
              console.log("Profile wizard completed:", data)
              setShowProfileWizard(false)
              toast.success("¡Perfil profesional actualizado!")
            }}
            onCancel={() => setShowProfileWizard(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="deletePassword">Confirma tu contraseña</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!sessionToTerminate} onOpenChange={(open) => !open && setSessionToTerminate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar esta sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              El dispositivo será desconectado y deberá iniciar sesión nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToTerminate && handleTerminateSession(sessionToTerminate)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si continúas, perderás todos los cambios realizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir editando</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardAllChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
