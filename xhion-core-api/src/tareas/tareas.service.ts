import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTareaDto, UpdateTareaDto, MoveTareaDto, CreateComentarioDto } from './dto';

@Injectable()
export class TareasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva tarea
   */
  async create(createTareaDto: CreateTareaDto, usuarioId: string) {
    // Verificar que el proyecto existe y el usuario tiene acceso
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: createTareaDto.proyectoId },
      include: {
        miembros: true,
      },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar acceso al proyecto
    const tieneAcceso =
      proyecto.responsableId === usuarioId ||
      proyecto.miembros.some((m) => m.usuarioId === usuarioId);

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // Verificar etapa si se proporciona
    if (createTareaDto.etapaId) {
      const etapa = await this.prisma.etapa.findUnique({
        where: { id: createTareaDto.etapaId },
      });

      if (!etapa || etapa.proyectoId !== createTareaDto.proyectoId) {
        throw new BadRequestException('La etapa no pertenece a este proyecto');
      }
    }

    // Verificar usuario asignado si se proporciona
    if (createTareaDto.asignadoId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createTareaDto.asignadoId },
      });

      if (!usuario) {
        throw new NotFoundException('El usuario asignado no existe');
      }
    }

    // Crear tarea
    const tarea = await this.prisma.tarea.create({
      data: {
        ...createTareaDto,
        creadorId: usuarioId,
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
        asignado: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    return tarea;
  }

  /**
   * Obtener todas las tareas (con filtros)
   */
  async findAll(
    usuarioId: string,
    filters?: {
      proyectoId?: string;
      etapaId?: string;
      asignadoId?: string;
      estado?: string;
      prioridad?: string;
    },
  ) {
    const where: any = {
      fechaEliminacion: null,
      proyecto: {
        OR: [
          { responsableId: usuarioId },
          { miembros: { some: { usuarioId } } },
        ],
      },
    };

    if (filters?.proyectoId) {
      where.proyectoId = filters.proyectoId;
    }

    if (filters?.etapaId) {
      where.etapaId = filters.etapaId;
    }

    if (filters?.asignadoId) {
      where.asignadoId = filters.asignadoId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.prioridad) {
      where.prioridad = filters.prioridad;
    }

    const tareas = await this.prisma.tarea.findMany({
      where,
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
        asignado: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
      orderBy: [
        { prioridad: 'desc' },
        { fechaVencimiento: 'asc' },
        { fechaCreacion: 'desc' },
      ],
    });

    return tareas;
  }

  /**
   * Obtener una tarea por ID
   */
  async findOne(id: string, usuarioId: string) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            responsableId: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
            estado: true,
          },
        },
        asignado: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
            puestoTrabajo: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        comentarios: {
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
          orderBy: {
            fechaCreacion: 'asc',
          },
        },
      },
    });

    if (!tarea || tarea.fechaEliminacion) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar acceso al proyecto
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: tarea.proyectoId },
      include: {
        miembros: true,
      },
    });

    const tieneAcceso =
      proyecto.responsableId === usuarioId ||
      proyecto.miembros.some((m) => m.usuarioId === usuarioId);

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a esta tarea');
    }

    return tarea;
  }

  /**
   * Actualizar una tarea
   */
  async update(id: string, updateTareaDto: UpdateTareaDto, usuarioId: string) {
    const tarea = await this.findOne(id, usuarioId);

    // Verificar etapa si se cambia
    if (updateTareaDto.etapaId && updateTareaDto.etapaId !== tarea.etapaId) {
      const etapa = await this.prisma.etapa.findUnique({
        where: { id: updateTareaDto.etapaId },
      });

      if (!etapa || etapa.proyectoId !== tarea.proyectoId) {
        throw new BadRequestException('La etapa no pertenece a este proyecto');
      }
    }

    // Verificar usuario asignado si se cambia
    if (updateTareaDto.asignadoId && updateTareaDto.asignadoId !== tarea.asignadoId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: updateTareaDto.asignadoId },
      });

      if (!usuario) {
        throw new NotFoundException('El usuario asignado no existe');
      }
    }

    // Si se marca como completada, establecer fecha de completado
    const dataToUpdate: any = { ...updateTareaDto };
    if (updateTareaDto.estado === 'Hecho' && tarea.estado !== 'Hecho') {
      dataToUpdate.fechaCompletado = new Date();
    } else if (updateTareaDto.estado && updateTareaDto.estado !== 'Hecho') {
      dataToUpdate.fechaCompletado = null;
    }

    const updated = await this.prisma.tarea.update({
      where: { id },
      data: dataToUpdate,
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
        asignado: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Mover tarea entre etapas/estados
   */
  async move(id: string, moveTareaDto: MoveTareaDto, usuarioId: string) {
    const tarea = await this.findOne(id, usuarioId);

    // Verificar etapa si se proporciona
    if (moveTareaDto.etapaId) {
      const etapa = await this.prisma.etapa.findUnique({
        where: { id: moveTareaDto.etapaId },
      });

      if (!etapa || etapa.proyectoId !== tarea.proyectoId) {
        throw new BadRequestException('La etapa no pertenece a este proyecto');
      }
    }

    // Preparar datos de actualización
    const dataToUpdate: any = {
      estado: moveTareaDto.estado,
    };

    if (moveTareaDto.etapaId !== undefined) {
      dataToUpdate.etapaId = moveTareaDto.etapaId;
    }

    // Si se marca como completada, establecer fecha
    if (moveTareaDto.estado === 'Hecho' && tarea.estado !== 'Hecho') {
      dataToUpdate.fechaCompletado = new Date();
    } else if (moveTareaDto.estado !== 'Hecho') {
      dataToUpdate.fechaCompletado = null;
    }

    const updated = await this.prisma.tarea.update({
      where: { id },
      data: dataToUpdate,
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
        asignado: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar una tarea (soft delete)
   */
  async remove(id: string, usuarioId: string) {
    const tarea = await this.findOne(id, usuarioId);

    // Solo el creador o el responsable del proyecto pueden eliminar
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: tarea.proyectoId },
    });

    if (tarea.creadorId !== usuarioId && proyecto.responsableId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador de la tarea o el responsable del proyecto pueden eliminarla',
      );
    }

    await this.prisma.tarea.update({
      where: { id },
      data: {
        fechaEliminacion: new Date(),
      },
    });

    return { message: 'Tarea eliminada exitosamente' };
  }

  // ==================== GESTIÓN DE COMENTARIOS ====================

  /**
   * Agregar un comentario a una tarea
   */
  async addComentario(tareaId: string, createComentarioDto: CreateComentarioDto, usuarioId: string) {
    // Verificar acceso a la tarea
    await this.findOne(tareaId, usuarioId);

    const comentario = await this.prisma.comentario.create({
      data: {
        contenido: createComentarioDto.contenido,
        tareaId,
        usuarioId,
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

    return comentario;
  }

  /**
   * Obtener comentarios de una tarea
   */
  async getComentarios(tareaId: string, usuarioId: string) {
    // Verificar acceso a la tarea
    await this.findOne(tareaId, usuarioId);

    const comentarios = await this.prisma.comentario.findMany({
      where: { tareaId },
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
      orderBy: {
        fechaCreacion: 'asc',
      },
    });

    return comentarios;
  }

  /**
   * Eliminar un comentario
   */
  async removeComentario(tareaId: string, comentarioId: string, usuarioId: string) {
    // Verificar acceso a la tarea
    await this.findOne(tareaId, usuarioId);

    const comentario = await this.prisma.comentario.findUnique({
      where: { id: comentarioId },
    });

    if (!comentario || comentario.tareaId !== tareaId) {
      throw new NotFoundException('Comentario no encontrado');
    }

    // Solo el autor del comentario puede eliminarlo
    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede eliminar el comentario');
    }

    await this.prisma.comentario.delete({
      where: { id: comentarioId },
    });

    return { message: 'Comentario eliminado exitosamente' };
  }

  /**
   * Obtener tareas asignadas al usuario actual
   */
  async getMisTareas(usuarioId: string) {
    const tareas = await this.prisma.tarea.findMany({
      where: {
        asignadoId: usuarioId,
        fechaEliminacion: null,
        estado: {
          not: 'Hecho',
        },
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        etapa: {
          select: {
            id: true,
            nombre: true,
            orden: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
      orderBy: [
        { prioridad: 'desc' },
        { fechaVencimiento: 'asc' },
      ],
    });

    return tareas;
  }
}
