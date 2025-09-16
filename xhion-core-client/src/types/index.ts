// src/types/index.ts

const EstadoUsuario = {
    INVITADO: 'INVITADO',
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO',
    SUSPENDIDO: 'SUSPENDIDO',
    BLOQUEADO: 'BLOQUEADO',
    ELIMINADO: 'ELIMINADO'
} as const

export interface Departamento {
    id: string;
    nombre: string;
    fechaCreacion: Date;
    fechaEliminacion: Date | null;
}

export interface PuestoTrabajo {
    id: string;
    titulo: string;
    descripcion: string | null;
    departamentoId: string;
}

export interface Rol {
    id: string;
    nombre: string;
    descripcion: string | null;
    fechaEliminacion: Date | null;
}

export interface Usuario {
    id: string;
    nombreCompleto: string;
    email: string;
    passwordHash: string | null;
    estado: typeof EstadoUsuario;
    rolId: string;
    puestoTrabajoId: string | null;
    supervisorId: string | null;
    avatarUrl: string | null;
    biografia: string | null;
    fechaNacimiento: Date | null;
    fechaIngreso: Date | null;
    archivoCvId: string | null;
    puntajePerfilCompleto: number;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    fechaEliminacion: Date | null;
}

export interface Invitacion {
    id: string;
    email: string;
    rolId: string;
    departamentoId: string | null;
    token: string;
    fechaExpiracion: Date;
    fueUtilizada: boolean;
    invitadoPorId: string;
    fechaCreacion: Date;
}

const TipoContacto = {
    telefono_principal: 'telefono_principal',
    telefono_secundario: 'telefono_secundario',
    email_personal: 'email_personal',
} as const

export interface UsuarioContacto {
    id: string;
    usuarioId: string;
    tipo: typeof TipoContacto;
    valor: string;
    esPrivado: boolean;
}

const TipoEnlaceProfesional = {
    linkedin: 'linkedin',
    portafolio_personal: 'portafolio_personal',
    blog_tecnico: 'blog_tecnico',
} as const

export interface UsuarioEnlaceProfesional {
    id: string;
    usuarioId: string;
    tipo: typeof TipoEnlaceProfesional;
    url: string;
}

const CategoriaHabilidad = {
    frontend: 'frontend',
    backend: 'backend',
    devops: 'devops',
    diseno_ui_ux: 'diseno_ui_ux',
    gestion_proyectos: 'gestion_proyectos',
    habilidad_blanda: 'habilidad_blanda',
} as const

export interface Habilidad {
    id: string;
    nombre: string;
    categoria: typeof CategoriaHabilidad;
}

const NivelHabilidad = {
    basico: 'basico',
    intermedio: 'intermedio',
    avanzado: 'avanzado',
    experto: 'experto',
} as const

export interface UsuarioHabilidad {
    usuarioId: string;
    habilidadId: string;
    nivel: typeof NivelHabilidad;
    sugeridoPorIa: boolean;
}

export interface Proyecto {
  
}