/**
 * Tipos compartidos para el módulo de Departamentos
 * Evita duplicación y conflictos de tipos entre componentes
 */

export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  avatarUrl?: string;
  puestoTrabajo?: {
    id: string;
    titulo: string;
  };
  rol?: {
    nombre: string;
    color?: string;
  };
}

export interface UsuarioSinPuesto {
  id: string;
  nombreCompleto: string;
  email: string;
  avatarUrl?: string;
  rol?: {
    nombre: string;
    color?: string;
  };
}

export interface PuestoTrabajo {
  id: string;
  titulo: string;
  descripcion?: string;
  departamentoId?: string;
  nivel?: number;
  responsabilidades?: string;
  puestoSuperiorId?: string;
  empleadoAsignado?: Usuario;
}

export interface Departamento {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  jefeId?: string;
  jefe?: Usuario;
  empleados?: Usuario[];
  puestosTrabajo?: PuestoTrabajo[];
}
