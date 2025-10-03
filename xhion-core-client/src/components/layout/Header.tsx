import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Botón de menú para móvil */}
      <Button
        isIconOnly
        variant="light"
        className="lg:hidden"
        onPress={onMenuClick}
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      {/* Espaciador en escritorio */}
      <div className="hidden lg:block" />

      {/* Controles de la derecha */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Menú de usuario */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              src={user?.avatarUrl || undefined}
              name={user?.nombreCompleto}
              size="sm"
              isBordered
              color="primary"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Menú de usuario" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2" textValue="Perfil">
              <p className="font-semibold">Sesión iniciada como</p>
              <p className="font-semibold">{user?.nombreCompleto}</p>
            </DropdownItem>
            <DropdownItem
              key="perfil"
              textValue="Mi Perfil"
              onPress={() => navigate('/perfil')}
            >
              Mi Perfil
            </DropdownItem>
            <DropdownItem
              key="sesiones"
              textValue="Mis Sesiones"
              onPress={() => navigate('/perfil/sesiones')}
            >
              Mis Sesiones
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              textValue="Cerrar Sesión"
              onPress={handleLogout}
            >
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};
