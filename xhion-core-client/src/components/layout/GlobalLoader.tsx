import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

/**
 * Barra de progreso global estilo YouTube/GitHub
 * Aparece en la parte superior cuando hay actividad de red
 * 
 * Características:
 * - Se muestra cuando hay queries o mutations en progreso
 * - Animación pulse para indicar actividad
 * - Se posiciona por encima de todo (z-100)
 */
export function GlobalLoader() {
    const isFetching = useIsFetching();
    const isMutating = useIsMutating();

    const isActive = isFetching > 0 || isMutating > 0;

    if (!isActive) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
            <div
                className={cn(
                    "h-full bg-gradient-to-r from-primary via-primary/80 to-primary",
                    "animate-pulse transition-all duration-300"
                )}
                style={{
                    // Si hay mutation pendiente, mostrar 95% para indicar que está procesando
                    width: isMutating > 0 ? '95%' : '100%',
                }}
            />
        </div>
    );
}
