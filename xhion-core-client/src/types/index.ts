// src/types/index.ts

// Este archivo contiene todas las definiciones de tipos de TypeScript para las entidades
// de la base de datos. Sirve como un contrato entre el frontend y el backend,
// asegurando que los datos se manejen de manera consistente y segura en toda la aplicación.

// --- ENUMS (Directamente del schema.prisma) ---

const EstadoUsuario = {
    INVITADO: 'INVITADO',
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO',
    SUSPENDIDO: 'SUSPENDIDO',
    BLOQUEADO: 'BLOQUEADO',
    ELIMINADO: 'ELIMINADO'
} as const;

const EstadoProyecto = {
    Activo: 'Activo',
    Completado: 'Completado',
    En_Pausa: 'En_Pausa',
    Archivado: 'Archivado',
} as const;

const EstadoTarea = {
    Por_Hacer: 'Por_Hacer',
    En_Progreso: 'En_Progreso',
    Hecho: 'Hecho',
    Bloqueado: 'Bloqueado',
} as const;

const TipoContacto = {
    telefono_principal: 'telefono_principal',
    telefono_secundario: 'telefono_secundario',
    email_personal: 'email_personal',
} as const;

const TipoEnlaceProfesional = {
    linkedin: 'linkedin',
    portafolio_personal: 'portafolio_personal',
    blog_tecnico: 'blog_tecnico',
} as const;

const NivelHabilidad = {
    Basico: 'Basico',
    Intermedio: 'Intermedio',
    Avanzado: 'Avanzado',
    Experto: 'Experto',
} as const;

const CategoriaHabilidad = {
    Frontend: 'Frontend',
    Backend: 'Backend',
    DevOps: 'DevOps',
    Diseno_UI_UX: 'Diseno_UI_UX',
    Gestion_Proyectos: 'Gestion_Proyectos',
    Habilidad_Blanda: 'Habilidad_Blanda',
} as const;

const TipoCanal = {
    directo: 'directo',
    grupo_privado: 'grupo_privado',
    proyecto: 'proyecto',
    anuncios_departamento: 'anuncios_departamento',
} as const;

const RolCanal = {
    miembro: 'miembro',
    admin: 'admin',
} as const;

const TipoDatoConfiguracion = {
    booleano: 'booleano',
    texto: 'texto',
    numero: 'numero',
    seleccion: 'seleccion',
} as const;

const PeriodoClasificacion = {
    diario: 'diario',
    semanal: 'semanal',
    mensual: 'mensual',
    trimestral: 'trimestral',
    historico: 'historico',
} as const;

// Tipos exportados a partir de los enums anteriores (mismo nombre usable como tipo)
export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];
export type EstadoProyecto = typeof EstadoProyecto[keyof typeof EstadoProyecto];
export type EstadoTarea = typeof EstadoTarea[keyof typeof EstadoTarea];
export type TipoContacto = typeof TipoContacto[keyof typeof TipoContacto];
export type TipoEnlaceProfesional = typeof TipoEnlaceProfesional[keyof typeof TipoEnlaceProfesional];
export type NivelHabilidad = typeof NivelHabilidad[keyof typeof NivelHabilidad];
export type CategoriaHabilidad = typeof CategoriaHabilidad[keyof typeof CategoriaHabilidad];
export type TipoCanal = typeof TipoCanal[keyof typeof TipoCanal];
export type RolCanal = typeof RolCanal[keyof typeof RolCanal];
export type TipoDatoConfiguracion = typeof TipoDatoConfiguracion[keyof typeof TipoDatoConfiguracion];
export type PeriodoClasificacion = typeof PeriodoClasificacion[keyof typeof PeriodoClasificacion];

// ... puedes añadir el resto de los enums si los necesitas en la lógica del frontend ...

// --- TIPOS DE MODELOS (Entidades de la base de datos) ---


export interface Departamento {
    id: string;
    nombre: string;
    fechaCreacion: string;
    fechaEliminacion?: string;

    puestosTrabajo: PuestoTrabajo[];
    proyectos: Proyecto[];
    invitaciones: Invitacion[];
}

export interface PuestoTrabajo {
    id: string;
    titulo: string;
    descripcion?: string | null;
    departamentoId: string;

    departamento?: Departamento;
    usuarios: Usuario[];
}

export interface Rol {
    id: string;
    nombre: string;
    descripcion?: string | null;
    color: string; // Color del rol (clase Tailwind o hex)
    fechaEliminacion?: string;

    usuarios: Usuario[];
    permisos: RolPermiso[];
    catalogoConfiguraciones: CatalogoConfiguracion[];
    plantillaDashboard?: PlantillaDashboard | null;
    
    catalogoWidgets: CatalogoWidget[];
    invitaciones: Invitacion[];
}

