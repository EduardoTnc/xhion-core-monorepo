import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProyectoDto,
  UpdateProyectoDto,
  AddMiembroDto,
  CreateEtapaDto,
  UpdateEtapaDto,
  ReorderEtapasDto,
} from './dto';

@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo proyecto
   */
  async create(createProyectoDto: CreateProyectoDto, usuarioId: string) {
    // Verificar que el responsable existe
    const responsable = await this.prisma.usuario.findUnique({
      where: { id: createProyectoDto.responsableId },
    });

    if (!responsable) {
      throw new NotFoundException('El usuario responsable no existe');
    }

    // Verificar departamento si se proporciona
    if (createProyectoDto.departamentoId) {
      const departamento = await this.prisma.departamento.findUnique({
        where: { id: createProyectoDto.departamentoId },
      });

      if (!departamento) {
        throw new NotFoundException('El departamento no existe');
      }
    }

    // Crear proyecto y agregar al responsable como miembro
    const proyecto = await this.prisma.proyecto.create({
      data: {
        ...createProyectoDto,
        miembros: {
          create: {
            usuarioId: createProyectoDto.responsableId,
            rol: 'Responsable',
          },
        },
      },
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        miembros: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        etapas: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    return proyecto;
  }

  /**
   * Obtener todos los proyectos (con filtros opcionales)
   */
  async findAll(usuarioId: string, filters?: { estado?: string; departamentoId?: string }) {
    const where: any = {
      fechaEliminacion: null,
      OR: [
        { responsableId: usuarioId },
        { miembros: { some: { usuarioId } } },
      ],
    };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.departamentoId) {
      where.departamentoId = filters.departamentoId;
    }

    const proyectos = await this.prisma.proyecto.findMany({
      where,
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            tareas: true,
            miembros: true,
            etapas: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return proyectos;
  }

  /**
   * Obtener un proyecto por ID
   */
  async findOne(id: string, usuarioId: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        miembros: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                email: true,
                avatarUrl: true,
                rolId: true,
              },
            },
          },
        },
        etapas: {
          orderBy: { orden: 'asc' },
          include: {
            _count: {
              select: {
                tareas: true,
              },
            },
          },
        },
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que el usuario tiene acceso
    const tieneAcceso =
      proyecto.responsableId === usuarioId ||
      proyecto.miembros.some((m) => m.usuarioId === usuarioId);

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return proyecto;
  }

  /**
   * Actualizar un proyecto
   */
  async update(id: string, updateProyectoDto: UpdateProyectoDto, usuarioId: string) {
    const proyecto = await this.findOne(id, usuarioId);

    // Solo el responsable puede actualizar el proyecto
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede actualizar el proyecto');
    }

    const updated = await this.prisma.proyecto.update({
      where: { id },
      data: updateProyectoDto,
      include: {
        responsable: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
        miembros: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        etapas: {
          orderBy: { orden: 'asc' },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar un proyecto (soft delete)
   */
  async remove(id: string, usuarioId: string) {
    const proyecto = await this.findOne(id, usuarioId);

    // Solo el responsable puede eliminar el proyecto
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede eliminar el proyecto');
    }

    await this.prisma.proyecto.update({
      where: { id },
      data: {
        fechaEliminacion: new Date(),
        estado: 'Archivado',
      },
    });

    return { message: 'Proyecto eliminado exitosamente' };
  }

  // ==================== GESTIÓN DE MIEMBROS ====================

  /**
   * Agregar un miembro al proyecto
   */
  async addMiembro(proyectoId: string, addMiembroDto: AddMiembroDto, usuarioId: string) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede agregar miembros
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede agregar miembros');
    }

    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: addMiembroDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    // Verificar que no sea ya miembro
    const yaEsMiembro = await this.prisma.proyectoMiembro.findUnique({
      where: {
        proyectoId_usuarioId: {
          proyectoId,
          usuarioId: addMiembroDto.usuarioId,
        },
      },
    });

    if (yaEsMiembro) {
      throw new ConflictException('El usuario ya es miembro del proyecto');
    }

    const miembro = await this.prisma.proyectoMiembro.create({
      data: {
        proyectoId,
        usuarioId: addMiembroDto.usuarioId,
        rol: addMiembroDto.rol || 'Miembro',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return miembro;
  }

  /**
   * Obtener miembros de un proyecto
   */
  async getMiembros(proyectoId: string, usuarioId: string) {
    await this.findOne(proyectoId, usuarioId);

    const miembros = await this.prisma.proyectoMiembro.findMany({
      where: { proyectoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
            rolId: true,
            puestoTrabajo: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },
      },
    });

    return miembros;
  }

  /**
   * Remover un miembro del proyecto
   */
  async removeMiembro(proyectoId: string, miembroId: string, usuarioId: string) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede remover miembros
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede remover miembros');
    }

    // No se puede remover al responsable
    if (miembroId === proyecto.responsableId) {
      throw new BadRequestException('No se puede remover al responsable del proyecto');
    }

    const miembro = await this.prisma.proyectoMiembro.findUnique({
      where: {
        proyectoId_usuarioId: {
          proyectoId,
          usuarioId: miembroId,
        },
      },
    });

    if (!miembro) {
      throw new NotFoundException('El miembro no existe en este proyecto');
    }

    await this.prisma.proyectoMiembro.delete({
      where: {
        proyectoId_usuarioId: {
          proyectoId,
          usuarioId: miembroId,
        },
      },
    });

    return { message: 'Miembro removido exitosamente' };
  }

  // ==================== GESTIÓN DE ETAPAS ====================

  /**
   * Crear una etapa en un proyecto
   */
  async createEtapa(proyectoId: string, createEtapaDto: CreateEtapaDto, usuarioId: string) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede crear etapas
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede crear etapas');
    }

    // Verificar que no exista una etapa con el mismo orden
    const etapaExistente = await this.prisma.etapa.findUnique({
      where: {
        proyectoId_orden: {
          proyectoId,
          orden: createEtapaDto.orden,
        },
      },
    });

    if (etapaExistente) {
      throw new ConflictException(`Ya existe una etapa con el orden ${createEtapaDto.orden}`);
    }

    const etapa = await this.prisma.etapa.create({
      data: {
        ...createEtapaDto,
        proyectoId,
      },
      include: {
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    return etapa;
  }

  /**
   * Obtener etapas de un proyecto
   */
  async getEtapas(proyectoId: string, usuarioId: string) {
    await this.findOne(proyectoId, usuarioId);

    const etapas = await this.prisma.etapa.findMany({
      where: { proyectoId },
      orderBy: { orden: 'asc' },
      include: {
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    return etapas;
  }

  /**
   * Actualizar una etapa
   */
  async updateEtapa(
    proyectoId: string,
    etapaId: string,
    updateEtapaDto: UpdateEtapaDto,
    usuarioId: string,
  ) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede actualizar etapas
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede actualizar etapas');
    }

    const etapa = await this.prisma.etapa.findUnique({
      where: { id: etapaId },
    });

    if (!etapa || etapa.proyectoId !== proyectoId) {
      throw new NotFoundException('Etapa no encontrada');
    }

    // Si se cambia el orden, verificar que no exista otra etapa con ese orden
    if (updateEtapaDto.orden && updateEtapaDto.orden !== etapa.orden) {
      const etapaConOrden = await this.prisma.etapa.findUnique({
        where: {
          proyectoId_orden: {
            proyectoId,
            orden: updateEtapaDto.orden,
          },
        },
      });

      if (etapaConOrden) {
        throw new ConflictException(`Ya existe una etapa con el orden ${updateEtapaDto.orden}`);
      }
    }

    const updated = await this.prisma.etapa.update({
      where: { id: etapaId },
      data: updateEtapaDto,
      include: {
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar una etapa
   */
  async removeEtapa(proyectoId: string, etapaId: string, usuarioId: string) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede eliminar etapas
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede eliminar etapas');
    }

    const etapa = await this.prisma.etapa.findUnique({
      where: { id: etapaId },
      include: {
        _count: {
          select: {
            tareas: true,
          },
        },
      },
    });

    if (!etapa || etapa.proyectoId !== proyectoId) {
      throw new NotFoundException('Etapa no encontrada');
    }

    // Verificar que no tenga tareas asociadas
    if (etapa._count.tareas > 0) {
      throw new BadRequestException(
        'No se puede eliminar una etapa que tiene tareas asociadas',
      );
    }

    await this.prisma.etapa.delete({
      where: { id: etapaId },
    });

    return { message: 'Etapa eliminada exitosamente' };
  }

  /**
   * Reordenar etapas
   */
  async reorderEtapas(proyectoId: string, reorderDto: ReorderEtapasDto, usuarioId: string) {
    const proyecto = await this.findOne(proyectoId, usuarioId);

    // Solo el responsable puede reordenar etapas
    if (proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException('Solo el responsable puede reordenar etapas');
    }

    // Verificar que todas las etapas pertenecen al proyecto
    const etapasIds = reorderDto.etapas.map((e) => e.id);
    const etapas = await this.prisma.etapa.findMany({
      where: {
        id: { in: etapasIds },
        proyectoId,
      },
    });

    if (etapas.length !== etapasIds.length) {
      throw new BadRequestException('Algunas etapas no pertenecen a este proyecto');
    }

    // Actualizar el orden de cada etapa en una transacción
    await this.prisma.$transaction(
      reorderDto.etapas.map((etapa) =>
        this.prisma.etapa.update({
          where: { id: etapa.id },
          data: { orden: etapa.orden },
        }),
      ),
    );

    return { message: 'Etapas reordenadas exitosamente' };
  }
}
