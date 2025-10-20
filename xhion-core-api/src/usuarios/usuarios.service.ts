import { Injectable } from '@nestjs/common';
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
}
