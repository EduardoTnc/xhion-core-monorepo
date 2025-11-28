import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, TipoActividadTarea } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTareaDto,
  UpdateTareaDto,
  MoveTareaDto,
  CreateComentarioDto,
  UploadAdjuntoDto,
  ResponderActividadDto,
} from './dto';
import { AiEmbeddingSyncService } from '../ai/ai-embedding-sync.service';
import { Express } from 'express';
import { NotificationsGateway } from '../websocket/websocket.gateway';

@Injectable()
export class TareasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEmbeddingSync: AiEmbeddingSyncService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  private readonly ENTIDAD_TAREA = 'Tarea';

  private async registrarActividad(params: {
    tareaId: string;
    usuarioId: string;
    tipo: TipoActividadTarea;
    descripcion?: string;
    payload?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    comentarioId?: string;
    archivoId?: string;
    actividadPadreId?: string;
  }) {
    const { tareaId, usuarioId, tipo, descripcion, payload, comentarioId, archivoId, actividadPadreId } = params;

    return this.prisma.tareaActividad.create({
      data: {
        tareaId,
        tipoEvento: tipo,
        descripcion,
        payload,
        comentarioId,
        archivoId,
        actividadPadreId,
        creadoPorId: usuarioId,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
        archivo: true,
        comentario: true,
        respuestas: true,
      },
    });
  }

  /**
   * Helper para obtener IDs de usuarios a notificar (miembros del proyecto)
   */
  private async getProjectMemberIds(proyectoId: string): Promise<string[]> {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        miembros: {
          select: { usuarioId: true },
        },
      },
    });

    if (!proyecto) return [];

    const ids = proyecto.miembros.map((m) => m.usuarioId);
    if (proyecto.responsableId && !ids.includes(proyecto.responsableId)) {
      ids.push(proyecto.responsableId);
    }
    return ids;
  }

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
        titulo: createTareaDto.titulo,
        descripcion: createTareaDto.descripcion,
        proyectoId: createTareaDto.proyectoId,
        etapaId: createTareaDto.etapaId,
        asignadoId: createTareaDto.asignadoId,
        prioridad: createTareaDto.prioridad,
        fechaVencimiento: createTareaDto.fechaVencimiento ? new Date(createTareaDto.fechaVencimiento) : undefined,
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

    await this.aiEmbeddingSync.syncTarea(tarea.id);

    await this.registrarActividad({
      tareaId: tarea.id,
      usuarioId,
      tipo: TipoActividadTarea.CREACION,
      descripcion: 'Tarea creada',
      payload: {
        titulo: tarea.titulo,
        prioridad: tarea.prioridad,
        estado: tarea.estado,
      },
    });

    // Notificar creación
    const memberIds = await this.getProjectMemberIds(tarea.proyectoId);
    this.notificationsGateway.sendTaskCreated(memberIds, tarea);

    return tarea;
  }

  /**
   * Obtener todas las tareas (con filtros)
   * Si el usuario tiene el permiso 'tareas.ver_todas', verá TODAS las tareas
   * Si no, solo verá tareas de proyectos donde es responsable o miembro
   */
  async findAll(
    usuarioId: string,
    permisos: string[],
    filters?: {
      proyectoId?: string;
      etapaId?: string;
      asignadoId?: string;
      estado?: string;
      prioridad?: string;
    },
  ) {
    // Verificar si el usuario tiene permiso para ver todas las tareas
    const puedeVerTodas = permisos.includes('tareas.ver_todas');

    const where: any = {
      fechaEliminacion: null,
    };

    // Si NO tiene permiso para ver todas, aplicar filtro de acceso
    if (!puedeVerTodas) {
      where.proyecto = {
        OR: [
          { responsableId: usuarioId },
          { miembros: { some: { usuarioId } } },
        ],
      };
    }

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
      proyecto?.responsableId === usuarioId ||
      proyecto?.miembros.some((m) => m.usuarioId === usuarioId);

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
    const dataToUpdate: any = {
      titulo: updateTareaDto.titulo,
      descripcion: updateTareaDto.descripcion,
      proyectoId: updateTareaDto.proyectoId,
      etapaId: updateTareaDto.etapaId,
      asignadoId: updateTareaDto.asignadoId,
      estado: updateTareaDto.estado,
      prioridad: updateTareaDto.prioridad,
      fechaVencimiento: updateTareaDto.fechaVencimiento ? new Date(updateTareaDto.fechaVencimiento) : undefined,
    };

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

    await this.aiEmbeddingSync.syncTarea(updated.id);

    await this.registrarActividad({
      tareaId: id,
      usuarioId,
      tipo: TipoActividadTarea.ACTUALIZACION,
      descripcion: 'La tarea fue actualizada',
      payload: updateTareaDto as Prisma.InputJsonValue,
    });

    // Notificar actualización
    const memberIds = await this.getProjectMemberIds(updated.proyectoId);
    this.notificationsGateway.sendTaskUpdated(memberIds, updated);

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
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    // Notificar movimiento (actualización)
    const memberIds = await this.getProjectMemberIds(updated.proyectoId);
    this.notificationsGateway.sendTaskUpdated(memberIds, updated);

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

    if (tarea.creadorId !== usuarioId && proyecto?.responsableId !== usuarioId) {
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

    await this.aiEmbeddingSync.deleteTarea(id);

    // Notificar eliminación
    const memberIds = await this.getProjectMemberIds(tarea.proyectoId);
    this.notificationsGateway.sendTaskDeleted(memberIds, id);

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

    await this.registrarActividad({
      tareaId,
      usuarioId,
      tipo: TipoActividadTarea.COMENTARIO,
      descripcion: 'Nuevo comentario agregado',
      comentarioId: comentario.id,
      payload: { contenido: comentario.contenido },
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

    await this.registrarActividad({
      tareaId,
      usuarioId,
      tipo: TipoActividadTarea.ACTUALIZACION,
      descripcion: 'Comentario eliminado',
      comentarioId,
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

  // ==================== ADJUNTOS ====================

  async getAdjuntos(tareaId: string, usuarioId: string) {
    await this.findOne(tareaId, usuarioId);

    return this.prisma.archivoAdjunto.findMany({
      where: {
        entidadPadreTipo: this.ENTIDAD_TAREA,
        entidadPadreId: tareaId,
      },
      include: {
        archivo: true,
      },
      orderBy: {
        archivo: {
          fechaCreacion: 'desc',
        },
      },
    });
  }

  async addAdjunto(
    tareaId: string,
    file: Express.Multer.File,
    uploadAdjuntoDto: UploadAdjuntoDto,
    usuarioId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    await this.findOne(tareaId, usuarioId);

    const archivo = await this.prisma.archivo.create({
      data: {
        nombreArchivo: file.originalname,
        urlArchivo: `/uploads/tareas/${file.filename}`,
        tipoArchivo: file.mimetype,
        tamanoBytes: file.size,
        subidoPorId: usuarioId,
      },
    });

    const adjunto = await this.prisma.archivoAdjunto.create({
      data: {
        archivoId: archivo.id,
        entidadPadreTipo: this.ENTIDAD_TAREA,
        entidadPadreId: tareaId,
        descripcion: uploadAdjuntoDto.descripcion,
      },
      include: {
        archivo: true,
      },
    });

    await this.registrarActividad({
      tareaId,
      usuarioId,
      tipo: TipoActividadTarea.ADJUNTO_AGREGADO,
      descripcion: uploadAdjuntoDto.descripcion ?? 'Se adjuntó un archivo',
      archivoId: archivo.id,
      payload: {
        nombreArchivo: archivo.nombreArchivo,
        tipoArchivo: archivo.tipoArchivo,
      },
    });

    return adjunto;
  }

  async removeAdjunto(tareaId: string, archivoId: string, usuarioId: string) {
    await this.findOne(tareaId, usuarioId);

    const adjunto = await this.prisma.archivoAdjunto.findUnique({
      where: {
        archivoId_entidadPadreTipo_entidadPadreId: {
          archivoId,
          entidadPadreTipo: this.ENTIDAD_TAREA,
          entidadPadreId: tareaId,
        },
      },
      include: {
        archivo: true,
      },
    });

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    await this.prisma.$transaction([
      this.prisma.archivoAdjunto.delete({
        where: {
          archivoId_entidadPadreTipo_entidadPadreId: {
            archivoId,
            entidadPadreTipo: this.ENTIDAD_TAREA,
            entidadPadreId: tareaId,
          },
        },
      }),
      this.prisma.archivo.delete({
        where: { id: archivoId },
      }),
    ]);

    await this.registrarActividad({
      tareaId,
      usuarioId,
      tipo: TipoActividadTarea.ACTUALIZACION,
      descripcion: 'Adjunto eliminado',
      archivoId,
    });

    return { message: 'Adjunto eliminado exitosamente' };
  }

  // ==================== ACTIVIDAD ====================

  async getActividad(tareaId: string) {
    return this.prisma.tareaActividad.findMany({
      where: { tareaId },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
        archivo: true,
        comentario: true,
        respuestas: {
          include: {
            creadoPor: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async responderActividad(
    tareaId: string,
    actividadId: string,
    responderActividadDto: ResponderActividadDto,
    usuarioId: string,
  ) {
    await this.findOne(tareaId, usuarioId);

    const actividad = await this.prisma.tareaActividad.findUnique({
      where: { id: actividadId },
    });

    if (!actividad || actividad.tareaId !== tareaId) {
      throw new NotFoundException('Actividad no encontrada');
    }

    const respuesta = await this.registrarActividad({
      tareaId,
      usuarioId,
      tipo: TipoActividadTarea.COMENTARIO,
      descripcion: responderActividadDto.descripcion,
      actividadPadreId: actividadId,
      payload: { contenido: responderActividadDto.descripcion },
    });

    return respuesta;
  }
}
