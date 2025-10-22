// xhion-core-client/src/components/layout/MainLayout.tsx
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from './sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Outlet /> {/* Aquí se renderizarán las páginas */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};