# 📗 Manual del Frontend - XHION Core

> Guía práctica de la arquitectura frontend: React 19, TypeScript, TanStack Query V5, Zustand, shadcn/ui y mejores prácticas.

---

## 📑 Contenido

1. [Stack Tecnológico](#-stack-tecnológico)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Estado del Servidor (TanStack Query)](#-estado-del-servidor-tanstack-query-v5)
4. [Estado del Cliente (Zustand)](#-estado-del-cliente-zustand)
5. [Comunicación con la API](#-comunicación-con-la-api)
6. [Sistema de Diseño](#-sistema-de-diseño)
7. [Routing](#-routing)
8. [Formularios](#-formularios)
9. [Performance](#-performance)

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 19.2.0 | Framework UI |
| **TypeScript** | 5.9.3 | Tipado estático |
| **Vite** | 7.1.9 | Build tool ultra-rápido |
| **TanStack Query** | 5.x | Server-state, caching, mutations |
| **Zustand** | 5.0.8 | Client-state (UI, auth, theme) |
| **React Router** | 7.9.3 | Navegación |
| **shadcn/ui** | Latest | Componentes UI |
| **Tailwind CSS** | 4.1.14 | Estilos utility-first |
| **React Hook Form** | 7.60.0 | Formularios performantes |
| **Zod** | 3.25.76 | Validación de esquemas |
| **Axios** | 1.12.2 | Cliente HTTP |

**¿Por qué este stack?**
- ⚡ **Vite:** Build 10-100x más rápido que Webpack
- 🔄 **TanStack Query:** Caching automático, sincronización con servidor
- 🎯 **Zustand:** Simple para estado del cliente (UI, auth, theme)
- 🎨 **shadcn/ui:** Componentes copiables, no una librería
- 🔒 **TypeScript:** Errores en tiempo de desarrollo, no en producción

---

## 📁 Estructura del Proyecto

```
xhion-core-client/
├── src/
│   ├── components/          # Componentes UI
│   │   ├── ui/              # shadcn/ui (Button, Card, Dialog...)
│   │   ├── layout/          # MainLayout, Sidebar, Header
│   │   ├── dashboard/       # Widgets del dashboard
│   │   ├── projects/        # Componentes de proyectos
│   │   ├── tasks/           # Componentes de tareas
│   │   └── ...
│   │
│   ├── pages/               # Páginas (1 por ruta)
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   └── ...
│   │
│   ├── store/               # Estado del cliente (Zustand)
│   │   ├── authStore.ts     # Autenticación
│   │   ├── themeStore.ts    # Tema UI
│   │   ├── calendarStore.ts # Estado del calendario
│   │   ├── socketStore.ts   # WebSocket
│   │   └── ...
│   │
│   ├── hooks/               # Custom hooks
│   │   ├── queries/         # TanStack Query hooks (16)
│   │   │   ├── useProjects.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useDepartments.ts
│   │   │   └── index.ts     # Re-exports
│   │   ├── mutations/       # TanStack Query mutations (11)
│   │   │   ├── useProjectMutations.ts
│   │   │   ├── useTaskMutations.ts
│   │   │   └── ...
│   │   └── *.ts             # Otros hooks (useWebSocket, etc.)
│   │
│   ├── services/            # Llamadas directas a la API
│   │   ├── api/axios.ts
│   │   ├── proyectosService.ts
│   │   └── ...
│   │
│   ├── lib/                 # Utilidades
│   │   └── queryKeys.ts     # Claves de TanStack Query
│   │
│   └── types/               # Tipos TypeScript
│
└── package.json
```

**Regla de oro:** Si un componente se usa en 2+ lugares → `components/`. Si es único de una página → dentro de `pages/`.

---

## 🔄 Estado del Servidor (TanStack Query V5)

### Arquitectura de Estado Dual

XHION Core utiliza un enfoque de **estado dual**:

| Tipo | Tecnología | Propósito | Ejemplos |
|------|------------|-----------|----------|
| **Server-State** | TanStack Query V5 | Datos de la API | Proyectos, tareas, usuarios |
| **Client-State** | Zustand | Estado de la UI | Auth, theme, modals |

### ¿Por qué TanStack Query?

```typescript
// ❌ Antes (Zustand para todo):
// - Caching manual
// - Invalidación manual
// - Estados loading/error manuales
// - Refetch manual al volver a la página

// ✅ Ahora (TanStack Query):
// - Caching automático
// - Invalidación inteligente al mutar
// - Estados loading/error/success built-in
// - Background refetching automático
// - Retry automático en errores
```

### Patrón de Query Hook

```typescript
// hooks/queries/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { projectService } from '@/services/projectService'

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectService.getAll(filters),
    staleTime: 1000 * 60, // 1 minuto
  })
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id!),
    queryFn: () => projectService.getById(id!),
    enabled: !!id, // Solo ejecuta si hay ID
  })
}
```

### Patrón de Mutation Hook

```typescript
// hooks/mutations/useProjectMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { projectService } from '@/services/projectService'
import { toast } from 'sonner'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectService.create(data),
    onSuccess: () => {
      toast.success('Proyecto creado exitosamente')
      // Invalida la lista para refetch automático
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear proyecto')
    },
  })
}
```

### Uso en Componentes

```typescript
import { useProjects, useCreateProject } from '@/hooks/queries'

function ProjectsList() {
  // Query - obtiene datos con caching automático
  const { data: projects, isLoading, error } = useProjects()

  // Mutation - para crear/actualizar/eliminar
  const createProject = useCreateProject()

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />

  return (
    <div>
      {projects?.map(p => <ProjectCard key={p.id} {...p} />)}
      <Button
        onClick={() => createProject.mutate({ nombre: 'Nuevo' })}
        disabled={createProject.isPending}
      >
        {createProject.isPending ? 'Creando...' : 'Crear Proyecto'}
      </Button>
    </div>
  )
}
```

### QueryKeys Centralizados

```typescript
// lib/queryKeys.ts
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (filters?: any) => [...queryKeys.projects.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
    stages: (id: string) => [...queryKeys.projects.all, 'stages', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byProject: (projectId: string) => [...queryKeys.tasks.all, 'project', projectId] as const,
  },
  // ... más entidades
}
```

### Hooks Disponibles

**Queries (16):**
- `useProjects`, `useProject`, `useProjectStages`, `useProjectMembers`
- `useTasks`, `useTask`
- `useDepartments`, `useDepartment`
- `useUsers`, `useUser`
- `useEvents`, `useNotifications`
- `useIdeas`, `useKnowledge`
- `useTimeline`, `useDashboard`, `useAudit`

**Mutations (11):**
- `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useDuplicateProject`
- `useCreateTask`, `useUpdateTask`, `useDeleteTask`
- `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent`
- ...y más

---

## 🗃️ Estado del Cliente (Zustand)

### ¿Cuándo usar Zustand?

Zustand se usa **solo** para estado que NO viene del servidor:

| Store | Propósito |
|-------|----------|
| `authStore` | Token JWT, usuario actual, estado de autenticación |
| `themeStore` | Tema (dark/light) |
| `calendarStore` | Vista actual del calendario, fecha seleccionada |
| `socketStore` | Estado de conexión WebSocket |
| `connectionStore` | Estado de conexión a internet |
| `aiSearchStore` | Estado del buscador AI |

### Patrón de Store (Client-State)

```typescript
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: Usuario | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  
  setUser: (user: Usuario) => void
  logout: () => void
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,
      status: 'loading',
      
      setUser: (user) => set({ user, status: 'authenticated' }),
      logout: () => set({ token: null, user: null, status: 'unauthenticated' })
    }),
    { name: 'auth-storage' } // ← Persiste en localStorage
  )
)
```

### Uso en Componentes

```typescript
function Navbar() {
  const { user, logout } = useAuthStore()
  
  return (
    <nav>
      <span>Hola, {user?.nombreCompleto}</span>
      <Button onClick={logout}>Cerrar Sesión</Button>
    </nav>
  )
}
```

**Importante:** NO uses Zustand para datos que vienen de la API. Usa TanStack Query para eso.

## 🌐 Comunicación con la API

### Axios Instance (con interceptores)

```typescript
// services/api/axiosInstance.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// 1. Agregar token automáticamente
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. Renovar token si expira
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken
      const { data } = await axios.post('/auth/refresh', { refreshToken })
      
      useAuthStore.getState().setAccessToken(data.accessToken)
      
      // Reintentar request original
      error.config.headers.Authorization = `Bearer ${data.accessToken}`
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
```

### Servicios por Módulo

```typescript
// services/proyectosService.ts
import api from './api/axiosInstance'

export const proyectosService = {
  getAll: () => api.get('/proyectos').then(res => res.data),
  getById: (id: string) => api.get(`/proyectos/${id}`).then(res => res.data),
  create: (dto: CreateProyectoDto) => api.post('/proyectos', dto).then(res => res.data),
  update: (id: string, dto: UpdateProyectoDto) => api.patch(`/proyectos/${id}`, dto).then(res => res.data),
  delete: (id: string) => api.delete(`/proyectos/${id}`).then(res => res.data)
}
```

**Ventajas:**
- ✅ Token automático en cada request
- ✅ Refresh token transparente
- ✅ Logout automático si refresh falla
- ✅ Servicios tipados con TypeScript

---

## 🎨 Sistema de Diseño

### shadcn/ui + Radix UI

**¿Qué es shadcn/ui?**
- NO es una librería npm (no hay `npm install shadcn`)
- Son componentes que **copias a tu proyecto**
- Basados en Radix UI (accesibilidad A+)
- Totalmente personalizables

### Componentes Principales

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyecto Alpha</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Descripción del proyecto</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Ver Detalles</Button>
          </DialogTrigger>
          <DialogContent>
            {/* Modal content */}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

### Variantes con CVA

```typescript
// components/ui/button.tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'rounded-md font-medium transition-colors', // Base
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input hover:bg-accent'
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8'
      }
    }
  }
)

// Uso
<Button variant="destructive" size="sm">Eliminar</Button>
```

### Dark Mode

```typescript
// Automático con Tailwind
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">Título</h1>
</div>

// Toggle theme
const { theme, setTheme } = useThemeStore()
<Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun /> : <Moon />}
</Button>
```

**Componentes más usados:**
- `Button`, `Input`, `Textarea` - Formularios
- `Card`, `Badge`, `Avatar` - Contenedores
- `Dialog`, `Sheet`, `Popover` - Modales
- `Select`, `Combobox`, `DatePicker` - Inputs avanzados
- `Table`, `DataTable` - Tablas

---

## 🧭 Routing

### React Router v7

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/proyectos" element={<ProjectsPage />} />
            <Route path="/proyectos/:id" element={<ProjectDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### ProtectedRoute

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const { status } = useAuthStore()
  
  if (status === 'loading') return <LoadingScreen />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  
  return <Outlet /> // ← Renderiza rutas hijas
}
```

### Navegación Programática

```typescript
import { useNavigate } from 'react-router-dom'

function ProjectCard({ id }) {
  const navigate = useNavigate()
  
  return (
    <Card onClick={() => navigate(`/proyectos/${id}`)}>
      {/* ... */}
    </Card>
  )
}
```

---

## 📝 Formularios

### React Hook Form + Zod

**¿Por qué?**
- React Hook Form: Performance (sin re-renders innecesarios)
- Zod: Validación type-safe

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 1. Definir schema
const schema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  edad: z.number().min(18, 'Debes ser mayor de edad')
})

type FormData = z.infer<typeof schema>

function MyForm() {
  // 2. Crear form
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', email: '', edad: 0 }
  })
  
  // 3. Submit
  const onSubmit = async (data: FormData) => {
    await api.post('/endpoint', data)
    toast.success('Guardado!')
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('nombre')} />
      {form.formState.errors.nombre && (
        <span>{form.formState.errors.nombre.message}</span>
      )}
      
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

### Con shadcn/ui Form Components

```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="nombre"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input placeholder="Tu nombre" {...field} />
          </FormControl>
          <FormMessage /> {/* ← Error automático */}
        </FormItem>
      )}
    />
    <Button type="submit">Guardar</Button>
  </form>
</Form>
```

---

## ⚡ Performance

### 1. Code Splitting (Lazy Loading)

```typescript
import { lazy, Suspense } from 'react'

// ❌ Malo: Carga todo al inicio
import ProjectsPage from './pages/ProjectsPage'

// ✅ Bueno: Carga solo cuando se necesita
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/proyectos" element={<ProjectsPage />} />
      </Routes>
    </Suspense>
  )
}
```

### 2. Memoización

```typescript
import { useMemo, useCallback } from 'react'

function ProjectsList({ proyectos, filters }) {
  // Evita recalcular en cada render
  const filteredProyectos = useMemo(() => {
    return proyectos.filter(p => 
      p.nombre.includes(filters.search) &&
      p.estado === filters.estado
    )
  }, [proyectos, filters]) // ← Solo recalcula si cambian
  
  // Evita recrear función en cada render
  const handleClick = useCallback((id: string) => {
    navigate(`/proyectos/${id}`)
  }, [navigate])
  
  return <div>{/* ... */}</div>
}
```

### 3. Optimistic Updates

```typescript
// En el store
createProyecto: async (dto) => {
  // 1. Crear ID temporal
  const tempId = `temp-${Date.now()}`
  const tempProyecto = { id: tempId, ...dto, estado: 'Activo' }
  
  // 2. Actualizar UI inmediatamente
  set(state => ({ proyectos: [...state.proyectos, tempProyecto] }))
  
  try {
    // 3. Crear en backend
    const proyecto = await proyectosService.create(dto)
    
    // 4. Reemplazar temp con real
    set(state => ({
      proyectos: state.proyectos.map(p => 
        p.id === tempId ? proyecto : p
      )
    }))
  } catch (error) {
    // 5. Revertir si falla
    set(state => ({
      proyectos: state.proyectos.filter(p => p.id !== tempId)
    }))
    toast.error('Error al crear proyecto')
  }
}
```

### 4. Virtualización (Listas Largas)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function LargeList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100 // Altura estimada de cada item
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <Item data={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Resultado:** Renderiza solo 10-20 items visibles en lugar de 1000+.

---

## 🎯 Patrones y Mejores Prácticas

### 1. Custom Hooks

```typescript
// hooks/useProjects.ts
export function useProjects() {
  const { proyectos, isLoading, fetchProyectos } = useProjectStore()
  
  useEffect(() => {
    fetchProyectos()
  }, [])
  
  return { proyectos, isLoading }
}

// Uso
function ProjectsList() {
  const { proyectos, isLoading } = useProjects() // ← Limpio
  // ...
}
```

### 2. Compound Components

```typescript
// Patrón flexible
<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Content>
    Contenido
  </Card.Content>
  <Card.Footer>
    <Button>Acción</Button>
  </Card.Footer>
</Card>
```

### 3. Error Boundaries

```typescript
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Algo salió mal. <button onClick={() => location.reload()}>Recargar</button></div>
    }
    return this.props.children
  }
}

