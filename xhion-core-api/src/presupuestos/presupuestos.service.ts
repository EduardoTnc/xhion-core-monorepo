import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePresupuestoDepartamentoDto } from './dto/create-presupuesto-departamento.dto';
import { UpdatePresupuestoDepartamentoDto } from './dto/update-presupuesto-departamento.dto';
import { CreateMovimientoDepartamentoDto } from './dto/create-movimiento-departamento.dto';
import { CreatePresupuestoProyectoDto } from './dto/create-presupuesto-proyecto.dto';
import { UpdatePresupuestoProyectoDto } from './dto/update-presupuesto-proyecto.dto';
import { CreateMovimientoProyectoDto } from './dto/create-movimiento-proyecto.dto';
import { TipoMovimientoPresupuesto, EstadoPresupuesto } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PresupuestosService {
  constructor(private prisma: PrismaService) {}

  // ==================== PRESUPUESTOS DE DEPARTAMENTO ====================

  async createPresupuestoDepartamento(
    dto: CreatePresupuestoDepartamentoDto,
    usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // Verificar que el departamento existe
    const departamento = await this.prisma.departamento.findUnique({
      where: { id: dto.departamentoId },
    });

    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }

    // Verificar que no existe un presupuesto activo para el mismo periodo
    const presupuestoExistente = await this.prisma.presupuestoDepartamento.findFirst({
      where: {
        departamentoId: dto.departamentoId,
        periodo: dto.periodo,
      },
    });

    if (presupuestoExistente) {
      throw new BadRequestException(
        'Ya existe un presupuesto para este departamento en el periodo especificado',
      );
    }

    const montoDisponible = dto.montoTotal;

    return this.prisma.presupuestoDepartamento.create({
      data: {
        departamento: {
          connect: { id: dto.departamentoId },
        },
        creadoPor: {
          connect: { id: usuarioId },
        },
        montoTotal: new Decimal(dto.montoTotal),
        montoGastado: new Decimal(0),
        montoDisponible: new Decimal(montoDisponible),
        periodo: dto.periodo,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        estado: dto.estado || EstadoPresupuesto.Activo,
        descripcion: dto.descripcion,
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
  }

  async getPresupuestoDepartamento(departamentoId: string) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
        movimientos: {
          orderBy: { fechaMovimiento: 'desc' },
          take: 10,
          include: {
            registradoPor: {
              select: {
                id: true,
                nombreCompleto: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    return presupuesto;
  }

  async updatePresupuestoDepartamento(
    departamentoId: string,
    dto: UpdatePresupuestoDepartamentoDto,
  ) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    // Recalcular montoDisponible si se actualiza montoTotal
    let montoDisponible = presupuesto.montoDisponible;
    if (dto.montoTotal !== undefined) {
      const nuevoTotal = new Decimal(dto.montoTotal);
      montoDisponible = nuevoTotal.minus(presupuesto.montoGastado);
    }

    return this.prisma.presupuestoDepartamento.update({
      where: { departamentoId },
      data: {
        ...(dto.montoTotal !== undefined && { montoTotal: new Decimal(dto.montoTotal) }),
        montoDisponible,
        ...(dto.periodo && { periodo: dto.periodo }),
        ...(dto.fechaInicio && { fechaInicio: new Date(dto.fechaInicio) }),
        ...(dto.fechaFin && { fechaFin: new Date(dto.fechaFin) }),
        ...(dto.estado && { estado: dto.estado }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async deletePresupuestoDepartamento(departamentoId: string) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
      include: {
        movimientos: true,
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    if (presupuesto.movimientos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un presupuesto con movimientos registrados',
      );
    }

    await this.prisma.presupuestoDepartamento.delete({
      where: { departamentoId },
    });

    return { message: 'Presupuesto de departamento eliminado exitosamente' };
  }

  // ==================== MOVIMIENTOS DE DEPARTAMENTO ====================

  async createMovimientoDepartamento(
    dto: CreateMovimientoDepartamentoDto,
    usuarioId: string,
  ) {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { id: dto.presupuestoDepartamentoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    if (presupuesto.estado !== EstadoPresupuesto.Activo) {
      throw new BadRequestException('El presupuesto no está activo');
    }

    const monto = new Decimal(dto.monto);

    // Validar según el tipo de movimiento
    if (dto.tipo === TipoMovimientoPresupuesto.Gasto) {
      if (monto.greaterThan(presupuesto.montoDisponible)) {
        throw new BadRequestException('Monto insuficiente en el presupuesto');
      }
    }

    // Crear el movimiento
    const movimiento = await this.prisma.movimientoPresupuestoDepartamento.create({
      data: {
        presupuestoDepartamento: {
          connect: { id: dto.presupuestoDepartamentoId },
        },
        registradoPor: {
          connect: { id: usuarioId },
        },
        ...(dto.archivoId && {
          archivo: {
            connect: { id: dto.archivoId },
          },
        }),
        tipo: dto.tipo,
        monto,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        comprobante: dto.comprobante,
        fechaMovimiento: dto.fechaMovimiento ? new Date(dto.fechaMovimiento) : new Date(),
      },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    // Actualizar el presupuesto
    let nuevoMontoGastado = presupuesto.montoGastado;
    let nuevoMontoDisponible = presupuesto.montoDisponible;

    switch (dto.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoMontoGastado = nuevoMontoGastado.plus(monto);
        nuevoMontoDisponible = nuevoMontoDisponible.minus(monto);
        break;
      case TipoMovimientoPresupuesto.Asignacion:
      case TipoMovimientoPresupuesto.Ajuste:
        nuevoMontoDisponible = nuevoMontoDisponible.plus(monto);
        break;
    }

    // Verificar si el presupuesto se agotó
    let nuevoEstado: EstadoPresupuesto = presupuesto.estado;
    if (nuevoMontoDisponible.lessThanOrEqualTo(0)) {
      nuevoEstado = EstadoPresupuesto.Agotado;
    }

    await this.prisma.presupuestoDepartamento.update({
      where: { id: dto.presupuestoDepartamentoId },
      data: {
        montoGastado: nuevoMontoGastado,
        montoDisponible: nuevoMontoDisponible,
        estado: nuevoEstado,
      },
    });

    return movimiento;
  }

  async getMovimientosDepartamento(presupuestoDepartamentoId: string) {
    return this.prisma.movimientoPresupuestoDepartamento.findMany({
      where: { presupuestoDepartamentoId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
          },
        },
      },
    });
  }

  async deleteMovimientoDepartamento(id: string) {
    const movimiento = await this.prisma.movimientoPresupuestoDepartamento.findUnique({
      where: { id },
      include: {
        presupuestoDepartamento: true,
      },
    });

    if (!movimiento) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    // Revertir el movimiento en el presupuesto
    const presupuesto = movimiento.presupuestoDepartamento;
    let nuevoMontoGastado = presupuesto.montoGastado;
    let nuevoMontoDisponible = presupuesto.montoDisponible;

    switch (movimiento.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoMontoGastado = nuevoMontoGastado.minus(movimiento.monto);
        nuevoMontoDisponible = nuevoMontoDisponible.plus(movimiento.monto);
        break;
      case TipoMovimientoPresupuesto.Asignacion:
      case TipoMovimientoPresupuesto.Ajuste:
        nuevoMontoDisponible = nuevoMontoDisponible.minus(movimiento.monto);
        break;
    }

    await this.prisma.$transaction([
      this.prisma.movimientoPresupuestoDepartamento.delete({
        where: { id },
      }),
      this.prisma.presupuestoDepartamento.update({
        where: { id: presupuesto.id },
        data: {
          montoGastado: nuevoMontoGastado,
          montoDisponible: nuevoMontoDisponible,
          estado: nuevoMontoDisponible.greaterThan(0)
            ? EstadoPresupuesto.Activo
            : presupuesto.estado,
        },
      }),
    ]);

    return { message: 'Movimiento eliminado exitosamente' };
  }

  // ==================== PRESUPUESTOS DE PROYECTO ====================

  async createPresupuestoProyecto(dto: CreatePresupuestoProyectoDto, usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no autenticado');
    }

    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: dto.proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que no existe un presupuesto para este proyecto
    const presupuestoExistente = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId: dto.proyectoId },
    });

    if (presupuestoExistente) {
      throw new BadRequestException('El proyecto ya tiene un presupuesto asignado');
    }

    const montoDisponible = dto.montoTotal;

    return this.prisma.presupuestoProyecto.create({
      data: {
        proyecto: {
          connect: { id: dto.proyectoId },
        },
        creadoPor: {
          connect: { id: usuarioId },
        },
        montoTotal: new Decimal(dto.montoTotal),
        montoGastado: new Decimal(0),
        montoDisponible: new Decimal(montoDisponible),
        estado: dto.estado || EstadoPresupuesto.Activo,
        descripcion: dto.descripcion,
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
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

  async getPresupuestoProyecto(proyectoId: string) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            estado: true,
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
        movimientos: {
          orderBy: { fechaMovimiento: 'desc' },
          take: 10,
          include: {
            registradoPor: {
              select: {
                id: true,
                nombreCompleto: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    return presupuesto;
  }

  async updatePresupuestoProyecto(proyectoId: string, dto: UpdatePresupuestoProyectoDto) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    // Recalcular montoDisponible si se actualiza montoTotal
    let montoDisponible = presupuesto.montoDisponible;
    if (dto.montoTotal !== undefined) {
      const nuevoTotal = new Decimal(dto.montoTotal);
      montoDisponible = nuevoTotal.minus(presupuesto.montoGastado);
    }

    return this.prisma.presupuestoProyecto.update({
      where: { proyectoId },
      data: {
        ...(dto.montoTotal !== undefined && { montoTotal: new Decimal(dto.montoTotal) }),
        montoDisponible,
        ...(dto.estado && { estado: dto.estado }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async deletePresupuestoProyecto(proyectoId: string) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
      include: {
        movimientos: true,
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    if (presupuesto.movimientos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un presupuesto con movimientos registrados',
      );
    }

    await this.prisma.presupuestoProyecto.delete({
      where: { proyectoId },
    });

    return { message: 'Presupuesto de proyecto eliminado exitosamente' };
  }

  // ==================== MOVIMIENTOS DE PROYECTO ====================

  async createMovimientoProyecto(dto: CreateMovimientoProyectoDto, usuarioId: string) {
    if (!usuarioId) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { id: dto.presupuestoProyectoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    if (presupuesto.estado !== EstadoPresupuesto.Activo) {
      throw new BadRequestException('El presupuesto no está activo');
    }

    const monto = new Decimal(dto.monto);

    // Validar según el tipo de movimiento
    if (dto.tipo === TipoMovimientoPresupuesto.Gasto) {
      if (monto.greaterThan(presupuesto.montoDisponible)) {
        throw new BadRequestException('Monto insuficiente en el presupuesto');
      }
    }

    // Crear el movimiento
    const movimiento = await this.prisma.movimientoPresupuestoProyecto.create({
      data: {
        presupuestoProyecto: {
          connect: { id: dto.presupuestoProyectoId },
        },
        registradoPor: {
          connect: { id: usuarioId },
        },
        ...(dto.archivoId && {
          archivo: {
            connect: { id: dto.archivoId },
          },
        }),
        tipo: dto.tipo,
        monto,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        comprobante: dto.comprobante,
        fechaMovimiento: dto.fechaMovimiento ? new Date(dto.fechaMovimiento) : new Date(),
      },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    // Actualizar el presupuesto
    let nuevoMontoGastado = presupuesto.montoGastado;
    let nuevoMontoDisponible = presupuesto.montoDisponible;

    switch (dto.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoMontoGastado = nuevoMontoGastado.plus(monto);
        nuevoMontoDisponible = nuevoMontoDisponible.minus(monto);
        break;
      case TipoMovimientoPresupuesto.Asignacion:
      case TipoMovimientoPresupuesto.Ajuste:
        nuevoMontoDisponible = nuevoMontoDisponible.plus(monto);
        break;
    }

    // Verificar si el presupuesto se agotó
    let nuevoEstado: EstadoPresupuesto = presupuesto.estado;
    if (nuevoMontoDisponible.lessThanOrEqualTo(0)) {
      nuevoEstado = EstadoPresupuesto.Agotado;
    }

    await this.prisma.presupuestoProyecto.update({
      where: { id: dto.presupuestoProyectoId },
      data: {
        montoGastado: nuevoMontoGastado,
        montoDisponible: nuevoMontoDisponible,
        estado: nuevoEstado,
      },
    });

    return movimiento;
  }

  async getMovimientosProyecto(presupuestoProyectoId: string) {
    return this.prisma.movimientoPresupuestoProyecto.findMany({
      where: { presupuestoProyectoId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
        archivo: {
          select: {
            id: true,
            nombreArchivo: true,
            urlArchivo: true,
          },
        },
      },
    });
  }

  async deleteMovimientoProyecto(id: string) {
    const movimiento = await this.prisma.movimientoPresupuestoProyecto.findUnique({
      where: { id },
      include: {
        presupuestoProyecto: true,
      },
    });

    if (!movimiento) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    // Revertir el movimiento en el presupuesto
    const presupuesto = movimiento.presupuestoProyecto;
    let nuevoMontoGastado = presupuesto.montoGastado;
    let nuevoMontoDisponible = presupuesto.montoDisponible;

    switch (movimiento.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoMontoGastado = nuevoMontoGastado.minus(movimiento.monto);
        nuevoMontoDisponible = nuevoMontoDisponible.plus(movimiento.monto);
        break;
      case TipoMovimientoPresupuesto.Asignacion:
      case TipoMovimientoPresupuesto.Ajuste:
        nuevoMontoDisponible = nuevoMontoDisponible.minus(movimiento.monto);
        break;
    }

    await this.prisma.$transaction([
      this.prisma.movimientoPresupuestoProyecto.delete({
        where: { id },
      }),
      this.prisma.presupuestoProyecto.update({
        where: { id: presupuesto.id },
        data: {
          montoGastado: nuevoMontoGastado,
          montoDisponible: nuevoMontoDisponible,
          estado: nuevoMontoDisponible.greaterThan(0)
            ? EstadoPresupuesto.Activo
            : presupuesto.estado,
        },
      }),
    ]);

    return { message: 'Movimiento eliminado exitosamente' };
  }
}