// El tipo Usuario es complejo y a menudo se pide con sus relaciones
export interface Usuario {
    id: string;
    nombreCompleto: string;
    email: string;
    passwordHash?: string | null;
    estado: EstadoUsuario;
    rolId: string;
    puestoTrabajoId?: string | null;
    supervisorId?: string;
    avatarUrl?: string | null;
    biografia?: string | null;
    fechaNacimiento?: string | null; // ISO Date String
    fechaIngreso?: string | null; // ISO Date String
    archivoCvId?: string | null;
    puntajePerfilCompleto?: number;
    fechaCreacion?: string | null; // ISO Date String
    fechaActualizacion?: string | null; // ISO Date String
    fechaEliminacion?: string | null; // ISO Date String

    invitaciones_enviadas: Invitacion[];
    rol: Rol;
    puestoTrabajo?: PuestoTrabajo | null;
    supervisor?: Usuario | null;
    subordinados: Usuario[];
    archivoCv?: Archivo | null;
    contactos: UsuarioContacto[];
    enlacesProfesionales: UsuarioEnlaceProfesional[];
    habilidades: UsuarioHabilidad[];
    proyectosResponsable: Proyecto[];
    tareasAsignadas: Tarea[];
    tareasCreadas: Tarea[];
    comentarios: Comentario[];
    plantillasProyectoCreadas: PlantillaProyectoIA[];
    logsQueriesIA: AiQueryLog[];
    archivosSubidos: Archivo[];
    canalesCreados: Canal[];
    miembroDeCanales: CanalMiembro[];
    mensajesEnviados: Mensaje[];
    estadosLecturaMensajes: MensajeEstadoLectura[];
    configuraciones: ConfiguracionUsuario[];
    dashboardsPropios: DashboardUsuario[];
    logros: UsuarioLogro[];
    registrosPuntos: RegistroPuntos[];
    entradasClasificacion: ClasificacionEntrada[];
    registrosAuditoria: RegistroAuditoria[];
}

export interface Archivo {
    id: string;
    nombreArchivo: string;
    urlArchivo: string;
    tipoArchivo?: string | null;
    tamanoBytes?: number | null;
    subidoPorId: string;
    fechaCreacion: string; // ISO Date String
    fechaEliminacion?: string | null; // ISO Date String

    // Relaciones
    subidoPor?: UsuarioSimple; // Relación con el usuario que sube
    cvDeUsuario?: UsuarioSimple | null;
    adjuntos?: ArchivoAdjunto[];
}

// Tipo simplificado para listas o asignaciones
export interface UsuarioSimple {
    id: string;
    nombreCompleto: string;
    avatarUrl?: string | null;
}

export interface Tarea {
    id: string;
    titulo: string;
    descripcion?: string | null;
    estado: EstadoTarea;
    fechaVencimiento?: string | null; // ISO Date String
    proyectoId: string;
    asignadoId?: string | null;
    creadorId: string;
    resumenIa?: string | null;
    fechaCreacion: string; // ISO Date String
    fechaActualizacion?: string; // ISO Date String
    fechaCompletado?: string | null; // ISO Date String
    fechaEliminacion?: string | null; // ISO Date String

    // Relaciones que podrías incluir en las respuestas de la API
    proyecto?: Proyecto;
    asignado?: UsuarioSimple | null;
    creador?: UsuarioSimple;
    comentarios?: Comentario[];
    archivos?: Archivo[]; // A través de archivos_adjuntos
}

export interface Comentario {
    id: string;
    contenido: string;
    usuarioId: string;
    tareaId: string;
    fechaCreacion: string; // ISO Date String
    usuario: UsuarioSimple; // Incluimos al autor del comentario
    // Relación opcional de conveniencia
    tarea?: Tarea;
}

export interface Proyecto {
    id: string;
    nombre: string;
    descripcion?: string | null;
    estado: EstadoProyecto;
    responsableId: string;
    departamentoId?: string | null;
    fechaCreacion: string; // ISO Date String
    fechaActualizacion?: string; // ISO Date String
    fechaEliminacion?: string | null; // ISO Date String
    usaEtapas?: boolean;

    // Relaciones que podrías incluir en las respuestas de la API
    responsable: UsuarioSimple;
    departamento?: Departamento | null;
    tareas: Tarea[];
}

export interface Logro {
    id: string;
    nombre: string;
    descripcion: string;
    urlIcono?: string | null;
    puntosRecompensa: number;
}

export interface UsuarioLogro {
    usuarioId: string;
    logroId: string;
    fechaDesbloqueo: string; // ISO Date String
    logro: Logro; // Para mostrar los detalles del logro
}