// Uso
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 4. Tipos Compartidos

```typescript
// types/project.types.ts
export interface Proyecto {
  id: string
  nombre: string
  descripcion?: string
  estado: 'Activo' | 'Completado' | 'Archivado'
  responsable: Usuario
  fechaInicio?: Date
  fechaFin?: Date
}

export type CreateProyectoDto = Omit<Proyecto, 'id' | 'responsable'> & {
  responsableId: string
}
```

---

## 📚 Recursos Útiles

- **React Docs:** https://react.dev
- **Zustand:** https://zustand-demo.pmnd.rs
- **shadcn/ui:** https://ui.shadcn.com
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev
- **Tailwind CSS:** https://tailwindcss.com

---

## 🎓 Conclusión

El frontend de XHION Core está construido con tecnologías modernas que priorizan:

1. **Developer Experience:** TypeScript, Vite, hot reload
2. **Performance:** Code splitting, memoización, virtualización
3. **Mantenibilidad:** Zustand simple, componentes reutilizables
4. **Accesibilidad:** Radix UI con ARIA completo
5. **Escalabilidad:** Arquitectura modular y tipada

**Siguiente paso:** Explora el código en `xhion-core-client/src/` y experimenta con los componentes.

Para más detalles técnicos, consulta el [Análisis Técnico Completo](../ANALISIS_TECNICO_COMPLETO.md).
