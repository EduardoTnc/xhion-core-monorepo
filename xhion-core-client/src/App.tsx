import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { useThemeStore } from './store/themeStore'
import { useServiceWorker } from './hooks/useServiceWorker'
import LoginPage from './pages/LoginPage'
import AceptarInvitacionPage from './pages/AceptarInvitacionPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import RolesPage from './pages/RolesPage'
import SessionsPage from './pages/SessionsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AiInsightsPage from './pages/AiInsightsPage'
import IdeasPage from './pages/IdeasPage'
import AuditPage from './pages/AuditPage'
import { CalendarioPage } from './pages/CalendarioPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import TasksPage from './pages/TasksPage'
import UsuariosPage from './pages/UsuariosPage'

// Componente interno que usa los hooks
function AppContent() {
  const { theme } = useThemeStore();
  const { isOnline } = useServiceWorker();

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
        <Route path="/aceptar-invitacion" element={<AceptarInvitacionPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='ai-insights' element={<AiInsightsPage />} />
            <Route path='auditoria' element={<AuditPage />} />
            <Route path='calendario' element={<CalendarioPage />} />
            <Route path="departamentos" element={<DepartmentsPage />} />
            <Route path='ideas' element={<IdeasPage />} />
            <Route path="proyectos" element={<ProjectsPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="perfil/sesiones" element={<SessionsPage />} />
            <Route path="configuraciones" element={<SettingsPage />} />
            <Route path="tareas" element={<TasksPage />} />
            
            {/* ... otras rutas protegidas */}
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