export interface ClasificacionEntrada {
    id?: string;
    clasificacionId?: string;
    usuarioId?: string;
    posicion: number;
    puntaje: number;
    fechaActualizacion?: string; // ISO Date String
    usuario: UsuarioSimple;
}

export interface Clasificacion {
    id: string;
    nombre: string;
    periodo: PeriodoClasificacion;
    fechaInicio: string; // ISO Date String
    fechaFin: string; // ISO Date String
    estaActiva: boolean;

    entradas: ClasificacionEntrada[];
}

// --- TIPOS PARA LA LÓGICA DE LA APLICACIÓN ---

// Tipo para el estado del usuario en el store de Zustand
export interface AuthUser extends UsuarioSimple {
    email: string;
    rol: string; // Simplificamos a solo el nombre del rol
    permisos: string[]; // Un array con los nombres de las acciones permitidas
    biografia?: string | null;
    fechaNacimiento?: string | null;
    fechaIngreso?: string | null;
    archivoCvId?: string | null;
    puestoTrabajo?: {
        id: string;
        nombre: string;
    } | null;
    supervisor?: UsuarioSimple | null;
    puntajePerfilCompleto?: number;
}

// Tipo para el payload de un JWT decodificado
export interface JwtPayload {
    id: string;
    email: string;
    rol: string;
    iat: number;
    exp: number;
}

// Tipo para la configuración de un widget en el dashboard
export interface WidgetInstancia {
id: string;
dashboardId: string;
widgetCatalogoId: string;
// Campo de conveniencia para el frontend (se puede derivar de CatalogoWidget)
tipoWidget?: string; // Ej: "lista_tareas_pendientes"
tituloPersonalizado?: string | null;
configuracionEspecifica?: any; // JSON
posX: number;
posY: number;
ancho: number;
alto: number;

// Relaciones
dashboard?: DashboardUsuario;
widgetCatalogo?: CatalogoWidget;
}

// Tipo para la configuración de un dashboard completo
export interface DashboardUsuario {
id: string;
nombre: string;
propietarioId: string;
fechaCreacion: string; // ISO
fechaEliminacion?: string | null; // ISO

propietario?: UsuarioSimple;
widgets: WidgetInstancia[];
}

// Alias de compatibilidad con versiones anteriores
export type Dashboard = DashboardUsuario;

// --- TIPOS PARA PAYLOADS DE API (DTOs - Data Transfer Objects) ---
// Es una buena práctica definir los tipos para los datos que se envían a la API

export type CrearProyectoDTO = Omit<Proyecto, 'id' | 'fechaCreacion' | 'responsable' | 'departamento' | 'tareas'> & {
    responsableId: string;
    departamentoId?: string;
};

export type CrearTareaDTO = {
    titulo: string;
    descripcion?: string;
    proyectoId: string;
    asignadoId?: string;
    fechaVencimiento?: string;
};

export type ActualizarTareaDTO = Partial<Omit<CrearTareaDTO, 'proyectoId'>> & {
    estado?: EstadoTarea;
};

// --- MODELOS ADICIONALES (completando el esquema) ---

export interface Invitacion {
    id: string;
    email: string;
    nombre_completo: string;
    rol_id: string;
    departamento_id?: string | null;
    token: string;
    fecha_expiracion: string; // ISO
    fue_utilizada: boolean;
    invitado_por_id: string;
    fecha_creacion: string; // ISO

    // Relaciones
    invitado_por?: UsuarioSimple;
    rol?: Rol;
    departamento?: Departamento | null;
}

export interface UsuarioContacto {
    id: string;
    usuarioId: string;
    tipo: TipoContacto;
    valor: string;
    esPrivado: boolean;

    usuario?: UsuarioSimple;
}

export interface UsuarioEnlaceProfesional {
    id: string;
    usuarioId: string;
    tipo: TipoEnlaceProfesional;
    url: string;

    usuario?: UsuarioSimple;
}

export interface Habilidad {
    id: string;
    nombre: string;
    categoria?: CategoriaHabilidad | null;

    usuarios: UsuarioHabilidad[];
}

export interface UsuarioHabilidad {
    usuarioId: string;
    habilidadId: string;
    nivel?: NivelHabilidad | null;
    sugeridoPorIa: boolean;

    usuario?: UsuarioSimple;
    habilidad?: Habilidad;
}

export interface PlantillaProyectoIA {
    id: string;
    nombrePlantilla: string;
    descripcion?: string | null;
    promptGenerador: string;
    estructuraJson: any; // JSON
    creadoPorId?: string | null;
    fechaCreacion: string; // ISO

    creadoPor?: UsuarioSimple | null;
}

export interface AiQueryLog {
    id: string;
    usuarioId: string;
    consultaLenguajeNatural: string;
    consultaSqlGenerada?: string | null;
    estadoEjecucion: string;
    fueUtil?: boolean | null;
    fechaCreacion: string; // ISO

