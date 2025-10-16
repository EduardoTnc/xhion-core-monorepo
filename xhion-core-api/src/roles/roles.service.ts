import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPermisosDto, CrearRolDto, ActualizarRolDto } from './dto';

/**
 * Servicio para la gestión de roles y permisos
 */
@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los roles con el conteo de usuarios
   */
  async findAll() {
    return this.prisma.rol.findMany({
      where: {
        fechaEliminacion: null, // Solo roles activos
      },
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Obtiene todos los roles con sus permisos completos (Eager Loading)
   * Este endpoint carga toda la información de una sola vez para navegación instantánea
   */
  async findAllWithDetails() {
    return this.prisma.rol.findMany({
      where: {
        fechaEliminacion: null,
      },
      include: {
        _count: {
          select: { usuarios: true },
        },
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Obtiene un rol específico con todos sus permisos
   */
  async findOne(id: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
        _count: {
          select: { usuarios: true },
        },
      },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  /**
   * Obtiene los usuarios que tienen asignado un rol específico
   */
  async findUsersByRole(id: string, page: number = 1, limit: number = 10) {
    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: {
          rolId: id,
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
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          nombreCompleto: 'asc',
        },
      }),
      this.prisma.usuario.count({
        where: {
          rolId: id,
          fechaEliminacion: null,
        },
      }),
    ]);

    return {
      data: usuarios,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualiza los permisos de un rol
   * Utiliza una transacción para garantizar consistencia
   */
  async updatePermissions(id: string, dto: ActualizarPermisosDto) {
    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    // Verificar que todos los permisos existen
    const permisos = await this.prisma.permiso.findMany({
      where: {
        id: {
          in: dto.permisosIds,
        },
      },
    });

    if (permisos.length !== dto.permisosIds.length) {
      throw new NotFoundException('Uno o más permisos no existen');
    }

    // Realizar la actualización en una transacción
    return this.prisma.$transaction(async (prisma) => {
      // 1. Eliminar todos los permisos actuales del rol
      await prisma.rolPermiso.deleteMany({
        where: {
          rolId: id,
        },
      });

      // 2. Crear los nuevos permisos
      if (dto.permisosIds.length > 0) {
        await prisma.rolPermiso.createMany({
          data: dto.permisosIds.map((permisoId) => ({
            rolId: id,
            permisoId,
          })),
        });
      }

      // 3. Retornar el rol actualizado con sus nuevos permisos
      return prisma.rol.findUnique({
        where: { id },
        include: {
          permisos: {
            include: {
              permiso: true,
            },
          },
        },
      });
    });
  }

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  async findAllPermissions() {
    return this.prisma.permiso.findMany({
      orderBy: {
        nombreAccion: 'asc',
      },
    });
  }

  /**
   * Crea un nuevo rol
   */
  async create(dto: CrearRolDto) {
    // Verificar que el nombre no esté en uso
    const existingRole = await this.prisma.rol.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existingRole) {
      throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}"`);
    }

    return this.prisma.rol.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        color: dto.color || 'bg-primary',
      },
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
    });
  }

  /**
   * Actualiza un rol existente
   */
  async update(id: string, dto: ActualizarRolDto) {
    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    // Si se está cambiando el nombre, verificar que no esté en uso
    if (dto.nombre && dto.nombre !== rol.nombre) {
      const existingRole = await this.prisma.rol.findUnique({
        where: { nombre: dto.nombre },
      });

      if (existingRole) {
        throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}"`);
      }
    }

    return this.prisma.rol.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        ...(dto.color && { color: dto.color }),
      },
      include: {
        _count: {
          select: { usuarios: true },
        },
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    });
  }

  /**
   * Elimina un rol (eliminación lógica)
   */
  async remove(id: string) {
    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    // Verificar que no haya usuarios asignados
    if (rol._count.usuarios > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol "${rol.nombre}" porque tiene ${rol._count.usuarios} usuario(s) asignado(s)`
      );
    }

    // Eliminación lógica
    return this.prisma.rol.update({
      where: { id },
      data: {
        fechaEliminacion: new Date(),
      },
    });
  }
}
