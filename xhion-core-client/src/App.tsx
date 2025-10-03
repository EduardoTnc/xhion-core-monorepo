import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import AcceptInvitationPage from './pages/AcceptInvitationPage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'
import { HeroUIProvider } from "@heroui/react"
import { useThemeStore } from './store/themeStore'
import { MainLayout } from './components/layout/MainLayout'
import SessionsPage from './pages/SessionsPage'

function App() {
  const { theme } = useThemeStore();

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
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/aceptar-invitacion" element={<AcceptInvitationPage />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="proyectos/:id" element={<ProjectPage />} />
              <Route path="perfil/sesiones" element={<SessionsPage />} />
              {/* ... otras rutas protegidas */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  )
}

export default App