    usuario?: UsuarioSimple;
}

export interface ArchivoAdjunto {
    archivoId: string;
    entidadPadreTipo: string;
    entidadPadreId: string;

    archivo?: Archivo;
}

export interface Canal {
    id: string;
    nombre?: string | null;
    tipo: TipoCanal;
    descripcion?: string | null;
    entidadAsociadaTipo?: string | null;
    entidadAsociadaId?: string | null;
    creadorId?: string | null;
    fechaCreacion: string; // ISO

    creador?: UsuarioSimple | null;
    miembros: CanalMiembro[];
    mensajes: Mensaje[];
    estadosLectura: MensajeEstadoLectura[];
}

export interface CanalMiembro {
    canalId: string;
    usuarioId: string;
    fechaUnion: string; // ISO
    rol: RolCanal;

    canal?: Canal;
    usuario?: UsuarioSimple;
}

export interface Mensaje {
    id: string;
    canalId: string;
    remitenteId: string;
    contenido?: string | null;
    mensajePadreId?: string | null;
    fechaCreacion: string; // ISO
    fechaActualizacion: string; // ISO
    fechaEliminacion?: string | null; // ISO

    canal?: Canal;
    remitente?: UsuarioSimple;
    mensajePadre?: Mensaje | null;
    respuestas?: Mensaje[];
    estadosLectura?: MensajeEstadoLectura[];
}

export interface MensajeEstadoLectura {
    mensajeId: string;
    usuarioId: string;
    canalId: string;
    fechaLectura: string; // ISO

    mensaje?: Mensaje;
    usuario?: UsuarioSimple;
    canal?: Canal;
}

export interface CatalogoConfiguracion {
    id: string;
    clave: string;
    nombreVisible: string;
    descripcion?: string | null;
    tipoDato: TipoDatoConfiguracion;
    valorPorDefecto: string;
    rolMinimoRequeridoId: string;

    rolMinimoRequerido?: Rol;
    valoresUsuario: ConfiguracionUsuario[];
}

export interface ConfiguracionUsuario {
    usuarioId: string;
    configuracionId: string;
    valor: string;

    usuario?: UsuarioSimple;
    configuracion?: CatalogoConfiguracion;
}

export interface CatalogoWidget {
    id: string;
    tipoWidget: string;
    nombreVisible: string;
    descripcion?: string | null;
    rolMinimoRequeridoId: string;

    rolMinimoRequerido?: Rol;
    instancias: WidgetInstancia[];
}

export interface PlantillaDashboard {
    id: string;
    nombre: string;
    rolId: string;
    configuracionWidgets: any; // JSON

    rol?: Rol;
}

export interface RegistroPuntos {
    id: string;
    usuarioId: string;
    puntos: number;
    motivo: string;
    tipoOrigen?: string | null;
    idOrigen?: string | null;
    fechaCreacion: string; // ISO

    usuario?: UsuarioSimple;
}

export interface Permiso {
    id: string;
    nombreAccion: string;
    descripcion?: string | null;

    roles: RolPermiso[];
}

export interface RolPermiso {
    rolId: string;
    permisoId: string;
    permiso?: Permiso;
}

// Tipos específicos para el módulo de roles
export interface RolConConteo extends Rol {
    _count: {
        usuarios: number;
    };
}

export interface RolCompleto extends Rol {
    permisos: RolPermiso[];
    _count: {
        usuarios: number;
    };
}

export interface UsuarioEnRol {
    id: string;
    nombreCompleto: string;
    email: string;
    avatarUrl?: string | null;
    estado: EstadoUsuario;
    fechaIngreso?: string | null;
    creadoEn?: string | null;
    actualizadoEn?: string | null;
    rolId: string;
    puestoTrabajo?: {
        titulo: string;
        descripcion?: string | null;
    } | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface RegistroAuditoria {
    id: string;
    usuarioId?: string | null;
    accion: string;
    detalles?: any; // JSON
    direccionIp?: string | null;
    timestamp: string; // ISO

    usuario?: UsuarioSimple | null;
}

// --- DTOs para Autenticación ---

export interface LoginDTO {
    email: string;
    password: string;
}

export interface CompletarRegistroDTO {
    token: string;
    password: string;
    // Campos opcionales del perfil
    avatarUrl?: string;
    telefono?: string;
    fechaNacimiento?: string;
    biografia?: string;
}

export interface Sesion {
    id: string;
    usuarioId: string;
    refreshTokenHash: string;
    userAgent: string | null;
    direccionIp: string | null;
    creadaEn: string; // ISO
    actualizadaEn: string; // ISO
    revocadaEn: string | null; // ISO
}