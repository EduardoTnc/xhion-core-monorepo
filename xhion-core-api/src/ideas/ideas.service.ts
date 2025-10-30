import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearIdeaDto } from './dto/crear-idea.dto';
import { ActualizarIdeaDto } from './dto/actualizar-idea.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { CategoriaIdea, EstadoIdea } from '@prisma/client';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== CRUD DE IDEAS ==========

  async crear(usuarioId: string, crearIdeaDto: CrearIdeaDto) {
    return this.prisma.idea.create({
      data: {
        ...crearIdeaDto,
        autorId: usuarioId,
        tags: crearIdeaDto.tags || [],
      },
      include: {
        autor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
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
    });
  }

  async obtenerTodas(categoria?: CategoriaIdea, estado?: EstadoIdea, busqueda?: string) {
    const where: any = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    return this.prisma.idea.findMany({
      where,
      include: {
        autor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
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
      orderBy: [
        { fechaCreacion: 'desc' },
      ],
    });
  }

  async obtenerPorId(ideaId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        autor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        votos: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
          },
        },
        comentarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            fechaCreacion: 'desc',
          },
        },
        _count: {
          select: {
            votos: true,
            comentarios: true,
          },
        },
      },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    return idea;
  }

  async actualizar(ideaId: string, usuarioId: string, actualizarIdeaDto: ActualizarIdeaDto) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    // Solo el autor puede editar (excepto el estado que puede ser cambiado por admin)
    if (idea.autorId !== usuarioId && !actualizarIdeaDto.estado) {
      throw new ForbiddenException('No tienes permiso para editar esta idea');
    }

    return this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        ...actualizarIdeaDto,
        tags: actualizarIdeaDto.tags !== undefined ? actualizarIdeaDto.tags : undefined,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
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
    });
  }

  async eliminar(ideaId: string, usuarioId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    if (idea.autorId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta idea');
    }

    await this.prisma.idea.delete({
      where: { id: ideaId },
    });

    return { message: 'Idea eliminada correctamente' };
  }

  // ========== VOTOS ==========

  async votar(ideaId: string, usuarioId: string) {
    // Verificar que la idea existe
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    // Verificar si ya votó
    const votoExistente = await this.prisma.votoIdea.findUnique({
      where: {
        ideaId_usuarioId: {
          ideaId,
          usuarioId,
        },
      },
    });

    if (votoExistente) {
      // Si ya votó, remover voto
      await this.prisma.votoIdea.delete({
        where: {
          id: votoExistente.id,
        },
      });

      return { message: 'Voto removido', voted: false };
    } else {
      // Si no ha votado, agregar voto
      await this.prisma.votoIdea.create({
        data: {
          ideaId,
          usuarioId,
        },
      });

      return { message: 'Voto agregado', voted: true };
    }
  }

  async obtenerVotantes(ideaId: string) {
    const votos = await this.prisma.votoIdea.findMany({
      where: { ideaId },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        fechaVoto: 'desc',
      },
    });

    return votos;
  }

  // ========== COMENTARIOS ==========

  async crearComentario(ideaId: string, usuarioId: string, crearComentarioDto: CrearComentarioDto) {
    // Verificar que la idea existe
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    return this.prisma.comentarioIdea.create({
      data: {
        ideaId,
        usuarioId,
        contenido: crearComentarioDto.contenido,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async obtenerComentarios(ideaId: string) {
    return this.prisma.comentarioIdea.findMany({
      where: { ideaId },
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async eliminarComentario(comentarioId: string, usuarioId: string) {
    const comentario = await this.prisma.comentarioIdea.findUnique({
      where: { id: comentarioId },
    });

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para eliminar este comentario');
    }

    await this.prisma.comentarioIdea.delete({
      where: { id: comentarioId },
    });

    return { message: 'Comentario eliminado correctamente' };
  }

  // ========== ESTADÍSTICAS ==========

  async obtenerEstadisticas() {
    const [total, porEstado, porCategoria] = await Promise.all([
      this.prisma.idea.count(),
      this.prisma.idea.groupBy({
        by: ['estado'],
        _count: true,
      }),
      this.prisma.idea.groupBy({
        by: ['categoria'],
        _count: true,
      }),
    ]);

    return {
      total,
      porEstado: porEstado.reduce((acc, item) => {
        acc[item.estado] = item._count;
        return acc;
      }, {}),
      porCategoria: porCategoria.reduce((acc, item) => {
        acc[item.categoria] = item._count;
        return acc;
      }, {}),
    };
  }
}
