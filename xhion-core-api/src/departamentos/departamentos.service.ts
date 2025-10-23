import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo departamento
   */
  async create(dto: CreateDepartamentoDto) {
    // Verificar que el nombre no esté duplicado
    const existente = await this.prisma.departamento.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      throw new ConflictException(`Ya existe un departamento con el nombre "${dto.nombre}"`);
    }

    // Si se especifica un jefe, verificar que existe
    if (dto.jefeId) {
      const jefe = await this.prisma.usuario.findUnique({
        where: { id: dto.jefeId },
      });

      if (!jefe) {
        throw new NotFoundException(`Usuario con ID ${dto.jefeId} no encontrado`);
      }
    }

    return this.prisma.departamento.create({
      data: dto,
      include: {
        jefe: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            puestosTrabajo: true,
            proyectos: true,
          },
        },
      },
    });
  }

  /**
   * Listar todos los departamentos (sin eliminados)
   */
  async findAll() {
    return this.prisma.departamento.findMany({
      where: {
        fechaEliminacion: null,
      },
      include: {
        jefe: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
            puestoTrabajo: {
              select: {
                titulo: true,
              },
            },
          },
        },
        contextoDepartamento: {
          select: {
            id: true,
            funciones: true,
            objetivos: true,
          },
        },
        _count: {
          select: {
            puestosTrabajo: true,
            proyectos: true,
            invitaciones: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Obtener un departamento por ID
   */
  async findOne(id: string) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        jefe: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
            puestoTrabajo: {
              select: {
                titulo: true,
              },
            },
          },
        },
        contextoDepartamento: true,
        puestosTrabajo: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            _count: {
              select: {
                usuarios: true,
              },
            },
          },
        },
        proyectos: {
          where: {
            fechaEliminacion: null,
          },
          select: {
            id: true,
            nombre: true,
            estado: true,
            fechaCreacion: true,
            responsable: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                tareas: true,
                miembros: true,
              },
            },
          },
          orderBy: {
            fechaCreacion: 'desc',
          },
        },
        _count: {
          select: {
            puestosTrabajo: true,
            proyectos: true,
            invitaciones: true,
          },
        },
      },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (departamento.fechaEliminacion) {
      throw new NotFoundException(`Departamento con ID ${id} ha sido eliminado`);
    }

    return departamento;
  }

  /**
   * Actualizar un departamento
   */
  async update(id: string, dto: UpdateDepartamentoDto) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (departamento.fechaEliminacion) {
      throw new BadRequestException('No se puede actualizar un departamento eliminado');
    }

    // Si se cambia el nombre, verificar que no esté duplicado
    if (dto.nombre && dto.nombre !== departamento.nombre) {
      const existente = await this.prisma.departamento.findUnique({
        where: { nombre: dto.nombre },
      });

      if (existente) {
        throw new ConflictException(`Ya existe un departamento con el nombre "${dto.nombre}"`);
      }
    }

    // Si se especifica un jefe, verificar que existe
    if (dto.jefeId) {
      const jefe = await this.prisma.usuario.findUnique({
        where: { id: dto.jefeId },
      });

      if (!jefe) {
        throw new NotFoundException(`Usuario con ID ${dto.jefeId} no encontrado`);
      }
    }

    return this.prisma.departamento.update({
      where: { id },
      data: dto,
      include: {
        jefe: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            puestosTrabajo: true,
            proyectos: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar un departamento (soft delete)
   */
  async remove(id: string) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            puestosTrabajo: true,
            proyectos: true,
          },
        },
      },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (departamento.fechaEliminacion) {
      throw new BadRequestException('El departamento ya ha sido eliminado');
    }

    // Verificar que no tenga puestos de trabajo activos
    if (departamento._count.puestosTrabajo > 0) {
      throw new BadRequestException(
        'No se puede eliminar un departamento con puestos de trabajo asignados'
      );
    }

    // Verificar que no tenga proyectos activos
    const proyectosActivos = await this.prisma.proyecto.count({
      where: {
        departamentoId: id,
        fechaEliminacion: null,
      },
    });

    if (proyectosActivos > 0) {
      throw new BadRequestException(
        'No se puede eliminar un departamento con proyectos activos'
      );
    }

    // Soft delete
    await this.prisma.departamento.update({
      where: { id },
      data: {
        fechaEliminacion: new Date(),
      },
    });

    return { message: 'Departamento eliminado exitosamente' };
  }

  /**
   * Restaurar un departamento eliminado
   */
  async restore(id: string) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (!departamento.fechaEliminacion) {
      throw new BadRequestException('El departamento no está eliminado');
    }

    return this.prisma.departamento.update({
      where: { id },
      data: {
        fechaEliminacion: null,
      },
      include: {
        jefe: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Obtener estadísticas de un departamento
   */
  async getEstadisticas(id: string) {
    const departamento = await this.findOne(id);

    const totalEmpleados = await this.prisma.usuario.count({
      where: {
        puestoTrabajo: {
          departamentoId: id,
        },
        fechaEliminacion: null,
      },
    });

    const proyectosActivos = await this.prisma.proyecto.count({
      where: {
        departamentoId: id,
        estado: 'Activo',
        fechaEliminacion: null,
      },
    });

    const proyectosCompletados = await this.prisma.proyecto.count({
      where: {
        departamentoId: id,
        estado: 'Completado',
        fechaEliminacion: null,
      },
    });

    const tareasAbiertas = await this.prisma.tarea.count({
      where: {
        proyecto: {
          departamentoId: id,
        },
        estado: {
          in: ['Por_Hacer', 'En_Progreso'],
        },
        fechaEliminacion: null,
      },
    });

    const tareasCompletadas = await this.prisma.tarea.count({
      where: {
        proyecto: {
          departamentoId: id,
        },
        estado: 'Hecho',
        fechaEliminacion: null,
      },
    });

    return {
      departamento: {
        id: departamento.id,
        nombre: departamento.nombre,
        descripcion: departamento.descripcion,
        color: departamento.color,
      },
      estadisticas: {
        totalEmpleados,
        totalPuestos: departamento._count.puestosTrabajo,
        proyectos: {
          activos: proyectosActivos,
          completados: proyectosCompletados,
          total: departamento._count.proyectos,
        },
        tareas: {
          abiertas: tareasAbiertas,
          completadas: tareasCompletadas,
          total: tareasAbiertas + tareasCompletadas,
        },
      },
      jefe: departamento.jefe,
      contexto: departamento.contextoDepartamento,
    };
  }
}
