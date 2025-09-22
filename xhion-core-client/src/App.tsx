import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import AcceptInvitationPage from './pages/AcceptInvitationPage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/aceptar-invitacion" element={<AcceptInvitationPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/proyectos/:id" element={<ProjectPage />} />
          {/* ... otras rutas protegidas */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
