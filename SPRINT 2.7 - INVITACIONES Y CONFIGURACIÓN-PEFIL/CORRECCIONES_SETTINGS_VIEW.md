# 🔧 CORRECCIONES COMPLETAS - SETTINGS VIEW

**Fecha:** 29 de Octubre, 2025  
**Objetivo:** Corregir todos los errores y agregar campos faltantes del modelo Usuario

---

## 🐛 ERRORES IDENTIFICADOS

### **1. Campos del Perfil Incorrectos**
```typescript
// ❌ INCORRECTO (líneas 37-41)
const [profileData, setProfileData] = useState({
  nombre: user?.nombre || "",      // ❌ No existe en AuthUser
  apellido: user?.apellido || "",  // ❌ No existe en AuthUser
  biografia: user?.biografia || "",
})

// ✅ CORRECTO
const [profileData, setProfileData] = useState({
  nombreCompleto: user?.nombreCompleto || "",
  biografia: user?.biografia || "",
  fechaNacimiento: user?.fechaNacimiento || "",
  fechaIngreso: user?.fechaIngreso || "",
})
```

### **2. Botones Sin Funcionalidad**
```typescript
// ❌ INCORRECTO (líneas 338-343)
<Button variant="outline">Cancelar</Button>
<Button className="gap-2">
  <Save className="h-4 w-4" />
  Guardar cambios
</Button>

// ✅ CORRECTO
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
```

### **3. Switches Sin Conexión al Store**
```typescript
// ❌ INCORRECTO (líneas 356, 364, 372, 380, 388, 396)
<Switch defaultChecked />
<Switch />

// ✅ CORRECTO
<Switch
  checked={notifications.email}
  onCheckedChange={(checked) => updateNotifications({ email: checked })}
/>
<Switch
  checked={notifications.push}
  onCheckedChange={(checked) => updateNotifications({ push: checked })}
/>
// ... etc para todos los switches
```

### **4. Inputs de Contraseña Sin Estado**
```typescript
// ❌ INCORRECTO (líneas 417, 421, 425)
<Input id="currentPassword" type="password" />
<Input id="newPassword" type="password" />
<Input id="confirmPassword" type="password" />

// ✅ CORRECTO
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
```

### **5. Selects Sin Conexión al Store**
```typescript
// ❌ INCORRECTO (líneas 474, 488, 508, 538, 552)
<Select defaultValue="dark">

// ✅ CORRECTO
<Select
  value={preferences.theme}
  onValueChange={(value: any) => updatePreferences({ theme: value })}
>
```

### **6. Botones de Sistema Sin Handlers**
```typescript
// ❌ INCORRECTO (líneas 569-577)
<Button variant="outline" className="w-full justify-start bg-transparent">
  Descargar mis datos
</Button>
<Button variant="outline" className="w-full justify-start text-destructive">
  Eliminar mi cuenta
</Button>

// ✅ CORRECTO
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
```

### **7. Falta AlertDialog de Eliminación**
```typescript
// ✅ AGREGAR al final del componente (antes del cierre del div principal)
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
```

---

## 📋 CAMPOS FALTANTES DEL MODELO USUARIO

### **Campos Actuales en el Componente:**
- ✅ nombreCompleto
- ✅ email (solo lectura)
- ✅ rol (solo lectura)
- ✅ biografia
- ✅ avatarUrl

### **Campos Faltantes del Modelo:**
1. ❌ **fechaNacimiento** - Fecha de nacimiento
2. ❌ **fechaIngreso** - Fecha de ingreso a la empresa
3. ❌ **archivoCvId** - CV del usuario (PDF)
4. ❌ **puestoTrabajoId** - Puesto de trabajo (solo lectura)
5. ❌ **supervisorId** - Supervisor directo (solo lectura)
6. ❌ **puntajePerfilCompleto** - Progreso del perfil (solo lectura)

---

## ✅ CAMPOS A AGREGAR

### **1. Fecha de Nacimiento**
```typescript
<div className="space-y-2">
  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
  <Input
    id="fechaNacimiento"
    type="date"
    value={profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento).toISOString().split('T')[0] : ''}
    onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
  />
</div>
```

