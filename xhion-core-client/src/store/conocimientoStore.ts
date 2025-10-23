import { create } from 'zustand';
import {
  conocimientoService,
  type ContextoOrganizacional,
  type ContextoDepartamento,
  type DocumentoProyecto,
  type CreateContextoOrganizacionalDto,
  type CreateContextoDepartamentoDto,
  type UpdateContextoDepartamentoDto,
  type CreateDocumentoProyectoDto,
  type UpdateDocumentoProyectoDto,
} from '@/services/conocimientoService';
import { toast } from 'sonner';

interface ConocimientoState {
  contextoOrganizacional: ContextoOrganizacional | null;
  contextosDepartamento: ContextoDepartamento[];
  documentosProyecto: DocumentoProyecto[];
  isLoading: boolean;
  error: string | null;

  // Actions - Contexto Organizacional
  fetchContextoOrganizacional: () => Promise<void>;
  upsertContextoOrganizacional: (data: CreateContextoOrganizacionalDto) => Promise<void>;

  // Actions - Contexto Departamento
  fetchAllContextosDepartamento: () => Promise<void>;
  fetchContextoDepartamento: (departamentoId: string) => Promise<ContextoDepartamento | null>;
  createContextoDepartamento: (data: CreateContextoDepartamentoDto) => Promise<void>;
  updateContextoDepartamento: (
    departamentoId: string,
    data: UpdateContextoDepartamentoDto
  ) => Promise<void>;
  deleteContextoDepartamento: (departamentoId: string) => Promise<void>;

  // Actions - Documentos Proyecto
  fetchDocumentosProyecto: (proyectoId: string) => Promise<void>;
  createDocumentoProyecto: (data: CreateDocumentoProyectoDto) => Promise<void>;
  updateDocumentoProyecto: (id: string, data: UpdateDocumentoProyectoDto) => Promise<void>;
  deleteDocumentoProyecto: (id: string) => Promise<void>;

  clearError: () => void;
}

export const useConocimientoStore = create<ConocimientoState>((set, get) => ({
  contextoOrganizacional: null,
  contextosDepartamento: [],
  documentosProyecto: [],
  isLoading: false,
  error: null,

  // ==================== CONTEXTO ORGANIZACIONAL ====================

  fetchContextoOrganizacional: async () => {
    set({ isLoading: true, error: null });
    try {
      const contextoOrganizacional = await conocimientoService.getContextoOrganizacional();
      set({ contextoOrganizacional, isLoading: false });
    } catch (error: any) {
      // Si no existe, no es un error crítico
      if (error.response?.status === 404) {
        set({ contextoOrganizacional: null, isLoading: false });
      } else {
        const errorMessage =
          error.response?.data?.message || 'Error al cargar contexto organizacional';
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    }
  },

  upsertContextoOrganizacional: async (data: CreateContextoOrganizacionalDto) => {
    set({ isLoading: true, error: null });
    try {
      const contextoOrganizacional = await conocimientoService.upsertContextoOrganizacional(data);
      set({ contextoOrganizacional, isLoading: false });
      toast.success('Contexto organizacional guardado exitosamente');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al guardar contexto organizacional';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== CONTEXTO DEPARTAMENTO ====================

  fetchAllContextosDepartamento: async () => {
    set({ isLoading: true, error: null });
    try {
      const contextosDepartamento = await conocimientoService.getAllContextosDepartamento();
      set({ contextosDepartamento, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar contextos de departamentos';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchContextoDepartamento: async (departamentoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const contexto = await conocimientoService.getContextoDepartamento(departamentoId);
      // Actualizar en el array si existe
      set((state) => ({
        contextosDepartamento: state.contextosDepartamento.some((c) => c.departamentoId === departamentoId)
          ? state.contextosDepartamento.map((c) =>
              c.departamentoId === departamentoId ? contexto : c
            )
          : [...state.contextosDepartamento, contexto],
        isLoading: false,
      }));
      return contexto;
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ isLoading: false });
        return null;
      }
      const errorMessage =
        error.response?.data?.message || 'Error al cargar contexto de departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  createContextoDepartamento: async (data: CreateContextoDepartamentoDto) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoContexto = await conocimientoService.createContextoDepartamento(data);
      set((state) => ({
        contextosDepartamento: [...state.contextosDepartamento, nuevoContexto],
        isLoading: false,
      }));
      toast.success('Contexto de departamento creado exitosamente');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear contexto de departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateContextoDepartamento: async (
    departamentoId: string,
    data: UpdateContextoDepartamentoDto
  ) => {
    set({ isLoading: true, error: null });
    try {
      const contextoActualizado = await conocimientoService.updateContextoDepartamento(
        departamentoId,
        data
      );
      set((state) => ({
        contextosDepartamento: state.contextosDepartamento.map((c) =>
          c.departamentoId === departamentoId ? contextoActualizado : c
        ),
        isLoading: false,
      }));
      toast.success('Contexto de departamento actualizado exitosamente');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar contexto de departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteContextoDepartamento: async (departamentoId: string) => {
    set({ isLoading: true, error: null });
    try {
      await conocimientoService.deleteContextoDepartamento(departamentoId);
      set((state) => ({
        contextosDepartamento: state.contextosDepartamento.filter(
          (c) => c.departamentoId !== departamentoId
        ),
        isLoading: false,
      }));
      toast.success('Contexto de departamento eliminado exitosamente');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar contexto de departamento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== DOCUMENTOS PROYECTO ====================

  fetchDocumentosProyecto: async (proyectoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const documentosProyecto = await conocimientoService.getDocumentosProyecto(proyectoId);
      set({ documentosProyecto, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar documentos del proyecto';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createDocumentoProyecto: async (data: CreateDocumentoProyectoDto) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoDocumento = await conocimientoService.createDocumentoProyecto(data);
      set((state) => ({
        documentosProyecto: [...state.documentosProyecto, nuevoDocumento],
        isLoading: false,
      }));
      toast.success('Documento creado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear documento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateDocumentoProyecto: async (id: string, data: UpdateDocumentoProyectoDto) => {
    set({ isLoading: true, error: null });
    try {
      const documentoActualizado = await conocimientoService.updateDocumentoProyecto(id, data);
      set((state) => ({
        documentosProyecto: state.documentosProyecto.map((d) =>
          d.id === id ? documentoActualizado : d
        ),
        isLoading: false,
      }));
      toast.success('Documento actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar documento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteDocumentoProyecto: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await conocimientoService.deleteDocumentoProyecto(id);
      set((state) => ({
        documentosProyecto: state.documentosProyecto.filter((d) => d.id !== id),
        isLoading: false,
      }));
      toast.success('Documento eliminado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar documento';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
