# 📚 GUÍA COMPLETA DE SWAGGER - TESTING BACKEND

**Fecha:** 26 de Octubre, 2025  
**Estado:** ✅ Swagger Configurado y Listo  

---

## 🚀 ACCESO A SWAGGER

### **URL de Swagger:**
```
http://localhost:3000/api/docs
```

### **Iniciar el Servidor:**
```bash
cd xhion-core-api
pnpm run start:dev
```

---

## 🔐 AUTENTICACIÓN EN SWAGGER

### **Paso 1: Hacer Login**

1. Ve a la sección **Auth** en Swagger
2. Expande el endpoint `POST /api/v1/auth/login`
3. Haz clic en **"Try it out"**
4. Usa las credenciales del administrador:

```json
{
  "email": "admin@xhion.com",
  "password": "Admin12345!"
}
```

5. Haz clic en **"Execute"**
6. Copia el `accessToken` de la respuesta (sin las comillas)

**Respuesta Esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "admin@xhion.com",
    "nombreCompleto": "Administrador XHION",
    "rol": {
      "id": "uuid-del-rol",
      "nombre": "Administrador"
    }
  }
}
```

---

### **Paso 2: Autorizar en Swagger**

1. Haz clic en el botón **"Authorize"** (🔓) en la parte superior derecha
2. Pega el `accessToken` en el campo de valor
3. **NO agregues "Bearer"** - Swagger lo hace automáticamente
4. Haz clic en **"Authorize"**
5. Cierra el modal

**¡Listo!** Ahora todos los endpoints protegidos funcionarán con tu token.

---

## 📋 ENDPOINTS DISPONIBLES

### **1. Auth (🔐 Autenticación)**

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Iniciar sesión | ❌ No |
| POST | `/auth/accept-invitation` | Aceptar invitación | ❌ No |
| GET | `/auth/me` | Obtener usuario actual | ✅ Sí |
| POST | `/auth/refresh` | Refrescar token | ✅ Sí |
| POST | `/auth/logout` | Cerrar sesión | ✅ Sí |

---

### **2. Usuarios (👥 Gestión de Usuarios)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| GET | `/usuarios` | `usuarios.ver` | Listar todos los usuarios |
| GET | `/usuarios/:id` | `usuarios.ver` | Obtener usuario por ID |
| POST | `/usuarios/:id/asignar-rol` | `usuarios.gestionar_roles` | Asignar rol a usuario |
| PATCH | `/usuarios/:id/cambiar-rol` | `usuarios.gestionar_roles` | Cambiar rol de usuario |
| GET | `/usuarios/por-rol/:rolId` | `usuarios.ver` | Listar usuarios por rol |
| GET | `/usuarios/estadisticas/por-rol` | `sistema.ver_estadisticas` | Estadísticas de roles |

---

### **3. Roles (🎭 Gestión de Roles)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| GET | `/roles` | `roles.ver` | Listar todos los roles |
| GET | `/roles/with-details` | `roles.ver` | Roles con permisos completos |
| GET | `/roles/:id` | `roles.ver` | Obtener rol por ID |
| POST | `/roles` | `roles.crear` | Crear nuevo rol |
| PATCH | `/roles/:id` | `roles.editar` | Actualizar rol |
| DELETE | `/roles/:id` | `roles.eliminar` | Eliminar rol |
| PATCH | `/roles/:id/permisos` | `roles.asignar_permisos` | Actualizar permisos de rol |
| GET | `/roles/permisos/all` | `roles.ver` | Listar todos los permisos |
| GET | `/roles/usuarios/all` | `usuarios.ver` | Listar todos los usuarios |

---

### **4. Proyectos (📁 Gestión de Proyectos)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| POST | `/proyectos` | `proyectos.crear` | Crear proyecto |
| GET | `/proyectos` | `proyectos.ver` | Listar proyectos |
| GET | `/proyectos/:id` | `proyectos.ver` | Obtener proyecto |
| PATCH | `/proyectos/:id` | `proyectos.editar` | Actualizar proyecto |
| DELETE | `/proyectos/:id` | `proyectos.eliminar` | Eliminar proyecto |
| POST | `/proyectos/:id/miembros` | `proyectos.gestionar_miembros` | Agregar miembro |
| GET | `/proyectos/:id/miembros` | `proyectos.ver` | Listar miembros |
| DELETE | `/proyectos/:id/miembros/:miembroId` | `proyectos.gestionar_miembros` | Remover miembro |
| POST | `/proyectos/:id/etapas` | `proyectos.gestionar_etapas` | Crear etapa |
| GET | `/proyectos/:id/etapas` | `proyectos.ver` | Listar etapas |
| PATCH | `/proyectos/:id/etapas/:etapaId` | `proyectos.gestionar_etapas` | Actualizar etapa |
| DELETE | `/proyectos/:id/etapas/:etapaId` | `proyectos.gestionar_etapas` | Eliminar etapa |
| PATCH | `/proyectos/:id/etapas/reorder` | `proyectos.gestionar_etapas` | Reordenar etapas |

---

### **5. Tareas (✅ Gestión de Tareas)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| POST | `/tareas` | `tareas.crear` | Crear tarea |
| GET | `/tareas` | `tareas.ver` | Listar tareas |
| GET | `/tareas/mis-tareas` | `tareas.ver` | Mis tareas asignadas |
| GET | `/tareas/:id` | `tareas.ver` | Obtener tarea |
| PATCH | `/tareas/:id` | `tareas.editar` | Actualizar tarea |
| PATCH | `/tareas/:id/move` | `tareas.cambiar_estado` | Mover tarea |
| DELETE | `/tareas/:id` | `tareas.eliminar` | Eliminar tarea |
| POST | `/tareas/:id/comentarios` | `tareas.comentar` | Agregar comentario |
| GET | `/tareas/:id/comentarios` | `tareas.ver` | Listar comentarios |
| DELETE | `/tareas/:id/comentarios/:comentarioId` | `tareas.comentar` | Eliminar comentario |

---

### **6. Departamentos (🏢 Gestión de Departamentos)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| POST | `/departamentos` | `departamentos.crear` | Crear departamento |
| GET | `/departamentos` | `departamentos.ver` | Listar departamentos |
| GET | `/departamentos/:id` | `departamentos.ver` | Obtener departamento |
| GET | `/departamentos/:id/estadisticas` | `departamentos.ver` | Estadísticas |
| PUT | `/departamentos/:id` | `departamentos.editar` | Actualizar departamento |
| DELETE | `/departamentos/:id` | `departamentos.eliminar` | Eliminar departamento |
| PATCH | `/departamentos/:id/restaurar` | `departamentos.editar` | Restaurar departamento |

---

### **7. Presupuestos (💰 Gestión de Presupuestos)**

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| POST | `/presupuestos/departamento` | `presupuestos.crear` | Crear presupuesto de departamento |
| GET | `/presupuestos/departamento/:departamentoId` | `presupuestos.ver` | Obtener presupuesto |
| PUT | `/presupuestos/departamento/:departamentoId` | `presupuestos.editar` | Actualizar presupuesto |
| DELETE | `/presupuestos/departamento/:departamentoId` | `presupuestos.eliminar` | Eliminar presupuesto |
| POST | `/presupuestos/departamento/movimiento` | `presupuestos.registrar_movimientos` | Registrar movimiento |
| GET | `/presupuestos/departamento/movimientos/:id` | `presupuestos.ver` | Listar movimientos |
| DELETE | `/presupuestos/departamento/movimiento/:id` | `presupuestos.eliminar` | Eliminar movimiento |
| POST | `/presupuestos/proyecto` | `presupuestos.crear` | Crear presupuesto de proyecto |
| GET | `/presupuestos/proyecto/:proyectoId` | `presupuestos.ver` | Obtener presupuesto |
| PUT | `/presupuestos/proyecto/:proyectoId` | `presupuestos.editar` | Actualizar presupuesto |
| DELETE | `/presupuestos/proyecto/:proyectoId` | `presupuestos.eliminar` | Eliminar presupuesto |
| POST | `/presupuestos/proyecto/movimiento` | `presupuestos.registrar_movimientos` | Registrar movimiento |
| GET | `/presupuestos/proyecto/movimientos/:id` | `presupuestos.ver` | Listar movimientos |
| DELETE | `/presupuestos/proyecto/movimiento/:id` | `presupuestos.eliminar` | Eliminar movimiento |

---

## 🧪 CASOS DE PRUEBA RECOMENDADOS

### **Caso 1: Flujo Completo de Autenticación**

1. **Login:**
   - POST `/auth/login` con credenciales admin
   - Guardar `accessToken`

2. **Obtener Usuario Actual:**
   - GET `/auth/me`
   - Verificar datos del usuario

3. **Logout:**
   - POST `/auth/logout`
   - Verificar que el token se invalida

---

### **Caso 2: Gestión de Roles y Permisos**

1. **Listar Todos los Permisos:**
   - GET `/roles/permisos/all`
   - Ver los 54 permisos disponibles

2. **Crear Nuevo Rol "Editor":**
   - POST `/roles`
   ```json
   {
     "nombre": "Editor",
     "descripcion": "Puede crear y editar contenido",
     "color": "bg-blue-500"
   }
   ```

3. **Asignar Permisos al Rol:**
   - PATCH `/roles/:id/permisos`
   ```json
   {
     "permisosIds": [
       "uuid-proyectos.crear",
       "uuid-proyectos.ver",
       "uuid-proyectos.editar",
       "uuid-tareas.crear",
       "uuid-tareas.ver",
       "uuid-tareas.editar"
     ]
   }
   ```

4. **Verificar Rol con Permisos:**
   - GET `/roles/:id`
   - Ver permisos asignados

---

### **Caso 3: Asignar Rol a Usuario**

1. **Listar Usuarios:**
   - GET `/usuarios`
   - Obtener ID de un usuario

2. **Asignar Rol "Editor":**
   - POST `/usuarios/:id/asignar-rol`
   ```json
   {
     "rolId": "uuid-del-rol-editor"
   }
   ```

3. **Verificar Asignación:**
   - GET `/usuarios/:id`
   - Ver que el usuario tiene el nuevo rol

4. **Ver Estadísticas:**
   - GET `/usuarios/estadisticas/por-rol`
   - Ver distribución de usuarios por rol

---

### **Caso 4: Crear Proyecto Completo**

1. **Crear Departamento:**
   - POST `/departamentos`
   ```json
   {
     "nombre": "Desarrollo",
     "descripcion": "Departamento de desarrollo de software"
   }
   ```

2. **Crear Proyecto:**
   - POST `/proyectos`
   ```json
   {
     "nombre": "Sistema de Gestión",
     "descripcion": "Proyecto de gestión empresarial",
     "fechaInicio": "2025-01-01",
     "fechaFin": "2025-12-31",
     "responsableId": "uuid-del-usuario",
     "departamentoId": "uuid-del-departamento"
   }
   ```

3. **Crear Etapas:**
   - POST `/proyectos/:id/etapas`
   ```json
   {
     "nombre": "Planificación",
     "descripcion": "Fase de planificación del proyecto",
     "orden": 1,
     "color": "bg-blue-500"
   }
   ```

4. **Agregar Miembros:**
   - POST `/proyectos/:id/miembros`
   ```json
   {
     "usuarioId": "uuid-del-usuario"
   }
   ```

---

### **Caso 5: Gestión de Tareas**

1. **Crear Tarea:**
   - POST `/tareas`
   ```json
   {
     "titulo": "Implementar login",
     "descripcion": "Desarrollar sistema de autenticación",
     "proyectoId": "uuid-del-proyecto",
     "etapaId": "uuid-de-la-etapa",
     "asignadoId": "uuid-del-usuario",
     "prioridad": "ALTA",
     "fechaVencimiento": "2025-02-01"
   }
   ```

2. **Listar Mis Tareas:**
   - GET `/tareas/mis-tareas`

3. **Mover Tarea:**
   - PATCH `/tareas/:id/move`
   ```json
   {
     "etapaId": "uuid-nueva-etapa",
     "estado": "EN_PROGRESO"
   }
   ```

4. **Agregar Comentario:**
   - POST `/tareas/:id/comentarios`
   ```json
   {
     "contenido": "Avance del 50% completado"
   }
   ```

---

### **Caso 6: Gestión de Presupuestos**

1. **Crear Presupuesto de Departamento:**
   - POST `/presupuestos/departamento`
   ```json
   {
     "departamentoId": "uuid-del-departamento",
     "montoTotal": 100000,
     "periodo": "2025-Q1",
     "fechaInicio": "2025-01-01",
     "fechaFin": "2025-03-31"
   }
   ```

2. **Registrar Movimiento:**
   - POST `/presupuestos/departamento/movimiento`
   ```json
   {
     "presupuestoDepartamentoId": "uuid-del-presupuesto",
     "tipo": "EGRESO",
     "monto": 5000,
     "categoria": "EQUIPAMIENTO",
     "descripcion": "Compra de laptops",
     "fecha": "2025-01-15T10:00:00Z"
   }
   ```

3. **Ver Movimientos:**
   - GET `/presupuestos/departamento/movimientos/:id`

---

## ❌ PRUEBAS DE PERMISOS (Casos Negativos)

### **Probar Acceso Sin Permiso:**

1. **Crear un rol sin permisos de eliminación:**
   - POST `/roles` → Crear rol "Viewer"
   - No asignar permiso `proyectos.eliminar`

2. **Asignar rol a un usuario de prueba**

3. **Hacer login con ese usuario**

4. **Intentar eliminar un proyecto:**
   - DELETE `/proyectos/:id`
   - **Resultado Esperado:** 403 Forbidden
   ```json
   {
     "statusCode": 403,
     "message": "No tienes los permisos necesarios para realizar esta acción",
     "permisosRequeridos": ["proyectos.eliminar"],
     "permisosFaltantes": ["proyectos.eliminar"],
     "tusPermisos": ["proyectos.ver", "proyectos.crear"],
     "sugerencia": "Contacta al administrador para solicitar los permisos necesarios"
   }
   ```

---

## 🎨 CARACTERÍSTICAS DE SWAGGER

### **Documentación Incluida:**
- ✅ Descripción detallada de cada endpoint
- ✅ Ejemplos de request y response
- ✅ Códigos de estado HTTP
- ✅ Mensajes de error esperados
- ✅ Permisos requeridos documentados
- ✅ Schemas de DTOs con validaciones

### **Funcionalidades:**
- ✅ Probar endpoints directamente desde el navegador
- ✅ Ver ejemplos de payloads
- ✅ Copiar comandos curl
- ✅ Descargar especificación OpenAPI
- ✅ Autenticación JWT integrada

---

## 🔧 TIPS Y TRUCOS

### **1. Copiar como cURL:**
Después de ejecutar un request, puedes copiar el comando cURL completo para usarlo en terminal o Postman.

### **2. Ver Schemas:**
Haz clic en "Schemas" al final de la página para ver todos los DTOs y sus validaciones.

### **3. Filtrar por Tag:**
Usa los tags (Auth, Usuarios, Roles, etc.) para navegar rápidamente entre módulos.

### **4. Guardar Colección:**
Puedes exportar la especificación OpenAPI y importarla en Postman o Insomnia.

### **5. Token Expirado:**
Si recibes 401 Unauthorized, tu token expiró. Haz login nuevamente y actualiza la autorización.

---

## 📊 ESTADÍSTICAS DEL API

- **Total de Endpoints:** ~60
- **Endpoints Protegidos:** ~55
- **Endpoints Públicos:** ~5
- **Permisos Granulares:** 54
- **Módulos:** 10
- **Métodos HTTP:** GET, POST, PATCH, PUT, DELETE

---

## ✅ CHECKLIST DE PRUEBAS

### **Autenticación:**
- [ ] Login exitoso
- [ ] Login con credenciales incorrectas
- [ ] Obtener usuario actual
- [ ] Refresh token
- [ ] Logout

### **Roles y Permisos:**
- [ ] Listar todos los permisos
- [ ] Crear nuevo rol
- [ ] Asignar permisos a rol
- [ ] Actualizar rol
- [ ] Eliminar rol
- [ ] Listar roles con detalles

### **Usuarios:**
- [ ] Listar usuarios
- [ ] Asignar rol a usuario
- [ ] Cambiar rol de usuario
- [ ] Ver usuarios por rol
- [ ] Ver estadísticas de roles

### **Proyectos:**
- [ ] Crear proyecto
- [ ] Listar proyectos
- [ ] Actualizar proyecto
- [ ] Eliminar proyecto
- [ ] Gestionar miembros
- [ ] Gestionar etapas

### **Tareas:**
- [ ] Crear tarea
- [ ] Listar tareas
- [ ] Actualizar tarea
- [ ] Mover tarea
- [ ] Eliminar tarea
- [ ] Gestionar comentarios

### **Departamentos:**
- [ ] Crear departamento
- [ ] Listar departamentos
- [ ] Actualizar departamento
- [ ] Eliminar departamento
- [ ] Ver estadísticas

### **Presupuestos:**
- [ ] Crear presupuesto
- [ ] Registrar movimientos
- [ ] Ver movimientos
- [ ] Eliminar movimientos

### **Permisos (Casos Negativos):**
- [ ] Intentar acción sin permiso → 403
- [ ] Intentar acceso sin token → 401
- [ ] Verificar mensajes de error descriptivos

---

## 🚀 CONCLUSIÓN

Swagger está completamente configurado con:
- ✅ **Documentación completa** de todos los endpoints
- ✅ **Autenticación JWT** integrada
- ✅ **54 permisos granulares** documentados
- ✅ **Ejemplos de uso** en cada endpoint
- ✅ **Mensajes de error** descriptivos
- ✅ **Interfaz visual** para testing

**¡Listo para probar el backend completo!** 🎉

---

**URL:** http://localhost:3000/api/docs  
**Credenciales:** admin@xhion.com / Admin12345!  
**Estado:** ✅ Operativo
