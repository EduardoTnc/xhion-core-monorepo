import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContextoOrganizacionalDto } from './dto/create-contexto-organizacional.dto';
import { UpdateContextoOrganizacionalDto } from './dto/update-contexto-organizacional.dto';
import { CreateContextoDepartamentoDto } from './dto/create-contexto-departamento.dto';
import { UpdateContextoDepartamentoDto } from './dto/update-contexto-departamento.dto';
import { CreateDocumentoProyectoDto } from './dto/create-documento-proyecto.dto';
import { UpdateDocumentoProyectoDto } from './dto/update-documento-proyecto.dto';
import { CreateDocumentoDepartamentoDto } from './dto/create-documento-departamento.dto';
import { UpdateDocumentoDepartamentoDto } from './dto/update-documento-departamento.dto';
import { AiEmbeddingSyncService } from '../ai/ai-embedding-sync.service';

@Injectable()
export class ConocimientoService {
  constructor(
    private prisma: PrismaService,
    private readonly aiEmbeddingSync: AiEmbeddingSyncService,
  ) {}

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
      const updated = await this.prisma.contextoOrganizacional.update({
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

      await this.aiEmbeddingSync.syncContextoOrganizacional(updated.id);

      return updated;
    }

    // Crear uno nuevo
    const created = await this.prisma.contextoOrganizacional.create({
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

    await this.aiEmbeddingSync.syncContextoOrganizacional(created.id);

    return created;
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

    const contexto = await this.prisma.contextoDepartamento.create({
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

    await this.aiEmbeddingSync.syncDepartamento(dto.departamentoId);

    return contexto;
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

    const updated = await this.prisma.contextoDepartamento.update({
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

    await this.aiEmbeddingSync.syncDepartamento(departamentoId);

    return updated;
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

    await this.aiEmbeddingSync.syncDepartamento(departamentoId);

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

    const documento = await this.prisma.documentoProyecto.create({
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

    await this.aiEmbeddingSync.syncDocumento(documento.id);

    return documento;
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

    const updated = await this.prisma.documentoProyecto.update({
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

    await this.aiEmbeddingSync.syncDocumento(id);

    return updated;
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

    await this.aiEmbeddingSync.deleteDocumento(id);

    return { message: 'Documento eliminado exitosamente' };
  }

  // ==================== DOCUMENTOS DE DEPARTAMENTO ====================

  /**
   * Crear documento de departamento
   */
  async createDocumentoDepartamento(
    dto: CreateDocumentoDepartamentoDto,
    usuarioId: string,
  ) {
    // Verificar que el departamento existe y obtener usuarios con puesto en el departamento
    const departamento = await this.prisma.departamento.findUnique({
      where: { id: dto.departamentoId },
      include: {
        jefe: {
          select: { id: true },
        },
        puestosTrabajo: {
          include: {
            usuarios: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${dto.departamentoId} no encontrado`);
    }

    // Verificar rol del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: { nombre: true },
        },
      },
    });

    const esAdministrador = usuario?.rol?.nombre === 'Administrador';
    const esJefe = departamento.jefe?.id === usuarioId;
    const esMiembro = departamento.puestosTrabajo.some(puesto => 
      puesto.usuarios.some(usuario => usuario.id === usuarioId)
    );

    if (!esAdministrador && !esJefe && !esMiembro) {
      throw new ForbiddenException('No tienes permiso para crear documentos en este departamento');
    }

    const documento = await this.prisma.documentoDepartamento.create({
      data: {
        ...dto,
        creadoPorId: usuarioId,
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
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

    await this.aiEmbeddingSync.syncDocumento(documento.id);

    return documento;
  }

  /**
   * Obtener documentos de un departamento
   */
  async getDocumentosDepartamento(departamentoId: string, usuarioId: string) {
    // Verificar que el departamento existe y obtener usuarios con puesto en el departamento
    const departamento = await this.prisma.departamento.findUnique({
      where: { id: departamentoId },
      include: {
        jefe: {
          select: { id: true },
        },
        puestosTrabajo: {
          include: {
            usuarios: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${departamentoId} no encontrado`);
    }

    // Verificar rol del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: { nombre: true },
        },
      },
    });

    const esAdministrador = usuario?.rol?.nombre === 'Administrador';
    const esJefe = departamento.jefe?.id === usuarioId;
    const esMiembro = departamento.puestosTrabajo.some(puesto => 
      puesto.usuarios.some(usuario => usuario.id === usuarioId)
    );

    if (!esAdministrador && !esJefe && !esMiembro) {
      throw new ForbiddenException('No tienes permiso para ver documentos de este departamento');
    }

    return this.prisma.documentoDepartamento.findMany({
      where: { departamentoId },
      include: {
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
   * Obtener un documento específico de departamento
   */
  async getDocumentoDepartamento(id: string, usuarioId: string) {
    const documento = await this.prisma.documentoDepartamento.findUnique({
      where: { id },
      include: {
        departamento: {
          include: {
            jefe: {
              select: { id: true },
            },
            puestosTrabajo: {
              include: {
                usuarios: {
                  select: { id: true },
                },
              },
            },
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

    // Verificar rol del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: { nombre: true },
        },
      },
    });

    const esAdministrador = usuario?.rol?.nombre === 'Administrador';
    const esJefe = documento.departamento.jefe?.id === usuarioId;
    const esMiembro = documento.departamento.puestosTrabajo.some(puesto => 
      puesto.usuarios.some(usuario => usuario.id === usuarioId)
    );

    if (!esAdministrador && !esJefe && !esMiembro) {
      throw new ForbiddenException('No tienes permiso para ver este documento');
    }

    return documento;
  }

  /**
   * Actualizar documento de departamento
   */
  async updateDocumentoDepartamento(
    id: string,
    dto: UpdateDocumentoDepartamentoDto,
    usuarioId: string,
  ) {
    const documento = await this.prisma.documentoDepartamento.findUnique({
      where: { id },
      include: {
        departamento: {
          include: {
            jefe: {
              select: { id: true },
            },
            puestosTrabajo: {
              include: {
                usuarios: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar rol del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: { nombre: true },
        },
      },
    });

    const esAdministrador = usuario?.rol?.nombre === 'Administrador';
    const esJefe = documento.departamento.jefe?.id === usuarioId;
    const esMiembro = documento.departamento.puestosTrabajo.some(puesto => 
      puesto.usuarios.some(usuario => usuario.id === usuarioId)
    );
    const esCreador = documento.creadoPorId === usuarioId;

    if (!esAdministrador && !esJefe && !esMiembro && !esCreador) {
      throw new ForbiddenException('No tienes permiso para actualizar este documento');
    }

    const updated = await this.prisma.documentoDepartamento.update({
      where: { id },
      data: dto,
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
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

    await this.aiEmbeddingSync.syncDocumento(id);

    return updated;
  }

  /**
   * Eliminar documento de departamento
   */
  async deleteDocumentoDepartamento(id: string, usuarioId: string) {
    const documento = await this.prisma.documentoDepartamento.findUnique({
      where: { id },
      include: {
        departamento: {
          include: {
            jefe: {
              select: { id: true },
            },
            puestosTrabajo: {
              include: {
                usuarios: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Verificar rol del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          select: { nombre: true },
        },
      },
    });

    const esAdministrador = usuario?.rol?.nombre === 'Administrador';
    const esCreador = documento.creadoPorId === usuarioId;
    const esJefe = documento.departamento.jefe?.id === usuarioId;
    const esMiembro = documento.departamento.puestosTrabajo.some(puesto => 
      puesto.usuarios.some(usuario => usuario.id === usuarioId)
    );

    if (!esAdministrador && !esCreador && !esJefe && !esMiembro) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }

    await this.prisma.documentoDepartamento.delete({
      where: { id },
    });

    await this.aiEmbeddingSync.deleteDocumento(id);

    return { message: 'Documento eliminado exitosamente' };
  }
}
