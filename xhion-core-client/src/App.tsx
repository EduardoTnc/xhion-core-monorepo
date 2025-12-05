import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { useThemeStore } from './store/themeStore'
import { useSystemSettingsStore } from './store/systemSettingsStore'
import { useServiceWorker } from './hooks/useServiceWorker'
import LoginPage from './pages/LoginPage'
import AceptarInvitacionPage from './pages/AceptarInvitacionPage'
import RequestAccessPage from './pages/RequestAccessPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import RolesPage from './pages/RolesPage'
import SessionsPage from './pages/SessionsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AiInsightsPage from './pages/AiInsightsPage'
import IdeasPage from './pages/IdeasPage'
import AuditPage from './pages/AuditPage'
import { CalendarioPage } from './pages/CalendarioPage'
import ProfilePage from './pages/ProfilePage'
import TasksPage from './pages/TasksPage'
import UsuariosPage from './pages/UsuariosPage'
import FinanzasPage from './pages/FinanzasPage'
import DepartmentDetailPage from './pages/DepartmentDetailPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import SystemSettingsPage from './pages/SystemSettingsPage'

// Componente interno que usa los hooks
function AppContent() {
  const { theme } = useThemeStore();
  const { fetchSettings } = useSystemSettingsStore();
  const { isOnline } = useServiceWorker();

  // Cargar configuración del sistema al iniciar
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Aplicar el tema al elemento HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RequestAccessPage />} />
        <Route path="/aceptar-invitacion" element={<AceptarInvitacionPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='ai-insights' element={<AiInsightsPage />} />
            <Route path='auditoria' element={<AuditPage />} />
            <Route path='calendario' element={<CalendarioPage />} />
            <Route path="departamentos" element={<DepartmentsPage />} />
            <Route path="departamentos/:id" element={<DepartmentDetailPage />} />
            <Route path='finanzas' element={<FinanzasPage />} />
            <Route path='ideas' element={<IdeasPage />} />
            <Route path="proyectos" element={<ProjectsPage />} />
            <Route path="proyectos/:id" element={<ProjectDetailPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="perfil/sesiones" element={<SessionsPage />} />
            <Route path="perfil/configuracion" element={<ProfileSettingsPage />} />
            <Route path="sistema/configuracion" element={<SystemSettingsPage />} />
            <Route path="configuraciones" element={<Navigate to="/perfil/configuracion" replace />} />
            <Route path="tareas" element={<TasksPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
