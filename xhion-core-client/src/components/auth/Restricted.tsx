import React from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface RestrictedProps {
    to: string; // Permission required (e.g., 'proyectos.crear')
    children: React.ReactNode;
    fallback?: React.ReactNode; // Optional custom fallback
    className?: string; // Optional className for the wrapper
}

/**
 * Hook to check if the current user has a specific permission
 */
export const usePermission = (permission: string) => {
    const { user } = useAuthStore();

    if (!user) return false;

    // Admin role usually has all permissions, but we'll stick to the explicit list 
    // unless there's a convention that 'admin' role bypasses checks.
    // For now, let's assume explicit permissions are required or 'admin' role check.
    if (user.rol === 'admin' || user.rol === 'Administrador') return true;

    return user.permisos?.includes(permission) || false;
};

/**
 * Component that restricts access to its children based on permissions.
 * If the user lacks the permission, the children are displayed with reduced opacity,
 * disabled interactions, and a tooltip indicating insufficient permissions.
 */
export const Restricted = ({ to, children, fallback, className }: RestrictedProps) => {
    const hasPermission = usePermission(to);

    if (hasPermission) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "relative opacity-50 cursor-not-allowed select-none grayscale-[0.5]",
                            className
                        )}
                        aria-disabled="true"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {/* 
              Overlay to capture interactions. 
              We use a high z-index transparent overlay to ensure no clicks pass through 
              to the children (like buttons or inputs).
            */}
                        <div className="absolute inset-0 z-50 bg-background/5" />

                        {/* 
              Disable pointer events on children to prevent hover states 
              from triggering on the disabled elements themselves 
            */}
                        <div className="pointer-events-none">
                            {children}
                        </div>

                        {/* Optional lock icon overlay for better visual cue */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md border border-border">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2 bg-destructive text-destructive-foreground border-destructive/20">
                    <Lock className="h-3 w-3" />
                    <p className="font-medium">No tienes permisos para realizar esta acción</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
