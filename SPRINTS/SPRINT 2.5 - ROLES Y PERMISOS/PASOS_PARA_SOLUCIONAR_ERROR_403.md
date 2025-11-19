# 🚀 PASOS RÁPIDOS PARA SOLUCIONAR ERROR 403

**Error:** `GET http://localhost:3000/api/v1/usuarios 403 (Forbidden)`  
**Tiempo:** ~5 minutos  
**Dificultad:** ⭐ Fácil

---

## 📋 PASOS A SEGUIR

### **1️⃣ Ejecutar Seed de Permisos**

Abre una terminal en la carpeta del backend:

```bash
cd xhion-core-api
pnpm prisma db seed
```

**Resultado esperado:**
```
🚀 Iniciando seed de XHION Core...
✅ Permisos procesados: 47
✅ 47 permisos asignados al Administrador
✅ Usuario Administrador creado
🎉 SEED COMPLETADO CON ÉXITO
```

---

### **2️⃣ Reiniciar Backend**

Detén el servidor backend (Ctrl+C) y vuelve a iniciarlo:

```bash
pnpm dev
```

---

### **3️⃣ Cerrar Sesión en Frontend**

En la aplicación web:
1. Click en tu avatar (esquina superior derecha)
2. Click en "Cerrar sesión"

---

### **4️⃣ Iniciar Sesión Nuevamente**

Inicia sesión con las credenciales:
- **Email:** `admin@xhion.com`
- **Password:** `Admin12345!`

---

### **5️⃣ Verificar Panel de Roles**

Ve a "Roles y Permisos" en el sidebar.

**Deberías ver:**
- ✅ 1 rol (Administrador)
- ✅ 1 usuario (Administrador XHION)
- ✅ Sin errores 403 en consola
- ✅ 47 permisos disponibles

---

## 🔍 VERIFICACIÓN OPCIONAL

Si quieres verificar el estado de la BD antes de ejecutar el seed:

```bash
cd xhion-core-api
npx ts-node scripts/verificar-permisos.ts
```

Esto te mostrará:
- Cuántos permisos hay en la BD
- Si el rol Administrador existe
- Cuántos permisos tiene asignados
- Si el usuario Administrador existe

---

## ❓ ¿POR QUÉ OCURRIÓ ESTE ERROR?

El sistema de permisos granulares está funcionando **correctamente**. El error 403 aparece porque:

1. ✅ El endpoint `/api/v1/usuarios` requiere el permiso `usuarios.ver`
2. ✅ El `PermissionsGuard` valida que el usuario tenga ese permiso
3. ❌ El rol Administrador **no tenía permisos asignados** todavía
4. ✅ El guard **bloquea correctamente** el acceso (seguridad funcionando)

**Solución:** Ejecutar el seed para asignar los 47 permisos al rol Administrador.

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, consulta:
- `SOLUCION_ERROR_403_PERMISOS.md` - Análisis técnico completo
- `SISTEMA_ROLES_PERMISOS_GRANULARES_IMPLEMENTADO.md` - Documentación del sistema

---

## 🎯 RESULTADO FINAL

Después de seguir estos pasos:

### **Backend:**
- ✅ 47 permisos granulares en BD
- ✅ Rol Administrador con todos los permisos
- ✅ Usuario Administrador configurado

### **Frontend:**
- ✅ Panel de Roles y Permisos funcional
- ✅ UI granular con 10 módulos
- ✅ Búsqueda y estadísticas en tiempo real
- ✅ Sin errores 403

---

**¿Necesitas ayuda?** Consulta `SOLUCION_ERROR_403_PERMISOS.md` para análisis detallado.
