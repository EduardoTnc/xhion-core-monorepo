import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Obtiene todos los usuarios con sus roles asociados
   * Retorna una lista plana de usuarios con información de rol
   */
  async obtenerTodosLosUsuarios() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        avatarUrl: true,
        fechaNacimiento: true,
        fechaIngreso: true,
        biografia: true,
        estado: true,
        fechaCreacion: true,
        fechaActualizacion: true,
        rolId: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
          },
        },
        contactos: {
          where: {
            tipo: 'telefono_principal',
          },
          select: {
            valor: true,
          },
          take: 1,
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      avatarUrl: usuario.avatarUrl,
      telefono: usuario.contactos[0]?.valor || null,
      fechaNacimiento: usuario.fechaNacimiento,
      fechaIngreso: usuario.fechaIngreso,
      biografia: usuario.biografia,
      estado: usuario.estado,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
      rolId: usuario.rolId,
      rol: usuario.rol,
    }));
  }

  /**
   * Obtiene un usuario por ID con toda su información
   */
  async obtenerUsuarioPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        avatarUrl: true,
        fechaNacimiento: true,
        fechaIngreso: true,
        biografia: true,
        estado: true,
        fechaCreacion: true,
        fechaActualizacion: true,
        rolId: true,
        puestoTrabajoId: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
            permisos: {
              select: {
                permiso: {
                  select: {
                    id: true,
                    nombreAccion: true,
                    descripcion: true,
                  },
                },
              },
            },
          },
        },
        puestoTrabajo: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
          },
        },
        contactos: {
          select: {
            tipo: true,
            valor: true,
          },
        },
      },
    });

    if (!usuario) {
      return null;
    }

    return {
      ...usuario,
      telefono: usuario.contactos.find((c) => c.tipo === 'telefono_principal')?.valor || null,
      rol: {
        ...usuario.rol,
        permisos: usuario.rol.permisos.map((rp) => rp.permiso),
      },
    };
  }

  /**
   * Asignar puesto de trabajo a un usuario
   */
  async asignarPuestoTrabajo(usuarioId: string, puestoTrabajoId: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar que el puesto de trabajo existe
    const puestoTrabajo = await this.prisma.puestoTrabajo.findUnique({
      where: { id: puestoTrabajoId },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!puestoTrabajo) {
      throw new NotFoundException(`Puesto de trabajo con ID ${puestoTrabajoId} no encontrado`);
    }

    // Actualizar el usuario con el nuevo puesto
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        puestoTrabajoId: puestoTrabajoId,
      },
      include: {
        puestoTrabajo: {
          include: {
            departamento: true,
          },
        },
        rol: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return usuarioActualizado;
  }

  /**
   * Remover puesto de trabajo de un usuario
   */
  async removerPuestoTrabajo(usuarioId: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Remover el puesto de trabajo
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        puestoTrabajoId: null,
      },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return usuarioActualizado;
  }

  /**
   * Obtener usuarios sin puesto de trabajo asignado
   */
  async obtenerUsuariosSinPuesto() {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        puestoTrabajoId: null,
      },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        avatarUrl: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
      orderBy: {
        nombreCompleto: 'asc',
      },
    });

    return usuarios;
  }

  /**
   * Asigna un rol a un usuario
   * @param usuarioId - ID del usuario
   * @param rolId - ID del rol a asignar
   */
  async asignarRol(usuarioId: string, rolId: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id: rolId },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
    }

    // Verificar que el rol no está eliminado
    if (rol.fechaEliminacion) {
      throw new BadRequestException(
        `El rol "${rol.nombre}" está eliminado y no puede ser asignado`,
      );
    }

    // Actualizar el rol del usuario
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        rolId: rolId,
      },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
          },
        },
      },
    });

    return {
      message: `Rol "${rol.nombre}" asignado exitosamente al usuario ${usuario.nombreCompleto}`,
      usuario: {
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        rolAnterior: usuario.rol?.nombre,
        rolNuevo: usuarioActualizado.rol.nombre,
      },
    };
  }

  /**
   * Cambia el rol de un usuario
   * (Alias de asignarRol para mayor claridad semántica)
   */
  async cambiarRol(usuarioId: string, nuevoRolId: string) {
    return this.asignarRol(usuarioId, nuevoRolId);
  }

  /**
   * Obtiene todos los usuarios que tienen un rol específico
   * @param rolId - ID del rol
   */
  async obtenerUsuariosPorRol(rolId: string) {
    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id: rolId },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
    }

    // Obtener usuarios con ese rol
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        rolId: rolId,
        fechaEliminacion: null, // Solo usuarios activos
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        avatarUrl: true,
        estado: true,
        fechaIngreso: true,
        puestoTrabajo: {
          select: {
            titulo: true,
            departamento: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        nombreCompleto: 'asc',
      },
    });

    return {
      rol: {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        color: rol.color,
      },
      totalUsuarios: usuarios.length,
      usuarios: usuarios.map((usuario) => ({
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        avatarUrl: usuario.avatarUrl,
        estado: usuario.estado,
        fechaIngreso: usuario.fechaIngreso,
        puesto: usuario.puestoTrabajo?.titulo,
        departamento: usuario.puestoTrabajo?.departamento?.nombre,
      })),
    };
  }

  /**
   * Obtiene estadísticas de usuarios por rol
   * Útil para dashboards y reportes
   */
  async obtenerEstadisticasPorRol() {
    const roles = await this.prisma.rol.findMany({
      where: {
        fechaEliminacion: null,
      },
      include: {
        _count: {
          select: {
            usuarios: {
              where: {
                fechaEliminacion: null,
              },
            },
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    const totalUsuarios = await this.prisma.usuario.count({
      where: {
        fechaEliminacion: null,
      },
    });

    return {
      totalUsuarios,
      roles: roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        color: rol.color,
        cantidadUsuarios: rol._count.usuarios,
        porcentaje:
          totalUsuarios > 0
            ? ((rol._count.usuarios / totalUsuarios) * 100).toFixed(2)
            : '0.00',
      })),
    };
  }

  /**
   * Cambia el estado de un usuario (ACTIVO/INACTIVO)
   * @param usuarioId - ID del usuario
   * @param nuevoEstado - Nuevo estado del usuario
   */
  async cambiarEstado(usuarioId: string, nuevoEstado: 'ACTIVO' | 'INACTIVO') {
    // Validar estado
    if (!['ACTIVO', 'INACTIVO'].includes(nuevoEstado)) {
      throw new BadRequestException(
        'Estado inválido. Debe ser ACTIVO o INACTIVO',
      );
    }

    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        estado: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar si el estado ya es el mismo
    if (usuario.estado === nuevoEstado) {
      return {
        message: `El usuario ya está ${nuevoEstado.toLowerCase()}`,
        usuario: {
          id: usuario.id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          estado: usuario.estado,
        },
      };
    }

    // Actualizar el estado
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        estado: nuevoEstado,
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        estado: true,
      },
    });

    const accion = nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado';

    return {
      message: `Usuario "${usuario.nombreCompleto}" ${accion} exitosamente`,
      usuario: {
        id: usuarioActualizado.id,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        estadoAnterior: usuario.estado,
        estadoNuevo: usuarioActualizado.estado,
      },
    };
  }

  /**
   * Elimina un usuario del sistema (eliminación lógica)
   * @param usuarioId - ID del usuario a eliminar
   */
  async eliminarUsuario(usuarioId: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar si ya está eliminado
    if (usuario.fechaEliminacion) {
      throw new BadRequestException(
        `El usuario "${usuario.nombreCompleto}" ya está eliminado`,
      );
    }

    // Verificar que no sea el último administrador
    if (usuario.rol?.nombre === 'Administrador') {
      const totalAdministradores = await this.prisma.usuario.count({
        where: {
          rol: {
            nombre: 'Administrador',
          },
          fechaEliminacion: null,
        },
      });

      if (totalAdministradores <= 1) {
        throw new BadRequestException(
          'No se puede eliminar el último administrador del sistema',
        );
      }
    }

    // Realizar eliminación lógica
    const usuarioEliminado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        fechaEliminacion: new Date(),
        estado: 'INACTIVO', // Cambiar estado a inactivo al eliminar
      },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        fechaEliminacion: true,
      },
    });

    return {
      message: `Usuario "${usuario.nombreCompleto}" eliminado exitosamente`,
      usuario: {
        id: usuarioEliminado.id,
        nombreCompleto: usuarioEliminado.nombreCompleto,
        email: usuarioEliminado.email,
        eliminadoEn: usuarioEliminado.fechaEliminacion,
      },
    };
  }

  /**
   * Obtiene el perfil completo de un usuario incluyendo proyectos, tareas y perfil profesional
   * @param usuarioId - ID del usuario
   */
  async obtenerPerfilCompleto(usuarioId: string) {
    // Obtener usuario con todas las relaciones necesarias
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true,
              },
            },
          },
        },
        puestoTrabajo: {
          include: {
            departamento: true,
          },
        },
        supervisor: true,
        contactos: true,
        configuraciones: true,
        proyectosResponsable: {
          where: {
            fechaEliminacion: null,
          },
          take: 5,
          orderBy: {
            fechaCreacion: 'desc',
          },
        },
        proyectosComoMiembro: {
          where: {
            proyecto: {
              fechaEliminacion: null,
            },
          },
          include: {
            proyecto: true,
          },
          take: 5,
        },
        tareasAsignadas: {
          where: {
            fechaEliminacion: null,
          },
          include: {
            proyecto: true,
          },
          take: 10,
          orderBy: {
            fechaActualizacion: 'desc',
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Contar estadísticas de proyectos
    const [totalProyectosResponsable, totalProyectosMiembro] = await Promise.all([
      this.prisma.proyecto.count({
        where: {
          responsableId: usuarioId,
          fechaEliminacion: null,
        },
      }),
      this.prisma.proyectoMiembro.count({
        where: {
          usuarioId: usuarioId,
          proyecto: {
            fechaEliminacion: null,
          },
        },
      }),
    ]);

    // Contar estadísticas de tareas
    const [totalTareas, tareasPendientes, tareasEnProgreso, tareasCompletadas] = await Promise.all([
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          fechaEliminacion: null,
        },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          fechaEliminacion: null,
          estado: 'Por_Hacer',
        },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          fechaEliminacion: null,
          estado: 'En_Progreso',
        },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          fechaEliminacion: null,
          estado: 'Hecho',
        },
      }),
    ]);

    // Extraer perfil profesional de configuraciones
    const perfilProfesional = usuario.configuraciones?.[0]?.perfilProfesional || null;

    return {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      avatarUrl: usuario.avatarUrl,
      biografia: usuario.biografia,
      estado: usuario.estado,
      fechaNacimiento: usuario.fechaNacimiento,
      fechaIngreso: usuario.fechaIngreso,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
      archivoCvId: usuario.archivoCvId,
      puntajePerfilCompleto: usuario.puntajePerfilCompleto,
      telefono: usuario.contactos.find((c) => c.tipo === 'telefono_principal')?.valor || null,

      rol: {
        id: usuario.rol.id,
        nombre: usuario.rol.nombre,
        descripcion: usuario.rol.descripcion,
        color: usuario.rol.color,
        totalPermisos: usuario.rol.permisos.length,
      },

      puestoTrabajo: usuario.puestoTrabajo ? {
        id: usuario.puestoTrabajo.id,
        titulo: usuario.puestoTrabajo.titulo,
        descripcion: usuario.puestoTrabajo.descripcion,
        departamento: usuario.puestoTrabajo.departamento ? {
          id: usuario.puestoTrabajo.departamento.id,
          nombre: usuario.puestoTrabajo.departamento.nombre,
        } : null,
      } : null,

      supervisor: usuario.supervisor ? {
        id: usuario.supervisor.id,
        nombreCompleto: usuario.supervisor.nombreCompleto,
        avatarUrl: usuario.supervisor.avatarUrl,
      } : null,

      proyectos: {
        responsable: usuario.proyectosResponsable.map(p => ({
          id: p.id,
          nombre: p.nombre,
          estado: p.estado,
          fechaCreacion: p.fechaCreacion,
        })),
        miembro: usuario.proyectosComoMiembro.map((pm) => ({
          id: pm.proyecto.id,
          nombre: pm.proyecto.nombre,
          estado: pm.proyecto.estado,
        })),
        totalResponsable: totalProyectosResponsable,
        totalMiembro: totalProyectosMiembro,
      },

      tareas: {
        asignadas: usuario.tareasAsignadas.map(t => ({
          id: t.id,
          titulo: t.titulo,
          estado: t.estado,
          prioridad: t.prioridad,
          fechaVencimiento: t.fechaVencimiento,
          proyecto: t.proyecto ? {
            id: t.proyecto.id,
            nombre: t.proyecto.nombre,
          } : null,
        })),
        totalAsignadas: totalTareas,
        pendientes: tareasPendientes,
        enProgreso: tareasEnProgreso,
        completadas: tareasCompletadas,
      },

      perfilProfesional,
    };
  }

  /**
   * Obtiene el historial de tareas de un usuario con paginación
   * @param usuarioId - ID del usuario
   * @param page - Número de página
   * @param limit - Elementos por página
   * @param estado - Filtro opcional por estado
   */
  async obtenerTareasHistorial(
    usuarioId: string,
    page: number = 1,
    limit: number = 10,
    estado?: string,
  ) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const skip = (page - 1) * limit;

    // Construir filtro
    const where: any = {
      asignadoId: usuarioId,
      fechaEliminacion: null,
    };

    // Solo aplicar filtro de estado si es un valor válido (no 'todos' ni vacío)
    const estadosValidos = ['Por_Hacer', 'En_Progreso', 'Hecho', 'Bloqueado'];
    if (estado && estado !== 'todos' && estadosValidos.includes(estado)) {
      where.estado = estado;
    }

    // Obtener tareas y total
    const [tareas, total] = await Promise.all([
      this.prisma.tarea.findMany({
        where,
        include: {
          proyecto: {
            select: {
              id: true,
              nombre: true,
              estado: true,
            },
          },
          asignado: {
            select: {
              id: true,
              nombreCompleto: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          fechaActualizacion: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.tarea.count({ where }),
    ]);

    return {
      data: tareas.map((tarea) => ({
        id: tarea.id,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        estado: tarea.estado,
        prioridad: tarea.prioridad,
        fechaVencimiento: tarea.fechaVencimiento,
        fechaCreacion: tarea.fechaCreacion,
        fechaActualizacion: tarea.fechaActualizacion,
        proyecto: tarea.proyecto,
        asignado: tarea.asignado,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene los proyectos de un usuario con paginación
   * @param usuarioId - ID del usuario
   * @param page - Número de página
   * @param limit - Elementos por página
   * @param rol - Filtro por rol (responsable, miembro, todos)
   */
  async obtenerProyectosUsuario(
    usuarioId: string,
    page: number = 1,
    limit: number = 10,
    rol: string = 'todos',
  ) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const skip = (page - 1) * limit;

    let proyectos: any[] = [];
    let total = 0;

    if (rol === 'responsable' || rol === 'todos') {
      const [proyectosResp, totalResp] = await Promise.all([
        this.prisma.proyecto.findMany({
          where: {
            responsableId: usuarioId,
            fechaEliminacion: null,
          },
          include: {
            responsable: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
            departamento: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
          orderBy: {
            fechaCreacion: 'desc',
          },
          skip: rol === 'responsable' ? skip : 0,
          take: rol === 'responsable' ? limit : undefined,
        }),
        this.prisma.proyecto.count({
          where: {
            responsableId: usuarioId,
            fechaEliminacion: null,
          },
        }),
      ]);

      proyectos = proyectosResp.map((p) => ({
        ...p,
        rolEnProyecto: 'Responsable',
      }));
      total = totalResp;
    }

    if (rol === 'miembro' || rol === 'todos') {
      const [miembrosProyecto, totalMiembros] = await Promise.all([
        this.prisma.proyectoMiembro.findMany({
          where: {
            usuarioId,
            proyecto: {
              fechaEliminacion: null,
            },
          },
          include: {
            proyecto: {
              include: {
                responsable: {
                  select: {
                    id: true,
                    nombreCompleto: true,
                    avatarUrl: true,
                  },
                },
                departamento: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
          orderBy: {
            proyecto: {
              fechaCreacion: 'desc',
            },
          },
          skip: rol === 'miembro' ? skip : 0,
          take: rol === 'miembro' ? limit : undefined,
        }),
        this.prisma.proyectoMiembro.count({
          where: {
            usuarioId,
            proyecto: {
              fechaEliminacion: null,
            },
          },
        }),
      ]);

      const proyectosMiembro = miembrosProyecto.map((m) => ({
        ...m.proyecto,
        rolEnProyecto: 'Miembro',
      }));

      if (rol === 'miembro') {
        proyectos = proyectosMiembro;
        total = totalMiembros;
      } else if (rol === 'todos') {
        proyectos = [...proyectos, ...proyectosMiembro];
        total += totalMiembros;
      }
    }

    // Si es "todos", aplicar paginación manualmente
    if (rol === 'todos') {
      proyectos = proyectos.slice(skip, skip + limit);
    }

    return {
      data: proyectos.map((proyecto) => ({
        id: proyecto.id,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        estado: proyecto.estado,
        fechaInicio: proyecto.fechaInicio,
        fechaFin: proyecto.fechaFin,
        fechaCreacion: proyecto.fechaCreacion,
        responsable: proyecto.responsable,
        departamento: proyecto.departamento,
        rolEnProyecto: proyecto.rolEnProyecto,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================== CONTACT CRUD METHODS ====================

  /**
   * Get all contacts for a user
   * @param usuarioId - User ID
   */
  async obtenerContactos(usuarioId: string) {
    const contactos = await this.prisma.usuarioContacto.findMany({
      where: { usuarioId },
      orderBy: { tipo: 'asc' },
    });
    return contactos;
  }

  /**
   * Add a new contact for a user
   * @param usuarioId - User ID
   * @param data - Contact data
   */
  async agregarContacto(
    usuarioId: string,
    data: { tipo: 'telefono_principal' | 'telefono_secundario' | 'email_personal'; valor: string; esPrivado?: boolean }
  ) {
    // Validate phone number if it's a phone type
    if (data.tipo === 'telefono_principal' || data.tipo === 'telefono_secundario') {
      if (!this.isValidPhoneNumber(data.valor)) {
        throw new BadRequestException('El número de teléfono no es válido. Debe incluir código de país (ej: +51 999888777)');
      }
    }

    // Validate email if it's email type
    if (data.tipo === 'email_personal') {
      if (!this.isValidEmail(data.valor)) {
        throw new BadRequestException('El email no es válido');
      }
    }

    // Check if contact type already exists for user
    const existente = await this.prisma.usuarioContacto.findFirst({
      where: { usuarioId, tipo: data.tipo },
    });

    if (existente) {
      throw new BadRequestException(`Ya existe un contacto de tipo ${data.tipo} para este usuario`);
    }

    const contacto = await this.prisma.usuarioContacto.create({
      data: {
        usuarioId,
        tipo: data.tipo,
        valor: data.valor,
        esPrivado: data.esPrivado ?? true,
      },
    });

    // Update profile completion score
    await this.actualizarPuntajePerfilCompleto(usuarioId);

    return contacto;
  }

  /**
   * Update an existing contact
   * @param contactoId - Contact ID
   * @param usuarioId - User ID (for verification)
   * @param data - Updated data
   */
  async actualizarContacto(
    contactoId: string,
    usuarioId: string,
    data: { valor?: string; esPrivado?: boolean }
  ) {
    const contacto = await this.prisma.usuarioContacto.findUnique({
      where: { id: contactoId },
    });

    if (!contacto) {
      throw new NotFoundException('Contacto no encontrado');
    }

    if (contacto.usuarioId !== usuarioId) {
      throw new BadRequestException('No tienes permiso para editar este contacto');
    }

    // Validate phone number if updating valor for phone types
    if (data.valor && (contacto.tipo === 'telefono_principal' || contacto.tipo === 'telefono_secundario')) {
      if (!this.isValidPhoneNumber(data.valor)) {
        throw new BadRequestException('El número de teléfono no es válido. Debe incluir código de país (ej: +51 999888777)');
      }
    }

    // Validate email if updating valor for email type
    if (data.valor && contacto.tipo === 'email_personal') {
      if (!this.isValidEmail(data.valor)) {
        throw new BadRequestException('El email no es válido');
      }
    }

    return this.prisma.usuarioContacto.update({
      where: { id: contactoId },
      data,
    });
  }

  /**
   * Delete a contact
   * @param contactoId - Contact ID
   * @param usuarioId - User ID (for verification)
   */
  async eliminarContacto(contactoId: string, usuarioId: string) {
    const contacto = await this.prisma.usuarioContacto.findUnique({
      where: { id: contactoId },
    });

    if (!contacto) {
      throw new NotFoundException('Contacto no encontrado');
    }

    if (contacto.usuarioId !== usuarioId) {
      throw new BadRequestException('No tienes permiso para eliminar este contacto');
    }

    await this.prisma.usuarioContacto.delete({
      where: { id: contactoId },
    });

    // Update profile completion score
    await this.actualizarPuntajePerfilCompleto(usuarioId);

    return { message: 'Contacto eliminado exitosamente' };
  }

  // ==================== PROFESSIONAL LINKS CRUD METHODS ====================

  /**
   * Get all professional links for a user
   * @param usuarioId - User ID
   */
  async obtenerEnlacesProfesionales(usuarioId: string) {
    const enlaces = await this.prisma.usuarioEnlaceProfesional.findMany({
      where: { usuarioId },
      orderBy: { tipo: 'asc' },
    });
    return enlaces;
  }

  /**
   * Add a new professional link for a user
   * @param usuarioId - User ID
   * @param data - Link data
   */
  async agregarEnlaceProfesional(
    usuarioId: string,
    data: { tipo: 'linkedin' | 'portafolio_personal' | 'blog_tecnico'; url: string }
  ) {
    // Check if link type already exists for user
    const existente = await this.prisma.usuarioEnlaceProfesional.findFirst({
      where: { usuarioId, tipo: data.tipo },
    });

    if (existente) {
      throw new BadRequestException(`Ya existe un enlace de tipo ${data.tipo} para este usuario`);
    }

    const enlace = await this.prisma.usuarioEnlaceProfesional.create({
      data: {
        usuarioId,
        tipo: data.tipo,
        url: data.url,
      },
    });

    // Update profile completion score
    await this.actualizarPuntajePerfilCompleto(usuarioId);

    return enlace;
  }

  /**
   * Update an existing professional link
   * @param enlaceId - Link ID
   * @param usuarioId - User ID (for verification)
   * @param data - Updated data
   */
  async actualizarEnlaceProfesional(
    enlaceId: string,
    usuarioId: string,
    data: { url?: string }
  ) {
    const enlace = await this.prisma.usuarioEnlaceProfesional.findUnique({
      where: { id: enlaceId },
    });

    if (!enlace) {
      throw new NotFoundException('Enlace profesional no encontrado');
    }

    if (enlace.usuarioId !== usuarioId) {
      throw new BadRequestException('No tienes permiso para editar este enlace');
    }

    return this.prisma.usuarioEnlaceProfesional.update({
      where: { id: enlaceId },
      data,
    });
  }

  /**
   * Delete a professional link
   * @param enlaceId - Link ID
   * @param usuarioId - User ID (for verification)
   */
  async eliminarEnlaceProfesional(enlaceId: string, usuarioId: string) {
    const enlace = await this.prisma.usuarioEnlaceProfesional.findUnique({
      where: { id: enlaceId },
    });

    if (!enlace) {
      throw new NotFoundException('Enlace profesional no encontrado');
    }

    if (enlace.usuarioId !== usuarioId) {
      throw new BadRequestException('No tienes permiso para eliminar este enlace');
    }

    await this.prisma.usuarioEnlaceProfesional.delete({
      where: { id: enlaceId },
    });

    // Update profile completion score
    await this.actualizarPuntajePerfilCompleto(usuarioId);

    return { message: 'Enlace profesional eliminado exitosamente' };
  }

  // ==================== PROFILE COMPLETION HELPER ====================

  /**
   * Update the profile completion score for a user
   * @param usuarioId - User ID
   */
  private async actualizarPuntajePerfilCompleto(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        contactos: true,
        enlacesProfesionales: true,
      },
    });

    if (!usuario) return;

    let puntaje = 0;
    const maxPuntaje = 100;

    // Basic info (40 points)
    if (usuario.nombreCompleto) puntaje += 10;
    if (usuario.biografia) puntaje += 10;
    if (usuario.fechaNacimiento) puntaje += 5;
    if (usuario.avatarUrl) puntaje += 10;
    if (usuario.fechaIngreso) puntaje += 5;

    // Contact info (20 points)
    if (usuario.contactos.some(c => c.tipo === 'telefono_principal')) puntaje += 10;
    if (usuario.contactos.some(c => c.tipo === 'email_personal')) puntaje += 5;
    if (usuario.contactos.some(c => c.tipo === 'telefono_secundario')) puntaje += 5;

    // Professional links (15 points)
    if (usuario.enlacesProfesionales.some(e => e.tipo === 'linkedin')) puntaje += 10;
    if (usuario.enlacesProfesionales.some(e => e.tipo === 'portafolio_personal')) puntaje += 5;

    // Personal info (15 points)
    if (usuario.direccionResidencia) puntaje += 5;
    if (usuario.ciudadResidencia && usuario.paisResidencia) puntaje += 5;
    if (usuario.nacionalidad) puntaje += 5;

    // Professional extensions (10 points)
    if (usuario.tituloAcademico) puntaje += 5;
    if (usuario.certificaciones && usuario.certificaciones.length > 0) puntaje += 5;

    // Ensure puntaje doesn't exceed maxPuntaje
    puntaje = Math.min(puntaje, maxPuntaje);

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { puntajePerfilCompleto: puntaje },
    });
  }

  // ==================== PHONE & EMAIL VALIDATION HELPERS ====================

  /**
   * Validate phone number format (ITU-T E.164 compliant)
   * Supports international format: +[country code] [number]
   * @param phone - Phone number to validate
   */
  private isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;

    // Remove all formatting characters to count digits
    const digitsOnly = phone.replace(/[^\d]/g, '');

    // Must have between 7 and 15 digits (ITU-T E.164 standard)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return false;
    }

    // Check format with regex - allows various formatting
    const phoneRegex = /^\+?[1-9]\d{0,3}[\s.\-]?\(?\d{1,4}\)?[\s.\-]?\d{1,5}[\s.\-]?\d{1,5}[\s.\-]?\d{0,5}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate email format
   * @param email - Email to validate
   */
  private isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  // ==================== USER IDEAS ====================

  /**
   * Obtiene las ideas creadas por un usuario
   * @param usuarioId - ID del usuario
   */
  async obtenerIdeasUsuario(usuarioId: string) {
    // Verify user exists
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const ideas = await this.prisma.idea.findMany({
      where: { autorId: usuarioId },
      include: {
        _count: {
          select: {
            votos: true,
            comentarios: true,
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    // Get ideas voted by user
    const ideasVotadas = await this.prisma.votoIdea.findMany({
      where: { usuarioId },
      include: {
        idea: {
          include: {
            autor: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                votos: true,
                comentarios: true,
              },
            },
          },
        },
      },
    });

    return {
      creadas: ideas,
      votadas: ideasVotadas.map(v => v.idea),
      totalCreadas: ideas.length,
      totalVotadas: ideasVotadas.length,
      estadisticas: {
        pendientes: ideas.filter(i => i.estado === 'Evaluating').length,
        aprobadas: ideas.filter(i => i.estado === 'Approved').length,
        enDesarrollo: ideas.filter(i => i.estado === 'InDevelopment').length,
        implementadas: ideas.filter(i => i.estado === 'Implemented').length,
        rechazadas: ideas.filter(i => i.estado === 'Rejected').length,
      },
    };
  }

  // ==================== USER ACTIVITY ====================

  /**
   * Obtiene el historial de actividad de un usuario
   * @param usuarioId - ID del usuario
   * @param limit - Límite de registros
   */
  async obtenerActividadUsuario(usuarioId: string, limit: number = 50) {
    // Verify user exists
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const actividad = await this.prisma.registroAuditoria.findMany({
      where: { usuarioId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        accion: true,
        detalles: true,
        timestamp: true,
        direccionIp: true,
      },
    });

    // Get last login
    const ultimoLogin = await this.prisma.registroAuditoria.findFirst({
      where: {
        usuarioId,
        accion: { contains: 'login', mode: 'insensitive' },
      },
      orderBy: { timestamp: 'desc' },
    });

    return {
      actividad,
      ultimoLogin: ultimoLogin?.timestamp || null,
      totalAcciones: actividad.length,
    };
  }

  // ==================== USER ANALYTICS ====================

  /**
   * Obtiene analytics avanzados de un usuario para Magnus IA
   * @param usuarioId - ID del usuario
   */
  async obtenerAnalyticsUsuario(usuarioId: string) {
    // Verify user exists
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: true,
        puestoTrabajo: {
          include: {
            departamento: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Task analytics
    const [
      tareasCompletadasSemana,
      tareasCompletadasSemanaAnterior,
      tareasCompletadasMes,
      tareasEnProgreso,
      tareasPendientes,
      tareasVencidas,
    ] = await Promise.all([
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          estado: 'Hecho',
          fechaActualizacion: { gte: startOfWeek },
        },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          estado: 'Hecho',
          fechaActualizacion: { gte: startOfLastWeek, lt: startOfWeek },
        },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          estado: 'Hecho',
          fechaActualizacion: { gte: startOfMonth },
        },
      }),
      this.prisma.tarea.count({
        where: { asignadoId: usuarioId, estado: 'En_Progreso' },
      }),
      this.prisma.tarea.count({
        where: { asignadoId: usuarioId, estado: 'Por_Hacer' },
      }),
      this.prisma.tarea.count({
        where: {
          asignadoId: usuarioId,
          fechaVencimiento: { lt: now },
          estado: { not: 'Hecho' },
        },
      }),
    ]);

    // Project analytics
    const proyectosActivos = await this.prisma.proyecto.count({
      where: {
        OR: [
          { responsableId: usuarioId },
          { miembros: { some: { usuarioId } } },
        ],
        estado: 'Activo',
      },
    });

    // Collaboration analytics (comments, mentions)
    const comentariosSemana = await this.prisma.comentario.count({
      where: {
        usuarioId: usuarioId,
        fechaCreacion: { gte: startOfWeek },
      },
    });

    // Calculate trends
    const tendenciaTareas = tareasCompletadasSemanaAnterior > 0
      ? Math.round(((tareasCompletadasSemana - tareasCompletadasSemanaAnterior) / tareasCompletadasSemanaAnterior) * 100)
      : tareasCompletadasSemana > 0 ? 100 : 0;

    // Calculate workload
    const cargaTrabajo = tareasPendientes + tareasEnProgreso;
    const cargaTrabajoNivel = cargaTrabajo > 10 ? 'alta' : cargaTrabajo > 5 ? 'media' : 'baja';

    // Generate AI insights
    const insights: { tipo: 'success' | 'warning' | 'info' | 'tip'; texto: string }[] = [];

    if (tareasCompletadasSemana > tareasCompletadasSemanaAnterior) {
      insights.push({
        tipo: 'success',
        texto: `Productividad aumentó ${tendenciaTareas}% esta semana (${tareasCompletadasSemana} tareas completadas)`,
      });
    }

    if (tareasVencidas > 0) {
      insights.push({
        tipo: 'warning',
        texto: `${tareasVencidas} tarea(s) vencida(s) requieren atención inmediata`,
      });
    }

    if (cargaTrabajoNivel === 'alta') {
      insights.push({
        tipo: 'warning',
        texto: `Carga de trabajo elevada: ${cargaTrabajo} tareas activas. Considerar redistribución.`,
      });
    }

    if (proyectosActivos > 3) {
      insights.push({
        tipo: 'info',
        texto: `Participando en ${proyectosActivos} proyectos activos simultáneamente`,
      });
    }

    if (comentariosSemana > 10) {
      insights.push({
        tipo: 'success',
        texto: `Alta colaboración: ${comentariosSemana} interacciones esta semana`,
      });
    }

    // Get tenure
    const fechaIngreso = usuario.fechaIngreso || usuario.fechaCreacion;
    const antiguedadMeses = Math.floor((now.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Experience-based recommendations
    if (antiguedadMeses >= 24 && usuario.rol?.nombre !== 'Administrador') {
      insights.push({
        tipo: 'tip',
        texto: `${antiguedadMeses} meses de antigüedad. Considerar para roles de mayor responsabilidad.`,
      });
    }

    return {
      productividad: {
        tareasCompletadasSemana,
        tareasCompletadasSemanaAnterior,
        tareasCompletadasMes,
        tendencia: tendenciaTareas,
      },
      estadoActual: {
        tareasEnProgreso,
        tareasPendientes,
        tareasVencidas,
        proyectosActivos,
      },
      colaboracion: {
        comentariosSemana,
      },
      cargaTrabajo: {
        total: cargaTrabajo,
        nivel: cargaTrabajoNivel,
      },
      perfil: {
        antiguedadMeses,
        rol: usuario.rol?.nombre || 'Sin rol',
        departamento: usuario.puestoTrabajo?.departamento?.nombre || 'Sin departamento',
      },
      insights,
    };
  }
}

