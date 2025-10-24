import { create } from "zustand"
import puestosTrabajoService, { type PuestoTrabajo, type CreatePuestoTrabajoDto, type UpdatePuestoTrabajoDto } from "@/services/puestosTrabajoService"

interface PuestosTrabajoState {
  puestos: Map<string, PuestoTrabajo[]>
  isLoading: boolean
  error: string | null

  fetchPuestosByProyecto: (proyectoId: string) => Promise<void>
  fetchPuestosByDepartamento: (departamentoId: string) => Promise<void>
  createPuesto: (data: CreatePuestoTrabajoDto) => Promise<void>
  updatePuesto: (id: string, data: UpdatePuestoTrabajoDto) => Promise<void>
  deletePuesto: (id: string) => Promise<void>
  asignarEmpleado: (puestoId: string, empleadoId: string) => Promise<void>
  desasignarEmpleado: (puestoId: string, empleadoId: string) => Promise<void>
}

export const usePuestosTrabajoStore = create<PuestosTrabajoState>((set, get) => ({
  puestos: new Map(),
  isLoading: false,
  error: null,

  fetchPuestosByProyecto: async (proyectoId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await puestosTrabajoService.getPuestosByProyecto(proyectoId)
      const newMap = new Map(get().puestos)
      newMap.set(proyectoId, data)
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchPuestosByDepartamento: async (departamentoId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await puestosTrabajoService.getPuestosByDepartamento(departamentoId)
      const newMap = new Map(get().puestos)
      newMap.set(departamentoId, data)
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createPuesto: async (data: CreatePuestoTrabajoDto) => {
    set({ isLoading: true, error: null })
    try {
      await puestosTrabajoService.createPuesto(data)
      if (data.proyectoId) {
        await get().fetchPuestosByProyecto(data.proyectoId)
      } else if (data.departamentoId) {
        await get().fetchPuestosByDepartamento(data.departamentoId)
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updatePuesto: async (id: string, data: UpdatePuestoTrabajoDto) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await puestosTrabajoService.updatePuesto(id, data)
      // Actualizar en el mapa
      const newMap = new Map(get().puestos)
      newMap.forEach((puestos, proyectoId) => {
        const index = puestos.findIndex((p) => p.id === id)
        if (index !== -1) {
          puestos[index] = updated
          newMap.set(proyectoId, [...puestos])
        }
      })
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deletePuesto: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await puestosTrabajoService.deletePuesto(id)
      // Eliminar del mapa
      const newMap = new Map(get().puestos)
      newMap.forEach((puestos, proyectoId) => {
        const filtered = puestos.filter((p) => p.id !== id)
        newMap.set(proyectoId, filtered)
      })
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  asignarEmpleado: async (puestoId: string, empleadoId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await puestosTrabajoService.asignarEmpleado(puestoId, empleadoId)
      // Actualizar en el mapa
      const newMap = new Map(get().puestos)
      newMap.forEach((puestos, proyectoId) => {
        const index = puestos.findIndex((p) => p.id === puestoId)
        if (index !== -1) {
          puestos[index] = updated
          newMap.set(proyectoId, [...puestos])
        }
      })
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  desasignarEmpleado: async (puestoId: string, empleadoId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await puestosTrabajoService.desasignarEmpleado(puestoId, empleadoId)
      // Actualizar en el mapa
      const newMap = new Map(get().puestos)
      newMap.forEach((puestos, proyectoId) => {
        const index = puestos.findIndex((p) => p.id === puestoId)
        if (index !== -1) {
          puestos[index] = updated
          newMap.set(proyectoId, [...puestos])
        }
      })
      set({ puestos: newMap, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
}))
