import type { Proyecto, Tarea } from "../types";

interface ProjectState {
    proyecto: Proyecto | null;
    tareas: Tarea[];
    isLoading: boolean;
    fetchProyecto: (id: string) => Promise<void>;
    actualizarEstadoTarea: (tareaId: string, nuevoEstado: string) => Promise<void>;
}