// xhion-core-client/src/components/layout/MainLayout.tsx
import { SidebarProvider } from '../providers/SidebarProvider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Outlet /> {/* Aquí se renderizarán las páginas */}
          </main>
        </div>  
      </div>
    </SidebarProvider>
  );
};