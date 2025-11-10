import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { AsignarRecursoDto } from './dto/asignar-recurso.dto';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { TipoRecurso, EstadoRecurso, TipoMovimiento } from '@prisma/client';

@Injectable()
export class RecursosService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CRUD BÁSICO
  // ============================================

  async crear(dto: CreateRecursoDto, usuarioId: string) {
    const recurso = await this.prisma.recurso.create({
      data: {
        ...dto,
        creadoPorId: usuarioId,
      },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return recurso;
  }

  async obtenerTodos(filtros?: {
    tipo?: TipoRecurso;
    estado?: EstadoRecurso;
    categoria?: string;
    busqueda?: string;
  }) {
    const where: any = {
      eliminado: false,
    };

    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    if (filtros?.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const recursos = await this.prisma.recurso.findMany({
      where,
      include: {
        creador: {
          select: {
            nombreCompleto: true,
            email: true,
          },
        },
        _count: {
          select: {
            asignaciones: true,
            movimientos: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return recursos;
  }

  async obtenerPorId(id: string) {
    const recurso = await this.prisma.recurso.findUnique({
      where: { id },
      include: {
        creador: {
          select: {
            nombreCompleto: true,
            email: true,
          },
        },
        asignaciones: {
          where: { activa: true },
          include: {
            departamento: {
              select: { nombre: true },
            },
            proyecto: {
              select: { nombre: true },
            },
            asignadoPor: {
              select: { nombreCompleto: true },
            },
          },
        },
        movimientos: {
          take: 10,
          orderBy: { fechaMovimiento: 'desc' },
          include: {
            registradoPor: {
              select: { nombreCompleto: true },
            },
          },
        },
      },
    });

    if (!recurso || recurso.eliminado) {
      throw new NotFoundException('Recurso no encontrado');
    }

    return recurso;
  }

  async actualizar(id: string, dto: UpdateRecursoDto) {
    const recurso = await this.prisma.recurso.findUnique({
      where: { id },
    });

    if (!recurso || recurso.eliminado) {
      throw new NotFoundException('Recurso no encontrado');
    }

    const actualizado = await this.prisma.recurso.update({
      where: { id },
      data: dto,
      include: {
        creador: {
          select: {
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return actualizado;
  }

  async eliminar(id: string) {
    const recurso = await this.prisma.recurso.findUnique({
      where: { id },
    });

    if (!recurso || recurso.eliminado) {
      throw new NotFoundException('Recurso no encontrado');
    }

    // Soft delete
    await this.prisma.recurso.update({
      where: { id },
      data: { eliminado: true },
    });

    return { message: 'Recurso eliminado correctamente' };
  }

  // ============================================
  // ASIGNACIONES
  // ============================================

  async asignar(recursoId: string, dto: AsignarRecursoDto, usuarioId: string) {
    // Validar que se especifique departamento O proyecto
    if (!dto.departamentoId && !dto.proyectoId) {
      throw new BadRequestException('Debe especificar un departamento o proyecto');
    }

    if (dto.departamentoId && dto.proyectoId) {
      throw new BadRequestException('Solo puede asignar a un departamento O proyecto, no ambos');
    }

    // Verificar que el recurso existe
    const recurso = await this.prisma.recurso.findUnique({
      where: { id: recursoId },
    });

    if (!recurso || recurso.eliminado) {
      throw new NotFoundException('Recurso no encontrado');
    }

    // Verificar stock disponible
    if (dto.cantidad > recurso.stockActual) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${recurso.stockActual}, Solicitado: ${dto.cantidad}`,
      );
    }

    const asignacion = await this.prisma.asignacionRecurso.create({
      data: {
        recursoId,
        cantidad: dto.cantidad,
        departamentoId: dto.departamentoId,
        proyectoId: dto.proyectoId,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        proposito: dto.proposito,
        observaciones: dto.observaciones,
        asignadoPorId: usuarioId,
      },
      include: {
        recurso: {
          select: { nombre: true, tipo: true },
        },
        departamento: {
          select: { nombre: true },
        },
        proyecto: {
          select: { nombre: true },
        },
        asignadoPor: {
          select: { nombreCompleto: true },
        },
      },
    });

    // Actualizar estado del recurso si está completamente asignado
    const totalAsignado = await this.calcularTotalAsignado(recursoId);
    if (totalAsignado >= recurso.stockActual) {
      await this.prisma.recurso.update({
        where: { id: recursoId },
        data: { estado: EstadoRecurso.Asignado },
      });
    }

    return asignacion;
  }

  async obtenerAsignaciones(recursoId: string) {
    const asignaciones = await this.prisma.asignacionRecurso.findMany({
      where: {
        recursoId,
        activa: true,
      },
      include: {
        departamento: {
          select: { nombre: true },
        },
        proyecto: {
          select: { nombre: true },
        },
        asignadoPor: {
          select: { nombreCompleto: true },
        },
      },
      orderBy: {
        fechaAsignacion: 'desc',
      },
    });

    return asignaciones;
  }

  async finalizarAsignacion(asignacionId: string) {
    const asignacion = await this.prisma.asignacionRecurso.findUnique({
      where: { id: asignacionId },
      include: { recurso: true },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.prisma.asignacionRecurso.update({
      where: { id: asignacionId },
      data: {
        activa: false,
        fechaFin: new Date(),
      },
    });

    // Actualizar estado del recurso
    const totalAsignado = await this.calcularTotalAsignado(asignacion.recursoId);
    if (totalAsignado < asignacion.recurso.stockActual) {
      await this.prisma.recurso.update({
        where: { id: asignacion.recursoId },
        data: { estado: EstadoRecurso.Disponible },
      });
    }

    return { message: 'Asignación finalizada correctamente' };
  }

  // ============================================
  // MOVIMIENTOS DE INVENTARIO
  // ============================================

  async registrarMovimiento(recursoId: string, dto: RegistrarMovimientoDto, usuarioId: string) {
    const recurso = await this.prisma.recurso.findUnique({
      where: { id: recursoId },
    });

    if (!recurso || recurso.eliminado) {
      throw new NotFoundException('Recurso no encontrado');
    }

    const stockAnterior = recurso.stockActual;
    let stockNuevo = stockAnterior;

    // Calcular nuevo stock según tipo de movimiento
    switch (dto.tipo) {
      case TipoMovimiento.Entrada:
      case TipoMovimiento.Devolucion:
      case TipoMovimiento.Ajuste:
        stockNuevo = stockAnterior + dto.cantidad;
        break;
      case TipoMovimiento.Salida:
      case TipoMovimiento.Asignacion:
      case TipoMovimiento.Baja:
        if (stockAnterior < dto.cantidad) {
          throw new BadRequestException('Stock insuficiente para realizar el movimiento');
        }
        stockNuevo = stockAnterior - dto.cantidad;
        break;
    }

    // Registrar movimiento
    const movimiento = await this.prisma.movimientoRecurso.create({
      data: {
        recursoId,
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        stockAnterior,
        stockNuevo,
        departamentoId: dto.departamentoId,
        proyectoId: dto.proyectoId,
        motivo: dto.motivo,
        costoTotal: dto.costoTotal,
        documentoReferencia: dto.documentoReferencia,
        registradoPorId: usuarioId,
      },
      include: {
        recurso: {
          select: { nombre: true, tipo: true },
        },
        registradoPor: {
          select: { nombreCompleto: true },
        },
      },
    });

    // Actualizar stock del recurso
    await this.prisma.recurso.update({
      where: { id: recursoId },
      data: {
        stockActual: stockNuevo,
        estado: stockNuevo === 0 ? EstadoRecurso.Agotado : recurso.estado,
      },
    });

    return movimiento;
  }

  async obtenerHistorialMovimientos(recursoId: string) {
    const movimientos = await this.prisma.movimientoRecurso.findMany({
      where: { recursoId },
      include: {
        departamento: {
          select: { nombre: true },
        },
        proyecto: {
          select: { nombre: true },
        },
        registradoPor: {
          select: { nombreCompleto: true },
        },
      },
      orderBy: {
        fechaMovimiento: 'desc',
      },
    });

    return movimientos;
  }

  // ============================================
  // ALERTAS Y REPORTES
  // ============================================

  async obtenerAlertasStockBajo() {
    const recursos = await this.prisma.recurso.findMany({
      where: {
        eliminado: false,
        stockMinimo: { not: null },
        stockActual: { lte: this.prisma.recurso.fields.stockMinimo },
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        stockActual: true,
        stockMinimo: true,
        unidadMedida: true,
      },
      orderBy: {
        stockActual: 'asc',
      },
    });

    return recursos;
  }

  async obtenerPorDepartamento(departamentoId: string) {
    const asignaciones = await this.prisma.asignacionRecurso.findMany({
      where: {
        departamentoId,
        activa: true,
      },
      include: {
        recurso: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            unidadMedida: true,
            costoUnitario: true,
          },
        },
      },
    });

    const totalCosto = asignaciones.reduce((sum, asig) => {
      const costo = asig.recurso.costoUnitario
        ? Number(asig.recurso.costoUnitario) * asig.cantidad
        : 0;
      return sum + costo;
    }, 0);

    return {
      asignaciones,
      totalRecursos: asignaciones.length,
      totalCosto,
    };
  }

  async obtenerPorProyecto(proyectoId: string) {
    const asignaciones = await this.prisma.asignacionRecurso.findMany({
      where: {
        proyectoId,
        activa: true,
      },
      include: {
        recurso: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            unidadMedida: true,
            costoUnitario: true,
          },
        },
      },
    });

    const totalCosto = asignaciones.reduce((sum, asig) => {
      const costo = asig.recurso.costoUnitario
        ? Number(asig.recurso.costoUnitario) * asig.cantidad
        : 0;
      return sum + costo;
    }, 0);

    return {
      asignaciones,
      totalRecursos: asignaciones.length,
      totalCosto,
    };
  }

  async obtenerReporteCostos() {
    const recursos = await this.prisma.recurso.findMany({
      where: {
        eliminado: false,
        costoUnitario: { not: null },
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        stockActual: true,
        costoUnitario: true,
        unidadMedida: true,
      },
    });

    const totalInventario = recursos.reduce((sum, recurso) => {
      const costo = Number(recurso.costoUnitario) * recurso.stockActual;
      return sum + costo;
    }, 0);

    // Agrupar por tipo
    const porTipo = recursos.reduce((acc, recurso) => {
      const tipo = recurso.tipo;
      if (!acc[tipo]) {
        acc[tipo] = { tipo, cantidad: 0, valorTotal: 0 };
      }
      acc[tipo].cantidad += recurso.stockActual;
      acc[tipo].valorTotal += Number(recurso.costoUnitario) * recurso.stockActual;
      return acc;
    }, {});

    return {
      totalInventario,
      totalRecursos: recursos.length,
      porTipo: Object.values(porTipo),
    };
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private async calcularTotalAsignado(recursoId: string): Promise<number> {
    const asignaciones = await this.prisma.asignacionRecurso.findMany({
      where: {
        recursoId,
        activa: true,
      },
      select: {
        cantidad: true,
      },
    });

    return asignaciones.reduce((sum, asig) => sum + asig.cantidad, 0);
  }
}
