import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    conocimientoService,
    type ContextoOrganizacional,
    type ContextoDepartamento,
    type DocumentoProyecto,
    type DocumentoDepartamento,
} from '@/services/conocimientoService';

/**
 * Hook para obtener el contexto organizacional
 */
export function useContextoOrganizacional(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.knowledge.organizationalContext(),
        queryFn: () => conocimientoService.getContextoOrganizacional(),
        staleTime: 1000 * 60 * 30, // 30 minutos - cambia poco
        retry: (failureCount, error: any) => {
            // No reintentar si es 404 (no existe aún)
            if (error?.response?.status === 404) return false;
            return failureCount < 3;
        },
        ...options,
    });
}

/**
 * Hook para obtener todos los contextos de departamentos
 */
export function useContextosDepartamento(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.knowledge.departmentContexts(),
        queryFn: () => conocimientoService.getAllContextosDepartamento(),
        staleTime: 1000 * 60 * 15, // 15 minutos
        ...options,
    });
}

/**
 * Hook para obtener el contexto de un departamento específico
 */
export function useContextoDepartamento(
    departamentoId: string | null | undefined,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.knowledge.departmentContext(departamentoId!),
        queryFn: () => conocimientoService.getContextoDepartamento(departamentoId!),
        enabled: !!departamentoId && (options?.enabled !== false),
        staleTime: 1000 * 60 * 15,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 3;
        },
        // Placeholder data de la lista
        placeholderData: () => {
            const contexts = queryClient.getQueryData<ContextoDepartamento[]>(
                queryKeys.knowledge.departmentContexts()
            );
            return contexts?.find(c => c.departamentoId === departamentoId);
        },
        ...options,
    });
}

/**
 * Hook para obtener documentos de un proyecto
 */
export function useDocumentosProyecto(
    proyectoId: string | null | undefined,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: queryKeys.knowledge.projectDocuments(proyectoId!),
        queryFn: () => conocimientoService.getDocumentosProyecto(proyectoId!),
        enabled: !!proyectoId && (options?.enabled !== false),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

/**
 * Hook para obtener documentos de un departamento
 */
export function useDocumentosDepartamento(
    departamentoId: string | null | undefined,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: queryKeys.knowledge.departmentDocuments(departamentoId!),
        queryFn: () => conocimientoService.getDocumentosDepartamento(departamentoId!),
        enabled: !!departamentoId && (options?.enabled !== false),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}