### **2. Fecha de Ingreso**
```typescript
<div className="space-y-2">
  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
  <Input
    id="fechaIngreso"
    type="date"
    value={profileData.fechaIngreso ? new Date(profileData.fechaIngreso).toISOString().split('T')[0] : ''}
    onChange={(e) => setProfileData({ ...profileData, fechaIngreso: e.target.value })}
  />
</div>
```

### **3. Curriculum Vitae (CV)**
```typescript
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

// En el JSX
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
        onClick={() => window.open(user.archivoCvId, '_blank')}
      >
        <Download className="h-4 w-4" />
        Ver CV actual
      </Button>
    )}
  </div>
  <p className="text-xs text-muted-foreground">PDF. Máximo 5MB.</p>
</div>
```

### **4. Información de Solo Lectura**
```typescript
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="puestoTrabajo">Puesto de Trabajo</Label>
    <Input
      id="puestoTrabajo"
      value={user?.puestoTrabajo?.nombre || "No asignado"}
      disabled
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="supervisor">Supervisor</Label>
    <Input
      id="supervisor"
      value={user?.supervisor?.nombreCompleto || "No asignado"}
      disabled
    />
  </div>
</div>

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
```

---

## 🎨 NUEVA ESTRUCTURA DEL TAB PERFIL

```typescript
<TabsContent value="profile" className="space-y-6">
  {/* Información Personal */}
  <div className="rounded-lg border border-border bg-card p-6">
    <h3 className="text-lg font-semibold text-foreground mb-4">Información Personal</h3>
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">...</div>

      {/* Nombre Completo */}
      <div className="space-y-2">
        <Label htmlFor="nombreCompleto">Nombre Completo</Label>
        <Input
          id="nombreCompleto"
          value={profileData.nombreCompleto}
          onChange={(e) => setProfileData({ ...profileData, nombreCompleto: e.target.value })}
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
              onClick={() => window.open(user.archivoCvId, '_blank')}
            >
              <Download className="h-4 w-4" />
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
```

---

## 📦 IMPORTS ADICIONALES NECESARIOS

```typescript
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileText } from "lucide-react"
```

---

## 🔧 ACTUALIZAR SETTINGSSERVICE

```typescript
// Agregar método uploadCv
async uploadCv(file: File): Promise<{ cvUrl: string }> {
  const formData = new FormData()
  formData.append('cv', file)
  
  const response = await api.post('/usuarios/cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}
```

---

## ✅ CHECKLIST DE CORRECCIONES

### **Errores Corregidos:**
- [x] Campos del perfil actualizados (nombreCompleto en lugar de nombre/apellido)
- [x] Botones conectados a handlers
- [x] Switches conectados al store
- [x] Inputs de contraseña con estado y toggle de visibilidad
- [x] Selects conectados al store
- [x] Botones de sistema con handlers
- [x] AlertDialog de eliminación agregado

### **Campos Agregados:**
- [x] fechaNacimiento
- [x] fechaIngreso
- [x] archivoCvId (upload de CV)
- [x] puestoTrabajo (solo lectura)
- [x] supervisor (solo lectura)
- [x] puntajePerfilCompleto (solo lectura con Progress)

### **Mejoras de UX:**
- [x] Estados de carga en todos los botones
- [x] Validaciones en todos los formularios
- [x] Feedback visual (toasts)
- [x] Confirmaciones para acciones destructivas
- [x] Progress bar para completitud del perfil
- [x] Textarea para biografía (en lugar de Input)
- [x] Botón para ver CV actual

---

## 🎯 RESULTADO ESPERADO

Un panel de configuración **100% funcional** que permite a los usuarios:

1. ✅ Actualizar toda su información personal
2. ✅ Subir/cambiar avatar y CV
3. ✅ Ver información de solo lectura (rol, puesto, supervisor)
4. ✅ Configurar notificaciones
5. ✅ Cambiar contraseña con validación
6. ✅ Gestionar sesiones activas
7. ✅ Personalizar apariencia
8. ✅ Configurar idioma y zona horaria
9. ✅ Descargar datos personales
10. ✅ Eliminar cuenta con confirmación

---

**Estado:** ✅ **LISTO PARA IMPLEMENTAR**  
**Tiempo estimado:** 1-2 horas  
**Prioridad:** ALTA

---

**Última actualización:** 29 de Octubre, 2025  
**Autor:** Eduardo Tanca
