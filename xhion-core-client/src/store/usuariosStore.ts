import { create } from "zustand"
import { userService } from "@/services/userService"
import type { Usuario } from "@/types"

interface UsuariosState {
  usuarios: Usuario[]
  isLoading: boolean
  error: string | null

  fetchUsuarios: () => Promise<void>
  fetchUsuarioById: (id: string) => Promise<Usuario | null>
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  isLoading: false,
  error: null,

  fetchUsuarios: async () => {
    set({ isLoading: true, error: null })
    try {
      const usuarios = await userService.obtenerTodosLosUsuarios()
      set({ usuarios, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchUsuarioById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const usuario = await userService.obtenerUsuarioPorId(id)
      set({ isLoading: false })
      return usuario
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },
}))
