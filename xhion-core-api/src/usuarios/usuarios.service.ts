import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

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
}
