import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarIngresoDto } from './dto/registrar-ingreso.dto';
import { RegistrarGastoDto } from './dto/registrar-gasto.dto';
import { FiltrosFinanzasDto } from './dto/filtros-finanzas.dto';
import { CreatePresupuestoDepartamentoDto } from './dto/create-presupuesto-departamento.dto';
import { UpdatePresupuestoDepartamentoDto } from './dto/update-presupuesto-departamento.dto';
import { CreatePresupuestoProyectoDto } from './dto/create-presupuesto-proyecto.dto';
import { UpdatePresupuestoProyectoDto } from './dto/update-presupuesto-proyecto.dto';
import { RegistrarMovimientoPresupuestoDto } from './dto/registrar-movimiento-presupuesto.dto';
import { EstadoPresupuesto, TipoMovimientoPresupuesto, Prisma } from '@prisma/client';

const { Decimal } = Prisma;

@Injectable()
export class FinanzasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // REGISTRO DE INGRESOS
  // ============================================

  async registrarIngreso(proyectoId: string, dto: RegistrarIngresoDto, usuarioId: string) {
    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const ingreso = await this.prisma.ingresoProyecto.create({
      data: {
        proyectoId,
        fuente: dto.fuente,
        monto: dto.monto,
        descripcion: dto.descripcion,
        fechaIngreso: new Date(dto.fechaIngreso),
        comprobante: dto.comprobante,
        registradoPorId: usuarioId,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
          },
        },
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    return ingreso;
  }

  async obtenerIngresos(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    const where: any = {
      proyectoId,
    };

    if (filtros?.fechaInicio) {
      where.fechaIngreso = {
        ...where.fechaIngreso,
        gte: new Date(filtros.fechaInicio),
      };
    }

    if (filtros?.fechaFin) {
      where.fechaIngreso = {
        ...where.fechaIngreso,
        lte: new Date(filtros.fechaFin),
      };
    }

    if (filtros?.fuente) {
      where.fuente = filtros.fuente;
    }

    const ingresos = await this.prisma.ingresoProyecto.findMany({
      where,
      include: {
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
      orderBy: {
        fechaIngreso: 'desc',
      },
    });

    const totalIngresos = ingresos.reduce((sum, ing) => sum + Number(ing.monto), 0);

    return {
      ingresos,
      total: totalIngresos,
      cantidad: ingresos.length,
    };
  }

  async eliminarIngreso(ingresoId: string) {
    const ingreso = await this.prisma.ingresoProyecto.findUnique({
      where: { id: ingresoId },
    });

    if (!ingreso) {
      throw new NotFoundException('Ingreso no encontrado');
    }

    await this.prisma.ingresoProyecto.delete({
      where: { id: ingresoId },
    });

    return { message: 'Ingreso eliminado correctamente' };
  }

  // ============================================
  // REGISTRO DE GASTOS
  // ============================================

  async registrarGasto(proyectoId: string, dto: RegistrarGastoDto, usuarioId: string) {
    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Si se especifica un recurso, verificar que existe
    if (dto.recursoId) {
      const recurso = await this.prisma.recurso.findUnique({
        where: { id: dto.recursoId },
      });

      if (!recurso || recurso.eliminado) {
        throw new NotFoundException('Recurso no encontrado');
      }
    }

    const gasto = await this.prisma.gastoProyecto.create({
      data: {
        proyectoId,
        categoria: dto.categoria,
        concepto: dto.concepto,
        monto: dto.monto,
        fechaGasto: new Date(dto.fechaGasto),
        comprobante: dto.comprobante,
        recursoId: dto.recursoId,
        registradoPorId: usuarioId,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
          },
        },
        recurso: {
          select: {
            nombre: true,
            tipo: true,
          },
        },
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    return gasto;
  }

  async obtenerGastos(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    const where: any = {
      proyectoId,
    };

    if (filtros?.fechaInicio) {
      where.fechaGasto = {
        ...where.fechaGasto,
        gte: new Date(filtros.fechaInicio),
      };
    }

    if (filtros?.fechaFin) {
      where.fechaGasto = {
        ...where.fechaGasto,
        lte: new Date(filtros.fechaFin),
      };
    }

    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    const gastos = await this.prisma.gastoProyecto.findMany({
      where,
      include: {
        recurso: {
          select: {
            nombre: true,
            tipo: true,
          },
        },
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
      orderBy: {
        fechaGasto: 'desc',
      },
    });

    const totalGastos = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

    // Agrupar por categoría
    const porCategoria = gastos.reduce((acc, gasto) => {
      const cat = gasto.categoria;
      if (!acc[cat]) {
        acc[cat] = { categoria: cat, total: 0, cantidad: 0 };
      }
      acc[cat].total += Number(gasto.monto);
      acc[cat].cantidad += 1;
      return acc;
    }, {});

    return {
      gastos,
      total: totalGastos,
      cantidad: gastos.length,
      porCategoria: Object.values(porCategoria),
    };
  }

  async eliminarGasto(gastoId: string) {
    const gasto = await this.prisma.gastoProyecto.findUnique({
      where: { id: gastoId },
    });

    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }

    await this.prisma.gastoProyecto.delete({
      where: { id: gastoId },
    });

    return { message: 'Gasto eliminado correctamente' };
  }

  // ============================================
  // ANÁLISIS DE RENTABILIDAD
  // ============================================

  async analizarRentabilidad(proyectoId: string, filtros?: FiltrosFinanzasDto) {
    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: {
        id: true,
        nombre: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
      },
    });

    if (!proyecto || !proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Obtener ingresos y gastos
    const { total: totalIngresos, ingresos } = await this.obtenerIngresos(proyectoId, filtros);
    const { total: totalGastos, gastos, porCategoria } = await this.obtenerGastos(proyectoId, filtros);

    // Calcular métricas
    const utilidadNeta = totalIngresos - totalGastos;
    const margenGanancia = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
    const roi = totalGastos > 0 ? ((utilidadNeta / totalGastos) * 100) : 0;

    // Determinar estado financiero
    let estadoFinanciero: 'rentable' | 'equilibrio' | 'perdida';
    if (utilidadNeta > 0) {
      estadoFinanciero = 'rentable';
    } else if (utilidadNeta === 0) {
      estadoFinanciero = 'equilibrio';
    } else {
      estadoFinanciero = 'perdida';
    }

    return {
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
      },
      resumen: {
        totalIngresos,
        totalGastos,
        utilidadNeta,
        margenGanancia: Number(margenGanancia.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        estadoFinanciero,
      },
      detalles: {
        cantidadIngresos: ingresos.length,
        cantidadGastos: gastos.length,
        gastosPorCategoria: porCategoria,
      },
    };
  }

  async compararRentabilidad(proyectosIds: string[]) {
    if (!proyectosIds || proyectosIds.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un proyecto');
    }

    const comparaciones = await Promise.all(
      proyectosIds.map(async (proyectoId) => {
        try {
          const analisis = await this.analizarRentabilidad(proyectoId);
          return analisis;
        } catch (error) {
          return null;
        }
      }),
    );

    // Filtrar proyectos no encontrados
    const resultados = comparaciones.filter((comp) => comp !== null);

    // Ordenar por ROI descendente
    resultados.sort((a, b) => b.resumen.roi - a.resumen.roi);

    // Calcular totales generales
    const totales = resultados.reduce(
      (acc, res) => ({
        totalIngresos: acc.totalIngresos + res.resumen.totalIngresos,
        totalGastos: acc.totalGastos + res.resumen.totalGastos,
        utilidadNeta: acc.utilidadNeta + res.resumen.utilidadNeta,
      }),
      { totalIngresos: 0, totalGastos: 0, utilidadNeta: 0 },
    );

    return {
      proyectos: resultados,
      totales: {
        ...totales,
        margenGananciaPromedio:
          totales.totalIngresos > 0
            ? Number(((totales.utilidadNeta / totales.totalIngresos) * 100).toFixed(2))
            : 0,
        roiPromedio:
          totales.totalGastos > 0
            ? Number(((totales.utilidadNeta / totales.totalGastos) * 100).toFixed(2))
            : 0,
      },
      cantidadProyectos: resultados.length,
    };
  }

  // ============================================
  // REPORTES FINANCIEROS
  // ============================================

  async obtenerReporteGeneral(filtros?: FiltrosFinanzasDto) {
    const whereIngresos: any = {};
    const whereGastos: any = {};

    if (filtros?.fechaInicio) {
      whereIngresos.fechaIngreso = { gte: new Date(filtros.fechaInicio) };
      whereGastos.fechaGasto = { gte: new Date(filtros.fechaInicio) };
    }

    if (filtros?.fechaFin) {
      whereIngresos.fechaIngreso = {
        ...whereIngresos.fechaIngreso,
        lte: new Date(filtros.fechaFin),
      };
      whereGastos.fechaGasto = {
        ...whereGastos.fechaGasto,
        lte: new Date(filtros.fechaFin),
      };
    }

    const [ingresos, gastos] = await Promise.all([
      this.prisma.ingresoProyecto.findMany({
        where: whereIngresos,
        include: {
          proyecto: {
            select: { nombre: true },
          },
        },
      }),
      this.prisma.gastoProyecto.findMany({
        where: whereGastos,
        include: {
          proyecto: {
            select: { nombre: true },
          },
        },
      }),
    ]);

    const totalIngresos = ingresos.reduce((sum, ing) => sum + Number(ing.monto), 0);
    const totalGastos = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

    // Agrupar ingresos por fuente
    const ingresosPorFuente = ingresos.reduce((acc, ing) => {
      const fuente = ing.fuente;
      if (!acc[fuente]) {
        acc[fuente] = { fuente, total: 0, cantidad: 0 };
      }
      acc[fuente].total += Number(ing.monto);
      acc[fuente].cantidad += 1;
      return acc;
    }, {});

    // Agrupar gastos por categoría
    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      const cat = gasto.categoria;
      if (!acc[cat]) {
        acc[cat] = { categoria: cat, total: 0, cantidad: 0 };
      }
      acc[cat].total += Number(gasto.monto);
      acc[cat].cantidad += 1;
      return acc;
    }, {});

    // Agrupar por proyecto
    const porProyecto = {};
    
    ingresos.forEach((ing) => {
      if (!porProyecto[ing.proyectoId]) {
        porProyecto[ing.proyectoId] = {
          proyectoId: ing.proyectoId,
          nombreProyecto: ing.proyecto.nombre,
          ingresos: 0,
          gastos: 0,
        };
      }
      porProyecto[ing.proyectoId].ingresos += Number(ing.monto);
    });

    gastos.forEach((gasto) => {
      if (!porProyecto[gasto.proyectoId]) {
        porProyecto[gasto.proyectoId] = {
          proyectoId: gasto.proyectoId,
          nombreProyecto: gasto.proyecto.nombre,
          ingresos: 0,
          gastos: 0,
        };
      }
      porProyecto[gasto.proyectoId].gastos += Number(gasto.monto);
    });

    // Calcular utilidad por proyecto
    const proyectosConUtilidad = Object.values(porProyecto).map((p: any) => ({
      ...p,
      utilidad: p.ingresos - p.gastos,
      margen: p.ingresos > 0 ? ((p.ingresos - p.gastos) / p.ingresos) * 100 : 0,
    }));

    return {
      resumen: {
        totalIngresos,
        totalGastos,
        utilidadNeta: totalIngresos - totalGastos,
        margenGanancia:
          totalIngresos > 0 ? Number((((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(2)) : 0,
      },
      ingresosPorFuente: Object.values(ingresosPorFuente),
      gastosPorCategoria: Object.values(gastosPorCategoria),
      porProyecto: proyectosConUtilidad,
    };
  }

  async obtenerTopProyectos(limite: number = 10, ordenarPor: 'ingresos' | 'utilidad' | 'roi' = 'utilidad') {
    const proyectos = await this.prisma.proyecto.findMany({
      where: {
        fechaEliminacion: null,
      },
      select: {
        id: true,
        nombre: true,
        estado: true,
      },
    });

    const analisis = await Promise.all(
      proyectos.map(async (proyecto) => {
        try {
          const resultado = await this.analizarRentabilidad(proyecto.id);
          return resultado;
        } catch {
          return null;
        }
      }),
    );

    const resultadosValidos = analisis.filter((a) => a !== null);

    // Ordenar según criterio
    let ordenados = [...resultadosValidos];
    switch (ordenarPor) {
      case 'ingresos':
        ordenados.sort((a, b) => b.resumen.totalIngresos - a.resumen.totalIngresos);
        break;
      case 'utilidad':
        ordenados.sort((a, b) => b.resumen.utilidadNeta - a.resumen.utilidadNeta);
        break;
      case 'roi':
        ordenados.sort((a, b) => b.resumen.roi - a.resumen.roi);
        break;
    }

    return {
      proyectos: ordenados.slice(0, limite),
      criterio: ordenarPor,
      total: resultadosValidos.length,
    };
  }

  // ============================================
  // PRESUPUESTOS DE DEPARTAMENTO
  // ============================================

  async crearPresupuestoDepartamento(
    departamentoId: string,
    dto: CreatePresupuestoDepartamentoDto,
    usuarioId: string,
  ) {
    // Verificar que el departamento existe
    const departamento = await this.prisma.departamento.findUnique({
      where: { id: departamentoId },
    });

    if (!departamento || departamento.fechaEliminacion) {
      throw new NotFoundException('Departamento no encontrado');
    }

    // Verificar que no existe un presupuesto activo para el mismo periodo
    const presupuestoExistente = await this.prisma.presupuestoDepartamento.findFirst({
      where: {
        departamentoId,
        periodo: dto.periodo,
      },
    });

    if (presupuestoExistente) {
      throw new BadRequestException(
        'Ya existe un presupuesto para este departamento en el periodo especificado',
      );
    }

    const presupuesto = await this.prisma.presupuestoDepartamento.create({
      data: {
        departamentoId,
        montoTotal: new Decimal(dto.montoTotal),
        montoGastado: new Decimal(0),
        montoDisponible: new Decimal(dto.montoTotal),
        periodo: dto.periodo,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        estado: dto.estado || EstadoPresupuesto.Activo,
        descripcion: dto.descripcion,
        creadoPorId: usuarioId,
      },
      include: {
        departamento: {
          select: {
            nombre: true,
          },
        },
        creadoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    return presupuesto;
  }

  async obtenerPresupuestoDepartamento(departamentoId: string) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
      include: {
        departamento: {
          select: {
            nombre: true,
            descripcion: true,
          },
        },
        creadoPor: {
          select: {
            nombreCompleto: true,
          },
        },
        movimientos: {
          take: 10,
          orderBy: {
            fechaMovimiento: 'desc',
          },
          include: {
            registradoPor: {
              select: {
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    // Calcular porcentaje de ejecución
    const porcentajeEjecutado =
      Number(presupuesto.montoTotal) > 0
        ? (Number(presupuesto.montoGastado) / Number(presupuesto.montoTotal)) * 100
        : 0;

    return {
      ...presupuesto,
      porcentajeEjecutado: Number(porcentajeEjecutado.toFixed(2)),
    };
  }

  async actualizarPresupuestoDepartamento(
    departamentoId: string,
    dto: UpdatePresupuestoDepartamentoDto,
  ) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    // Si se actualiza el monto total, recalcular disponible
    const updateData: any = { ...dto };
    if (dto.montoTotal !== undefined) {
      updateData.montoTotal = new Decimal(dto.montoTotal);
      updateData.montoDisponible = new Decimal(dto.montoTotal).sub(presupuesto.montoGastado);
    }

    if (dto.fechaInicio) {
      updateData.fechaInicio = new Date(dto.fechaInicio);
    }

    if (dto.fechaFin) {
      updateData.fechaFin = new Date(dto.fechaFin);
    }

    const actualizado = await this.prisma.presupuestoDepartamento.update({
      where: { departamentoId },
      data: updateData,
      include: {
        departamento: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return actualizado;
  }

  async registrarMovimientoPresupuestoDepartamento(
    departamentoId: string,
    dto: RegistrarMovimientoPresupuestoDto,
    usuarioId: string,
  ) {
    const presupuesto = await this.prisma.presupuestoDepartamento.findUnique({
      where: { departamentoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de departamento no encontrado');
    }

    // Validar que hay fondos disponibles para gastos
    if (
      dto.tipo === TipoMovimientoPresupuesto.Gasto &&
      Number(presupuesto.montoDisponible) < dto.monto
    ) {
      throw new BadRequestException('Fondos insuficientes en el presupuesto');
    }

    // Calcular nuevos montos
    let nuevoGastado = new Decimal(presupuesto.montoGastado);
    let nuevoDisponible = new Decimal(presupuesto.montoDisponible);

    switch (dto.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoGastado = nuevoGastado.add(dto.monto);
        nuevoDisponible = nuevoDisponible.sub(dto.monto);
        break;
      case TipoMovimientoPresupuesto.Ajuste:
        // El ajuste puede ser positivo o negativo
        nuevoDisponible = nuevoDisponible.add(dto.monto);
        break;
      case TipoMovimientoPresupuesto.Transferencia:
        // Transferencia no afecta el total, solo mueve entre categorías
        break;
    }

    // Registrar movimiento
    const movimiento = await this.prisma.movimientoPresupuestoDepartamento.create({
      data: {
        presupuestoDepartamentoId: presupuesto.id,
        tipo: dto.tipo,
        monto: new Decimal(dto.monto),
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        comprobante: dto.comprobante,
        registradoPorId: usuarioId,
      },
      include: {
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    // Actualizar presupuesto
    const nuevoEstado =
      nuevoDisponible.lte(0) ? EstadoPresupuesto.Agotado : presupuesto.estado;

    await this.prisma.presupuestoDepartamento.update({
      where: { id: presupuesto.id },
      data: {
        montoGastado: nuevoGastado,
        montoDisponible: nuevoDisponible,
        estado: nuevoEstado,
      },
    });

    return movimiento;
  }

  // ============================================
  // PRESUPUESTOS DE PROYECTO
  // ============================================

  async crearPresupuestoProyecto(
    proyectoId: string,
    dto: CreatePresupuestoProyectoDto,
    usuarioId: string,
  ) {
    // Verificar que el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
    });

    if (!proyecto || proyecto.fechaEliminacion) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que no existe un presupuesto
    const presupuestoExistente = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
    });

    if (presupuestoExistente) {
      throw new BadRequestException('El proyecto ya tiene un presupuesto asignado');
    }

    const presupuesto = await this.prisma.presupuestoProyecto.create({
      data: {
        proyectoId,
        montoTotal: new Decimal(dto.montoTotal),
        montoGastado: new Decimal(0),
        montoDisponible: new Decimal(dto.montoTotal),
        estado: dto.estado || EstadoPresupuesto.Activo,
        descripcion: dto.descripcion,
        creadoPorId: usuarioId,
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
          },
        },
        creadoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    return presupuesto;
  }

  async obtenerPresupuestoProyecto(proyectoId: string) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
      include: {
        proyecto: {
          select: {
            nombre: true,
            descripcion: true,
          },
        },
        creadoPor: {
          select: {
            nombreCompleto: true,
          },
        },
        movimientos: {
          take: 10,
          orderBy: {
            fechaMovimiento: 'desc',
          },
          include: {
            registradoPor: {
              select: {
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    // Calcular porcentaje de ejecución
    const porcentajeEjecutado =
      Number(presupuesto.montoTotal) > 0
        ? (Number(presupuesto.montoGastado) / Number(presupuesto.montoTotal)) * 100
        : 0;

    return {
      ...presupuesto,
      porcentajeEjecutado: Number(porcentajeEjecutado.toFixed(2)),
    };
  }

  async actualizarPresupuestoProyecto(proyectoId: string, dto: UpdatePresupuestoProyectoDto) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    // Si se actualiza el monto total, recalcular disponible
    const updateData: any = { ...dto };
    if (dto.montoTotal !== undefined) {
      updateData.montoTotal = new Decimal(dto.montoTotal);
      updateData.montoDisponible = new Decimal(dto.montoTotal).sub(presupuesto.montoGastado);
    }

    const actualizado = await this.prisma.presupuestoProyecto.update({
      where: { proyectoId },
      data: updateData,
      include: {
        proyecto: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return actualizado;
  }

  async registrarMovimientoPresupuestoProyecto(
    proyectoId: string,
    dto: RegistrarMovimientoPresupuestoDto,
    usuarioId: string,
  ) {
    const presupuesto = await this.prisma.presupuestoProyecto.findUnique({
      where: { proyectoId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Presupuesto de proyecto no encontrado');
    }

    // Validar que hay fondos disponibles para gastos
    if (
      dto.tipo === TipoMovimientoPresupuesto.Gasto &&
      Number(presupuesto.montoDisponible) < dto.monto
    ) {
      throw new BadRequestException('Fondos insuficientes en el presupuesto');
    }

    // Calcular nuevos montos
    let nuevoGastado = new Decimal(presupuesto.montoGastado);
    let nuevoDisponible = new Decimal(presupuesto.montoDisponible);

    switch (dto.tipo) {
      case TipoMovimientoPresupuesto.Gasto:
        nuevoGastado = nuevoGastado.add(dto.monto);
        nuevoDisponible = nuevoDisponible.sub(dto.monto);
        break;
      case TipoMovimientoPresupuesto.Ajuste:
        nuevoDisponible = nuevoDisponible.add(dto.monto);
        break;
      case TipoMovimientoPresupuesto.Transferencia:
        // Transferencia no afecta el total, solo mueve entre categorías
        break;
    }

    // Registrar movimiento
    const movimiento = await this.prisma.movimientoPresupuestoProyecto.create({
      data: {
        presupuestoProyectoId: presupuesto.id,
        tipo: dto.tipo,
        monto: new Decimal(dto.monto),
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        comprobante: dto.comprobante,
        registradoPorId: usuarioId,
      },
      include: {
        registradoPor: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });

    // Actualizar presupuesto
    const nuevoEstado =
      nuevoDisponible.lte(0) ? EstadoPresupuesto.Agotado : presupuesto.estado;

    await this.prisma.presupuestoProyecto.update({
      where: { id: presupuesto.id },
      data: {
        montoGastado: nuevoGastado,
        montoDisponible: nuevoDisponible,
        estado: nuevoEstado,
      },
    });

    return movimiento;
  }

  // ============================================
  // ANÁLISIS PRESUPUESTO VS REAL
  // ============================================

  async analizarPresupuestoVsRealProyecto(proyectoId: string) {
    const [presupuesto, analisisFinanciero] = await Promise.all([
      this.obtenerPresupuestoProyecto(proyectoId),
      this.analizarRentabilidad(proyectoId),
    ]);

    const gastosReales = analisisFinanciero.resumen.totalGastos;
    const presupuestoAsignado = Number(presupuesto.montoTotal);
    const presupuestoGastado = Number(presupuesto.montoGastado);
    const presupuestoDisponible = Number(presupuesto.montoDisponible);

    // Comparar gastos reales vs presupuesto
    const diferencia = gastosReales - presupuestoAsignado;
    const porcentajeDesviacion =
      presupuestoAsignado > 0 ? (diferencia / presupuestoAsignado) * 100 : 0;

    let estadoPresupuesto: 'dentro' | 'alerta' | 'excedido';
    if (gastosReales <= presupuestoAsignado * 0.8) {
      estadoPresupuesto = 'dentro';
    } else if (gastosReales <= presupuestoAsignado) {
      estadoPresupuesto = 'alerta';
    } else {
      estadoPresupuesto = 'excedido';
    }

    return {
      proyecto: analisisFinanciero.proyecto,
      presupuesto: {
        asignado: presupuestoAsignado,
        gastado: presupuestoGastado,
        disponible: presupuestoDisponible,
        porcentajeEjecutado: presupuesto.porcentajeEjecutado,
      },
      gastosReales: {
        total: gastosReales,
        diferencia,
        porcentajeDesviacion: Number(porcentajeDesviacion.toFixed(2)),
        estadoPresupuesto,
      },
      analisisFinanciero: analisisFinanciero.resumen,
    };
  }

  async analizarPresupuestoVsRealDepartamento(departamentoId: string) {
    const presupuesto = await this.obtenerPresupuestoDepartamento(departamentoId);

    // Obtener gastos reales del departamento (suma de movimientos de tipo Gasto)
    const movimientos = await this.prisma.movimientoPresupuestoDepartamento.findMany({
      where: {
        presupuestoDepartamento: {
          departamentoId,
        },
        tipo: TipoMovimientoPresupuesto.Gasto,
      },
    });

    const gastosReales = movimientos.reduce((sum, mov) => sum + Number(mov.monto), 0);
    const presupuestoAsignado = Number(presupuesto.montoTotal);
    const presupuestoGastado = Number(presupuesto.montoGastado);
    const presupuestoDisponible = Number(presupuesto.montoDisponible);

    const diferencia = gastosReales - presupuestoAsignado;
    const porcentajeDesviacion =
      presupuestoAsignado > 0 ? (diferencia / presupuestoAsignado) * 100 : 0;

    let estadoPresupuesto: 'dentro' | 'alerta' | 'excedido';
    if (gastosReales <= presupuestoAsignado * 0.8) {
      estadoPresupuesto = 'dentro';
    } else if (gastosReales <= presupuestoAsignado) {
      estadoPresupuesto = 'alerta';
    } else {
      estadoPresupuesto = 'excedido';
    }

    return {
      departamento: {
        id: departamentoId,
        nombre: presupuesto.departamento.nombre,
      },
      presupuesto: {
        asignado: presupuestoAsignado,
        gastado: presupuestoGastado,
        disponible: presupuestoDisponible,
        porcentajeEjecutado: presupuesto.porcentajeEjecutado,
        periodo: presupuesto.periodo,
      },
      gastosReales: {
        total: gastosReales,
        diferencia,
        porcentajeDesviacion: Number(porcentajeDesviacion.toFixed(2)),
        estadoPresupuesto,
      },
    };
  }
}
