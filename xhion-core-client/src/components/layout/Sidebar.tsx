import { NavLink } from 'react-router-dom';
import { Modal, ModalContent } from '@heroui/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Proyectos',
    path: '/proyectos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Tareas',
    path: '/tareas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    name: 'Equipo',
    path: '/equipo',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          XHION Core
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 XHION Core
        </p>
      </div>
    </div>
  );
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Sidebar para Escritorio (siempre visible, posición fija) */}
      <aside className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 lg:z-40 lg:flex-col lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
        <SidebarContent />
      </aside>

      {/* Modal/Drawer para Móvil */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        size="full"
        classNames={{
          base: 'lg:hidden m-0 sm:m-0',
          wrapper: 'items-start justify-start',
          body: 'p-0',
          closeButton: 'hidden',
        }}
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              x: -300,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
      >
        <ModalContent className="w-64 h-full rounded-none">
          <SidebarContent onItemClick={onClose} />
        </ModalContent>
      </Modal>
    </>
  );
};
