import { create } from 'zustand';
import type { RolConConteo, RolCompleto, UsuarioEnRol } from '../types';
import { roleService } from '../services/roleService';
import { toast } from 'sonner';

interface RoleState {
  // Estado - Eager Loading: todos los roles con detalles cargados de una vez
  rolesCompletos: RolCompleto[];
  selectedRole: RolCompleto | null;
  usersInRole: UsuarioEnRol[];
  isLoading: boolean;
  isLoadingUsers: boolean;
  error: string | null;
  
  // Paginación de usuarios
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  
  // Set optimizado de permisos activos (O(1) lookup)
  permisosActivosSet: Set<string>;

  // Acciones
  fetchRolesWithDetails: () => Promise<void>;
  selectRole: (roleId: string) => void;
  fetchUsersInRole: (roleId: string, page?: number) => Promise<void>;
  updateRolePermissions: (roleId: string, permisosIds: string[]) => Promise<void>;
  createRole: (data: { nombre: string; descripcion?: string; color?: string }) => Promise<RolCompleto>;
  updateRole: (roleId: string, data: { nombre?: string; descripcion?: string; color?: string }) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  clearSelectedRole: () => void;
  setError: (error: string | null) => void;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  // Estado inicial
  rolesCompletos: [],
  selectedRole: null,
  usersInRole: [],
  isLoading: false,
  isLoadingUsers: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  permisosActivosSet: new Set(),

  // Obtener todos los roles con detalles (Eager Loading)
  fetchRolesWithDetails: async () => {
    set({ isLoading: true, error: null });
    try {
      const rolesCompletos = await roleService.obtenerRolesConDetalles();
      set({ rolesCompletos, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar los roles';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // Seleccionar un rol (instantáneo - ya está cargado)
  selectRole: (roleId: string) => {
    const { rolesCompletos } = get();
    
    // Buscar el rol en la lista ya cargada
    const role = rolesCompletos.find(r => r.id === roleId);
    
    if (!role) {
      toast.error('Rol no encontrado');
      return;
    }
    
    // Crear Set de permisos para lookup O(1)
    const permisosSet = new Set(
      role.permisos.map(rp => rp.permiso?.nombreAccion || '')
    );
    
    set({ 
      selectedRole: role,
      permisosActivosSet: permisosSet,
      usersInRole: [],
      currentPage: 1,
    });
  },

  // Obtener usuarios de un rol con paginación
  fetchUsersInRole: async (roleId: string, page: number = 1) => {
    set({ isLoadingUsers: true, error: null });
    try {
      const response = await roleService.obtenerUsuariosPorRol(roleId, page, 10);
      set({ 
        usersInRole: response.data,
        currentPage: response.meta.page,
        totalPages: response.meta.totalPages,
        totalUsers: response.meta.total,
        isLoadingUsers: false,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar los usuarios';
      set({ error: errorMessage, isLoadingUsers: false });
      toast.error(errorMessage);
    }
  },

  // Actualizar permisos de un rol
  updateRolePermissions: async (roleId: string, permisosIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRole = await roleService.actualizarPermisos(roleId, permisosIds);
      
      // Crear nuevo Set de permisos
      const permisosSet = new Set(
        updatedRole.permisos.map(rp => rp.permiso?.nombreAccion || '')
      );
      
      // Actualizar en la lista de roles completos
      const { rolesCompletos } = get();
      const updatedRoles = rolesCompletos.map(r => 
        r.id === roleId ? updatedRole : r
      );
      
      set({ 
        rolesCompletos: updatedRoles,
        selectedRole: updatedRole,
        permisosActivosSet: permisosSet,
        isLoading: false,
      });
      
      toast.success('Permisos actualizados exitosamente');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar los permisos';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Crear un nuevo rol
  createRole: async (data: { nombre: string; descripcion?: string; color?: string }) => {
    set({ isLoading: true, error: null });
    try {
      await roleService.crearRol(data);
      
      // Recargar todos los roles para mantener consistencia
      const rolesCompletos = await roleService.obtenerRolesConDetalles();
      
      set({ 
        rolesCompletos,
        isLoading: false,
      });
      
      toast.success(`Rol "${data.nombre}" creado exitosamente`);
      
      // Retornar el rol creado
      return rolesCompletos.find(r => r.nombre === data.nombre)!;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al crear el rol';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Actualizar un rol
  updateRole: async (roleId: string, data: { nombre?: string; descripcion?: string; color?: string }) => {
    set({ isLoading: true, error: null });
    try {
      await roleService.actualizarRol(roleId, data);
      
      // Recargar todos los roles para mantener consistencia
      const rolesCompletos = await roleService.obtenerRolesConDetalles();
      
      // Actualizar rol seleccionado si es el mismo
      const { selectedRole } = get();
      const newSelectedRole = selectedRole?.id === roleId 
        ? rolesCompletos.find(r => r.id === roleId) || null
        : selectedRole;
      
      set({ 
        rolesCompletos,
        selectedRole: newSelectedRole,
        isLoading: false,
      });
      
      toast.success('Rol actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar el rol';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Eliminar un rol
  deleteRole: async (roleId: string) => {
    set({ isLoading: true, error: null });
    try {
      await roleService.eliminarRol(roleId);
      
      // Recargar todos los roles
      const rolesCompletos = await roleService.obtenerRolesConDetalles();
      
      // Limpiar selección si era el rol eliminado
      const { selectedRole } = get();
      const newSelectedRole = selectedRole?.id === roleId ? null : selectedRole;
      
      set({ 
        rolesCompletos,
        selectedRole: newSelectedRole,
        isLoading: false,
      });
      
      toast.success('Rol eliminado exitosamente');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar el rol';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Limpiar rol seleccionado
  clearSelectedRole: () => {
    set({ 
      selectedRole: null,
      permisosActivosSet: new Set(),
      usersInRole: [],
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
    });
  },

  // Establecer error
  setError: (error: string | null) => {
    set({ error });
  },
}));
