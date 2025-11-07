import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { FiltrarEventosDto } from './dto/filtrar-eventos.dto';
import { Evento, EventoParticipante, Prisma } from '@prisma/client';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo evento
   */
  async create(createEventoDto: CreateEventoDto, creadorId: string): Promise<Evento> {
    const { participantesIds, ...eventoData } = createEventoDto;

    // Validar que fechaFin sea posterior a fechaInicio
    if (new Date(eventoData.fechaFin) <= new Date(eventoData.fechaInicio)) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar que el proyecto existe si se proporciona
    if (eventoData.proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: eventoData.proyectoId },
      });
      if (!proyecto) {
        throw new NotFoundException(`Proyecto con ID ${eventoData.proyectoId} no encontrado`);
      }
    }

    // Validar que la tarea existe si se proporciona
    if (eventoData.tareaId) {
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: eventoData.tareaId },
      });
      if (!tarea) {
        throw new NotFoundException(`Tarea con ID ${eventoData.tareaId} no encontrada`);
      }
    }

    // Crear evento con participantes en una transacción
    const evento = await this.prisma.$transaction(async (tx) => {
      // Crear el evento
      const nuevoEvento = await tx.evento.create({
        data: {
          ...eventoData,
          creadorId,
        },
        include: {
          creador: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
              avatarUrl: true,
            },
          },
          proyecto: true,
          tarea: true,
          participantes: {
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
        },
      });

      // Agregar participantes si se proporcionaron
      if (participantesIds && participantesIds.length > 0) {
        await tx.eventoParticipante.createMany({
          data: participantesIds.map((usuarioId) => ({
            eventoId: nuevoEvento.id,
            usuarioId,
          })),
        });
      }

      return nuevoEvento;
    });

    // TODO: Generar notificaciones para los participantes
    // await this.notificacionesService.notificarNuevoEvento(evento);

    return evento;
  }

  /**
   * Obtener todos los eventos con filtros
   */
  async findAll(filtros: FiltrarEventosDto): Promise<Evento[]> {
    const where: Prisma.EventoWhereInput = {
      eliminado: false,
    };

    // Filtro por usuario (creador o participante)
    if (filtros.usuarioId) {
      where.OR = [
        { creadorId: filtros.usuarioId },
        {
          participantes: {
            some: {
              usuarioId: filtros.usuarioId,
            },
          },
        },
      ];
    }

    // Filtro por proyecto
    if (filtros.proyectoId) {
      where.proyectoId = filtros.proyectoId;
    }

    // Filtro por tipo
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    // Filtro por estado
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Filtro por rango de fechas
    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.AND = [];

      if (filtros.fechaDesde) {
        where.AND.push({
          fechaInicio: {
            gte: new Date(filtros.fechaDesde),
          },
        });
      }

      if (filtros.fechaHasta) {
        where.AND.push({
          fechaFin: {
            lte: new Date(filtros.fechaHasta),
          },
        });
      }
    }

    return this.prisma.evento.findMany({
      where,
      include: {
        creador: {
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
            estado: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
            estado: true,
          },
        },
        participantes: {
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
      },
      orderBy: {
        fechaInicio: 'asc',
      },
    });
  }

  /**
   * Obtener un evento por ID
   */
  async findOne(id: string): Promise<Evento> {
    const evento = await this.prisma.evento.findUnique({
      where: { id, eliminado: false },
      include: {
        creador: {
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
            descripcion: true,
            estado: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            estado: true,
            prioridad: true,
          },
        },
        participantes: {
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
      },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return evento;
  }

  /**
   * Actualizar un evento
   */
  async update(id: string, updateEventoDto: UpdateEventoDto, usuarioId: string): Promise<Evento> {
    const evento = await this.findOne(id);

    // Verificar que el usuario sea el creador
    if (evento.creadorId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para editar este evento');
    }

    const { participantesIds, ...eventoData } = updateEventoDto;

    // Validar fechas si se actualizan
    if (eventoData.fechaInicio && eventoData.fechaFin) {
      if (new Date(eventoData.fechaFin) <= new Date(eventoData.fechaInicio)) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Actualizar evento y participantes en transacción
    return this.prisma.$transaction(async (tx) => {
      // Actualizar el evento
      const eventoActualizado = await tx.evento.update({
        where: { id },
        data: eventoData,
        include: {
          creador: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
              avatarUrl: true,
            },
          },
          proyecto: true,
          tarea: true,
          participantes: {
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
        },
      });

      // Actualizar participantes si se proporcionaron
      if (participantesIds) {
        // Eliminar participantes actuales
        await tx.eventoParticipante.deleteMany({
          where: { eventoId: id },
        });

        // Agregar nuevos participantes
        if (participantesIds.length > 0) {
          await tx.eventoParticipante.createMany({
            data: participantesIds.map((usuarioId) => ({
              eventoId: id,
              usuarioId,
            })),
          });
        }
      }

      return eventoActualizado;
    });
  }

  /**
   * Eliminar un evento (soft delete)
   */
  async remove(id: string, usuarioId: string): Promise<void> {
    const evento = await this.findOne(id);

    // Verificar que el usuario sea el creador
    if (evento.creadorId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para eliminar este evento');
    }

    await this.prisma.evento.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  /**
   * Agregar un participante a un evento
   */
  async addParticipante(eventoId: string, usuarioId: string): Promise<EventoParticipante> {
    // Verificar que el evento existe
    await this.findOne(eventoId);

    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar que no esté ya agregado
    const participanteExistente = await this.prisma.eventoParticipante.findUnique({
      where: {
        eventoId_usuarioId: {
          eventoId,
          usuarioId,
        },
      },
    });

    if (participanteExistente) {
      throw new BadRequestException('El usuario ya es participante de este evento');
    }

    return this.prisma.eventoParticipante.create({
      data: {
        eventoId,
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
  }

  /**
   * Remover un participante de un evento
   */
  async removeParticipante(eventoId: string, usuarioId: string): Promise<void> {
    // Verificar que el evento existe
    await this.findOne(eventoId);

    const participante = await this.prisma.eventoParticipante.findUnique({
      where: {
        eventoId_usuarioId: {
          eventoId,
          usuarioId,
        },
      },
    });

    if (!participante) {
      throw new NotFoundException('El usuario no es participante de este evento');
    }

    await this.prisma.eventoParticipante.delete({
      where: {
        eventoId_usuarioId: {
          eventoId,
          usuarioId,
        },
      },
    });
  }

  /**
   * Confirmar asistencia a un evento
   */
  async confirmarAsistencia(eventoId: string, usuarioId: string): Promise<EventoParticipante> {
    // Verificar que el evento existe
    await this.findOne(eventoId);

    const participante = await this.prisma.eventoParticipante.findUnique({
      where: {
        eventoId_usuarioId: {
          eventoId,
          usuarioId,
        },
      },
    });

    if (!participante) {
      throw new NotFoundException('No eres participante de este evento');
    }

    return this.prisma.eventoParticipante.update({
      where: {
        eventoId_usuarioId: {
          eventoId,
          usuarioId,
        },
      },
      data: {
        confirmado: true,
        fechaRespuesta: new Date(),
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
  }

  /**
   * Obtener eventos de un usuario (creados o participando)
   */
  async findEventosByUsuario(
    usuarioId: string,
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<Evento[]> {
    const where: Prisma.EventoWhereInput = {
      eliminado: false,
      OR: [
        { creadorId: usuarioId },
        {
          participantes: {
            some: {
              usuarioId,
            },
          },
        },
      ],
    };

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      where.AND = [];

      if (fechaDesde) {
        where.AND.push({
          fechaInicio: {
            gte: new Date(fechaDesde),
          },
        });
      }

      if (fechaHasta) {
        where.AND.push({
          fechaFin: {
            lte: new Date(fechaHasta),
          },
        });
      }
    }

    return this.prisma.evento.findMany({
      where,
      include: {
        creador: {
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
            estado: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
            estado: true,
          },
        },
        participantes: {
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
      },
      orderBy: {
        fechaInicio: 'asc',
      },
    });
  }

  /**
   * Obtener eventos de un proyecto
   */
  async findEventosByProyecto(proyectoId: string): Promise<Evento[]> {
    return this.prisma.evento.findMany({
      where: {
        proyectoId,
        eliminado: false,
      },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        tarea: {
          select: {
            id: true,
            titulo: true,
            estado: true,
          },
        },
        participantes: {
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
      },
      orderBy: {
        fechaInicio: 'asc',
      },
    });
  }

  /**
   * Obtener próximos eventos de un usuario
   */
  async findEventosProximos(usuarioId: string, dias: number = 7): Promise<Evento[]> {
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias);

    return this.findEventosByUsuario(
      usuarioId,
      fechaInicio.toISOString(),
      fechaFin.toISOString(),
    );
  }

  /**
   * Mover un evento (Drag & Drop)
   */
  async moverEvento(
    eventoId: string,
    nuevaFechaInicio: string,
    nuevaFechaFin: string,
    usuarioId: string,
  ): Promise<Evento> {
    const evento = await this.findOne(eventoId);

    // Verificar que el usuario sea el creador
    if (evento.creadorId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para mover este evento');
    }

    // Validar fechas
    if (new Date(nuevaFechaFin) <= new Date(nuevaFechaInicio)) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    return this.prisma.evento.update({
      where: { id: eventoId },
      data: {
        fechaInicio: new Date(nuevaFechaInicio),
        fechaFin: new Date(nuevaFechaFin),
      },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        proyecto: true,
        tarea: true,
        participantes: {
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
      },
    });
  }
}
