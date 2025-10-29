import { create } from 'zustand';
import type { RolConConteo, RolCompleto, UsuarioEnRol, Permiso } from '../types';
import { roleService } from '../services/roleService';
import { userService } from '../services/userService';
import { toast } from 'sonner';

interface RoleState {
  // Estado - Eager Loading: todos los roles y usuarios cargados de una vez
  rolesCompletos: RolCompleto[];
  todosLosUsuarios: UsuarioEnRol[];
  todosLosPermisos: Permiso[];
  selectedRole: RolCompleto | null;
  isLoading: boolean;
  error: string | null;
  
  // Set optimizado de permisos activos (O(1) lookup)
  permisosActivosSet: Set<string>;

  // Acciones
  fetchInitialData: () => Promise<void>;
  selectRole: (roleId: string) => void;
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
  todosLosUsuarios: [],
  todosLosPermisos: [],
  selectedRole: null,
  isLoading: false,
  error: null,
  permisosActivosSet: new Set(),

  // Obtener todos los roles, usuarios y permisos en paralelo (Eager Loading)
  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Cargar roles, usuarios y permisos en paralelo para máxima velocidad
      const [rolesCompletos, todosLosUsuarios, todosLosPermisos] = await Promise.all([
        roleService.obtenerRolesConDetalles(),
        userService.obtenerTodosLosUsuarios(),
        roleService.obtenerTodosLosPermisos(),
      ]);
      
      set({ rolesCompletos, todosLosUsuarios, todosLosPermisos, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar los datos';
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
    });
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
      
      // Recargar todos los datos para mantener consistencia
      const [rolesCompletos, todosLosUsuarios] = await Promise.all([
        roleService.obtenerRolesConDetalles(),
        userService.obtenerTodosLosUsuarios(),
      ]);
      
      set({ 
        rolesCompletos,
        todosLosUsuarios,
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
      
      // Recargar todos los datos para mantener consistencia
      const [rolesCompletos, todosLosUsuarios] = await Promise.all([
        roleService.obtenerRolesConDetalles(),
        userService.obtenerTodosLosUsuarios(),
      ]);
      
      // Actualizar rol seleccionado si es el mismo
      const { selectedRole } = get();
      const newSelectedRole = selectedRole?.id === roleId 
        ? rolesCompletos.find(r => r.id === roleId) || null
        : selectedRole;
      
      set({ 
        rolesCompletos,
        todosLosUsuarios,
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
      
      // Recargar todos los datos
      const [rolesCompletos, todosLosUsuarios] = await Promise.all([
        roleService.obtenerRolesConDetalles(),
        roleService.obtenerTodosLosUsuarios(),
      ]);
      
      // Limpiar selección si era el rol eliminado
      const { selectedRole } = get();
      const newSelectedRole = selectedRole?.id === roleId ? null : selectedRole;
      
      set({ 
        rolesCompletos,
        todosLosUsuarios,
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
    });
  },

  // Establecer error
  setError: (error: string | null) => {
    set({ error });
  },
}));
