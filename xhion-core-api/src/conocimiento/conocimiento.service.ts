import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContextoOrganizacionalDto } from './dto/create-contexto-organizacional.dto';
import { UpdateContextoOrganizacionalDto } from './dto/update-contexto-organizacional.dto';
import { CreateContextoDepartamentoDto } from './dto/create-contexto-departamento.dto';
import { UpdateContextoDepartamentoDto } from './dto/update-contexto-departamento.dto';
import { CreateDocumentoProyectoDto } from './dto/create-documento-proyecto.dto';
import { UpdateDocumentoProyectoDto } from './dto/update-documento-proyecto.dto';

@Injectable()
export class ConocimientoService {
  constructor(private prisma: PrismaService) {}

  // ==================== CONTEXTO ORGANIZACIONAL ====================

  /**
   * Crear o actualizar el contexto organizacional (solo puede haber uno)
   */
  async upsertContextoOrganizacional(
    dto: CreateContextoOrganizacionalDto,
    usuarioId: string,
  ) {
    // Buscar si ya existe un contexto organizacional
    const existente = await this.prisma.contextoOrganizacional.findFirst();

    if (existente) {
      // Actualizar el existente
      return this.prisma.contextoOrganizacional.update({
        where: { id: existente.id },
        data: {
          ...dto,
          actualizadoPorId: usuarioId,
        },
        include: {
          actualizadoPor: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
            },
          },
        },
      });
    }

    // Crear uno nuevo
    return this.prisma.contextoOrganizacional.create({
      data: {
        ...dto,
        actualizadoPorId: usuarioId,
      },
      include: {
        actualizadoPor: {
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
   * Obtener el contexto organizacional
   */
  async getContextoOrganizacional() {
    const contexto = await this.prisma.contextoOrganizacional.findFirst({
      include: {
        actualizadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    if (!contexto) {
      throw new NotFoundException('No se ha configurado el contexto organizacional');
    }

    return contexto;
  }

  // ==================== CONTEXTO DEPARTAMENTO ====================

  /**
   * Crear contexto de departamento
   */
  async createContextoDepartamento(
    dto: CreateContextoDepartamentoDto,
    usuarioId: string,
  ) {
    // Verificar que el departamento existe
    const departamento = await this.prisma.departamento.findUnique({
      where: { id: dto.departamentoId },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${dto.departamentoId} no encontrado`);
    }

    // Verificar que no exista ya un contexto para este departamento
    const existente = await this.prisma.contextoDepartamento.findUnique({
      where: { departamentoId: dto.departamentoId },
    });

    if (existente) {
      throw new ConflictException('Este departamento ya tiene un contexto configurado');
    }

    return this.prisma.contextoDepartamento.create({
      data: {
        ...dto,
        actualizadoPorId: usuarioId,
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        actualizadoPor: {
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
   * Obtener contexto de un departamento
   */
  async getContextoDepartamento(departamentoId: string) {
    const contexto = await this.prisma.contextoDepartamento.findUnique({
      where: { departamentoId },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
          },
        },
        actualizadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    if (!contexto) {
      throw new NotFoundException(`No se encontró contexto para el departamento ${departamentoId}`);
    }

    return contexto;
  }

  /**
   * Listar todos los contextos de departamentos
   */
  async getAllContextosDepartamento() {
    return this.prisma.contextoDepartamento.findMany({
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
          },
        },
        actualizadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
      orderBy: {
        departamento: {
          nombre: 'asc',
        },
      },
    });
  }

  /**
   * Actualizar contexto de departamento
   */
  async updateContextoDepartamento(
    departamentoId: string,
    dto: UpdateContextoDepartamentoDto,
    usuarioId: string,
  ) {
    const contexto = await this.prisma.contextoDepartamento.findUnique({
      where: { departamentoId },
    });

    if (!contexto) {
      throw new NotFoundException(`No se encontró contexto para el departamento ${departamentoId}`);
    }

    return this.prisma.contextoDepartamento.update({
      where: { departamentoId },
      data: {
        ...dto,
        actualizadoPorId: usuarioId,
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        actualizadoPor: {
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
   * Eliminar contexto de departamento
   */
  async deleteContextoDepartamento(departamentoId: string) {
    const contexto = await this.prisma.contextoDepartamento.findUnique({
      where: { departamentoId },
    });

    if (!contexto) {
      throw new NotFoundException(`No se encontró contexto para el departamento ${departamentoId}`);
    }

    await this.prisma.contextoDepartamento.delete({
      where: { departamentoId },
    });

    return { message: 'Contexto de departamento eliminado exitosamente' };
  }

  // ==================== DOCUMENTOS DE PROYECTO ====================

  /**
   * Crear documento de proyecto
   */
  async createDocumentoProyecto(
    dto: CreateDocumentoProyectoDto,
    usuarioId: string,
  ) {
    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: dto.proyectoId },
      include: {
        miembros: {
          where: { usuarioId },
        },
        responsable: {
          select: { id: true },
        },
      },
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${dto.proyectoId} no encontrado`);
    }

    // Verificar que el usuario es miembro o responsable del proyecto
    const esMiembro = proyecto.miembros.length > 0;
    const esResponsable = proyecto.responsable.id === usuarioId;

    if (!esMiembro && !esResponsable) {
      throw new ForbiddenException('No tienes permiso para crear documentos en este proyecto');
    }

    // Si hay archivoId, verificar que existe
    if (dto.archivoId) {
      const archivo = await this.prisma.archivo.findUnique({
        where: { id: dto.archivoId },
      });

      if (!archivo) {
        throw new NotFoundException(`Archivo con ID ${dto.archivoId} no encontrado`);
      }
    }

    return this.prisma.documentoProyecto.create({
      data: {
        ...dto,
        creadoPorId: usuarioId,
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
          },
        },
        creadoPor: {
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
   * Obtener documentos de un proyecto
   */
  async getDocumentosProyecto(proyectoId: string, usuarioId: string) {
    // Verificar acceso al proyecto
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        miembros: {
          where: { usuarioId },
        },
        responsable: {
          select: { id: true },
        },
      },
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${proyectoId} no encontrado`);
    }

    const esMiembro = proyecto.miembros.length > 0;
    const esResponsable = proyecto.responsable.id === usuarioId;

    if (!esMiembro && !esResponsable) {
      throw new ForbiddenException('No tienes permiso para ver documentos de este proyecto');
    }

    return this.prisma.documentoProyecto.findMany({
      where: { proyectoId },
      include: {
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
            tipoArchivo: true,
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  /**
   * Obtener un documento específico
   */
  async getDocumentoProyecto(id: string, usuarioId: string) {
    const documento = await this.prisma.documentoProyecto.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            miembros: {
              where: { usuarioId },
            },
            responsable: {
              select: { id: true },
            },
          },
        },
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
            tipoArchivo: true,
            tamanoBytes: true,
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar acceso
    const esMiembro = documento.proyecto.miembros.length > 0;
    const esResponsable = documento.proyecto.responsable.id === usuarioId;

    if (!esMiembro && !esResponsable) {
      throw new ForbiddenException('No tienes permiso para ver este documento');
    }

    return documento;
  }

  /**
   * Actualizar documento de proyecto
   */
  async updateDocumentoProyecto(
    id: string,
    dto: UpdateDocumentoProyectoDto,
    usuarioId: string,
  ) {
    const documento = await this.prisma.documentoProyecto.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            miembros: {
              where: { usuarioId },
            },
            responsable: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar acceso
    const esMiembro = documento.proyecto.miembros.length > 0;
    const esResponsable = documento.proyecto.responsable.id === usuarioId;
    const esCreador = documento.creadoPorId === usuarioId;

    if (!esMiembro && !esResponsable && !esCreador) {
      throw new ForbiddenException('No tienes permiso para actualizar este documento');
    }

    return this.prisma.documentoProyecto.update({
      where: { id },
      data: dto,
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
          },
        },
        creadoPor: {
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
   * Eliminar documento de proyecto
   */
  async deleteDocumentoProyecto(id: string, usuarioId: string) {
    const documento = await this.prisma.documentoProyecto.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            responsable: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Solo el creador o el responsable del proyecto pueden eliminar
    const esCreador = documento.creadoPorId === usuarioId;
    const esResponsable = documento.proyecto.responsable.id === usuarioId;

    if (!esCreador && !esResponsable) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }

    await this.prisma.documentoProyecto.delete({
      where: { id },
    });

    return { message: 'Documento eliminado exitosamente' };
  }
}
