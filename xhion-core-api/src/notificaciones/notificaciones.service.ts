import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { TipoNotificacion, EstadoNotificacion } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva notificación
   */
  async create(createNotificacionDto: CreateNotificacionDto) {
    return this.prisma.notificacion.create({
      data: createNotificacionDto,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });
  }

  /**
   * Obtener todas las notificaciones de un usuario
   */
  async findByUsuario(usuarioId: string, soloNoLeidas: boolean = false) {
    return this.prisma.notificacion.findMany({
      where: {
        usuarioId,
        ...(soloNoLeidas && { estado: EstadoNotificacion.NoLeida }),
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
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  /**
   * Obtener una notificación por ID
   */
  async findOne(id: string) {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notificacion;
  }

  /**
   * Actualizar una notificación
   */
  async update(id: string, updateNotificacionDto: UpdateNotificacionDto) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.notificacion.update({
      where: { id },
      data: updateNotificacionDto,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(id: string) {
    await this.findOne(id);

    return this.prisma.notificacion.update({
      where: { id },
      data: {
        estado: EstadoNotificacion.Leida,
        fechaLeida: new Date(),
      },
    });
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async marcarTodasComoLeidas(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        usuarioId,
        estado: EstadoNotificacion.NoLeida,
      },
      data: {
        estado: EstadoNotificacion.Leida,
        fechaLeida: new Date(),
      },
    });
  }

  /**
   * Eliminar una notificación
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.notificacion.delete({
      where: { id },
    });
  }

  /**
   * Eliminar todas las notificaciones leídas de un usuario
   */
  async eliminarLeidas(usuarioId: string) {
    return this.prisma.notificacion.deleteMany({
      where: {
        usuarioId,
        estado: EstadoNotificacion.Leida,
      },
    });
  }

  /**
   * Contar notificaciones no leídas de un usuario
   */
  async contarNoLeidas(usuarioId: string) {
    return this.prisma.notificacion.count({
      where: {
        usuarioId,
        estado: EstadoNotificacion.NoLeida,
      },
    });
  }

  /**
   * Crear notificación automática para evento
   */
  async crearNotificacionEvento(
    usuarioId: string,
    eventoId: string,
    tipo: 'creado' | 'actualizado' | 'cancelado' | 'recordatorio',
  ) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        creador: true,
      },
    });

    if (!evento) return null;

    const mensajes = {
      creado: `Nuevo evento: ${evento.titulo}`,
      actualizado: `Evento actualizado: ${evento.titulo}`,
      cancelado: `Evento cancelado: ${evento.titulo}`,
      recordatorio: `Recordatorio: ${evento.titulo} comienza pronto`,
    };

    return this.create({
      usuarioId,
      tipo: TipoNotificacion.Evento,
      titulo: mensajes[tipo],
      mensaje: evento.descripcion || '',
      eventoId,
    });
  }

  /**
   * Crear notificación automática para tarea
   */
  async crearNotificacionTarea(
    usuarioId: string,
    tareaId: string,
    tipo: 'asignada' | 'actualizada' | 'completada' | 'vencida',
  ) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: tareaId },
    });

    if (!tarea) return null;

    const mensajes = {
      asignada: `Nueva tarea asignada: ${tarea.titulo}`,
      actualizada: `Tarea actualizada: ${tarea.titulo}`,
      completada: `Tarea completada: ${tarea.titulo}`,
      vencida: `Tarea vencida: ${tarea.titulo}`,
    };

    return this.create({
      usuarioId,
      tipo: TipoNotificacion.Tarea,
      titulo: mensajes[tipo],
      mensaje: tarea.descripcion || '',
      tareaId,
    });
  }
}
