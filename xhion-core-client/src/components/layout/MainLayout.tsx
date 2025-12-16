// xhion-core-client/src/components/layout/MainLayout.tsx
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectionBanner } from './ConnectionBanner';
import { GlobalLoader } from './GlobalLoader';
import { Outlet } from 'react-router-dom';
import { useThemeCustomization } from '@/hooks/useThemeCustomization';
import { useConnectionRefresh } from '@/hooks/useConnectionRefresh';
import { usePermissionSync } from '@/hooks/usePermissionSync';
import { useQueryClient } from '@tanstack/react-query';

export const MainLayout = () => {
  const queryClient = useQueryClient();

  // Apply theme customization from system settings
  useThemeCustomization();

  // Automatically sync user permissions in background
  // Syncs every 5 minutes and on window focus (optimized)
  usePermissionSync();

  // Invalidate all queries when connection is restored (instead of page reload)
  useConnectionRefresh({
    onRefresh: () => {
      console.log('🔄 Connection restored - invalidating all queries...');
      queryClient.invalidateQueries();
    },
  });

  return (
    <SidebarProvider>
      {/* Global loading indicator */}
      <GlobalLoader />
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          {/* Connection Banner - pushes content down when visible */}
          <ConnectionBanner />
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Outlet /> {/* Aquí se renderizarán las páginas */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
