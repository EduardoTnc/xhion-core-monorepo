import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanzasService } from './finanzas.service';
import { RegistrarIngresoDto } from './dto/registrar-ingreso.dto';
import { RegistrarGastoDto } from './dto/registrar-gasto.dto';
import { FiltrosFinanzasDto } from './dto/filtros-finanzas.dto';
import { CreatePresupuestoDepartamentoDto } from './dto/create-presupuesto-departamento.dto';
import { UpdatePresupuestoDepartamentoDto } from './dto/update-presupuesto-departamento.dto';
import { CreatePresupuestoProyectoDto } from './dto/create-presupuesto-proyecto.dto';
import { UpdatePresupuestoProyectoDto } from './dto/update-presupuesto-proyecto.dto';
import { RegistrarMovimientoPresupuestoDto } from './dto/registrar-movimiento-presupuesto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';

@ApiTags('Finanzas')
@Controller('finanzas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  // ============================================
  // INGRESOS
  // ============================================

  @Post('proyectos/:proyectoId/ingresos')
  @RequiresPermission('finanzas:registrar_ingreso')
  @ApiOperation({ summary: 'Registrar un ingreso en un proyecto' })
  registrarIngreso(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: RegistrarIngresoDto,
    @Request() req,
  ) {
    return this.finanzasService.registrarIngreso(proyectoId, dto, req.user.id);
  }

  @Get('proyectos/:proyectoId/ingresos')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener ingresos de un proyecto' })
  obtenerIngresos(
    @Param('proyectoId') proyectoId: string,
    @Query() filtros: FiltrosFinanzasDto,
  ) {
    return this.finanzasService.obtenerIngresos(proyectoId, filtros);
  }

  @Delete('ingresos/:ingresoId')
  @RequiresPermission('finanzas:eliminar')
  @ApiOperation({ summary: 'Eliminar un ingreso' })
  eliminarIngreso(@Param('ingresoId') ingresoId: string) {
    return this.finanzasService.eliminarIngreso(ingresoId);
  }

  // ============================================
  // GASTOS
  // ============================================

  @Post('proyectos/:proyectoId/gastos')
  @RequiresPermission('finanzas:registrar_gasto')
  @ApiOperation({ summary: 'Registrar un gasto en un proyecto' })
  registrarGasto(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: RegistrarGastoDto,
    @Request() req,
  ) {
    return this.finanzasService.registrarGasto(proyectoId, dto, req.user.id);
  }

  @Get('proyectos/:proyectoId/gastos')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener gastos de un proyecto' })
  obtenerGastos(
    @Param('proyectoId') proyectoId: string,
    @Query() filtros: FiltrosFinanzasDto,
  ) {
    return this.finanzasService.obtenerGastos(proyectoId, filtros);
  }

  @Delete('gastos/:gastoId')
  @RequiresPermission('finanzas:eliminar')
  @ApiOperation({ summary: 'Eliminar un gasto' })
  eliminarGasto(@Param('gastoId') gastoId: string) {
    return this.finanzasService.eliminarGasto(gastoId);
  }

  // ============================================
  // ANÁLISIS DE RENTABILIDAD
  // ============================================

  @Get('proyectos/:proyectoId/rentabilidad')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Analizar rentabilidad de un proyecto' })
  analizarRentabilidad(
    @Param('proyectoId') proyectoId: string,
    @Query() filtros: FiltrosFinanzasDto,
  ) {
    return this.finanzasService.analizarRentabilidad(proyectoId, filtros);
  }

  @Post('comparar-rentabilidad')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Comparar rentabilidad de múltiples proyectos' })
  compararRentabilidad(@Body() body: { proyectosIds: string[] }) {
    return this.finanzasService.compararRentabilidad(body.proyectosIds);
  }

  // ============================================
  // REPORTES
  // ============================================

  @Get('reportes/general')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener reporte financiero general' })
  obtenerReporteGeneral(@Query() filtros: FiltrosFinanzasDto) {
    return this.finanzasService.obtenerReporteGeneral(filtros);
  }

  @Get('reportes/top-proyectos')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener top proyectos por rentabilidad' })
  @ApiQuery({ name: 'limite', required: false, example: 10 })
  @ApiQuery({ name: 'ordenarPor', required: false, enum: ['ingresos', 'utilidad', 'roi'] })
  obtenerTopProyectos(
    @Query('limite') limite?: number,
    @Query('ordenarPor') ordenarPor?: 'ingresos' | 'utilidad' | 'roi',
  ) {
    return this.finanzasService.obtenerTopProyectos(
      limite ? Number(limite) : 10,
      ordenarPor || 'utilidad',
    );
  }

  // ============================================
  // PRESUPUESTOS DE DEPARTAMENTO
  // ============================================

  @Post('departamentos/:departamentoId/presupuesto')
  @RequiresPermission('finanzas:crear_presupuesto')
  @ApiOperation({ summary: 'Crear presupuesto para un departamento' })
  crearPresupuestoDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() dto: CreatePresupuestoDepartamentoDto,
    @Request() req,
  ) {
    return this.finanzasService.crearPresupuestoDepartamento(departamentoId, dto, req.user.id);
  }

  @Get('departamentos/:departamentoId/presupuesto')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener presupuesto de un departamento' })
  obtenerPresupuestoDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.finanzasService.obtenerPresupuestoDepartamento(departamentoId);
  }

  @Patch('departamentos/:departamentoId/presupuesto')
  @RequiresPermission('finanzas:editar_presupuesto')
  @ApiOperation({ summary: 'Actualizar presupuesto de un departamento' })
  actualizarPresupuestoDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() dto: UpdatePresupuestoDepartamentoDto,
  ) {
    return this.finanzasService.actualizarPresupuestoDepartamento(departamentoId, dto);
  }

  @Post('departamentos/:departamentoId/presupuesto/movimientos')
  @RequiresPermission('finanzas:registrar_gasto')
  @ApiOperation({ summary: 'Registrar movimiento en presupuesto de departamento' })
  registrarMovimientoPresupuestoDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() dto: RegistrarMovimientoPresupuestoDto,
    @Request() req,
  ) {
    return this.finanzasService.registrarMovimientoPresupuestoDepartamento(
      departamentoId,
      dto,
      req.user.id,
    );
  }

  // ============================================
  // PRESUPUESTOS DE PROYECTO
  // ============================================

  @Post('proyectos/:proyectoId/presupuesto')
  @RequiresPermission('finanzas:crear_presupuesto')
  @ApiOperation({ summary: 'Crear presupuesto para un proyecto' })
  crearPresupuestoProyecto(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: CreatePresupuestoProyectoDto,
    @Request() req,
  ) {
    return this.finanzasService.crearPresupuestoProyecto(proyectoId, dto, req.user.id);
  }

  @Get('proyectos/:proyectoId/presupuesto')
  @RequiresPermission('finanzas:ver')
  @ApiOperation({ summary: 'Obtener presupuesto de un proyecto' })
  obtenerPresupuestoProyecto(@Param('proyectoId') proyectoId: string) {
    return this.finanzasService.obtenerPresupuestoProyecto(proyectoId);
  }

  @Patch('proyectos/:proyectoId/presupuesto')
  @RequiresPermission('finanzas:editar_presupuesto')
  @ApiOperation({ summary: 'Actualizar presupuesto de un proyecto' })
  actualizarPresupuestoProyecto(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: UpdatePresupuestoProyectoDto,
  ) {
    return this.finanzasService.actualizarPresupuestoProyecto(proyectoId, dto);
  }

  @Post('proyectos/:proyectoId/presupuesto/movimientos')
  @RequiresPermission('finanzas:registrar_gasto')
  @ApiOperation({ summary: 'Registrar movimiento en presupuesto de proyecto' })
  registrarMovimientoPresupuestoProyecto(
    @Param('proyectoId') proyectoId: string,
    @Body() dto: RegistrarMovimientoPresupuestoDto,
    @Request() req,
  ) {
    return this.finanzasService.registrarMovimientoPresupuestoProyecto(
      proyectoId,
      dto,
      req.user.id,
    );
  }

  // ============================================
  // ANÁLISIS PRESUPUESTO VS REAL
  // ============================================

  @Get('proyectos/:proyectoId/presupuesto-vs-real')
  @RequiresPermission('finanzas:analizar')
  @ApiOperation({ summary: 'Analizar presupuesto vs gastos reales de un proyecto' })
  analizarPresupuestoVsRealProyecto(@Param('proyectoId') proyectoId: string) {
    return this.finanzasService.analizarPresupuestoVsRealProyecto(proyectoId);
  }

  @Get('departamentos/:departamentoId/presupuesto-vs-real')
  @RequiresPermission('finanzas:analizar')
  @ApiOperation({ summary: 'Analizar presupuesto vs gastos reales de un departamento' })
  analizarPresupuestoVsRealDepartamento(@Param('departamentoId') departamentoId: string) {
    return this.finanzasService.analizarPresupuestoVsRealDepartamento(departamentoId);
  }
}
