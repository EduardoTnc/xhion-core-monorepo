import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  User, Bell, Shield, Palette, Globe, Save, Upload, Loader2, 
  Eye, EyeOff, Download, Trash2, LogOut, Smartphone, Monitor, FileText
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import { useTheme } from "@/components/providers/ThemeProvider"
import { settingsService } from "@/services/settingsService"
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

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("profile")
  const { user, setUser } = useAuthStore()
  const { preferences, notifications, updatePreferences, updateNotifications } = useSettingsStore()
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados del formulario de perfil
  const [profileData, setProfileData] = useState({
    nombreCompleto: user?.nombreCompleto || "",
    biografia: user?.biografia || "",
    fechaNacimiento: user?.fechaNacimiento || "",
    fechaIngreso: user?.fechaIngreso || "",
  })
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const cvInputRef = useRef<HTMLInputElement>(null)

  // Estados de contraseña
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

  // Estados de sesiones
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  // Estados de eliminación de cuenta
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  // Cargar sesiones al abrir la pestaña de seguridad
  useEffect(() => {
    if (activeTab === "security") {
      loadSessions()
    }
  }, [activeTab])

  const loadSessions = async () => {
    setIsLoadingSessions(true)
    try {
      const sessionsData = await settingsService.getSessions()
      setSessions(sessionsData)
    } catch (error) {
      console.error("Error al cargar sesiones:", error)
      toast.error("Error al cargar las sesiones activas")
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // ========== PERFIL ==========

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 2MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen")
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
      const updatedUser = await settingsService.updateProfile(profileData)
      setUser(updatedUser)
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
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
      toast.success("Contraseña cambiada correctamente")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error)
      toast.error(error.response?.data?.message || "Error al cambiar la contraseña")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await settingsService.terminateSession(sessionId)
      toast.success("Sesión cerrada correctamente")
      loadSessions()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar la sesión")
    }
  }

  const handleSaveNotifications = async () => {
    try {
      await settingsService.updateNotificationSettings(notifications)
      toast.success("Preferencias de notificaciones guardadas")
    } catch (error) {
      console.error("Error al guardar notificaciones:", error)
      toast.error("Error al guardar las preferencias")
    }
  }

  const handleSaveAppearance = async () => {
    try {
      await settingsService.updatePreferences(preferences)
      // Aplicar tema si no es 'system'
      if (preferences.theme === 'light' || preferences.theme === 'dark') {
        setTheme(preferences.theme)
      } else if (preferences.theme === 'system') {
        // Detectar preferencia del sistema
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setTheme(systemTheme)
      }
      toast.success("Preferencias de apariencia guardadas")
    } catch (error) {
      console.error("Error al guardar apariencia:", error)
      toast.error("Error al guardar las preferencias")
    }
  }

  const handleSaveSystem = async () => {
    try {
      await settingsService.updatePreferences(preferences)
      toast.success("Configuración del sistema guardada")
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast.error("Error al guardar la configuración")
    }
  }

  const handleDownloadData = async () => {
    try {
      const blob = await settingsService.downloadUserData()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `xhion-datos-${user?.email}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Datos descargados correctamente")
    } catch (error) {
      console.error("Error al descargar datos:", error)
      toast.error("Error al descargar los datos")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Debes ingresar tu contraseña")
      return
    }

    try {
      await settingsService.deleteAccount(deletePassword)
      toast.success("Cuenta eliminada correctamente")
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error)
      toast.error(error.response?.data?.message || "Error al eliminar la cuenta")
    } finally {
      setShowDeleteDialog(false)
      setDeletePassword("")
    }
  }

  const handleCvChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El CV no debe superar los 5MB")
      return
    }

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF")
      return
    }

    try {
      const { cvUrl } = await settingsService.uploadCv(file)
      setUser({ ...user!, archivoCvId: cvUrl })
      toast.success("CV actualizado correctamente")
    } catch (error) {
      console.error("Error al subir CV:", error)
      toast.error("Error al actualizar el CV")
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tu cuenta y preferencias del sistema</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Globe className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Información Personal */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Información Personal</h3>
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.nombreCompleto} />
                    <AvatarFallback className="text-lg">
                      {user?.nombreCompleto?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Cambiar foto
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máximo 2MB.</p>
                  </div>
                </div>

                {/* Nombre Completo */}
                <div className="space-y-2">
                  <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                  <Input
                    id="nombreCompleto"
                    value={profileData.nombreCompleto}
                    onChange={(e) => setProfileData({ ...profileData, nombreCompleto: e.target.value })}
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                {/* Email (solo lectura) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={user?.email} disabled />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento).toISOString().split('T')[0] : ''}
                      onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                    <Input
                      id="fechaIngreso"
                      type="date"
                      value={profileData.fechaIngreso ? new Date(profileData.fechaIngreso).toISOString().split('T')[0] : ''}
                      onChange={(e) => setProfileData({ ...profileData, fechaIngreso: e.target.value })}
                    />
                  </div>
                </div>

                {/* Biografía */}
                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía</Label>
                  <Textarea
                    id="biografia"
                    value={profileData.biografia}
                    onChange={(e) => setProfileData({ ...profileData, biografia: e.target.value })}
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Información Profesional</h3>
              <div className="space-y-6">
                {/* CV */}
                <div className="space-y-2">
                  <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCvChange}
                    />
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => cvInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {user?.archivoCvId ? "Cambiar CV" : "Subir CV"}
                    </Button>
                    {user?.archivoCvId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(user.archivoCvId!, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                        Ver CV actual
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">PDF. Máximo 5MB.</p>
                </div>

                {/* Información de Solo Lectura */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Input id="rol" value={user?.rol || "Usuario"} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puestoTrabajo">Puesto de Trabajo</Label>
                    <Input
                      id="puestoTrabajo"
                      value={user?.puestoTrabajo?.nombre || "No asignado"}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor Directo</Label>
                  <Input
                    id="supervisor"
                    value={user?.supervisor?.nombreCompleto || "No asignado"}
                    disabled
                  />
                </div>

                {/* Progreso del Perfil */}
                <div className="space-y-2">
                  <Label htmlFor="perfilCompleto">Progreso del Perfil</Label>
                  <div className="flex items-center gap-3">
                    <Progress value={user?.puntajePerfilCompleto || 0} className="flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {user?.puntajePerfilCompleto || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completa tu perfil para desbloquear más funcionalidades
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setProfileData({
                  nombreCompleto: user?.nombreCompleto || "",
                  biografia: user?.biografia || "",
                  fechaNacimiento: user?.fechaNacimiento || "",
                  fechaIngreso: user?.fechaIngreso || "",
                })}
              >
                Cancelar
              </Button>
              <Button
                className="gap-2"
                onClick={handleSaveProfile}
                disabled={isProfileLoading}
              >
                {isProfileLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Preferencias de Notificaciones</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificaciones por email</p>
                    <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo electrónico</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => updateNotifications({ email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificaciones push</p>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones en el navegador</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => updateNotifications({ push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Tareas asignadas</p>
                    <p className="text-sm text-muted-foreground">Cuando te asignan una nueva tarea</p>
                  </div>
                  <Switch
                    checked={notifications.taskAssigned}
                    onCheckedChange={(checked) => updateNotifications({ taskAssigned: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Menciones</p>
                    <p className="text-sm text-muted-foreground">Cuando alguien te menciona en un comentario</p>
                  </div>
                  <Switch
                    checked={notifications.mentions}
                    onCheckedChange={(checked) => updateNotifications({ mentions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Actualizaciones de proyectos</p>
                    <p className="text-sm text-muted-foreground">Cambios importantes en tus proyectos</p>
                  </div>
                  <Switch
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => updateNotifications({ projectUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Resumen diario</p>
                    <p className="text-sm text-muted-foreground">Recibe un resumen de actividad cada día</p>
                  </div>
                  <Switch
                    checked={notifications.dailySummary}
                    onCheckedChange={(checked) => updateNotifications({ dailySummary: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => updateNotifications({
                email: true,
                push: true,
                taskAssigned: true,
                mentions: true,
                projectUpdates: false,
                dailySummary: false,
              })}>
                Restablecer
              </Button>
              <Button className="gap-2" onClick={handleSaveNotifications}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cambiar Contraseña</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleChangePassword}
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Cambiar contraseña
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Autenticación de Dos Factores</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Habilitar 2FA</p>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Switch disabled />
                </div>
                <p className="text-xs text-muted-foreground">La autenticación de dos factores estará disponible próximamente</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sesiones Activas</h3>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No hay sesiones activas</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-3">
                        {session.userAgent?.includes("Mobile") ? (
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {session.userAgent || "Navegador desconocido"}
                            {session.isCurrentSession && (
                              <span className="ml-2 text-xs text-primary">(Sesión actual)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.ip} · {new Date(session.lastActivity).toLocaleString("es-MX")}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrentSession && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleTerminateSession(session.id)}
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
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tema</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Modo de color</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: any) => updatePreferences({ theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Color de acento</Label>
                  <Select
                    value={preferences.accentColor}
                    onValueChange={(value: any) => updatePreferences({ accentColor: value })}
                  >
                    <SelectTrigger id="accentColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Violeta</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="orange">Naranja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Densidad</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="density">Densidad de interfaz</Label>
                  <Select
                    value={preferences.density}
                    onValueChange={(value: any) => updatePreferences({ density: value })}
                  >
                    <SelectTrigger id="density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compacta</SelectItem>
                      <SelectItem value="comfortable">Cómoda</SelectItem>
                      <SelectItem value="spacious">Espaciosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => updatePreferences({
                theme: 'system',
                accentColor: 'blue',
                density: 'comfortable',
              })}>
                Restablecer
              </Button>
              <Button className="gap-2" onClick={handleSaveAppearance}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Idioma y Región</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value: any) => updatePreferences({ language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value: any) => updatePreferences({ timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">América/Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">América/Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Europa/Madrid (GMT+1)</SelectItem>
                      <SelectItem value="America/Los_Angeles">América/Los Ángeles (GMT-8)</SelectItem>
                      <SelectItem value="America/Bogota">América/Bogotá (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Datos y Privacidad</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  onClick={handleDownloadData}
                >
                  <Download className="h-4 w-4" />
                  Descargar mis datos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar mi cuenta
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => updatePreferences({
                language: 'es',
                timezone: 'America/Mexico_City',
              })}>
                Restablecer
              </Button>
              <Button className="gap-2" onClick={handleSaveSystem}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AlertDialog de Eliminación de Cuenta */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta
              y todos tus datos del sistema.
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
              Eliminar cuenta permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
